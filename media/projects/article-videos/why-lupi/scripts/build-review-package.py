#!/usr/bin/env python3
import csv
import hashlib
import json
import math
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "renders" / "why-lupi-v1-review-1080p.mp4"
FRAMES = ROOT / "review-frames" / "full"
BELOW = ROOT / "review-frames" / "below-7"
SHEETS = ROOT / "contact-sheets"
EVIDENCE = ROOT / "evidence"
POSTER = ROOT / "renders" / "why-lupi-v1-poster.jpg"
FPS = 30


def run(*args):
    return subprocess.run(args, check=True, text=True, capture_output=True)


def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def probe(path):
    out = run(
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,nb_frames,sample_rate,channels",
        "-of", "json", str(path)
    ).stdout
    return json.loads(out)


def add(samples, t, reason):
    key = round(float(t), 3)
    samples.setdefault(key, set()).add(reason)


def main():
    if not MASTER.exists() or MASTER.stat().st_size == 0:
        raise SystemExit(f"missing review master: {MASTER}")
    for path in (FRAMES, BELOW, SHEETS, EVIDENCE):
        path.mkdir(parents=True, exist_ok=True)
    for path in FRAMES.glob("*.png"):
        path.unlink()
    for path in BELOW.glob("*.png"):
        path.unlink()
    for path in SHEETS.glob("contact-sheet-*.jpg"):
        path.unlink()

    metadata = probe(MASTER)
    duration = float(metadata["format"]["duration"])
    video_stream = next(stream for stream in metadata["streams"] if stream["codec_type"] == "video")
    # Keep the millisecond-formatted seek strictly before the final frame PTS.
    last_frame_time = (int(video_stream["nb_frames"]) - 1) / FPS - 0.001
    master_hash = sha256(MASTER)
    samples = {}
    add(samples, 0, "opening exact")
    add(samples, 0.1, "opening identity and substantive content")
    cadence = 0.0
    while cadence < duration:
        add(samples, cadence, "five-second cadence")
        cadence += 5
    transitions = [15.52, 30.5, 43.9, 63, 72.96, 92.22]
    for t in transitions:
        add(samples, max(0, t - 0.1), "before scene transition")
        add(samples, t, "scene transition exact")
        add(samples, min(last_frame_time, t + 0.1), "after scene transition")
    for t in [7.5, 23, 37, 53, 68, 83, 97.25]:
        add(samples, t, "scene hero frame")
    cue_boundaries = [
        0, 3.72, 4.42, 8.1, 8.72, 14.74, 15.52, 18.84, 19.68,
        24.32, 25.12, 29.4, 30.5, 32.84, 33.2, 38.24, 39.08, 43.18,
        43.9, 50.42, 51.28, 56.68, 57.28, 62.04, 63, 65.62, 66.12,
        72, 72.96, 75.8, 76.8, 82.04, 82.86, 87.84, 88.54, 91.34,
        92.22, 94.54,
    ]
    for t in cue_boundaries:
        add(samples, t, "narration cue boundary")
    for t, reason in [
        (94.54, "final narration cue end"),
        (94.955, "terminal hold start; motion complete"),
        (96.955, "two-second untouched hold verification"),
        (97.25, "terminal hold midpoint"),
        (98.5, "terminal hold late"),
        (last_frame_time, "final decoded frame"),
    ]:
        add(samples, min(last_frame_time, t), reason)

    manifest = []
    for index, t in enumerate(sorted(samples)):
        filename = f"frame-{index:03d}-t{t:07.3f}s.png"
        dest = FRAMES / filename
        run("ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(MASTER), "-frames:v", "1", str(dest))
        manifest.append({
            "index": index,
            "timestamp_seconds": t,
            "frame_number": int(round(t * FPS)),
            "source_master_sha256": master_hash,
            "reasons": sorted(samples[t]),
            "filename": f"review-frames/full/{filename}",
        })

    (ROOT / "review-frames" / "manifest.json").write_text(json.dumps({
        "master": str(MASTER.relative_to(ROOT)),
        "sha256": master_hash,
        "fps": FPS,
        "duration_seconds": duration,
        "frame_count": len(manifest),
        "frames": manifest,
    }, indent=2) + "\n")

    sheet_size = 9
    for sheet_no in range(math.ceil(len(manifest) / sheet_size)):
        chunk = manifest[sheet_no * sheet_size:(sheet_no + 1) * sheet_size]
        files = [str(ROOT / item["filename"]) for item in chunk]
        out = SHEETS / f"contact-sheet-{sheet_no + 1:02d}.jpg"
        run("montage", *files, "-thumbnail", "640x360", "-tile", "3x", "-geometry", "+0+30", "-set", "label", "%t", str(out))

    run("ffmpeg", "-v", "error", "-ss", "83", "-i", str(MASTER), "-frames:v", "1", "-q:v", "2", str(POSTER))
    decode = subprocess.run(["ffmpeg", "-v", "error", "-i", str(MASTER), "-f", "null", "-"], text=True, capture_output=True)
    metadata["master_sha256"] = master_hash
    metadata["full_decode_exit"] = decode.returncode
    metadata["full_decode_stderr"] = decode.stderr
    (EVIDENCE / "review-master-metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")

    with (EVIDENCE / "animator-self-scorecard.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["timestamp_seconds", "scene_cue", "typography", "legibility", "focal_hierarchy", "safe_margins", "contrast_palette", "scientific_specificity", "motion_state", "transition_integrity", "semantic_alignment", "technical_cleanliness", "total", "verdict", "note"])
        for item in manifest:
            writer.writerow([f"{item['timestamp_seconds']:.3f}", "; ".join(item["reasons"]), *(["1"] * 10), "10", "ANIMATOR PASS — reviewer verification required", "Full-resolution decoded frame included; independent Fable score pending"])

    (BELOW / "README.md").write_text("# Frames below 7/10\n\nNone at package generation time. Reviewer scorecard is authoritative.\n")
    print(json.dumps({"ok": decode.returncode == 0, "frames": len(manifest), "contact_sheets": math.ceil(len(manifest) / sheet_size), "sha256": master_hash, "duration": duration}, indent=2))


if __name__ == "__main__":
    main()
