#!/usr/bin/env python3
"""Build deterministic decoded-frame evidence from the v3 review master."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "renders/investing-in-the-trust-layer-v3-review-1080p.mp4"
VTT = ROOT / "captions/investing-in-the-trust-layer.vtt"
OUT = ROOT / "review-frames-v3"
FRAMES = OUT / "full-resolution"
SHEETS = ROOT / "contact-sheets-v3"
FPS = 30
MASTER_FRAMES = 3510


def run(*args: str) -> str:
    return subprocess.run(args, check=True, text=True, capture_output=True).stdout


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_time(value: str) -> float:
    hours, minutes, seconds = value.split(":")
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def frame_for(seconds: float) -> int:
    return min(MASTER_FRAMES - 1, max(0, round(seconds * FPS)))


def timestamp(frame: int) -> str:
    seconds = frame / FPS
    minutes, seconds = divmod(seconds, 60)
    return f"{int(minutes):02d}:{seconds:06.3f}"


def main() -> None:
    if not MASTER.is_file() or not VTT.is_file():
        raise SystemExit("review master or VTT is missing")
    shutil.rmtree(OUT, ignore_errors=True)
    shutil.rmtree(SHEETS, ignore_errors=True)
    FRAMES.mkdir(parents=True)
    SHEETS.mkdir(parents=True)

    reasons: dict[int, set[str]] = defaultdict(set)

    def add(frame: int, reason: str) -> None:
        if 0 <= frame < MASTER_FRAMES:
            reasons[frame].add(reason)

    add(0, "opening t=0")
    add(3, "opening t=0.1")
    for second in range(5, 118, 5):
        add(frame_for(second), "five-second cadence")

    cue_pattern = re.compile(
        r"(?m)^(\d+)\s*\n(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})$"
    )
    cues = cue_pattern.findall(VTT.read_text(encoding="utf-8"))
    if len(cues) != 38:
        raise SystemExit(f"expected 38 VTT cues, found {len(cues)}")
    for cue, start, end in cues:
        add(frame_for(parse_time(start)), f"cue {cue} start")
        add(frame_for(parse_time(end)), f"cue {cue} end")

    boundaries = [423, 970, 1348, 2091, 2557, 3134]
    for boundary in boundaries:
        add(boundary - 6, f"transition before F{boundary:04d}")
        add(boundary, f"transition boundary F{boundary:04d}")
        add(boundary + 6, f"transition after F{boundary:04d}")

    defects = [13.9, 15.2, 21.9, 32.1, 44.7, 48.3, 53.8, 64.6, 77.0, 86.2, 98.0, 104.2]
    for seconds in defects:
        center = frame_for(seconds)
        add(center - 6, f"prior defect {seconds:.1f}s before")
        add(center, f"prior defect exact {seconds:.1f}s")
        add(center + 6, f"prior defect {seconds:.1f}s after")

    add(3450, "untouched hold start F3450")
    add(3480, "untouched hold midpoint F3480")
    add(3509, "untouched hold final F3509")

    selected = sorted(reasons)
    select_expr = "+".join(f"eq(n\\,{frame})" for frame in selected)
    run(
        "ffmpeg", "-v", "error", "-i", str(MASTER),
        "-vf", f"select='{select_expr}'", "-vsync", "0",
        str(FRAMES / "decoded-%04d.png"),
    )
    decoded = sorted(FRAMES.glob("decoded-*.png"))
    if len(decoded) != len(selected):
        raise SystemExit(f"decoded {len(decoded)} frames, expected {len(selected)}")

    master_hash = sha256(MASTER)
    manifest = []
    for temp, frame in zip(decoded, selected, strict=True):
        name = f"frame-F{frame:04d}-at-{timestamp(frame).replace(':', '-')}.png"
        final = temp.with_name(name)
        temp.rename(final)
        manifest.append(
            {
                "frame": frame,
                "timestamp_seconds": round(frame / FPS, 6),
                "timestamp": timestamp(frame),
                "filename": str(final.relative_to(ROOT)),
                "reasons": sorted(reasons[frame]),
                "master_sha256": master_hash,
                "frame_sha256": sha256(final),
            }
        )

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    lines = ["frame\ttimestamp\tfilename\treasons\tmaster_sha256\tframe_sha256"]
    for item in manifest:
        lines.append(
            "\t".join(
                [
                    str(item["frame"]), item["timestamp"], item["filename"],
                    "; ".join(item["reasons"]), item["master_sha256"], item["frame_sha256"],
                ]
            )
        )
    (OUT / "manifest.tsv").write_text("\n".join(lines) + "\n", encoding="utf-8")

    font = ImageFont.load_default(size=28)
    tile_w, tile_h, label_h = 960, 540, 48
    page_size = 4
    for page, start in enumerate(range(0, len(manifest), page_size), start=1):
        sheet = Image.new("RGB", (tile_w * 2, (tile_h + label_h) * 2), "#faf9f6")
        for slot, item in enumerate(manifest[start : start + page_size]):
            image = Image.open(ROOT / item["filename"]).convert("RGB")
            image.thumbnail((tile_w, tile_h), Image.Resampling.LANCZOS)
            x = (slot % 2) * tile_w
            y = (slot // 2) * (tile_h + label_h)
            sheet.paste(image, (x, y))
            draw = ImageDraw.Draw(sheet)
            draw.rectangle((x, y + tile_h, x + tile_w, y + tile_h + label_h), fill="#1a1a1a")
            draw.text((x + 14, y + tile_h + 8), f"F{item['frame']:04d} · {item['timestamp']}", fill="white", font=font)
        sheet.save(SHEETS / f"contact-sheet-v3-{page:02d}.jpg", quality=92, subsampling=0)

    hold = {item["frame"]: item["frame_sha256"] for item in manifest if item["frame"] in {3450, 3480, 3509}}
    if len(set(hold.values())) != 1:
        raise SystemExit(f"terminal hold frames are not byte-identical: {hold}")
    (OUT / "hold-identity.json").write_text(json.dumps(hold, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"frames": len(manifest), "sheets": (len(manifest) + 3) // 4, "hold_sha256": next(iter(hold.values()))}, indent=2))


if __name__ == "__main__":
    main()