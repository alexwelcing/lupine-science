#!/usr/bin/env python3
"""Wave-4 batch 08 scenes built from deterministic, glyph-free PIL primitives."""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from wave4_scene_components import (
    INK,
    PAPER,
    SceneCanvas,
    bench,
    cartridge,
    floor,
    instrument_feet,
    sample_boat,
    vessel,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B6-A02-03": {
        "archetype": "nested-containment-pressure-cell",
        "dimensions": (1536, 1024),
        "filename": "SW1-B6-A02-03--nested-containment-pressure-cell.png",
        "scene": "A high-pressure material cell enclosed by three nested mechanical containment rings, with the innermost ring carrying a restrained indigo boundary.",
        "mechanism": "the nested rings prevent a correction from extending beyond its tested material regime",
    },
    "SW1-B6-A02-04": {
        "archetype": "phased-evidence-test-hall",
        "dimensions": (1536, 1024),
        "filename": "SW1-B6-A02-04--phased-evidence-test-hall.png",
        "scene": "A phased research hall with a simple coupon rack nearest the viewer and progressively enclosed thermal, reaction, and interface test bays farther away.",
        "mechanism": "samples advance only when each increasingly specialized test bay supplies evidence",
    },
    "SW1-B6-A03-01": {
        "archetype": "paired-spring-gauge-row",
        "dimensions": (1536, 864),
        "filename": "SW1-B6-A03-01--paired-spring-gauge-row.png",
        "scene": "A row of five practical material coupons under paired spring gauges, where each indigo predicted pointer stops below its corresponding ink measured pointer.",
        "mechanism": "the paired gauges show correct ordering but systematically undersized response",
    },
    "SW1-B6-A03-04": {
        "archetype": "bounded-correction-decision-rail",
        "dimensions": (1536, 1024),
        "filename": "SW1-B6-A03-04--bounded-correction-decision-rail.png",
        "scene": "An unattended specimen pipeline with a model cartridge, a bounded correction jig, and a final engineering decision tray connected by one narrow rail.",
        "mechanism": "the rail carries one sample through rank-preserving correction into a physical decision tray",
    },
    "SW1-B6-A04-01": {
        "archetype": "makeability-survival-line",
        "dimensions": (1536, 864),
        "filename": "SW1-B6-A04-01--makeability-survival-line.png",
        "scene": "A porous-framework powder batch moving from a synthesis vessel through a pellet press and stability chamber into one plain sorbent cartridge.",
        "mechanism": "the makeability line rejects material unless it survives synthesis, shaping, and stability testing",
    },
    "SW1-B6-A04-02": {
        "archetype": "bonded-dac-panel-cutaway",
        "dimensions": (1536, 1024),
        "filename": "SW1-B6-A04-02--bonded-dac-panel-cutaway.png",
        "scene": "A full-height direct-air-capture panel in cutaway with a porous-framework coating bonded to a plain metal support and sparse airflow crossing it.",
        "mechanism": "the bonded porous coating captures gas while remaining mechanically supported inside the contactor",
    },
    "SW1-B6-A04-03": {
        "archetype": "straight-materials-check-line",
        "dimensions": (1536, 1024),
        "filename": "SW1-B6-A04-03--straight-materials-check-line.png",
        "scene": "An unoccupied materials bay with a synthesis vessel, wash filter, stability chamber, and pilot cartridge connected in one straight line.",
        "mechanism": "one framework batch advances through synthesis and stability checks before entering the pilot cartridge",
    },
}


def rail(canvas: SceneCanvas, points: list[tuple[int, int]]) -> None:
    """A substantial double-line physical rail without arrowheads or markings."""
    canvas.line(points, width=7 * canvas.unit)
    canvas.line(points, fill=PAPER, width=3 * canvas.unit)


