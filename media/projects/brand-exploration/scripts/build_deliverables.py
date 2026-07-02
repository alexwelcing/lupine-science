#!/usr/bin/env python3
"""Build production deliverables from chosen brand-exploration stills.

Outputs (all under renders/deliverables/):
  og-card.jpg          1200x630  Open Graph / social card
  site-hero.jpg        2400x1200  Wide hero background
  deck-slide-16x9.jpg  1920x1080  Pitch deck background
  deck-slide-4x3.jpg   1600x1200  Pitch deck background
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
OUT = ROOT / "renders" / "deliverables"
OUT.mkdir(parents=True, exist_ok=True)

# Brand colors
PAPER = (250, 249, 246)
INK = (22, 23, 29)
INK_SOFT = (76, 78, 88)
INDIGO = (61, 77, 179)

# Source winner
SOURCE = ASSETS / "v3" / "shape-of-wrongness_wide_v3.jpg"

# Fonts (fallbacks when ideal web fonts are unavailable)
FONT_SERIF = Path("/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf")
FONT_SERIF_ITALIC = Path("/usr/share/fonts/truetype/noto/NotoSerif-Italic.ttf")
FONT_SANS = Path("/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf")
FONT_MONO = Path("/usr/share/fonts/truetype/noto/NotoSansMono-Regular.ttf")


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def crop_to_ratio(img: Image.Image, ratio: float) -> Image.Image:
    """Center-crop to target width/height ratio."""
    w, h = img.size
    target_w = h * ratio
    if target_w <= w:
        left = (w - target_w) / 2
        return img.crop((left, 0, left + target_w, h))
    target_h = w / ratio
    top = (h - target_h) / 2
    return img.crop((0, top, w, top + target_h))


def paste_centered(dst: Image.Image, src: Image.Image) -> None:
    sw, sh = src.size
    dw, dh = dst.size
    x = (dw - sw) // 2
    y = (dh - sh) // 2
    dst.paste(src, (x, y))


def draw_orbit_mark(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color) -> None:
    """Draw a minimal atom/orbit mark."""
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=2)
    # Tilted ellipses to suggest orbits
    for angle in (-30, 30):
        bbox = [cx - int(r * 1.4), cy - int(r * 0.5), cx + int(r * 1.4), cy + int(r * 0.5)]
        # PIL doesn't rotate ellipses; approximate with a small polygon or just skip
        # Use simple arcs instead
        draw.arc(bbox, start=0, end=360, fill=color, width=2)


def build_og_card() -> Path:
    img = Image.open(SOURCE).convert("RGB")
    img = crop_to_ratio(img, 1200 / 630)
    img = img.resize((1200, 630), Image.Resampling.LANCZOS)

    # Slight paper-wash vignette to keep text readable
    overlay = Image.new("RGBA", img.size, (250, 249, 246, 0))
    d = ImageDraw.Draw(overlay)
    for y in range(img.size[1]):
        alpha = int(180 * (y / img.size[1]) ** 1.5)
        d.line([(0, y), (img.size[0], y)], fill=(250, 249, 246, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    d = ImageDraw.Draw(img)

    # Headline
    headline = "The trust layer for\nthe age of AI-designed matter."
    font_h = load_font(FONT_SERIF_ITALIC, 72)
    d.text((70, 70), headline, font=font_h, fill=INK)

    # Subhead
    sub = "Lupine Science measures, proves, and corrects\ninteratomic potential error — with machine-checkable evidence."
    font_s = load_font(FONT_SANS, 26)
    d.text((70, 300), sub, font=font_s, fill=INK_SOFT)

    # Brand mark text + URL
    font_url = load_font(FONT_MONO, 20)
    d.text((70, 560), "lupine.science", font=font_url, fill=INDIGO)

    out = OUT / "og-card.jpg"
    img.save(out, quality=92)
    return out


def build_site_hero() -> Path:
    img = Image.open(SOURCE).convert("RGB")
    img = crop_to_ratio(img, 2400 / 1200)
    img = img.resize((2400, 1200), Image.Resampling.LANCZOS)
    # Lighten bottom third for hero text with a smooth ease-out fade
    overlay = Image.new("RGBA", img.size, (250, 249, 246, 0))
    d = ImageDraw.Draw(overlay)
    h = img.size[1]
    for y in range(h):
        t = max(0.0, (y - h * 0.45) / (h * 0.55))
        alpha = int(200 * (t ** 1.4))
        d.line([(0, y), (img.size[0], y)], fill=(250, 249, 246, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    out = OUT / "site-hero.jpg"
    img.save(out, quality=92)
    return out


def build_deck_slide(ratio: float, name: str) -> Path:
    img = Image.open(SOURCE).convert("RGB")
    img = crop_to_ratio(img, ratio)
    w = 1920 if name == "16x9" else 1600
    h = int(w / ratio)
    img = img.resize((w, h), Image.Resampling.LANCZOS)
    # Wash left side for slide copy with a smooth gradient across the whole width
    overlay = Image.new("RGBA", img.size, (250, 249, 246, 0))
    d = ImageDraw.Draw(overlay)
    w = img.size[0]
    for x in range(w):
        t = x / (w * 0.95)
        alpha = int(210 * ((1 - t) ** 2))
        d.line([(x, 0), (x, img.size[1])], fill=(250, 249, 246, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    out = OUT / f"deck-slide-{name}.jpg"
    img.save(out, quality=92)
    return out


def build_one_pager_cover() -> Path:
    """Letter-top cover image for the print one-pager."""
    img = Image.open(SOURCE).convert("RGB")
    img = crop_to_ratio(img, 1024 / 576)
    img = img.resize((1024, 576), Image.Resampling.LANCZOS)
    # Top-down wash so the headline remains readable
    overlay = Image.new("RGBA", img.size, (250, 249, 246, 0))
    d = ImageDraw.Draw(overlay)
    h = img.size[1]
    for y in range(h):
        t = 1 - (y / (h * 0.85))
        alpha = int(180 * max(0.0, t) ** 1.4)
        d.line([(0, y), (img.size[0], y)], fill=(250, 249, 246, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    out = OUT / "one-pager-cover.jpg"
    img.save(out, quality=92)
    return out


def main() -> None:
    print("Building deliverables from", SOURCE)
    jobs = [
        build_og_card(),
        build_site_hero(),
        build_deck_slide(16 / 9, "16x9"),
        build_deck_slide(4 / 3, "4x3"),
        build_one_pager_cover(),
    ]
    for p in jobs:
        print(" ", p)


if __name__ == "__main__":
    main()
