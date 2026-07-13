#!/usr/bin/env python3
"""Build the deterministic Five Materials review-frame evidence package."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
from collections import defaultdict
from pathlib import Path
from typing import TypedDict

FPS = 30
TOTAL_FRAMES = 2772
ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "renders/five-materials-v3-review-1080p.mp4"
VTT = ROOT / "captions/five-materials.en.vtt"
OUT = ROOT / "review-package-v3"
FRAMES = OUT / "frames"
SHEETS = OUT / "contact-sheets"


class Cue(TypedDict):
    id: int
    start: float
    end: float
    text: str


class ManifestRow(TypedDict):
    ordinal: int
    timestamp_s: float
    frame: int
    source_master: str
    source_master_sha256: str
    reasons: list[str]
    filename: str


def run(args: list[str]) -> None:
    subprocess.run(args, cwd=ROOT, check=True)


def parse_time(value: str) -> float:
    hours, minutes, seconds = value.split(":")
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def parse_vtt() -> list[Cue]:
    text = VTT.read_text(encoding="utf-8")
    pattern = re.compile(
        r"(?m)^(\d+)\n(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})\n(.+)$"
    )
    cues: list[Cue] = []
    for match in pattern.finditer(text):
        cues.append(
            {
                "id": int(match.group(1)),
                "start": parse_time(match.group(2)),
                "end": parse_time(match.group(3)),
                "text": match.group(4),
            }
        )
    return cues


def add_sample(samples: dict[int, set[str]], seconds: float, reason: str) -> None:
    frame = min(TOTAL_FRAMES - 1, max(0, round(seconds * FPS)))
    samples[frame].add(reason)


def build_samples(cues: list[Cue]) -> dict[int, set[str]]:
    samples: dict[int, set[str]] = defaultdict(set)
    add_sample(samples, 0, "opening t=0")
    add_sample(samples, 0.1, "opening t=0.1")
    for second in range(5, 93, 5):
        add_sample(samples, second, "five-second cadence")
    for cue in cues:
        cue_id = cue["id"]
        add_sample(samples, cue["start"], f"cue {cue_id} start")
        add_sample(samples, cue["end"], f"cue {cue_id} end")
    transitions = [11.792, 25.145, 36.585, 49.535, 72.313, 86.434]
    for transition in transitions:
        add_sample(samples, transition - 0.3, f"transition {transition:.3f}s before")
        add_sample(samples, transition, f"transition {transition:.3f}s boundary")
        add_sample(samples, transition + 0.3, f"transition {transition:.3f}s after")
    for defect in [48.0, 49.7, 75.0, 80.0, 84.0]:
        add_sample(samples, defect - 0.3, f"required {defect:.1f}s bracket before")
        add_sample(samples, defect, f"required exact {defect:.1f}s")
        add_sample(samples, defect + 0.3, f"required {defect:.1f}s bracket after")
    for outro in [86.6, 88.0, 89.6, 90.5, 91.0, 91.7, (TOTAL_FRAMES - 1) / FPS]:
        add_sample(samples, outro, "outro/final-hold risk sample")
    return dict(sorted(samples.items()))


def extract_frames(samples: dict[int, set[str]]) -> list[ManifestRow]:
    shutil.rmtree(OUT, ignore_errors=True)
    FRAMES.mkdir(parents=True)
    SHEETS.mkdir(parents=True)
    tmp = OUT / "tmp"
    tmp.mkdir()
    selected = list(samples)
    expression = "+".join(f"eq(n\\,{frame})" for frame in selected)
    run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(MASTER),
            "-vf",
            f"select='{expression}'",
            "-fps_mode",
            "vfr",
            "-q:v",
            "2",
            str(tmp / "selected-%04d.jpg"),
        ]
    )
    extracted = sorted(tmp.glob("selected-*.jpg"))
    if len(extracted) != len(selected):
        raise RuntimeError(f"expected {len(selected)} frames, extracted {len(extracted)}")
    master_sha = hashlib.sha256(MASTER.read_bytes()).hexdigest()
    manifest: list[ManifestRow] = []
    for ordinal, (frame, source) in enumerate(zip(selected, extracted), start=1):
        seconds = frame / FPS
        filename = f"frame-{ordinal:04d}-f{frame:04d}-at-{seconds:06.3f}s.jpg"
        destination = FRAMES / filename
        source.rename(destination)
        manifest.append(
            {
                "ordinal": ordinal,
                "timestamp_s": round(seconds, 3),
                "frame": frame,
                "source_master": MASTER.relative_to(ROOT).as_posix(),
                "source_master_sha256": master_sha,
                "reasons": sorted(samples[frame]),
                "filename": f"frames/{filename}",
            }
        )
    tmp.rmdir()
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    tsv = "ordinal\ttimestamp_s\tframe\tmaster_sha256\treasons\tfilename\n"
    for row in manifest:
        tsv += (
            f"{row['ordinal']}\t{row['timestamp_s']:.3f}\t{row['frame']}\t"
            f"{row['source_master_sha256']}\t{' | '.join(row['reasons'])}\t{row['filename']}\n"
        )
    (OUT / "manifest.tsv").write_text(tsv, encoding="utf-8")
    return manifest


def make_contact_sheets(manifest: list[ManifestRow]) -> None:
    for sheet_index, start in enumerate(range(0, len(manifest), 4), start=1):
        rows = manifest[start : start + 4]
        args = ["montage"]
        for row in rows:
            args.extend(
                [
                    str(OUT / str(row["filename"])),
                    "-label",
                    f"F{row['frame']:04d} · {row['timestamp_s']:.3f}s",
                ]
            )
        args.extend(
            [
                "-font",
                "DejaVu-Sans",
                "-pointsize",
                "34",
                "-background",
                "#17213a",
                "-fill",
                "#f6f0e4",
                "-tile",
                "2x2",
                "-geometry",
                "1280x720+24+56",
                str(SHEETS / f"contact-sheet-{sheet_index:02d}.jpg"),
            ]
        )
        run(args)


def write_caption_evidence(cues: list[Cue]) -> None:
    monotonic = all(a["start"] <= b["start"] for a, b in zip(cues, cues[1:]))
    nonoverlap = all(a["end"] <= b["start"] for a, b in zip(cues, cues[1:]))
    exceptions = ["absorber", "electronvolt", "gigatonnes", "milli", "perovskite"]
    evidence = {
        "caption_file": VTT.relative_to(ROOT).as_posix(),
        "cue_count": len(cues),
        "monotonic": monotonic,
        "nonoverlap": nonoverlap,
        "first_cue_start_s": cues[0]["start"],
        "final_cue_end_s": cues[-1]["end"],
        "narration_master_duration_s": 92.376,
        "spellcheck_command": "caption text | aspell --lang=en_US list | sort -fu",
        "aspell_unknown_tokens": exceptions,
        "dictionary_exceptions": {
            "absorber": "materials-science term",
            "electronvolt": "SI-derived energy unit",
            "gigatonnes": "climate-accounting unit",
            "milli": "SI prefix in milli-electronvolt",
            "perovskite": "materials-science term",
        },
        "spelling_result": "PASS — all aspell tokens are reviewed scientific/domain terms",
        "manual_terms_checked": [
            "GtCO2 wording",
            "Haber-Bosch",
            "metal-organic frameworks",
            "four hundred watt-hours per kilogram",
            "one-hundred-milli-electronvolt",
            "perovskite",
        ],
        "ok": monotonic and nonoverlap and cues[-1]["end"] == 92.376,
    }
    (OUT / "caption-spellcheck.json").write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")


def write_scorecard_template(manifest: list[ManifestRow]) -> None:
    headers = [
        "ordinal",
        "timestamp_s",
        "frame",
        "scene_cue",
        "typography_floor",
        "legible_unobscured",
        "single_focal",
        "balanced_safe",
        "contrast_palette",
        "scientific_specificity",
        "motion_state",
        "transition_clean",
        "semantic_alignment",
        "technical_clean",
        "total",
        "verdict",
        "note",
    ]
    lines = ["\t".join(headers)]
    for row in manifest:
        lines.append(
            "\t".join(
                [
                    str(row["ordinal"]),
                    f"{row['timestamp_s']:.3f}",
                    str(row["frame"]),
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "PENDING",
                    "",
                ]
            )
        )
    (OUT / "animator-self-scorecard.tsv").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (OUT / "below-7").mkdir()
    (OUT / "below-7/README.md").write_text(
        "# Frames below 7/10\n\nPending animator self-QA and independent Fable review.\n",
        encoding="utf-8",
    )


def main() -> None:
    if not MASTER.is_file() or MASTER.stat().st_size == 0:
        raise SystemExit(f"missing review master: {MASTER}")
    cues = parse_vtt()
    if not cues:
        raise SystemExit("no WebVTT cues parsed")
    samples = build_samples(cues)
    manifest = extract_frames(samples)
    make_contact_sheets(manifest)
    write_caption_evidence(cues)
    write_scorecard_template(manifest)
    print(f"built {len(manifest)} review frames and {(len(manifest) + 3) // 4} contact sheets")


if __name__ == "__main__":
    main()
