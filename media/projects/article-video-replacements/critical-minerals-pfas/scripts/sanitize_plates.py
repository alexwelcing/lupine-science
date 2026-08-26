#!/usr/bin/env python3
"""Deterministically remove generated signage/control artifacts from Fal atmosphere plates.

Raw provider outputs remain immutable under assets/plates/raw/. Sanitized derivatives are
compositing backgrounds only, not scientific or engineering evidence.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageStat

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "assets" / "plates" / "raw"
OUT = ROOT / "assets" / "plates"


def clone_patch(image: Image.Image, source: tuple[int, int, int, int], destination: tuple[int, int]) -> None:
    patch = image.crop(source)
    image.paste(patch, destination)


def feathered_fill(image: Image.Image, box: tuple[int, int, int, int], sample: tuple[int, int, int, int], radius: int = 5) -> None:
    """Fill a small artifact from a nearby uniform surface with feathered edges."""
    color = tuple(round(v) for v in ImageStat.Stat(image.crop(sample)).mean[:3])
    x0, y0, x1, y1 = box
    layer = Image.new("RGB", image.size, color)
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rectangle(box, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius))
    image.paste(layer, (0, 0), mask)


def plate_02() -> None:
    im = Image.open(RAW / "plate-02-service-bay.png").convert("RGB")
    # Remove tiny generated wall markings and control box from uniform cream panels.
    feathered_fill(im, (0, 238, 48, 278), (55, 240, 120, 280), 4)
    feathered_fill(im, (622, 242, 649, 292), (651, 242, 705, 292), 4)
    # Remove tiny ceiling-edge marking at upper right from the adjacent ceiling tile.
    feathered_fill(im, (964, 0, 1024, 20), (900, 0, 955, 20), 3)
    im.save(OUT / "plate-02-service-bay.png", optimize=True)


def plate_03() -> None:
    im = Image.open(RAW / "plate-03-test-annex.png").convert("RGB")
    # Rear-door generated EXIT and safety placards: reconstruct uniform wall around door.
    feathered_fill(im, (485, 220, 544, 246), (445, 220, 480, 246), 4)
    feathered_fill(im, (418, 258, 440, 294), (440, 258, 462, 294), 3)
    feathered_fill(im, (563, 258, 582, 294), (542, 258, 560, 294), 3)
    # Remove generated paper and hardware-like marks on the door with sampled door paint.
    feathered_fill(im, (493, 278, 528, 322), (470, 300, 488, 336), 3)
    im.save(OUT / "plate-03-test-annex.png", optimize=True)


if __name__ == "__main__":
    plate_02()
    plate_03()
