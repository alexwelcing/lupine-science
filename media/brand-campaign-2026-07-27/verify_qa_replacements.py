#!/usr/bin/env python3
"""Probe immutable QA attempt-1 campaign video replacements and save frame evidence."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "public/videos/campaign-2026-07-27"
MANIFEST_PATH = OUTPUT_DIR / "video-manifest.json"
STORYBOARDS_PATH = ROOT / "media/brand-campaign-2026-07-27/campaign-video-storyboards.json"
REPORT_PATH = OUTPUT_DIR / "qa-attempt-1-probe-report.json"


def run(command: list[str], *, capture: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, check=True, text=True, capture_output=capture)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def shot_motion_deltas(path: Path, film: dict) -> list[dict]:
    """Decode a low-resolution copy and prove each shot changes internally."""
    command = [
        "ffmpeg", "-v", "error", "-i", str(path),
        "-vf", "scale=320:180:flags=bilinear", "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
    ]
    decoded = subprocess.run(command, check=True, capture_output=True).stdout
    frame_size = 320 * 180 * 3
    if len(decoded) % frame_size:
        raise RuntimeError(f"Unexpected rawvideo byte count for {path}")
    frames = np.frombuffer(decoded, dtype=np.uint8).reshape((-1, 180, 320, 3))
    records = []
    for shot in film["shots"]:
        start_tc, end_tc = shot["timecode"].split("-")

        def seconds(value: str) -> float:
            minutes, sec = value.split(":")
            return int(minutes) * 60 + float(sec)

        start_frame = round(seconds(start_tc) * 30)
        end_frame = min(len(frames) - 1, round(seconds(end_tc) * 30) - 1)
        first = round(start_frame + (end_frame - start_frame) * 0.20)
        second = round(start_frame + (end_frame - start_frame) * 0.80)
        delta = float(np.abs(frames[first].astype(np.int16) - frames[second].astype(np.int16)).mean())
        records.append({
            "shot": shot["shot"],
            "motion": shot["motion"],
            "sample_frames": [first, second],
            "mean_absolute_pixel_delta": round(delta, 4),
            "temporally_distinct": delta > 0.05,
        })
    return records


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text())
    storyboards = json.loads(STORYBOARDS_PATH.read_text())
    original_by_id = {film["id"]: film for film in manifest["films"]}
    storyboard_by_id = {film["id"]: film for film in storyboards["films"]}
    retries = sorted(OUTPUT_DIR.glob("*-qa-attempt-1.mp4"))
    if len(retries) != 5:
        raise RuntimeError(f"Expected exactly five QA attempt-1 replacements, found {len(retries)}")

    records = []
    for film_id, original in original_by_id.items():
        original_path = ROOT / original["output"]
        stem = original_path.stem
        replacement = OUTPUT_DIR / f"{stem}-qa-attempt-1.mp4"
        if not replacement.exists():
            raise FileNotFoundError(replacement)
        original_hash_now = sha256(original_path)
        if original_hash_now != original["sha256"]:
            raise RuntimeError(f"Original evidence changed: {original_path}")

        probe = json.loads(run([
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration,format_name:stream=index,codec_type,codec_name,width,height,pix_fmt,r_frame_rate,sample_rate,channels",
            "-of", "json", str(replacement),
        ]).stdout)
        video = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
        audio = next(stream for stream in probe["streams"] if stream["codec_type"] == "audio")
        duration = float(probe["format"]["duration"])
        expected = float(storyboard_by_id[film_id]["duration_seconds"])
        motion_deltas = shot_motion_deltas(replacement, storyboard_by_id[film_id])

        run(["ffmpeg", "-v", "error", "-i", str(replacement), "-f", "null", "-"])
        loudness = run([
            "ffmpeg", "-hide_banner", "-nostats", "-i", str(replacement),
            "-filter_complex", "ebur128=peak=true", "-f", "null", "-",
        ]).stderr
        matches = re.findall(r"I:\s*(-?\d+(?:\.\d+)?) LUFS", loudness)
        integrated_lufs = float(matches[-1]) if matches else None

        representative = OUTPUT_DIR / f"{stem}-qa-attempt-1-representative.png"
        contact_sheet = OUTPUT_DIR / f"{stem}-qa-attempt-1-contact-sheet.png"
        run([
            "ffmpeg", "-v", "error", "-y", "-ss", f"{duration / 2:.3f}",
            "-i", str(replacement), "-frames:v", "1", str(representative),
        ])
        run([
            "ffmpeg", "-v", "error", "-y", "-i", str(replacement),
            "-vf", f"fps=6/{duration},scale=640:360:flags=lanczos,tile=3x2:padding=8:margin=8:color=0xfaf9f6",
            "-frames:v", "1", str(contact_sheet),
        ])

        checks = {
            "original_sha256_unchanged": True,
            "nonzero_bytes": replacement.stat().st_size > 0,
            "duration_matches_storyboard": abs(duration - expected) < 0.05,
            "video_codec_h264": video["codec_name"] == "h264",
            "dimensions_1920x1080": (video["width"], video["height"]) == (1920, 1080),
            "frame_rate_30fps": video["r_frame_rate"] == "30/1",
            "pixel_format_yuv420p": video["pix_fmt"] == "yuv420p",
            "audio_codec_aac": audio["codec_name"] == "aac",
            "audio_sample_rate_48000": int(audio["sample_rate"]) == 48000,
            "audio_mono": audio["channels"] == 1,
            "full_decode_clean": True,
            "representative_frame_nonzero": representative.stat().st_size > 0,
            "contact_sheet_nonzero": contact_sheet.stat().st_size > 0,
            "all_shots_temporally_distinct": all(shot["temporally_distinct"] for shot in motion_deltas),
        }
        if not all(checks.values()):
            raise RuntimeError(f"Replacement checks failed for {replacement}: {checks}")

        records.append({
            "film_id": film_id,
            "attempt": 1,
            "original": str(original_path.relative_to(ROOT)),
            "original_sha256": original_hash_now,
            "replacement": str(replacement.relative_to(ROOT)),
            "replacement_sha256": sha256(replacement),
            "bytes": replacement.stat().st_size,
            "duration_seconds": duration,
            "probe": {
                "container": probe["format"]["format_name"],
                "video_codec": video["codec_name"],
                "width": video["width"],
                "height": video["height"],
                "pixel_format": video["pix_fmt"],
                "frame_rate": video["r_frame_rate"],
                "audio_codec": audio["codec_name"],
                "audio_sample_rate_hz": int(audio["sample_rate"]),
                "audio_channels": audio["channels"],
                "integrated_loudness_lufs": integrated_lufs,
            },
            "representative_frame": str(representative.relative_to(ROOT)),
            "contact_sheet": str(contact_sheet.relative_to(ROOT)),
            "shot_motion_checks": motion_deltas,
            "checks": checks,
        })

    report = {
        "schema_version": "1.0.0",
        "campaign_id": storyboards["campaign_id"],
        "attempt": 1,
        "replacement_count": len(records),
        "storyboard_sha256": sha256(STORYBOARDS_PATH),
        "all_checks_pass": all(all(record["checks"].values()) for record in records),
        "records": records,
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