def pressure_cell(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    """A compact opposed-anvil pressure cell with an unmarked sample chamber."""
    x0, y0, x1, y1 = box
    cx = (x0 + x1) // 2
    cy = (y0 + y1) // 2
    canvas.rounded_box(box, radius=8 * canvas.unit, width=4 * canvas.unit)
    canvas.polygon(
        [(x0 + 10 * canvas.unit, cy - 20 * canvas.unit),
         (cx - 8 * canvas.unit, cy - 6 * canvas.unit),
         (cx - 8 * canvas.unit, cy + 6 * canvas.unit),
         (x0 + 10 * canvas.unit, cy + 20 * canvas.unit)],
        width=2 * canvas.unit,
    )
    canvas.polygon(
        [(x1 - 10 * canvas.unit, cy - 20 * canvas.unit),
         (cx + 8 * canvas.unit, cy - 6 * canvas.unit),
         (cx + 8 * canvas.unit, cy + 6 * canvas.unit),
         (x1 - 10 * canvas.unit, cy + 20 * canvas.unit)],
        width=2 * canvas.unit,
    )
    canvas.rounded_box(
        (cx - 9 * canvas.unit, cy - 9 * canvas.unit,
         cx + 9 * canvas.unit, cy + 9 * canvas.unit),
        radius=3 * canvas.unit,
        width=2 * canvas.unit,
    )
    instrument_feet(canvas, box)


def test_bay(canvas: SceneCanvas, box: tuple[int, int, int, int], enclosure: int) -> None:
    """A plain test bay whose nested casing depth communicates specialization."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=5 * canvas.unit, width=3 * canvas.unit)
    for inset_index in range(enclosure):
        inset = (8 + inset_index * 7) * canvas.unit
        canvas.rounded_box(
            (x0 + inset, y0 + inset, x1 - inset, y1 - inset),
            radius=3 * canvas.unit,
            width=2 * canvas.unit,
        )
    instrument_feet(canvas, box)


def correction_jig(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    """A bounded mechanical correction jig with a single narrow throat."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=5 * canvas.unit, width=4 * canvas.unit)
    canvas.rounded_box(
        (x0 + 15 * canvas.unit, y0 + 12 * canvas.unit,
         x1 - 15 * canvas.unit, y1 - 12 * canvas.unit),
        radius=3 * canvas.unit,
        width=2 * canvas.unit,
    )
    cy = (y0 + y1) // 2
    canvas.line([(x0 + 5 * canvas.unit, cy), (x0 + 15 * canvas.unit, cy)], width=5 * canvas.unit)
    canvas.line([(x1 - 15 * canvas.unit, cy), (x1 - 5 * canvas.unit, cy)], width=5 * canvas.unit)


def chamber(canvas: SceneCanvas, box: tuple[int, int, int, int], *, textured: bool = False) -> None:
    """A sealed, unmarked materials chamber with a visible inner vessel."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=6 * canvas.unit, width=3 * canvas.unit)
    inner = (
        x0 + 12 * canvas.unit,
        y0 + 13 * canvas.unit,
        x1 - 12 * canvas.unit,
        y1 - 13 * canvas.unit,
    )
    canvas.rounded_box(inner, radius=4 * canvas.unit, width=2 * canvas.unit)
    if textured:
        canvas.stipple(
            (inner[0] + 6 * canvas.unit, inner[1] + 6 * canvas.unit,
             inner[2] - 6 * canvas.unit, inner[3] - 6 * canvas.unit),
            step=9 * canvas.unit,
        )
    instrument_feet(canvas, box)


def pellet_press(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    """A compact two-column press with opposed plain platens."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=4 * canvas.unit, width=3 * canvas.unit)
    cx = (x0 + x1) // 2
    canvas.line([(cx, y0 + 8 * canvas.unit), (cx, y0 + 25 * canvas.unit)], width=5 * canvas.unit)
    canvas.rounded_box(
        (cx - 17 * canvas.unit, y0 + 25 * canvas.unit,
         cx + 17 * canvas.unit, y0 + 35 * canvas.unit),
        radius=2 * canvas.unit,
        width=2 * canvas.unit,
    )
    canvas.rounded_box(
        (cx - 17 * canvas.unit, y1 - 23 * canvas.unit,
         cx + 17 * canvas.unit, y1 - 13 * canvas.unit),
        radius=2 * canvas.unit,
        width=2 * canvas.unit,
    )
    instrument_feet(canvas, box)


def wash_filter(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    """A practical filter housing with a hatched removable filter bed."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=6 * canvas.unit, width=3 * canvas.unit)
    bed = (
        x0 + 16 * canvas.unit,
        y0 + 17 * canvas.unit,
        x1 - 16 * canvas.unit,
        y1 - 17 * canvas.unit,
    )
    canvas.rounded_box(bed, radius=3 * canvas.unit, width=2 * canvas.unit)
    canvas.hatch(
        (bed[0] + 5 * canvas.unit, bed[1] + 5 * canvas.unit,
         bed[2] - 5 * canvas.unit, bed[3] - 5 * canvas.unit),
        spacing=8 * canvas.unit,
    )
    instrument_feet(canvas, box)


def decision_tray(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    """A deep, unmarked engineering decision tray with a receiving cradle."""
    x0, y0, x1, y1 = box
    canvas.polygon(
        [(x0, y0), (x1, y0),
         (x1 - 10 * canvas.unit, y1), (x0 + 10 * canvas.unit, y1)],
        width=3 * canvas.unit,
    )
    canvas.rounded_box(
        (x0 + 17 * canvas.unit, y0 + 12 * canvas.unit,
         x1 - 17 * canvas.unit, y1 - 10 * canvas.unit),
        radius=3 * canvas.unit,
        width=2 * canvas.unit,
    )


def nested_containment_pressure_cell() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A02-03"]["dimensions"])
    u = c.unit
    floor(c, 328 * u, 40 * u, 472 * u)
    # Three unmistakable mechanical containment rings around one pressure cell.
    rings = (
        (66 * u, 190 * u, 446 * u, 326 * u),
        (105 * u, 207 * u, 407 * u, 318 * u),
        (145 * u, 224 * u, 367 * u, 310 * u),
    )
    for ring in rings:
        c.ellipse(ring, width=5 * u)
    pressure_cell(c, (205 * u, 236 * u, 307 * u, 305 * u))
    # One restrained indigo boundary follows only the innermost containment ring.
    c.path(
        [(151 * u, 267 * u), (164 * u, 245 * u), (198 * u, 230 * u),
         (256 * u, 224 * u), (314 * u, 230 * u), (348 * u, 245 * u),
         (361 * u, 267 * u), (348 * u, 289 * u), (314 * u, 304 * u),
         (256 * u, 310 * u), (198 * u, 304 * u), (164 * u, 289 * u),
         (151 * u, 267 * u)],
        width=3 * u,
    )
    return c


def phased_evidence_test_hall() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A02-04"]["dimensions"])
    u = c.unit
    floor(c, 328 * u, 27 * u, 485 * u)
    rail(c, [(34 * u, 292 * u), (476 * u, 292 * u)])
    # Simple coupon rack nearest the viewer.
    c.rounded_box((36 * u, 226 * u, 111 * u, 317 * u), radius=4 * u, width=3 * u)
    for y in (245, 271, 297):
        c.line([(48 * u, y * u), (99 * u, y * u)], width=2 * u)
        sample_boat(c, (55 * u, (y - 12) * u, 92 * u, (y - 2) * u))
    # Progressively smaller and more deeply enclosed thermal, reaction, and interface bays.
    test_bay(c, (137 * u, 227 * u, 234 * u, 314 * u), 1)
    test_bay(c, (258 * u, 215 * u, 367 * u, 314 * u), 2)
    test_bay(c, (390 * u, 201 * u, 477 * u, 314 * u), 3)
    sample_boat(c, (161 * u, 279 * u, 205 * u, 290 * u))
    sample_boat(c, (290 * u, 279 * u, 334 * u, 290 * u))
    sample_boat(c, (412 * u, 279 * u, 456 * u, 290 * u))
    c.path(
        [(51 * u, 284 * u), (111 * u, 284 * u), (137 * u, 284 * u),
         (185 * u, 282 * u), (234 * u, 284 * u), (258 * u, 284 * u),
         (312 * u, 282 * u), (367 * u, 284 * u), (390 * u, 284 * u),
         (434 * u, 282 * u), (468 * u, 282 * u)],
        width=3 * u,
    )
    return c


def paired_spring_gauge_row() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A03-01"]["dimensions"])
    u = c.unit
    floor(c, 418 * u, 35 * u, 733 * u)
    xs = (85, 215, 345, 475, 605)
    measured_tops = (338, 322, 304, 286, 266)
    predicted_tops = (370, 352, 333, 313, 292)
    for x, measured_top, predicted_top in zip(xs, measured_tops, predicted_tops):
        # Two adjacent spring housings over one practical coupon.
        for offset in (-18, 18):
            c.rounded_box(
                ((x + offset - 12) * u, 218 * u,
                 (x + offset + 12) * u, 252 * u),
                radius=3 * u,
                width=2 * u,
            )
        # Measured ink spring and rod extend farther than the prediction.
        c.line(
            [((x - 18) * u, 252 * u), ((x - 24) * u, 261 * u),
             ((x - 12) * u, 270 * u), ((x - 24) * u, 279 * u),
             ((x - 12) * u, 288 * u), ((x - 18) * u, measured_top * u)],
            width=2 * u,
        )
        c.rounded_box(
            ((x - 29) * u, measured_top * u,
             (x - 7) * u, (measured_top + 10) * u),
            radius=2 * u,
            width=2 * u,
        )
        sample_boat(c, ((x - 38) * u, 390 * u, (x + 38) * u, 410 * u))
    # One continuous predicted manifold links all five shorter indigo gauge rods.
    prediction_points: list[tuple[int, int]] = [(67 * u, 252 * u)]
    for index, (x, predicted_top) in enumerate(zip(xs, predicted_tops)):
        prediction_points.extend(
            [((x + 18) * u, 252 * u), ((x + 12) * u, 261 * u),
             ((x + 24) * u, 270 * u), ((x + 12) * u, 279 * u),
             ((x + 24) * u, 288 * u), ((x + 18) * u, predicted_top * u),
             ((x + 18) * u, 377 * u)]
        )
        if index < len(xs) - 1:
            prediction_points.append(((xs[index + 1] + 18) * u, 377 * u))
            prediction_points.append(((xs[index + 1] + 18) * u, 252 * u))
    c.path(prediction_points, width=3 * u)
    return c


def bounded_correction_decision_rail() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A03-04"]["dimensions"])
    u = c.unit
    bench(c, 313 * u, 28 * u, 484 * u, leg_units=21)
    rail(c, [(39 * u, 277 * u), (475 * u, 277 * u)])
    cartridge(c, (44 * u, 246 * u, 151 * u, 294 * u))
    sample_boat(c, (163 * u, 260 * u, 207 * u, 275 * u))
    correction_jig(c, (222 * u, 218 * u, 303 * u, 304 * u))
    sample_boat(c, (320 * u, 258 * u, 364 * u, 275 * u))
    decision_tray(c, (389 * u, 238 * u, 468 * u, 303 * u))
    c.path(
        [(57 * u, 268 * u), (151 * u, 268 * u), (185 * u, 266 * u),
         (222 * u, 268 * u), (262 * u, 262 * u), (303 * u, 268 * u),
         (342 * u, 266 * u), (389 * u, 268 * u), (428 * u, 264 * u)],
        width=3 * u,
    )
    return c


def makeability_survival_line() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A04-01"]["dimensions"])
    u = c.unit
    floor(c, 420 * u, 28 * u, 740 * u)
    rail(c, [(37 * u, 377 * u), (731 * u, 377 * u)])
    vessel(c, (42 * u, 292 * u, 160 * u, 405 * u), cutaway=True)
    pellet_press(c, (213 * u, 283 * u, 333 * u, 408 * u))
    chamber(c, (387 * u, 286 * u, 532 * u, 408 * u), textured=True)
    cartridge(c, (582 * u, 337 * u, 716 * u, 398 * u))
    c.path(
        [(75 * u, 365 * u), (160 * u, 365 * u), (213 * u, 365 * u),
         (273 * u, 357 * u), (333 * u, 365 * u), (387 * u, 365 * u),
         (459 * u, 357 * u), (532 * u, 365 * u), (582 * u, 365 * u),
         (649 * u, 360 * u), (716 * u, 365 * u)],
        width=3 * u,
    )
    return c


def bonded_dac_panel_cutaway() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A04-02"]["dimensions"])
    u = c.unit
    floor(c, 329 * u, 42 * u, 470 * u)
    # A framed contactor holds a bonded porous layer against a hatched metal support.
    c.rounded_box((141 * u, 188 * u, 371 * u, 321 * u), radius=6 * u, width=4 * u)
    c.rounded_box((168 * u, 207 * u, 344 * u, 307 * u), radius=3 * u, width=2 * u)
    coating = (204 * u, 216 * u, 245 * u, 298 * u)
    support = (245 * u, 216 * u, 300 * u, 298 * u)
    c.rounded_box(coating, radius=2 * u, width=2 * u)
    c.stipple(
        (coating[0] + 5 * u, coating[1] + 5 * u,
         coating[2] - 5 * u, coating[3] - 5 * u),
        step=7 * u,
    )
    c.rounded_box(support, radius=2 * u, width=3 * u)
    c.hatch(
        (support[0] + 6 * u, support[1] + 6 * u,
         support[2] - 6 * u, support[3] - 6 * u),
        spacing=8 * u,
    )
    for x in (158, 354):
        c.line([(x * u, 321 * u), (x * u, 328 * u)], width=4 * u)
    # One sparse continuous airflow path crosses coating then mechanical support.
    c.path(
        [(58 * u, 254 * u), (112 * u, 249 * u), (168 * u, 255 * u),
         (204 * u, 249 * u), (245 * u, 255 * u), (300 * u, 249 * u),
         (344 * u, 255 * u), (399 * u, 249 * u), (454 * u, 254 * u)],
        width=3 * u,
    )
    return c


def straight_materials_check_line() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A04-03"]["dimensions"])
    u = c.unit
    floor(c, 330 * u, 27 * u, 485 * u)
    rail(c, [(36 * u, 290 * u), (476 * u, 290 * u)])
    vessel(c, (40 * u, 224 * u, 126 * u, 316 * u), cutaway=True)
    wash_filter(c, (155 * u, 223 * u, 242 * u, 316 * u))
    chamber(c, (271 * u, 216 * u, 373 * u, 316 * u), textured=False)
    cartridge(c, (402 * u, 254 * u, 471 * u, 306 * u))
    c.path(
        [(58 * u, 279 * u), (126 * u, 279 * u), (155 * u, 279 * u),
         (198 * u, 274 * u), (242 * u, 279 * u), (271 * u, 279 * u),
         (322 * u, 274 * u), (373 * u, 279 * u), (402 * u, 279 * u),
         (436 * u, 275 * u), (471 * u, 279 * u)],
        width=3 * u,
    )
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B6-A02-03": nested_containment_pressure_cell,
    "SW1-B6-A02-04": phased_evidence_test_hall,
    "SW1-B6-A03-01": paired_spring_gauge_row,
    "SW1-B6-A03-04": bounded_correction_decision_rail,
    "SW1-B6-A04-01": makeability_survival_line,
    "SW1-B6-A04-02": bonded_dac_panel_cutaway,
    "SW1-B6-A04-03": straight_materials_check_line,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
