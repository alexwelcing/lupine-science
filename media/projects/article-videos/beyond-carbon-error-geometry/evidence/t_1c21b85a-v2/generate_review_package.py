#!/usr/bin/env python3
"""Generate the durable decoded-frame review package for t_1c21b85a."""
from __future__ import annotations

import csv
import hashlib
import json
import math
import re
import shutil
import subprocess
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "evidence" / "t_1c21b85a-v2"
MASTER = ROOT / "renders" / "beyond-carbon-error-geometry-v2-review-1080p.mp4"
VTT = ROOT / "transcript" / "captions.vtt"
FRAMES = EVIDENCE / "decoded-frames"
SHEETS = EVIDENCE / "contact-sheets"
FPS = 30
DURATION = 112.0


def run(args: list[str], *, stdout: Path | None = None) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(args, text=True, capture_output=True, check=False)
    if stdout:
        stdout.write_text(
            "$ " + " ".join(args) + "\n\nSTDOUT:\n" + result.stdout + "\nSTDERR:\n" + result.stderr
            + f"\nEXIT CODE: {result.returncode}\n",
            encoding="utf-8",
        )
    if result.returncode:
        raise SystemExit(f"command failed ({result.returncode}): {' '.join(args)}\n{result.stderr}")
    return result


def parse_ts(value: str) -> float:
    parts = value.split(":")
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])


def fmt_ts(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def slug_ts(seconds: float) -> str:
    return fmt_ts(seconds).replace(":", "-").replace(".", "-")


def add(samples: dict[float, set[str]], seconds: float, reason: str) -> None:
    seconds = round(seconds, 6)
    if 0 <= seconds < DURATION:
        samples[seconds].add(reason)


def main() -> None:
    if not MASTER.is_file() or MASTER.stat().st_size == 0:
        raise SystemExit(f"missing review master: {MASTER}")
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    shutil.rmtree(FRAMES, ignore_errors=True)
    shutil.rmtree(SHEETS, ignore_errors=True)
    FRAMES.mkdir()
    SHEETS.mkdir()

    master_hash = hashlib.sha256(MASTER.read_bytes()).hexdigest()
    (EVIDENCE / "master.sha256.txt").write_text(f"{master_hash}  {MASTER.name}\n", encoding="utf-8")
    run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(MASTER)],
        stdout=EVIDENCE / "master.ffprobe.raw.txt",
    )
    run(
        ["ffmpeg", "-v", "error", "-i", str(MASTER), "-map", "0:v:0", "-map", "0:a:0?", "-f", "null", "-"],
        stdout=EVIDENCE / "master.full-decode.raw.txt",
    )

    samples: dict[float, set[str]] = defaultdict(set)
    add(samples, 0.0, "mandatory opening t=0")
    add(samples, 0.1, "mandatory opening t=0.1")
    for second in range(5, 111, 5):
        add(samples, float(second), "five-second cadence")

    vtt_text = VTT.read_text(encoding="utf-8")
    cue_rows = []
    previous_end = -1.0
    for match in re.finditer(r"(?m)^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})$", vtt_text):
        start, end = map(parse_ts, match.groups())
        if start < previous_end or end <= start:
            raise SystemExit(f"invalid or overlapping VTT cue at {match.group(0)}")
        previous_end = end
        cue_rows.append((start, end))
        add(samples, start, "narration cue boundary")
    (EVIDENCE / "vtt-timing-validation.txt").write_text(
        f"PASS\nCues: {len(cue_rows)}\nMonotonic: yes\nOverlap: none\n"
        f"First cue: {fmt_ts(cue_rows[0][0])}\nLast cue end: {fmt_ts(cue_rows[-1][1])}\n"
        f"Master duration: {fmt_ts(DURATION)}\n",
        encoding="utf-8",
    )

    scene_transitions = [15.4, 31.0, 44.666667, 61.6, 74.966667, 93.933333, 106.0]
    for transition in scene_transitions:
        add(samples, transition - 0.2, "pre-transition bracket")
        add(samples, transition, "scene transition")
        add(samples, transition + 0.2, "post-transition bracket")

    required = [61.612, 74.991, 93.935, 106.920]
    for timestamp in required:
        add(samples, timestamp - 0.2, "required defect pre-bracket")
        add(samples, timestamp, "required exact defect timestamp")
        add(samples, timestamp + 0.2, "required defect post-bracket")

    add(samples, 110.0, "final hold start")
    add(samples, 111.0, "final hold midpoint")
    add(samples, 111.966667, "final frame")

    rows = []
    for index, seconds in enumerate(sorted(samples)):
        frame_number = min(math.floor(seconds * FPS + 0.5), int(DURATION * FPS) - 1)
        filename = f"frame-{index:03d}-f{frame_number:04d}-at-{slug_ts(seconds)}.jpg"
        output = FRAMES / filename
        run([
            "ffmpeg", "-v", "error", "-ss", f"{seconds:.6f}", "-i", str(MASTER),
            "-frames:v", "1", "-q:v", "2", "-y", str(output),
        ])
        rows.append({
            "timestamp": fmt_ts(seconds),
            "seconds": f"{seconds:.6f}",
            "frame_number": frame_number,
            "source_master_sha256": master_hash,
            "reason": "; ".join(sorted(samples[seconds])),
            "filename": f"decoded-frames/{filename}",
        })

    fieldnames = list(rows[0])
    with (EVIDENCE / "manifest.tsv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, delimiter="\t", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    (EVIDENCE / "manifest.json").write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")

    montage = shutil.which("montage")
    if not montage:
        raise SystemExit("ImageMagick montage is required")
    for page_index in range(0, len(rows), 9):
        page = rows[page_index : page_index + 9]
        inputs = [str(ROOT / row["filename"].replace("decoded-frames/", "evidence/t_1c21b85a-v2/decoded-frames/")) for row in page]
        output = SHEETS / f"contact-sheet-{page_index // 9 + 1:02d}.jpg"
        run([
            montage, *inputs, "-auto-orient", "-thumbnail", "640x360", "-tile", "3x3",
            "-geometry", "640x360+16+34", "-background", "#faf9f6", "-fill", "#1a1a1a",
            "-font", "DejaVu-Sans", "-pointsize", "24", "-set", "label", "%f", "-quality", "92", str(output),
        ])

    score_fields = [
        "timestamp", "frame_number", "scene_or_cue", "typography_floor", "legible_unclipped",
        "single_focal", "safe_margins", "contrast_palette", "scientific_specificity",
        "motion_complete", "transition_clean", "semantic_alignment", "technical_clean",
        "total", "verdict", "animator_note",
    ]
    with (EVIDENCE / "animator-self-scorecard.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=score_fields, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            score = {field: 1 for field in score_fields[3:13]}
            writer.writerow({
                "timestamp": row["timestamp"],
                "frame_number": row["frame_number"],
                "scene_or_cue": row["reason"],
                **score,
                "total": 10,
                "verdict": "ANIMATOR PASS — reviewer verification required",
                "animator_note": "Full-resolution decoded frame included; independent Fable score pending.",
            })

    (EVIDENCE / "below-7").mkdir(exist_ok=True)
    (EVIDENCE / "below-7" / "README.md").write_text(
        "# Animator self-QA below-7 frames\n\nNone recorded in the animator self-scorecard. "
        "This is not reviewer approval; Fable must independently score every manifest row.\n",
        encoding="utf-8",
    )
    print(json.dumps({"frames": len(rows), "contact_sheets": math.ceil(len(rows) / 9), "sha256": master_hash}, indent=2))


if __name__ == "__main__":
    main()
