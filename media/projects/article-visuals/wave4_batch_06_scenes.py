#!/usr/bin/env python3
"""Wave-4 batch 06 scenes built from deterministic, glyph-free PIL primitives."""

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
    probe,
    sample_boat,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B4-A04-04": {
        "archetype": "evidence-gate-routing-bench",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A04-04--evidence-gate-routing-bench.png",
        "scene": "A risk-routing bench where candidate trays approach one mechanical evidence gate; several stop in side bays and one continues toward a small pilot reactor.",
        "mechanism": "the evidence gate routes insufficient candidates aside before pilot equipment",
    },
    "SW1-B5-A01-02": {
        "archetype": "interface-probe-correction-band",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A01-02--interface-probe-correction-band.png",
        "scene": "A dense row of identical displacement probes scanning across one ceramic-to-metal interface in a practical cell cross-section.",
        "mechanism": "the local probe readings join into one smooth indigo correction band along the interface",
    },
    "SW1-B5-A01-03": {
        "archetype": "bounded-correction-tensile-rail",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A01-03--bounded-correction-tensile-rail.png",
        "scene": "A material coupon traveling on a short rail from a prediction cartridge through one compact correction plate and into a tensile-test frame.",
        "mechanism": "the bounded correction plate adjusts the predicted path before the physical tensile test",
    },
    "SW1-B5-A01-04": {
        "archetype": "proof-frame-specimen-rail",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A01-04--proof-frame-specimen-rail.png",
        "scene": "A rigid rectangular proof frame mounted over a specimen rail, with one compatible sample carriage passing through and one incompatible carriage stopped at the edge.",
        "mechanism": "the frame physically bounds which correction path may proceed to testing",
    },
    "SW1-B5-A02-02": {
        "archetype": "rank-agreement-pedestal-rows",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A02-02--rank-agreement-pedestal-rows.png",
        "scene": "Two parallel rows of four unmarked engineering coupons on stepped mechanical pedestals; both rows preserve the same order while the pedestal heights differ.",
        "mechanism": "the pedestal ordering shows rank agreement despite mismatched measured magnitude",
    },
    "SW1-B5-A02-03": {
        "archetype": "sealed-prediction-compression-test",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A02-03--sealed-prediction-compression-test.png",
        "scene": "A sealed prediction cartridge locked in a cradle outside an independent compression-test chamber, with the specimen entering through a separate hatch.",
        "mechanism": "the sealed prediction remains untouched until the independent measurement is complete",
    },
    "SW1-B5-A02-04": {
        "archetype": "correction-plate-fatigue-fixture",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A02-04--correction-plate-fatigue-fixture.png",
        "scene": "A compact correction plate inserted between an interatomic-model cartridge and a finite-element fatigue-test fixture for one turbine-blade coupon.",
        "mechanism": "the plate applies a bounded local correction before the coupon simulation reaches the fatigue fixture",
    },
    "SW1-B5-A03-02": {
        "archetype": "probe-mapped-defect-cliff",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A03-02--probe-mapped-defect-cliff.png",
        "scene": "A defect-rich ceramic surface beneath a scanning probe, with one smooth polished region ending sharply at a cracked rough region.",
        "mechanism": "the probe maps where a smooth correction field ceases to be supported at the defect cliff",
    },
}


def rail(canvas: SceneCanvas, points: list[tuple[int, int]]) -> None:
    """A substantial double-line physical rail without arrowheads or markings."""
    canvas.line(points, width=7 * canvas.unit)
    canvas.line(points, fill=PAPER, width=3 * canvas.unit)


def carriage(canvas: SceneCanvas, box: tuple[int, int, int, int], *, tall: bool = False) -> None:
    """An unmarked specimen carriage with four plain rollers."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=3 * canvas.unit, width=2 * canvas.unit)
    if tall:
        canvas.rounded_box(
            (x0 + 8 * canvas.unit, y0 - 11 * canvas.unit, x1 - 8 * canvas.unit, y0),
            radius=2 * canvas.unit,
            width=2 * canvas.unit,
        )
    for x in (x0 + 9 * canvas.unit, x1 - 12 * canvas.unit):
        canvas.ellipse(
            (x, y1 - canvas.unit, x + 4 * canvas.unit, y1 + 3 * canvas.unit),
            fill=INK,
            width=canvas.unit,
        )


def correction_plate(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    """A compact bounded plate with a single plain physical channel."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=4 * canvas.unit, width=3 * canvas.unit)
    canvas.rounded_box(
        (x0 + 8 * canvas.unit, y0 + 10 * canvas.unit, x1 - 8 * canvas.unit, y1 - 10 * canvas.unit),
        radius=3 * canvas.unit,
        width=2 * canvas.unit,
    )
    for y in (y0 + 7 * canvas.unit, y1 - 10 * canvas.unit):
        for x in (x0 + 5 * canvas.unit, x1 - 8 * canvas.unit):
            canvas.ellipse((x, y, x + 3 * canvas.unit, y + 3 * canvas.unit), fill=INK, width=canvas.unit)


