#!/usr/bin/env python3
"""Assemble the private PFAS replacement candidate from approved deterministic composites."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[3]
SCENE_DIR = ROOT / "assets" / "composites"
STATE_DIR = ROOT / "assets" / "motion-states"
BUILD = ROOT / "build"
SLUG = "critical-minerals-pfas-and-the-remediation-imperative"
SOURCE_MP4 = REPO / "public" / "videos" / f"{SLUG}.mp4"
OUTPUT = BUILD / f"{SLUG}-candidate.mp4"
FPS = 30


def run(args: list[str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(args, cwd=REPO, text=True, capture_output=True)
    if result.returncode:
        raise SystemExit(f"BLOCKER: command failed ({result.returncode}): {' '.join(args)}\n{result.stderr[-4000:]}")
    return result


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def probe(path: Path) -> dict:
    result = run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=index,codec_type,codec_name,width,height,pix_fmt,r_frame_rate,sample_rate,channels,color_space",
        "-of", "json", str(path)
    ])
    return json.loads(result.stdout)


def audio_stream_hash(path: Path) -> str:
    result = run([
        "ffmpeg", "-v", "error", "-i", str(path), "-map", "0:a:0",
        "-c", "copy", "-f", "streamhash", "-hash", "sha256", "-"
    ])
    return result.stdout.strip().split("SHA256=", 1)[1]


def main() -> None:
    subprocess.run([sys.executable, str(ROOT / "scripts" / "validate_project.py"), "--scope", "prebuild"], cwd=REPO, check=True)
    BUILD.mkdir(parents=True, exist_ok=True)
    storyboard = yaml.safe_load((ROOT / "storyboard.yaml").read_text())
    scenes = storyboard["scenes"]
    scene_records = []
    frame_counts = []

    for index, scene in enumerate(scenes, 1):
        image_path = SCENE_DIR / f"{scene['id']}.png"
        if not image_path.is_file():
            raise SystemExit(f"BLOCKER: missing approved scene composite: {image_path}")
        with Image.open(image_path) as image:
            if image.size != (1920, 1080):
                raise SystemExit(f"BLOCKER: wrong scene dimensions for {scene['id']}: {image.size}")
        start_frame = round(float(scene["time_start"]) * FPS)
        end_frame = round(float(scene["time_end"]) * FPS)
        frames = end_frame - start_frame
        if frames <= 0:
            raise SystemExit(f"BLOCKER: non-positive scene duration: {scene['id']}")
        frame_counts.append(frames)
        scene_records.append({
            "id": scene["id"],
            "path": str(image_path.relative_to(ROOT)),
            "sha256": sha(image_path),
            "startFrame": start_frame,
            "endFrameExclusive": end_frame,
            "frames": frames,
            "durationSecondsOnGrid": frames / FPS,
            "captionCues": scene["caption_cues"]
        })

    input_args: list[str] = []
    filters: list[str] = []
    pads: list[str] = []
    state_records: list[dict] = []
    transition_frames = 8
    input_index = 0
    for i, (scene, frames) in enumerate(zip(scenes, frame_counts)):
        base = frames // 3
        counts = [base + transition_frames, base, frames - 2 * base + transition_frames]
        state_paths = [STATE_DIR / f"{scene['id']}-state-{n}.png" for n in (1, 2, 3)]
        for path, count in zip(state_paths, counts):
            if not path.is_file():
                raise SystemExit(f"BLOCKER: missing semantic motion state: {path}")
            input_args += ["-loop", "1", "-framerate", str(FPS), "-i", str(path)]
            filters.append(f"[{input_index}:v]trim=end_frame={count},setpts=PTS-STARTPTS,format=yuv420p[s{i}_{input_index % 3}]")
            input_index += 1
        first_offset = base / FPS
        second_offset = (2 * base - transition_frames) / FPS
        transition_seconds = transition_frames / FPS
        filters.append(f"[s{i}_0][s{i}_1]xfade=transition=fade:duration={transition_seconds:.9f}:offset={first_offset:.9f}[s{i}_01]")
        filters.append(f"[s{i}_01][s{i}_2]xfade=transition=fade:duration={transition_seconds:.9f}:offset={second_offset:.9f},trim=end_frame={frames},setpts=PTS-STARTPTS[v{i}]")
        pads.append(f"[v{i}]")
        state_records.append({"sceneId": scene["id"], "semanticStates": [str(p.relative_to(ROOT)) for p in state_paths], "inputFrameCounts": counts, "crossfadeFrames": transition_frames})
    audio_index = input_index
    input_args += ["-i", str(SOURCE_MP4)]
    filters.append(f"{''.join(pads)}concat=n={len(scenes)}:v=1:a=0,format=yuv420p[outv]")

    args = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        *input_args,
        "-filter_complex", ";".join(filters),
        "-map", "[outv]", "-map", f"{audio_index}:a:0",
        "-c:v", "libx264", "-preset", "slow", "-crf", "22",
        "-r", str(FPS), "-pix_fmt", "yuv420p", "-color_range", "tv",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-c:a", "copy",
        "-movflags", "+faststart", str(OUTPUT)
    ]
    run(args)

    info = probe(OUTPUT)
    video = next(s for s in info["streams"] if s["codec_type"] == "video")
    audio = next(s for s in info["streams"] if s["codec_type"] == "audio")
    duration = float(info["format"]["duration"])
    frame_probe = run([
        "ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
        "-show_entries", "stream=nb_read_frames,duration", "-of", "json", str(OUTPUT)
    ])
    counted = json.loads(frame_probe.stdout)["streams"][0]
    decoded_frames = int(counted["nb_read_frames"])
    video_duration = float(counted["duration"])
    if video.get("width") != 1920 or video.get("height") != 1080 or video.get("pix_fmt") != "yuv420p":
        raise SystemExit(f"BLOCKER: candidate video contract failed: {video}")
    if audio.get("sample_rate") != "44100" or audio.get("channels") != 1:
        raise SystemExit(f"BLOCKER: candidate audio contract failed: {audio}")
    source_audio_hash = audio_stream_hash(SOURCE_MP4)
    candidate_audio_hash = audio_stream_hash(OUTPUT)
    if candidate_audio_hash != source_audio_hash:
        raise SystemExit("BLOCKER: reviewed source audio packets were not preserved exactly")
    if decoded_frames != sum(frame_counts):
        raise SystemExit(f"BLOCKER: decoded frame count drift: {decoded_frames} != {sum(frame_counts)}")
    audio_duration = float(audio.get("duration", storyboard["target_duration_seconds"]))
    if abs(video_duration - audio_duration) > 1 / FPS:
        raise SystemExit(f"BLOCKER: audio/video endpoint drift exceeds one frame: {video_duration} vs {audio_duration}")
    if abs(duration - float(storyboard["target_duration_seconds"])) > 0.12:
        raise SystemExit(f"BLOCKER: candidate duration drift: {duration}")

    report = {
        "schemaVersion": 1,
        "decision": "pass",
        "publicationEligible": False,
        "candidate": str(OUTPUT.relative_to(ROOT)),
        "sha256": sha(OUTPUT),
        "bytes": OUTPUT.stat().st_size,
        "durationSeconds": duration,
        "targetDurationSeconds": storyboard["target_duration_seconds"],
        "fps": FPS,
        "totalFramesRequested": sum(frame_counts),
        "decodedVideoFrames": decoded_frames,
        "videoDurationSeconds": video_duration,
        "audioDurationSeconds": audio_duration,
        "sourceAudio": str(SOURCE_MP4.relative_to(REPO)),
        "sourceAudioContainerSha256": sha(SOURCE_MP4),
        "sourceAudioStreamSha256": source_audio_hash,
        "candidateAudioStreamSha256": candidate_audio_hash,
        "audioPacketIdentity": True,
        "videoStream": video,
        "audioStream": audio,
        "scenes": scene_records,
        "motionMethod": "three authored semantic states per scene with deterministic crossfades; no whole-frame pan or zoom",
        "motionStates": state_records,
        "buildInputs": {
            "buildScriptSha256": sha(Path(__file__)),
            "motionStateReportSha256": sha(ROOT / "reports" / "motion-state-report.json"),
            "claimEvidenceMapSha256": sha(ROOT / "claim-evidence-map.json")
        },
        "blockers": []
    }
    (BUILD / "candidate-build-report.json").write_text(json.dumps(report, indent=2) + "\n")
    subprocess.run([sys.executable, str(ROOT / "scripts" / "validate_project.py"), "--scope", "candidate"], cwd=REPO, check=True)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
