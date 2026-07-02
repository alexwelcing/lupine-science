#!/usr/bin/env python3
"""Render pitch-deck slide images over the brand deck backgrounds."""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DELIVERABLES = ROOT / "renders" / "deliverables"
OUT = DELIVERABLES / "slides"
OUT.mkdir(parents=True, exist_ok=True)

PAPER = (250, 249, 246)
INK = (22, 23, 29)
INK_SOFT = (76, 78, 88)
INDIGO = (61, 77, 179)

FONT_SERIF = Path("/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf")
FONT_SERIF_ITALIC = Path("/usr/share/fonts/truetype/noto/NotoSerif-Italic.ttf")
FONT_SANS = Path("/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf")
FONT_MONO = Path("/usr/share/fonts/truetype/noto/NotoSansMono-Regular.ttf")


def load(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


SLIDES = [
    {
        "head": "The trust layer for\nthe age of AI-designed matter.",
        "sub": "Lupine Science · lupine.science",
    },
    {
        "head": "AI is leaving the screen\nand entering matter.",
        "sub": "Foundation machine-learned potentials now design materials at million-atom scale.",
    },
    {
        "head": "Every prediction is wrong\nin a structured way.",
        "sub": "uMLIPs systematically under-predict surfaces, vacancies, and planar faults — while fitting bulk data.",
    },
    {
        "head": "The wrongness has a shape.",
        "sub": "A smooth environment-resolved error field, with coordination deficit as the leading coordinate.",
    },
    {
        "head": "Measured. Blind-tested.\nMachine-checked.",
        "sub": "36 (model, material) cells · blind γ₁₁₀ prediction r = 0.906 · p = 10⁻⁴ · zero free parameters.",
    },
    {
        "head": "A correction that runs\nbeside the calculator.",
        "sub": "Recovers fitted observables, improves the blind facet at run time, and leaves bulk forces untouched — 15.6 % overhead.",
    },
    {
        "head": "Product: floor + ceiling.",
        "sub": "Floor: a proof-grade correction layer that makes any MLIP trustworthy. Ceiling: a makeability engine for new materials IP.",
    },
    {
        "head": "Moat: proof, not promises.",
        "sub": "Self-refutation discipline · provenance-hashed data · Lean 4 theorems · compounding error-manifold coverage.",
    },
    {
        "head": "Vision: the validation substrate\nfor a real-world Replicator.",
        "sub": "From fantasy frameworks to makeable materials — with evidence you can inspect.",
    },
]


def render(bg_path: Path, ratio_name: str) -> None:
    base = Image.open(bg_path).convert("RGB")
    w, h = base.size

    for i, slide in enumerate(SLIDES, 1):
        img = base.copy()
        d = ImageDraw.Draw(img)

        # margins scale with canvas
        left = int(w * 0.08)
        top = int(h * 0.18)
        max_w = int(w * 0.66)

        # Headline — size down if it would overflow
        head_size = int(h * 0.075)
        head_font = load(FONT_SERIF_ITALIC, head_size)
        while True:
            lines = slide["head"].splitlines()
            head_w = max(d.textlength(line, font=head_font) for line in lines)
            if head_w <= max_w or head_size < 32:
                break
            head_size -= 2
            head_font = load(FONT_SERIF_ITALIC, head_size)

        d.multiline_text((left, top), slide["head"], font=head_font, fill=INK, spacing=int(head_size * 0.15))

        # Subhead beneath headline
        lines = slide["head"].splitlines()
        head_h = len(lines) * head_size + (len(lines) - 1) * int(head_size * 0.15)
        sub_top = top + head_h + int(h * 0.05)
        sub_size = int(h * 0.035)
        sub_font = load(FONT_SANS, sub_size)
        d.multiline_text((left, sub_top), slide["sub"], font=sub_font, fill=INK_SOFT, spacing=int(sub_size * 0.2))

        # Corner URL / mark
        url_font = load(FONT_MONO, int(h * 0.025))
        d.text((left, h - int(h * 0.10)), "lupine.science", font=url_font, fill=INDIGO)

        out = OUT / f"slide-{i:02d}-{ratio_name}.jpg"
        img.save(out, quality=92)
        print(out)


def main() -> None:
    render(DELIVERABLES / "deck-slide-16x9.jpg", "16x9")
    render(DELIVERABLES / "deck-slide-4x3.jpg", "4x3")


if __name__ == "__main__":
    main()
