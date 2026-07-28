#!/usr/bin/env python3
"""Reusable, glyph-free PIL primitives for Lupine Wave-4 line art."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageDraw

PAPER = "#faf9f6"
INK = "#16171d"
INDIGO = "#3d4db3"
PALETTE = (PAPER, INK, INDIGO)

Point = tuple[int, int]
Box = tuple[int, int, int, int]


@dataclass
class SceneCanvas:
    width: int
    height: int

    def __post_init__(self) -> None:
        self.image = Image.new("RGB", (self.width, self.height), PAPER)
        self.draw = ImageDraw.Draw(self.image)
        self.unit = max(2, round(min(self.width, self.height) / 360))

    def line(
        self,
        points: Sequence[Point],
        *,
        fill: str = INK,
        width: int | None = None,
        joint: str = "curve",
    ) -> None:
        self.draw.line(points, fill=fill, width=width or 2 * self.unit, joint=joint)

    def rounded_box(
        self,
        box: Box,
        *,
        radius: int | None = None,
        outline: str = INK,
        width: int | None = None,
        fill: str = PAPER,
    ) -> None:
        self.draw.rounded_rectangle(
            box,
            radius=radius or 5 * self.unit,
            fill=fill,
            outline=outline,
            width=width or 2 * self.unit,
        )

    def ellipse(
        self,
        box: Box,
        *,
        outline: str = INK,
        width: int | None = None,
        fill: str = PAPER,
    ) -> None:
        self.draw.ellipse(box, fill=fill, outline=outline, width=width or 2 * self.unit)

    def polygon(
        self,
        points: Sequence[Point],
        *,
        outline: str = INK,
        width: int | None = None,
        fill: str = PAPER,
    ) -> None:
        self.draw.polygon(points, fill=fill)
        self.line([*points, points[0]], fill=outline, width=width)

    def stipple(self, box: Box, *, step: int | None = None, color: str = INK) -> None:
        """Sparse deterministic printmaking texture inside an open rectangle."""
        x0, y0, x1, y1 = box
        spacing = step or 7 * self.unit
        radius = self.unit
        row = 0
        for y in range(y0 + spacing, y1, spacing):
            offset = (row % 2) * spacing // 2
            for x in range(x0 + spacing + offset, x1, spacing):
                self.draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
            row += 1

    def hatch(self, box: Box, *, spacing: int | None = None, color: str = INK) -> None:
        x0, y0, x1, y1 = box
        gap = spacing or 8 * self.unit
        for x in range(x0 - (y1 - y0), x1, gap):
            start_x = max(x, x0)
            start_y = y1 - max(0, x0 - x)
            end_x = min(x + (y1 - y0), x1)
            end_y = y1 - (end_x - x)
            if end_x > start_x:
                self.line([(start_x, start_y), (end_x, end_y)], fill=color, width=self.unit)

    def path(self, points: Sequence[Point], *, width: int | None = None) -> None:
        """The one functional route in a scene; never adds nodes, arrows, or symbols."""
        self.line(points, fill=INDIGO, width=width or 4 * self.unit)

    def save(self, path: Path) -> Path:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.image.save(path, format="PNG", optimize=True)
        return path


def floor(canvas: SceneCanvas, y: int, x0: int, x1: int) -> None:
    canvas.line([(x0, y), (x1, y)], width=2 * canvas.unit)
    for x in range(x0 + 10 * canvas.unit, x1, 24 * canvas.unit):
        canvas.line(
            [(x, y + 2 * canvas.unit), (x + 10 * canvas.unit, y + 5 * canvas.unit)],
            width=canvas.unit,
        )


def cabinet(
    canvas: SceneCanvas,
    box: Box,
    *,
    cutaway: bool = False,
    layers: Iterable[tuple[str, int]] = (),
) -> None:
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=3 * canvas.unit)
    canvas.line([(x0, y0 + 9 * canvas.unit), (x1, y0 + 9 * canvas.unit)])
    canvas.ellipse(
        (
            x1 - 7 * canvas.unit,
            y0 + 3 * canvas.unit,
            x1 - 4 * canvas.unit,
            y0 + 6 * canvas.unit,
        ),
        fill=INK,
        width=canvas.unit,
    )
    if cutaway:
        inset = 7 * canvas.unit
        cx0, cx1 = x0 + inset, x1 - inset
        cy0, cy1 = y0 + 15 * canvas.unit, y1 - 8 * canvas.unit
        canvas.rounded_box((cx0, cy0, cx1, cy1), radius=2 * canvas.unit, width=canvas.unit)
        layer_items = list(layers)
        if layer_items:
            total = sum(weight for _, weight in layer_items)
            cursor = cy0 + 5 * canvas.unit
            usable = cy1 - cursor - 5 * canvas.unit
            for index, (texture, weight) in enumerate(layer_items):
                next_y = cursor + round(usable * weight / total)
                if index == len(layer_items) - 1:
                    next_y = cy1 - 5 * canvas.unit
                canvas.rounded_box(
                    (cx0 + 5 * canvas.unit, cursor, cx1 - 5 * canvas.unit, next_y),
                    radius=canvas.unit,
                    width=canvas.unit,
                )
                if texture == "hatch":
                    canvas.hatch((cx0 + 7 * canvas.unit, cursor + 2 * canvas.unit,
                                  cx1 - 7 * canvas.unit, next_y - 2 * canvas.unit))
                elif texture == "stipple":
                    canvas.stipple((cx0 + 7 * canvas.unit, cursor + 2 * canvas.unit,
                                    cx1 - 7 * canvas.unit, next_y - 2 * canvas.unit))
                cursor = next_y + 3 * canvas.unit


def instrument_feet(canvas: SceneCanvas, box: Box) -> None:
    x0, _y0, x1, y1 = box
    for x in (x0 + 8 * canvas.unit, x1 - 10 * canvas.unit):
        canvas.line([(x, y1), (x, y1 + 5 * canvas.unit)], width=3 * canvas.unit)


def pipe(canvas: SceneCanvas, points: Sequence[Point], *, functional: bool = False) -> None:
    canvas.line(points, width=7 * canvas.unit)
    canvas.line(points, fill=PAPER, width=3 * canvas.unit)
    if functional:
        canvas.path(points, width=2 * canvas.unit)


def vessel(canvas: SceneCanvas, box: Box, *, cutaway: bool = False) -> None:
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=(x1 - x0) // 2)
    neck_w = max(5 * canvas.unit, (x1 - x0) // 4)
    cx = (x0 + x1) // 2
    canvas.line([(cx - neck_w, y0), (cx - neck_w, y0 - 8 * canvas.unit),
                 (cx + neck_w, y0 - 8 * canvas.unit), (cx + neck_w, y0)])
    if cutaway:
        canvas.stipple((x0 + 7 * canvas.unit, (y0 + y1) // 2,
                        x1 - 7 * canvas.unit, y1 - 7 * canvas.unit))


def probe(canvas: SceneCanvas, x: int, y0: int, y1: int) -> None:
    canvas.rounded_box((x - 7 * canvas.unit, y0, x + 7 * canvas.unit, y0 + 15 * canvas.unit),
                       radius=2 * canvas.unit)
    canvas.line([(x, y0 + 15 * canvas.unit), (x, y1 - 4 * canvas.unit)], width=2 * canvas.unit)
    canvas.rounded_box(
        (x - 4 * canvas.unit, y1 - 5 * canvas.unit,
         x + 4 * canvas.unit, y1),
        radius=2 * canvas.unit,
        width=canvas.unit,
    )


def bench(canvas: SceneCanvas, y: int, x0: int, x1: int, *, leg_units: int = 34) -> None:
    """A plain laboratory or pilot-line bench with no controls or labels.

    leg_units defaults to 34 (the certified proportion). Pass a smaller value
    when the bench top sits low on the canvas so the legs stay inset from the
    bottom edge (QA rejects canvas contact)."""
    canvas.rounded_box((x0, y, x1, y + 10 * canvas.unit), radius=2 * canvas.unit)
    for x in (x0 + 14 * canvas.unit, x1 - 14 * canvas.unit):
        canvas.line([(x, y + 10 * canvas.unit), (x, y + leg_units * canvas.unit)], width=4 * canvas.unit)


def sample_boat(canvas: SceneCanvas, box: Box, *, warped: bool = False) -> None:
    """An unmarked ceramic sample boat or visibly distorted shallow pellet."""
    x0, y0, x1, y1 = box
    middle = (x0 + x1) // 2
    lift = 3 * canvas.unit if warped else 0
    canvas.polygon(
        [
            (x0, y0),
            (middle, y0 + lift),
            (x1, y0),
            (x1 - 4 * canvas.unit, y1),
            (x0 + 4 * canvas.unit, y1),
        ],
        width=canvas.unit,
    )


def tube_furnace(canvas: SceneCanvas, box: Box) -> None:
    """A compact, closed tube furnace rendered as nested physical casings."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=6 * canvas.unit)
    cy = (y0 + y1) // 2
    canvas.ellipse(
        (x0 + 8 * canvas.unit, cy - 11 * canvas.unit,
         x1 - 8 * canvas.unit, cy + 11 * canvas.unit),
        width=2 * canvas.unit,
    )
    canvas.ellipse(
        (x0 + 18 * canvas.unit, cy - 5 * canvas.unit,
         x1 - 18 * canvas.unit, cy + 5 * canvas.unit),
        width=canvas.unit,
    )
    instrument_feet(canvas, box)


def test_instrument(canvas: SceneCanvas, box: Box, *, socket_side: str = "left") -> None:
    """A glyph-free test fixture with a standardized mechanical socket."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=4 * canvas.unit)
    canvas.line(
        [(x0 + 8 * canvas.unit, y0 + 13 * canvas.unit),
         (x1 - 8 * canvas.unit, y0 + 13 * canvas.unit)],
        width=canvas.unit,
    )
    socket_x = x0 if socket_side == "left" else x1
    canvas.ellipse(
        (socket_x - 5 * canvas.unit, y0 + 24 * canvas.unit,
         socket_x + 5 * canvas.unit, y0 + 34 * canvas.unit),
        width=2 * canvas.unit,
    )
    instrument_feet(canvas, box)


def cartridge(canvas: SceneCanvas, box: Box) -> None:
    """An identical, unmarked sample cartridge with plain end caps."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=3 * canvas.unit)
    canvas.line(
        [(x0 + 6 * canvas.unit, y0), (x0 + 6 * canvas.unit, y1)],
        width=canvas.unit,
    )
    canvas.line(
        [(x1 - 6 * canvas.unit, y0), (x1 - 6 * canvas.unit, y1)],
        width=canvas.unit,
    )
