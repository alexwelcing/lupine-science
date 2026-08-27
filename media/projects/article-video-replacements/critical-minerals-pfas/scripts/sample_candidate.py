#!/usr/bin/env python3
"""Extract a deterministic >=45-frame candidate review inventory."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "build/critical-minerals-pfas-and-the-remediation-imperative-candidate.mp4"
OUT = ROOT / "reviews/stratified-frames"
REPORT = ROOT / "reviews/stratified-frame-report.json"
SCENE_BOUNDARIES = [0.0, 16.88, 39.95, 64.34, 88.17, 109.16, 115.89, 123.53, 134.78, 147.60]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.png"):
        old.unlink()
    # Five interior samples in each of nine scenes = 45; add both sides of eight cuts = 16.
    times: set[float] = set()
    for start, end in zip(SCENE_BOUNDARIES[:-1], SCENE_BOUNDARIES[1:]):
        span = end - start
        for fraction in (0.08, 0.27, 0.50, 0.73, 0.92):
            times.add(round(start + span * fraction, 3))
    for cut in SCENE_BOUNDARIES[1:-1]:
        times.add(round(cut - 0.05, 3))
        times.add(round(cut + 0.05, 3))
    rows = []
    for index, time in enumerate(sorted(times), 1):
        path = OUT / f"{index:02d}-{time:07.3f}.png"
        result = subprocess.run([
            "ffmpeg", "-v", "error", "-ss", str(time), "-i", str(VIDEO),
            "-frames:v", "1", "-y", str(path)
        ], text=True, capture_output=True)
        if result.returncode or not path.is_file():
            raise SystemExit(f"BLOCKER: failed to decode sample at {time}: {result.stderr}")
        with Image.open(path) as image:
            if image.size != (1920, 1080):
                raise SystemExit(f"BLOCKER: sample dimensions drift at {time}: {image.size}")
            stats = ImageStat.Stat(image.convert("RGB"))
            avg_std = sum(stats.stddev) / 3
        rows.append({"index": index, "timeSeconds": time, "path": str(path.relative_to(ROOT)), "sha256": sha(path), "averageStdDev": round(avg_std, 2), "blank": avg_std < 12})
    report = {
        "schemaVersion": 1,
        "candidateSha256": sha(VIDEO),
        "sampleStrategy": "five interior frames per scene plus both sides of every cut",
        "sampleCount": len(rows),
        "blankCount": sum(row["blank"] for row in rows),
        "minimumAverageStdDev": min(row["averageStdDev"] for row in rows),
        "rows": rows,
    }
    REPORT.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({key: report[key] for key in ("candidateSha256", "sampleCount", "blankCount", "minimumAverageStdDev")}, indent=2))


if __name__ == "__main__":
    main()
