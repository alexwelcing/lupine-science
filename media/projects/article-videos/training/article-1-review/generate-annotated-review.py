#!/usr/bin/env python3
"""Generate scored/annotated Article 1 reviewer-training evidence."""
from __future__ import annotations

import csv
from pathlib import Path
from typing import TypedDict
from PIL import Image, ImageDraw, ImageFont


class Assessment(TypedDict):
    scores: dict[str, int]
    overall: int
    failures: str
    evidence: str

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw-frames"
ANNOTATED = ROOT / "annotated-frames"
SHEETS = ROOT / "annotated-contact-sheets"

PAPER = "#faf9f6"
INK = "#1a1a1a"
INDIGO = "#3d4db3"
ROSE = "#c75b5b"
SLATE = "#6b7c8e"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)


def wrap(draw: ImageDraw.ImageDraw, text: str, width: int, fnt: ImageFont.FreeTypeFont) -> list[str]:
    words, lines, current = text.split(), [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def assessment(seconds: float) -> Assessment:
    # Scores are 0–10. The overall score is the minimum applicable score because
    # the publication checklist forbids averaging away a hard failure.
    if seconds == 0:
        scores = dict(typography=0, imagery=0, motion=0, composition=1, narrative=0)
        failures = "T03 · M01 · C03 · N02"
        evidence = "Blank opening frame; no title, episode identity, claim, or visible evidence."
    elif seconds < 0.5:
        scores = dict(typography=2, imagery=2, motion=2, composition=2, narrative=5)
        failures = "T01 · T02 · T04 · I01 · C03"
        evidence = "Transitional scale-in exposes undersized raster and unreadable labels; no mark."
    else:
        scores = dict(typography=3, imagery=3, motion=2, composition=3, narrative=7 if seconds < 9 else 2)
        failures = "T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04"
        evidence = "Static 1280×720 evidence card is upscaled; 28 px caption/18 px kicker and embedded labels miss floors; whole-card entrance is not a causal reveal."
        if 38 <= seconds < 48:
            scores["typography"] = 2
            failures += " · T03"
            evidence = "Failure-economics card visibly collides labels around the center divider; other global type, raster, motion, and identity failures remain."
        if 84 <= seconds < 88:
            scores["typography"] = 2
            evidence = "Map annotations are unreadably small at 1080p; the low-resolution static card is upscaled and has no causal reveal."
        if seconds >= 9:
            failures += " · N02"
            evidence += " Scene timing does not match the active narration cue."
        if seconds >= 88:
            scores["narrative"] = 2
            failures += " · N04"
            evidence += " Final card is a 36-second static hold with no explicit article/proof-pack CTA or canonical outro."
        if seconds >= 122:
            scores["composition"] = 1
            evidence += " Final-two-second identity/outro requirement is visibly absent."
    overall = min(scores.values())
    return {"scores": scores, "overall": overall, "failures": failures, "evidence": evidence}


def main() -> None:
    ANNOTATED.mkdir(parents=True, exist_ok=True)
    SHEETS.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, str]] = []
    with (RAW / "manifest.tsv").open(newline="", encoding="utf-8") as handle:
        manifest = list(csv.DictReader(handle, delimiter="\t"))

    for index, item in enumerate(manifest, 1):
        seconds = float(item["seconds"])
        result = assessment(seconds)
        scores = result["scores"]
        source = Image.open(RAW / item["file"]).convert("RGB")
        canvas = Image.new("RGB", (2520, 1080), PAPER)
        canvas.paste(source, (0, 0))
        draw = ImageDraw.Draw(canvas)
        draw.rectangle((1920, 0, 2519, 1079), fill=PAPER)
        draw.rectangle((1920, 0, 1931, 1079), fill=ROSE)
        draw.text((1970, 48), "ARTICLE 1 · FRAME REVIEW", font=font(24, True), fill=INDIGO)
        draw.text((1970, 92), item["timestamp"], font=font(42, True), fill=INK)
        draw.rounded_rectangle((1970, 165, 2440, 278), radius=12, fill=ROSE)
        draw.text((2000, 186), f"REJECT  {result['overall']}/10", font=font(45, True), fill=PAPER)
        draw.text((1970, 322), "GROUP SCORES (0–10)", font=font(23, True), fill=SLATE)
        y = 365
        for name in ("typography", "imagery", "motion", "composition", "narrative"):
            draw.text((1970, y), name.upper(), font=font(21, True), fill=INK)
            draw.text((2380, y), str(scores[name]), font=font(25, True), fill=ROSE, anchor="ra")
            y += 45
        draw.text((1970, 608), "FAILED GATES", font=font(23, True), fill=SLATE)
        y = 650
        for line in wrap(draw, str(result["failures"]), 470, font(22, True)):
            draw.text((1970, y), line, font=font(22, True), fill=ROSE)
            y += 31
        draw.text((1970, y + 20), "OBSERVED EVIDENCE", font=font(23, True), fill=SLATE)
        y += 63
        for line in wrap(draw, str(result["evidence"]), 470, font(19)):
            draw.text((1970, y), line, font=font(19), fill=INK)
            y += 28
        draw.text((1970, 1030), f"{index:02d}/{len(manifest)} · {item['source']}", font=font(18, True), fill=SLATE)
        output = ANNOTATED / item["file"].replace(".jpg", "-annotated.jpg")
        canvas.save(output, quality=92, subsampling=0)
        rows.append({
            "frame": f"{index:02d}", "timestamp": item["timestamp"], "seconds": item["seconds"],
            "source": item["source"], "file": item["file"], "decision": "REJECT", "severity": "P0",
            "typography": str(scores["typography"]), "imagery": str(scores["imagery"]),
            "motion": str(scores["motion"]), "composition": str(scores["composition"]),
            "narrative": str(scores["narrative"]), "overall": str(result["overall"]),
            "failed_gates": str(result["failures"]), "observed_evidence": str(result["evidence"]),
        })

    with (ROOT / "frame-scores.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    files = sorted(ANNOTATED.glob("*-annotated.jpg"))
    thumb_w, thumb_h = 630, 270
    for start in range(0, len(files), 8):
        page = Image.new("RGB", (thumb_w * 2, thumb_h * 4), PAPER)
        for slot, path in enumerate(files[start:start + 8]):
            image = Image.open(path).convert("RGB")
            image.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            x = (slot % 2) * thumb_w
            y = (slot // 2) * thumb_h
            page.paste(image, (x, y))
        page.save(SHEETS / f"sheet-{start // 8 + 1:02d}.jpg", quality=92, subsampling=0)

    print(f"annotated {len(rows)} frames; wrote frame-scores.csv and {(len(files)+7)//8} contact sheets")


if __name__ == "__main__":
    main()