def tensile_frame(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    """A physical two-column tensile frame with opposed specimen grips."""
    x0, y0, x1, y1 = box
    canvas.rounded_box(box, radius=4 * canvas.unit, width=3 * canvas.unit)
    canvas.rounded_box(
        (x0 + 17 * canvas.unit, y0 + 12 * canvas.unit, x1 - 17 * canvas.unit, y1 - 12 * canvas.unit),
        radius=3 * canvas.unit,
        width=2 * canvas.unit,
    )
    cy = (y0 + y1) // 2
    canvas.rounded_box((x0 + 22 * canvas.unit, cy - 8 * canvas.unit, x0 + 39 * canvas.unit, cy + 8 * canvas.unit), radius=2 * canvas.unit)
    canvas.rounded_box((x1 - 39 * canvas.unit, cy - 8 * canvas.unit, x1 - 22 * canvas.unit, cy + 8 * canvas.unit), radius=2 * canvas.unit)
    canvas.line([(x0 + 39 * canvas.unit, cy), (x1 - 39 * canvas.unit, cy)], width=5 * canvas.unit)
    instrument_feet(canvas, box)


def evidence_gate_routing_bench() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A04-04"]["dimensions"])
    u = c.unit
    bench(c, 306 * u, 25 * u, 487 * u)
    rail(c, [(34 * u, 275 * u), (222 * u, 275 * u), (222 * u, 291 * u), (474 * u, 291 * u)])

    for x in (55, 108, 161):
        carriage(c, (x * u, 252 * u, (x + 38) * u, 273 * u))

    gate = (215 * u, 213 * u, 282 * u, 302 * u)
    c.rounded_box(gate, radius=4 * u, width=4 * u)
    c.rounded_box((232 * u, 231 * u, 265 * u, 288 * u), radius=3 * u, width=2 * u)
    c.line([(248 * u, 213 * u), (248 * u, 198 * u)], width=4 * u)
    c.rounded_box((235 * u, 193 * u, 261 * u, 201 * u), radius=2 * u)

    # Three unmistakable dead-end bays branch from the gate and hold stopped trays.
    for x, y in ((304, 224), (356, 238), (408, 252)):
        rail(c, [(282 * u, 270 * u), (x * u, 270 * u), (x * u, y * u)])
        carriage(c, ((x - 18) * u, (y - 23) * u, (x + 18) * u, (y - 3) * u))
        c.line([((x - 22) * u, (y - 28) * u), ((x + 22) * u, (y - 28) * u)], width=4 * u)

    # Small pilot reactor at the one continuing rail endpoint.
    reactor = (420 * u, 238 * u, 474 * u, 301 * u)
    c.rounded_box(reactor, radius=14 * u, width=3 * u)
    c.rounded_box((435 * u, 252 * u, 459 * u, 286 * u), radius=5 * u, width=2 * u)
    instrument_feet(c, reactor)
    c.path([(58 * u, 265 * u), (222 * u, 265 * u), (248 * u, 265 * u),
            (282 * u, 275 * u), (346 * u, 291 * u), (420 * u, 291 * u),
            (447 * u, 270 * u)], width=3 * u)
    return c


def interface_probe_correction_band() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A01-02"]["dimensions"])
    u = c.unit
    cell = (42 * u, 260 * u, 470 * u, 318 * u)
    c.rounded_box(cell, radius=4 * u, width=3 * u)
    boundary = 259 * u
    c.line([(boundary, 261 * u), (boundary, 316 * u)], width=4 * u)
    c.stipple((55 * u, 272 * u, 249 * u, 307 * u), step=10 * u)
    c.hatch((270 * u, 272 * u, 457 * u, 307 * u), spacing=9 * u)

    for x in (75, 125, 175, 225, 275, 325, 375, 425):
        probe(c, x * u, 200 * u, 260 * u)
    # One continuous correction band follows the physical ceramic/metal interface.
    c.path([(55 * u, 266 * u), (116 * u, 264 * u), (177 * u, 267 * u),
            (238 * u, 263 * u), (299 * u, 266 * u), (360 * u, 262 * u),
            (421 * u, 265 * u), (457 * u, 264 * u)], width=4 * u)
    return c


def bounded_correction_tensile_rail() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A01-03"]["dimensions"])
    u = c.unit
    bench(c, 307 * u, 27 * u, 485 * u, leg_units=24)
    rail(c, [(42 * u, 270 * u), (470 * u, 270 * u)])
    cartridge(c, (48 * u, 241 * u, 156 * u, 286 * u))
    carriage(c, (174 * u, 247 * u, 223 * u, 269 * u))
    correction_plate(c, (239 * u, 215 * u, 306 * u, 298 * u))
    tensile_frame(c, (330 * u, 198 * u, 466 * u, 302 * u))
    c.path([(66 * u, 263 * u), (156 * u, 263 * u), (198 * u, 260 * u),
            (239 * u, 260 * u), (272 * u, 256 * u), (306 * u, 260 * u),
            (330 * u, 260 * u), (398 * u, 250 * u)], width=3 * u)
    return c


def proof_frame_specimen_rail() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A01-04"]["dimensions"])
    u = c.unit
    floor(c, 320 * u, 30 * u, 482 * u)
    rail(c, [(35 * u, 278 * u), (478 * u, 278 * u)])
    frame = (207 * u, 199 * u, 311 * u, 307 * u)
    c.rounded_box(frame, radius=3 * u, width=5 * u)
    c.rounded_box((226 * u, 222 * u, 292 * u, 291 * u), radius=2 * u, width=3 * u)
    instrument_feet(c, frame)

    carriage(c, (236 * u, 251 * u, 283 * u, 276 * u))
    # The taller carriage is physically too high for the inner aperture and stops at its edge.
    carriage(c, (127 * u, 250 * u, 187 * u, 276 * u), tall=True)
    c.rounded_box((106 * u, 231 * u, 124 * u, 290 * u), radius=2 * u, width=3 * u)
    c.path([(43 * u, 267 * u), (97 * u, 267 * u), (127 * u, 267 * u),
            (187 * u, 267 * u), (207 * u, 267 * u), (259 * u, 267 * u),
            (311 * u, 267 * u), (470 * u, 267 * u)], width=3 * u)
    return c


def rank_agreement_pedestal_rows() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A02-02"]["dimensions"])
    u = c.unit
    floor(c, 325 * u, 36 * u, 476 * u)
    xs = (74, 176, 278, 380)
    front_heights = (25, 39, 53, 67)
    back_heights = (16, 29, 42, 55)
    for x, front_h, back_h in zip(xs, front_heights, back_heights):
        # Rear row: shallower perspective baseline but identical left-to-right order.
        c.rounded_box((x * u, (268 - back_h) * u, (x + 56) * u, 268 * u), radius=3 * u, width=2 * u)
        sample_boat(c, ((x + 8) * u, (254 - back_h) * u, (x + 48) * u, (267 - back_h) * u))
        # Front row: a different magnitude scale while retaining the same ordering.
        c.rounded_box(((x + 13) * u, (321 - front_h) * u, (x + 69) * u, 321 * u), radius=3 * u, width=2 * u)
        sample_boat(c, ((x + 21) * u, (307 - front_h) * u, (x + 61) * u, (320 - front_h) * u))
    # One physical coupling rail passes through the front pedestal bases; it is not a plotted axis.
    c.path([(51 * u, 314 * u), (115 * u, 314 * u), (166 * u, 312 * u),
            (217 * u, 314 * u), (268 * u, 311 * u), (319 * u, 314 * u),
            (370 * u, 310 * u), (421 * u, 314 * u), (472 * u, 314 * u)], width=3 * u)
    return c


def sealed_prediction_compression_test() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A02-03"]["dimensions"])
    u = c.unit
    floor(c, 321 * u, 30 * u, 482 * u)
    # Locked cartridge and cradle remain physically isolated left of the chamber.
    cartridge(c, (47 * u, 252 * u, 155 * u, 287 * u))
    c.rounded_box((38 * u, 238 * u, 164 * u, 298 * u), radius=4 * u, width=3 * u)
    for x in (45, 151):
        c.line([(x * u, 241 * u), (x * u, 230 * u), ((x + 6) * u, 224 * u)], width=3 * u)

    chamber = (250 * u, 194 * u, 466 * u, 307 * u)
    c.rounded_box(chamber, radius=7 * u, width=4 * u)
    c.rounded_box((272 * u, 215 * u, 444 * u, 290 * u), radius=4 * u, width=2 * u)
    hatch = (235 * u, 240 * u, 274 * u, 278 * u)
    c.rounded_box(hatch, radius=3 * u, width=3 * u)
    # Opposed platens and a separate unmarked specimen inside the chamber.
    c.rounded_box((315 * u, 224 * u, 401 * u, 239 * u), radius=2 * u)
    c.rounded_box((315 * u, 270 * u, 401 * u, 285 * u), radius=2 * u)
    c.line([(358 * u, 239 * u), (358 * u, 248 * u)], width=5 * u)
    c.rounded_box((344 * u, 248 * u, 372 * u, 270 * u), radius=2 * u, width=3 * u)
    c.path([(187 * u, 258 * u), (235 * u, 258 * u), (274 * u, 258 * u),
            (318 * u, 258 * u), (344 * u, 258 * u), (372 * u, 258 * u)], width=3 * u)
    return c


def correction_plate_fatigue_fixture() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A02-04"]["dimensions"])
    u = c.unit
    bench(c, 308 * u, 25 * u, 487 * u, leg_units=23)
    rail(c, [(38 * u, 269 * u), (476 * u, 269 * u)])
    cartridge(c, (43 * u, 242 * u, 154 * u, 286 * u))
    correction_plate(c, (187 * u, 216 * u, 254 * u, 298 * u))

    fixture = (292 * u, 198 * u, 468 * u, 302 * u)
    c.rounded_box(fixture, radius=5 * u, width=4 * u)
    c.rounded_box((311 * u, 217 * u, 449 * u, 285 * u), radius=3 * u, width=2 * u)
    # A plain turbine-blade coupon between a fixed root clamp and fatigue actuator.
    c.rounded_box((319 * u, 243 * u, 345 * u, 276 * u), radius=2 * u, width=3 * u)
    c.polygon([(345 * u, 248 * u), (397 * u, 238 * u), (425 * u, 251 * u),
               (398 * u, 267 * u), (345 * u, 270 * u)], width=3 * u)
    c.rounded_box((425 * u, 242 * u, 443 * u, 268 * u), radius=2 * u, width=3 * u)
    instrument_feet(c, fixture)
    c.path([(59 * u, 261 * u), (154 * u, 261 * u), (187 * u, 261 * u),
            (220 * u, 256 * u), (254 * u, 261 * u), (292 * u, 261 * u),
            (345 * u, 259 * u), (397 * u, 252 * u), (443 * u, 255 * u)], width=3 * u)
    return c


def probe_mapped_defect_cliff() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A03-02"]["dimensions"])
    u = c.unit
    # One practical scanning head above a ceramic coupon, never a radiating symbol.
    probe(c, 190 * u, 190 * u, 248 * u)
    c.line([(190 * u, 190 * u), (190 * u, 180 * u), (349 * u, 180 * u)], width=4 * u)
    c.rounded_box((337 * u, 174 * u, 365 * u, 190 * u), radius=3 * u)

    surface_y = 266 * u
    c.rounded_box((40 * u, surface_y, 472 * u, 320 * u), radius=4 * u, width=3 * u)
    # Polished region is sparse and smooth; rough region is stippled and visibly cracked.
    cliff_x = 292 * u
    c.line([(cliff_x, surface_y), (cliff_x, 318 * u)], width=4 * u)
    c.stipple((307 * u, 278 * u, 458 * u, 308 * u), step=8 * u)
    cracks = (
        [(318, 269), (311, 280), (320, 291), (315, 307)],
        [(356, 269), (364, 279), (358, 288), (367, 300), (363, 309)],
        [(407, 268), (398, 281), (405, 292), (397, 304), (402, 310)],
        [(446, 270), (451, 283), (442, 294), (449, 308)],
    )
    for crack in cracks:
        c.line([(x * u, y * u) for x, y in crack], width=2 * u)
    c.path([(55 * u, 258 * u), (105 * u, 256 * u), (155 * u, 259 * u),
            (205 * u, 255 * u), (255 * u, 258 * u), (286 * u, 258 * u)], width=4 * u)
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B4-A04-04": evidence_gate_routing_bench,
    "SW1-B5-A01-02": interface_probe_correction_band,
    "SW1-B5-A01-03": bounded_correction_tensile_rail,
    "SW1-B5-A01-04": proof_frame_specimen_rail,
    "SW1-B5-A02-02": rank_agreement_pedestal_rows,
    "SW1-B5-A02-03": sealed_prediction_compression_test,
    "SW1-B5-A02-04": correction_plate_fatigue_fixture,
    "SW1-B5-A03-02": probe_mapped_defect_cliff,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
