#!/usr/bin/env python3
"""Build the Five Materials v3 decoded-frame review manifest."""

from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
import subprocess
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "renders/five-materials-v3-review-1080p.mp4"
VTT = ROOT / "captions/five-materials.en.vtt"
OUTPUT = ROOT / "review-frames-v3"
FPS = 30
DURATION_MS = 92_437

SPECIAL_SAMPLES = {
    100: "opening exact",
    11_592: "transition 1 before",
    11_792: "transition 1 exact",
    11_992: "transition 1 after",
    24_945: "transition 2 before",
    25_145: "transition 2 exact",
    25_345: "transition 2 after",
    36_385: "transition 3 before",
    36_585: "transition 3 exact",
    36_785: "transition 3 after",
    47_700: "48.0s defect bracket before",
    48_000: "48.0s exact defect sample",
    48_300: "48.0s defect bracket after",
    49_335: "transition 4 before",
    49_400: "49.7s defect bracket before",
    49_535: "transition 4 exact",
    49_700: "49.7s exact defect sample",
    49_735: "transition 4 after",
    50_000: "49.7s defect bracket after",
    72_113: "transition 5 before",
    72_313: "transition 5 exact",
    72_513: "transition 5 after",
    74_700: "75.0s defect bracket before",
    75_000: "75.0s exact defect sample",
    75_300: "75.0s defect bracket after",
    79_700: "80.0s defect bracket before",
    80_000: "80.0s exact defect sample",
    80_300: "80.0s defect bracket after",
    83_700: "84.0s defect bracket before",
    84_000: "84.0s exact defect sample",
    84_300: "84.0s defect bracket after",
    86_234: "transition 6 before",
    86_434: "transition 6 exact",
    86_634: "transition 6 after",
    90_376: "final hold start",
    91_376: "final hold midpoint",
    92_200: "prior outro defect exact",
    92_366: "final frame sample",
}


def timestamp_to_ms(value: str) -> int:
    hours, minutes, seconds = value.replace(",", ".").split(":")
    return round((int(hours) * 3600 + int(minutes) * 60 + float(seconds)) * 1000)


def clock(milliseconds: int) -> str:
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    seconds, millis = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{millis:03d}"


def main() -> None:
    if not MASTER.is_file() or not VTT.is_file():
        raise SystemExit("master or VTT missing")

    reasons: dict[int, set[str]] = defaultdict(set)
    for milliseconds in range(0, DURATION_MS, 5000):
        reasons[milliseconds].add("five-second cadence")

    cue_pattern = re.compile(r"^(\d{2}:\d{2}:\d{2}[.,]\d{3})\s+-->", re.MULTILINE)
    for match in cue_pattern.finditer(VTT.read_text(encoding="utf-8")):
        reasons[timestamp_to_ms(match.group(1))].add("WebVTT cue boundary")

    for milliseconds, reason in SPECIAL_SAMPLES.items():
        reasons[milliseconds].add(reason)

    shutil.rmtree(OUTPUT, ignore_errors=True)
    OUTPUT.mkdir(parents=True)
    master_sha256 = hashlib.sha256(MASTER.read_bytes()).hexdigest()
    rows = []

    for index, milliseconds in enumerate(sorted(reasons)):
        seconds = milliseconds / 1000
        filename = f"frame-{index:03d}-at-{seconds:06.3f}s.jpg"
        output_path = OUTPUT / filename
        subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-ss", f"{seconds:.3f}", "-i", str(MASTER),
                "-map", "0:v:0", "-frames:v", "1", "-q:v", "2", str(output_path),
            ],
            check=True,
        )
        if not output_path.is_file() or output_path.stat().st_size == 0:
            raise RuntimeError(f"empty extraction at {seconds:.3f}s")
        rows.append(
            {
                "timestamp": clock(milliseconds),
                "seconds": f"{seconds:.3f}",
                "frame_number": round(seconds * FPS),
                "source_master_sha256": master_sha256,
                "reasons": "; ".join(sorted(reasons[milliseconds])),
                "filename": filename,
            }
        )

    fieldnames = list(rows[0])
    with (OUTPUT / "manifest.tsv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)
    (OUTPUT / "manifest.json").write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted {len(rows)} unique decoded frames from {MASTER.name}")
    print(f"SHA-256 {master_sha256}")


if __name__ == "__main__":
    main()
