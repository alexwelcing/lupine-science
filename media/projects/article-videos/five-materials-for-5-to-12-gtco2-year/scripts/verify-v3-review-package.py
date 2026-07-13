#!/usr/bin/env python3
"""Verify the Five Materials v3 decoded-frame review package."""

from __future__ import annotations

import csv
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "renders/five-materials-v3-review-1080p.mp4"
FRAMES = ROOT / "review-frames-v3"
SHEETS = ROOT / "contact-sheets-v3"
EVIDENCE = ROOT / "evidence"
REQUIRED_SECONDS = {0.1, 48.0, 49.7, 75.0, 80.0, 84.0, 92.2}
EXPECTED_DURATION = 92.437333
EXPECTED_FRAME_COUNT = 2772


def fail(message: str) -> None:
    raise SystemExit(f"FAIL: {message}")


def main() -> None:
    if not MASTER.is_file():
        fail(f"missing master: {MASTER}")

    master_hash = hashlib.sha256(MASTER.read_bytes()).hexdigest()
    manifest = json.loads((FRAMES / "manifest.json").read_text(encoding="utf-8"))
    if len(manifest) < 37:
        fail(f"only {len(manifest)} review frames; at least 37 required")

    seconds = {float(row["seconds"]) for row in manifest}
    missing_samples = REQUIRED_SECONDS - seconds
    if missing_samples:
        fail(f"missing required timestamps: {sorted(missing_samples)}")

    for row in manifest:
        if row["source_master_sha256"] != master_hash:
            fail(f"stale source hash in {row['filename']}")
        frame = FRAMES / row["filename"]
        if not frame.is_file() or frame.stat().st_size == 0:
            fail(f"missing or empty frame: {frame}")

    dimensions = subprocess.check_output(
        ["identify", "-format", "%w %h\n", *map(str, sorted(FRAMES.glob("frame-*.jpg")))],
        text=True,
    ).splitlines()
    if len(dimensions) != len(manifest) or any(item != "1920 1080" for item in dimensions):
        fail("review frames are not all full-resolution 1920x1080 JPEGs")

    sheets = sorted(SHEETS.glob("contact-sheet-*.jpg"))
    if len(sheets) != 6:
        fail(f"expected 6 contact sheets, found {len(sheets)}")

    with (EVIDENCE / "animator-self-scorecard-v3.tsv").open(encoding="utf-8") as handle:
        scores = list(csv.DictReader(handle, delimiter="\t"))
    if len(scores) != len(manifest):
        fail(f"scorecard has {len(scores)} rows for {len(manifest)} frames")
    minimum_score = min(int(row["total"]) for row in scores)
    if minimum_score < 7:
        fail(f"animator scorecard includes a {minimum_score}/10 rejection")

    probe = json.loads((EVIDENCE / "render-v3-ffprobe.json").read_text(encoding="utf-8"))
    video = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
    audio = next(stream for stream in probe["streams"] if stream["codec_type"] == "audio")
    duration = float(probe["format"]["duration"])
    if (video["codec_name"], video["width"], video["height"], video["r_frame_rate"]) != (
        "h264",
        1920,
        1080,
        "30/1",
    ):
        fail("video probe does not match H.264 1920x1080 at 30 fps")
    if int(video["nb_read_frames"]) != EXPECTED_FRAME_COUNT:
        fail(f"decoded {video['nb_read_frames']} video frames, expected {EXPECTED_FRAME_COUNT}")
    if (audio["codec_name"], audio["sample_rate"], audio["channels"]) != ("aac", "48000", 2):
        fail("audio probe does not match AAC 48 kHz stereo")
    if abs(duration - EXPECTED_DURATION) > 0.001:
        fail(f"duration {duration:.6f}s differs from expected {EXPECTED_DURATION:.6f}s")

    documented_hashes = "\n".join(
        path.read_text(encoding="utf-8")
        for path in (
            EVIDENCE / "master-evidence-v3.md",
            EVIDENCE / "self-scorecard-v3.md",
            EVIDENCE / "independent-review-handoff-v3.md",
        )
    )
    if documented_hashes.count(master_hash) != 3:
        fail("master SHA-256 is not synchronized across all three review documents")

    decode_result = (EVIDENCE / "render-v3-full-decode.txt").read_text(encoding="utf-8").strip()
    if decode_result != "PASS: full decode":
        fail("full-decode evidence is missing or failed")

    caption_qa = (EVIDENCE / "caption-qa-v3.md").read_text(encoding="utf-8")
    if not re.search(r"Result: PASS", caption_qa):
        fail("caption QA does not pass")

    print(
        "PASS: "
        f"sha256={master_hash} frames={len(manifest)} sheets={len(sheets)} "
        f"min_score={minimum_score}/10 duration={duration:.6f}s decoded={video['nb_read_frames']}"
    )


if __name__ == "__main__":
    main()
