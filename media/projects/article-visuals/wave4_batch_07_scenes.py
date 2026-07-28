#!/usr/bin/env python3
"""Wave-4 batch 07 scenes built from deterministic, glyph-free PIL primitives."""

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
    test_instrument,
    vessel,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B5-A03-03": {
        "archetype": "cantilever-three-pointer-jig",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A03-03--cantilever-three-pointer-jig.png",
        "scene": "A cantilever coupon in a displacement-test jig with three adjacent physical pointers showing raw prediction, corrected prediction, and measured deflection without scales.",
        "mechanism": "the pointers compare whether correction moves the prediction toward the measured deflection",
    },
    "SW1-B5-A04-02": {
        "archetype": "migration-ridge-pin-rig",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A04-02--migration-ridge-pin-rig.png",
        "scene": "A solid-electrolyte migration rig with one ink ridge formed by measurement pins and a lower indigo trajectory passing beneath it.",
        "mechanism": "the rig exposes systematic underestimation of the ion migration barrier",
    },
    "SW1-B5-A04-04": {
        "archetype": "magnetic-specimen-abstention-tray",
        "dimensions": (1536, 1024),
        "filename": "SW1-B5-A04-04--magnetic-specimen-abstention-tray.png",
        "scene": "A magnetic specimen rests in a sealed side tray outside a nonmagnetic correction fixture whose empty cradle is clearly incompatible.",
        "mechanism": "the workflow abstains by keeping unsupported magnetic material outside the correction fixture",
    },
    "SW1-B6-A01-01": {
        "archetype": "shared-reference-diffusion-rigs",
        "dimensions": (1536, 864),
        "filename": "SW1-B6-A01-01--shared-reference-diffusion-rigs.png",
        "scene": "A row of solid-electrolyte coupons mounted in identical diffusion rigs, with a sparse set of shared reference pins aligned across all rigs.",
        "mechanism": "the shared reference pins anchor comparison of migration barriers across the coupon panel",
    },
    "SW1-B6-A01-02": {
        "archetype": "union-route-shared-stations",
        "dimensions": (1536, 1024),
        "filename": "SW1-B6-A01-02--union-route-shared-stations.png",
        "scene": "A broad array of untouched electrolyte coupons surrounding a compact central route through three shared physical diffusion-test stations.",
        "mechanism": "the union route reuses shared stations instead of repeating every possible barrier test",
    },
    "SW1-B6-A01-03": {
        "archetype": "ranked-coupon-response-gauges",
        "dimensions": (1536, 1024),
        "filename": "SW1-B6-A01-03--ranked-coupon-response-gauges.png",
        "scene": "Five battery-material coupons ordered along a bench beneath spring-loaded response gauges; the pointer order agrees while every predicted stop sits short of its measured stop.",
        "mechanism": "the gauges preserve candidate ranking while exposing underestimated barrier magnitude",
    },
    "SW1-B6-A02-01": {
        "archetype": "specialized-test-bay-sequence",
        "dimensions": (1536, 864),
        "filename": "SW1-B6-A02-01--specialized-test-bay-sequence.png",
        "scene": "A row of four increasingly specialized test bays: bulk compression, defect scanning, reaction vessel, and interface microscopy, receding across a bare laboratory floor.",
        "mechanism": "each material environment is routed to the level of test equipment its complexity requires",
    },
    "SW1-B6-A02-02": {
        "archetype": "evidence-allocation-switch-rail",
        "dimensions": (1536, 1024),
        "filename": "SW1-B6-A02-02--evidence-allocation-switch-rail.png",
        "scene": "A branching sample rail at a quiet allocation station: simple coupons enter a rapid screen while one complex interface coupon is diverted to a reference chamber.",
        "mechanism": "the physical switch routes work according to evidence difficulty",
    },
}


def rail(canvas: SceneCanvas, points: list[tuple[int, int]]) -> None:
    """A double-line physical rail, deliberately without arrowheads or markings."""
    canvas.line(points, width=7 * canvas.unit)
    canvas.line(points, fill=PAPER, width=3 * canvas.unit)


def spring(canvas: SceneCanvas, x: int, y0: int, y1: int) -> None:
    """A plain compression spring attached to a physical response rod."""
    u = canvas.unit
    points = [(x, y0)]
    step = max(2 * u, (y1 - y0) // 8)
    side = 1
    y = y0 + step
    while y < y1:
        points.append((x + side * 5 * u, y))
        side *= -1
        y += step
    points.append((x, y1))
    canvas.line(points, width=2 * u)


def diffusion_rig(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    """An identical physical diffusion station holding one electrolyte coupon."""
    x0, y0, x1, y1 = box
    u = canvas.unit
    canvas.rounded_box(box, radius=4 * u, width=3 * u)
    cy = (y0 + y1) // 2
    canvas.rounded_box((x0 + 8 * u, cy - 13 * u, x1 - 8 * u, cy + 13 * u), radius=3 * u)
    canvas.rounded_box((x0 + 19 * u, cy - 7 * u, x1 - 19 * u, cy + 7 * u), radius=2 * u, width=2 * u)
    instrument_feet(canvas, box)


def compression_bay(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    u = canvas.unit
    canvas.rounded_box(box, radius=4 * u, width=3 * u)
    canvas.rounded_box((x0 + 14 * u, y0 + 12 * u, x1 - 14 * u, y0 + 23 * u), radius=2 * u)
    canvas.rounded_box((x0 + 14 * u, y1 - 23 * u, x1 - 14 * u, y1 - 12 * u), radius=2 * u)
    canvas.rounded_box((x0 + 28 * u, y0 + 23 * u, x1 - 28 * u, y1 - 23 * u), radius=2 * u, width=2 * u)
    instrument_feet(canvas, box)


def reference_chamber(canvas: SceneCanvas, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    u = canvas.unit
    canvas.rounded_box(box, radius=6 * u, width=4 * u)
    canvas.rounded_box((x0 + 13 * u, y0 + 14 * u, x1 - 13 * u, y1 - 13 * u), radius=4 * u, width=2 * u)
    canvas.rounded_box((x0 + 30 * u, y0 + 31 * u, x1 - 30 * u, y1 - 29 * u), radius=2 * u)
    instrument_feet(canvas, box)


def cantilever_three_pointer_jig() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A03-03"]["dimensions"])
    u = c.unit
    bench(c, 316 * u, 28 * u, 484 * u, leg_units=18)
    c.rounded_box((49 * u, 232 * u, 108 * u, 310 * u), radius=3 * u, width=4 * u)
    c.rounded_box((67 * u, 250 * u, 102 * u, 292 * u), radius=2 * u, width=3 * u)
    c.polygon([(102 * u, 265 * u), (425 * u, 267 * u), (452 * u, 286 * u), (102 * u, 280 * u)], width=3 * u)
    c.rounded_box((292 * u, 206 * u, 467 * u, 224 * u), radius=3 * u, width=3 * u)
    for x, stop_y in ((325, 255), (375, 271), (425, 285)):
        c.rounded_box(((x - 8) * u, 216 * u, (x + 8) * u, 235 * u), radius=2 * u, width=2 * u)
        c.line([(x * u, 235 * u), (x * u, stop_y * u)], width=3 * u)
        c.rounded_box(((x - 11) * u, (stop_y - 3) * u, (x + 11) * u, (stop_y + 3) * u), radius=u, width=2 * u)
    c.path([(111 * u, 272 * u), (205 * u, 272 * u), (286 * u, 273 * u), (375 * u, 271 * u)], width=3 * u)
    return c


def migration_ridge_pin_rig() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A04-02"]["dimensions"])
    u = c.unit
    bench(c, 318 * u, 30 * u, 482 * u, leg_units=17)
    c.rounded_box((49 * u, 258 * u, 463 * u, 312 * u), radius=5 * u, width=3 * u)
    c.rounded_box((67 * u, 271 * u, 445 * u, 300 * u), radius=3 * u, width=2 * u)
    c.line([(76 * u, 222 * u), (436 * u, 222 * u)], width=5 * u)
    heights = (255, 249, 239, 230, 221, 226, 236, 247, 254)
    for x, y in zip(range(88, 425, 42), heights):
        c.rounded_box(((x - 6) * u, 214 * u, (x + 6) * u, 228 * u), radius=2 * u, width=2 * u)
        c.line([(x * u, 228 * u), (x * u, y * u)], width=3 * u)
        c.ellipse(((x - 4) * u, (y - 2) * u, (x + 4) * u, (y + 5) * u), fill=INK, width=u)
    c.path([(74 * u, 286 * u), (128 * u, 284 * u), (182 * u, 287 * u), (236 * u, 282 * u), (290 * u, 286 * u), (344 * u, 283 * u), (398 * u, 286 * u), (442 * u, 284 * u)], width=4 * u)
    return c


def magnetic_specimen_abstention_tray() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B5-A04-04"]["dimensions"])
    u = c.unit
    floor(c, 324 * u, 31 * u, 481 * u)
    fixture = (281 * u, 207 * u, 466 * u, 312 * u)
    c.rounded_box(fixture, radius=5 * u, width=4 * u)
    c.rounded_box((321 * u, 239 * u, 427 * u, 292 * u), radius=4 * u, width=3 * u)
    c.rounded_box((349 * u, 251 * u, 399 * u, 281 * u), radius=3 * u, width=2 * u)
    instrument_feet(c, fixture)
    tray = (45 * u, 245 * u, 217 * u, 315 * u)
    c.rounded_box(tray, radius=5 * u, width=4 * u)
    c.rounded_box((58 * u, 258 * u, 204 * u, 302 * u), radius=3 * u, width=2 * u)
    c.rounded_box((80 * u, 267 * u, 129 * u, 294 * u), radius=4 * u, width=3 * u)
    c.rounded_box((134 * u, 267 * u, 183 * u, 294 * u), radius=4 * u, width=3 * u)
    c.line([(217 * u, 272 * u), (238 * u, 272 * u)], width=6 * u)
    c.line([(238 * u, 250 * u), (238 * u, 298 * u)], width=5 * u)
    c.path([(273 * u, 271 * u), (238 * u, 271 * u), (217 * u, 280 * u), (183 * u, 280 * u), (134 * u, 280 * u)], width=3 * u)
    return c


def shared_reference_diffusion_rigs() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A01-01"]["dimensions"])
    u = c.unit
    floor(c, 390 * u, 40 * u, 728 * u)
    xs = (64, 190, 316, 442, 568)
    for x in xs:
        diffusion_rig(c, (x * u, 290 * u, (x + 96) * u, 374 * u))
    c.line([(53 * u, 263 * u), (686 * u, 263 * u)], width=5 * u)
    for x in (112, 238, 364, 490, 616):
        c.rounded_box(((x - 7) * u, 252 * u, (x + 7) * u, 270 * u), radius=2 * u, width=2 * u)
        c.line([(x * u, 270 * u), (x * u, 302 * u)], width=3 * u)
    c.path([(53 * u, 257 * u), (175 * u, 257 * u), (301 * u, 257 * u), (427 * u, 257 * u), (553 * u, 257 * u), (686 * u, 257 * u)], width=3 * u)
    return c


def union_route_shared_stations() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A01-02"]["dimensions"])
    u = c.unit
    floor(c, 327 * u, 28 * u, 484 * u)
    for x, y in ((38, 245), (92, 225), (146, 245), (340, 245), (394, 225), (448, 245), (65, 301), (421, 301)):
        sample_boat(c, (x * u, y * u, (x + 39) * u, (y + 14) * u))
    stations = ((177, 240, 259, 306), (266, 226, 348, 306), (355, 240, 437, 306))
    for x0, y0, x1, y1 in stations:
        diffusion_rig(c, (x0 * u, y0 * u, x1 * u, y1 * u))
    c.path([(149 * u, 277 * u), (177 * u, 277 * u), (218 * u, 269 * u), (259 * u, 277 * u), (266 * u, 277 * u), (307 * u, 261 * u), (348 * u, 277 * u), (355 * u, 277 * u), (396 * u, 269 * u), (437 * u, 277 * u)], width=3 * u)
    return c


def ranked_coupon_response_gauges() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A01-03"]["dimensions"])
    u = c.unit
    bench(c, 319 * u, 27 * u, 485 * u, leg_units=16)
    xs = (70, 158, 246, 334, 422)
    measured = (283, 275, 266, 256, 245)
    predicted = (297, 290, 282, 273, 263)
    c.line([(50 * u, 210 * u), (470 * u, 210 * u)], width=5 * u)
    for x, measured_y, predicted_y in zip(xs, measured, predicted):
        sample_boat(c, ((x - 25) * u, 300 * u, (x + 25) * u, 316 * u))
        c.rounded_box(((x - 10) * u, 203 * u, (x + 10) * u, 220 * u), radius=2 * u, width=2 * u)
        spring(c, x * u, 220 * u, (measured_y - 5) * u)
        c.line([(x * u, (measured_y - 5) * u), (x * u, 299 * u)], width=3 * u)
        c.rounded_box(((x - 14) * u, (predicted_y - 3) * u, (x + 14) * u, (predicted_y + 3) * u), radius=u, width=2 * u)
        c.rounded_box(((x - 18) * u, (measured_y - 3) * u, (x + 18) * u, (measured_y + 3) * u), radius=u, width=3 * u)
    # A straight physical coupling rail avoids turning the five ordered gauges into a chart.
    c.path([(45 * u, 309 * u), (470 * u, 309 * u)], width=3 * u)
    return c


def specialized_test_bay_sequence() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A02-01"]["dimensions"])
    u = c.unit
    floor(c, 392 * u, 38 * u, 730 * u)
    compression_bay(c, (50 * u, 286 * u, 180 * u, 375 * u))
    scan_box = (220 * u, 294 * u, 344 * u, 375 * u)
    c.rounded_box(scan_box, radius=4 * u, width=3 * u)
    c.rounded_box((238 * u, 343 * u, 326 * u, 367 * u), radius=3 * u, width=2 * u)
    probe(c, 282 * u, 304 * u, 343 * u)
    instrument_feet(c, scan_box)
    vessel(c, (397 * u, 298 * u, 491 * u, 375 * u), cutaway=True)
    scope = (548 * u, 282 * u, 700 * u, 375 * u)
    c.rounded_box(scope, radius=5 * u, width=3 * u)
    c.ellipse((576 * u, 301 * u, 622 * u, 347 * u), width=3 * u)
    c.line([(622 * u, 324 * u), (655 * u, 324 * u), (672 * u, 349 * u)], width=5 * u)
    c.rounded_box((639 * u, 349 * u, 687 * u, 365 * u), radius=2 * u, width=2 * u)
    instrument_feet(c, scope)
    c.path([(39 * u, 365 * u), (115 * u, 365 * u), (180 * u, 365 * u), (220 * u, 359 * u), (344 * u, 359 * u), (397 * u, 359 * u), (491 * u, 359 * u), (548 * u, 359 * u), (624 * u, 351 * u), (700 * u, 359 * u)], width=3 * u)
    return c


def evidence_allocation_switch_rail() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B6-A02-02"]["dimensions"])
    u = c.unit
    floor(c, 327 * u, 29 * u, 483 * u)
    rail(c, [(35 * u, 283 * u), (224 * u, 283 * u), (303 * u, 251 * u), (352 * u, 251 * u)])
    rail(c, [(224 * u, 283 * u), (303 * u, 304 * u), (352 * u, 304 * u)])
    for x in (55, 111, 167):
        cartridge(c, (x * u, 264 * u, (x + 43) * u, 299 * u))
    c.rounded_box((213 * u, 265 * u, 245 * u, 300 * u), radius=5 * u, width=4 * u)
    rapid = (348 * u, 267 * u, 463 * u, 319 * u)
    test_instrument(c, rapid)
    chamber = (348 * u, 196 * u, 466 * u, 270 * u)
    reference_chamber(c, chamber)
    c.rounded_box((267 * u, 226 * u, 317 * u, 253 * u), radius=2 * u, width=3 * u)
    c.hatch((276 * u, 231 * u, 308 * u, 248 * u), spacing=7 * u)
    c.path([(167 * u, 278 * u), (224 * u, 278 * u), (263 * u, 260 * u), (303 * u, 246 * u), (348 * u, 246 * u), (407 * u, 239 * u)], width=3 * u)
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B5-A03-03": cantilever_three_pointer_jig,
    "SW1-B5-A04-02": migration_ridge_pin_rig,
    "SW1-B5-A04-04": magnetic_specimen_abstention_tray,
    "SW1-B6-A01-01": shared_reference_diffusion_rigs,
    "SW1-B6-A01-02": union_route_shared_stations,
    "SW1-B6-A01-03": ranked_coupon_response_gauges,
    "SW1-B6-A02-01": specialized_test_bay_sequence,
    "SW1-B6-A02-02": evidence_allocation_switch_rail,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
