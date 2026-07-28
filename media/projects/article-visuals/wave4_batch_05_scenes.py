#!/usr/bin/env python3
"""Wave-4 batch 05 scenes built from deterministic, glyph-free PIL primitives."""

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
    pipe,
    probe,
    test_instrument,
    tube_furnace,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B4-A01-02": {
        "archetype": "coupon-transfer-rail",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A01-02--coupon-transfer-rail.png",
        "scene": "A sample-coupon transfer rail beginning at a simple pixel-pattern mask, passing through an X-ray instrument, and ending at a physical bend-test frame.",
        "mechanism": "the same coupon is fabricated, measured, and mechanically tested along one traceable rail",
    },
    "SW1-B4-A01-03": {
        "archetype": "sealed-evidence-table",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A01-03--sealed-evidence-table.png",
        "scene": "A low evidence table holding three unmarked sample blocks in fitted trays, each tray linked by a tamper-evident physical seal to one nearby instrument socket.",
        "mechanism": "the fitted tray and seal preserve sample provenance between storage and measurement",
    },
    "SW1-B4-A01-04": {
        "archetype": "instrumented-beam-load-frame",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A01-04--instrumented-beam-load-frame.png",
        "scene": "A small bridge beam mounted in a laboratory load frame, with scattered displacement probes along the beam converging on one restrained indigo strain ribbon.",
        "mechanism": "the probes combine into one measured strain profile used to judge the beam",
    },
    "SW1-B4-A02-02": {
        "archetype": "paired-plate-scanner",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A02-02--paired-plate-scanner.png",
        "scene": "Two plain metal field plates mounted side by side beneath the same scanning probe, with their surface mismatch visible as one narrow indigo displacement ribbon.",
        "mechanism": "the probe measures the local difference between predicted and reference plates",
    },
    "SW1-B4-A03-02": {
        "archetype": "four-station-materials-loop",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A03-02--four-station-materials-loop.png",
        "scene": "A circular materials bench with four connected stations: powder dosing, small furnace, measurement cradle, and an empty return tray.",
        "mechanism": "one specimen circulates through the make-measure-revise loop and returns for adjustment",
    },
    "SW1-B4-A03-04": {
        "archetype": "dual-instrument-cartridge-rack",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A03-04--dual-instrument-cartridge-rack.png",
        "scene": "A long rack of sealed evidence cartridges connected by identical mechanical couplers to two independent instruments at opposite ends.",
        "mechanism": "the common coupler lets independent instruments inspect the same immutable cartridge chain",
    },
    "SW1-B4-A04-01": {
        "archetype": "gated-pilot-pipeline",
        "dimensions": (1536, 864),
        "filename": "SW1-B4-A04-01--gated-pilot-pipeline.png",
        "scene": "A narrow pilot pipeline from powder hopper through sintering furnace to a pressure-test fixture, with one inspection gate interrupting the route before scale-up equipment.",
        "mechanism": "the inspection gate admits only measured samples to the pilot press",
    },
    "SW1-B4-A04-02": {
        "archetype": "calibration-traceability-chain",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A04-02--calibration-traceability-chain.png",
        "scene": "A calibration artifact in a sealed cradle connected by an unbroken physical chain of couplers to a specimen archive and a test instrument.",
        "mechanism": "the coupler chain makes every instrument result traceable to the calibration artifact",
    },
}


def coupler(canvas: SceneCanvas, x: int, y: int) -> None:
    """Draw one substantial, identical mechanical sleeve around a route."""
    u = canvas.unit
    canvas.rounded_box((x - 8 * u, y - 9 * u, x + 8 * u, y + 9 * u), radius=2 * u, width=2 * u)
    canvas.line([(x - 4 * u, y - 9 * u), (x - 4 * u, y + 9 * u)], width=u)
    canvas.line([(x + 4 * u, y - 9 * u), (x + 4 * u, y + 9 * u)], width=u)


def coupon_transfer_rail() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A01-02"]["dimensions"])
    u = c.unit
    bench(c, 302 * u, 24 * u, 488 * u)
    rail_y = 267 * u
    c.line([(42 * u, rail_y), (470 * u, rail_y)], width=6 * u)
    c.line([(42 * u, rail_y + 12 * u), (470 * u, rail_y + 12 * u)], width=2 * u)
    for x in range(55, 470, 34):
        c.ellipse(((x - 3) * u, (rail_y // u + 5) * u, (x + 3) * u, (rail_y // u + 11) * u), width=u)

    # A perforated fabrication mask, an enclosed X-ray tunnel, and a physical bend frame.
    c.rounded_box((50 * u, 218 * u, 124 * u, 258 * u), radius=3 * u, width=3 * u)
    for x, y in ((65, 230), (83, 230), (101, 230), (74, 246), (92, 246), (110, 246)):
        c.rounded_box((x * u, y * u, (x + 7) * u, (y + 7) * u), radius=u, width=u, fill=INK)
    xray = (194 * u, 199 * u, 312 * u, 297 * u)
    c.rounded_box(xray, radius=5 * u, width=3 * u)
    c.rounded_box((215 * u, 223 * u, 291 * u, 283 * u), radius=4 * u, width=2 * u)
    c.ellipse((235 * u, 240 * u, 271 * u, 276 * u), width=3 * u)
    instrument_feet(c, xray)
    c.rounded_box((370 * u, 207 * u, 456 * u, 296 * u), radius=4 * u, width=3 * u)
    c.line([(385 * u, 232 * u), (441 * u, 232 * u)], width=6 * u)
    c.line([(385 * u, 232 * u), (385 * u, 282 * u)], width=5 * u)
    c.line([(441 * u, 232 * u), (441 * u, 282 * u)], width=5 * u)
    c.ellipse((400 * u, 250 * u, 426 * u, 278 * u), width=3 * u)
    # The single coupon remains visibly identical along one uninterrupted route.
    for x in (139, 330, 347):
        c.rounded_box((x * u, 254 * u, (x + 24) * u, 276 * u), radius=2 * u, width=2 * u)
    c.path([(62 * u, rail_y), (124 * u, rail_y), (151 * u, rail_y),
            (194 * u, rail_y), (253 * u, rail_y), (312 * u, rail_y),
            (342 * u, rail_y), (370 * u, rail_y), (413 * u, rail_y)], width=3 * u)
    return c


def sealed_evidence_table() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A01-03"]["dimensions"])
    u = c.unit
    bench(c, 301 * u, 24 * u, 488 * u)
    instrument = (390 * u, 207 * u, 470 * u, 294 * u)
    test_instrument(c, instrument, socket_side="left")
    # Three fitted trays contain three plain blocks; no markings are present.
    for x in (51, 157, 263):
        c.rounded_box((x * u, 251 * u, (x + 82) * u, 288 * u), radius=5 * u, width=2 * u)
        c.rounded_box(((x + 22) * u, 239 * u, (x + 60) * u, 275 * u), radius=3 * u, width=3 * u)
        c.line([((x + 12) * u, 281 * u), ((x + 70) * u, 281 * u)], width=u)
        # Tamper-evident clasp is a physical bridge and rivet, not an icon.
        c.rounded_box(((x + 66) * u, 258 * u, (x + 86) * u, 276 * u), radius=3 * u, width=2 * u)
        c.ellipse(((x + 73) * u, 264 * u, (x + 79) * u, 270 * u), fill=INK, width=u)
    socket_y = 266 * u
    for x in (145, 251, 357):
        coupler(c, x * u, socket_y)
    c.path([(92 * u, socket_y), (145 * u, socket_y), (198 * u, socket_y),
            (251 * u, socket_y), (304 * u, socket_y), (357 * u, socket_y),
            (390 * u, socket_y), (430 * u, socket_y)], width=3 * u)
    return c


def instrumented_beam_load_frame() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A01-04"]["dimensions"])
    u = c.unit
    floor(c, 322 * u, 28 * u, 484 * u)
    # Full load frame surrounds a small bridge beam on two substantial supports.
    c.line([(67 * u, 312 * u), (67 * u, 194 * u), (445 * u, 194 * u), (445 * u, 312 * u)], width=7 * u)
    c.line([(53 * u, 312 * u), (99 * u, 312 * u)], width=6 * u)
    c.line([(413 * u, 312 * u), (459 * u, 312 * u)], width=6 * u)
    c.polygon([(114 * u, 279 * u), (398 * u, 279 * u), (374 * u, 296 * u), (138 * u, 296 * u)], width=3 * u)
    for x in (146, 366):
        c.polygon([((x - 12) * u, 296 * u), ((x + 12) * u, 296 * u), (x * u, 312 * u)], width=2 * u)
    # Central hydraulic platen loads the beam; five probes read displacement from a common rail.
    c.rounded_box((234 * u, 198 * u, 278 * u, 238 * u), radius=4 * u, width=3 * u)
    c.line([(256 * u, 238 * u), (256 * u, 278 * u)], width=5 * u)
    c.line([(118 * u, 232 * u), (394 * u, 232 * u)], width=4 * u)
    for x, bottom in ((135, 278), (195, 281), (256, 286), (317, 281), (377, 278)):
        probe(c, x * u, 219 * u, bottom * u)
    c.path([(114 * u, 286 * u), (150 * u, 284 * u), (195 * u, 287 * u),
            (256 * u, 292 * u), (317 * u, 287 * u), (362 * u, 284 * u),
            (398 * u, 286 * u)], width=3 * u)
    return c


def paired_plate_scanner() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A02-02"]["dimensions"])
    u = c.unit
    bench(c, 303 * u, 31 * u, 481 * u)
    # One rigid gantry carries one probe above two separately mounted field plates.
    c.line([(82 * u, 284 * u), (82 * u, 205 * u), (430 * u, 205 * u), (430 * u, 284 * u)], width=6 * u)
    c.line([(105 * u, 222 * u), (407 * u, 222 * u)], width=4 * u)
    probe(c, 256 * u, 207 * u, 264 * u)
    for x0 in (105, 271):
        c.polygon([(x0 * u, 273 * u), ((x0 + 136) * u, 269 * u),
                   ((x0 + 136) * u, 289 * u), (x0 * u, 293 * u)], width=3 * u)
        for support_x in (x0 + 17, x0 + 119):
            c.line([(support_x * u, 293 * u), (support_x * u, 303 * u)], width=4 * u)
    # A single narrow ribbon makes the mismatch physically visible without chart marks.
    c.path([(105 * u, 280 * u), (161 * u, 278 * u), (217 * u, 276 * u),
            (256 * u, 281 * u), (271 * u, 279 * u), (327 * u, 275 * u),
            (383 * u, 274 * u), (407 * u, 276 * u)], width=3 * u)
    return c


def four_station_materials_loop() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A03-02"]["dimensions"])
    u = c.unit
    floor(c, 325 * u, 27 * u, 485 * u)
    # Circular bench ring physically joins four distinct pieces of hardware.
    c.ellipse((74 * u, 206 * u, 438 * u, 320 * u), width=6 * u)
    c.ellipse((110 * u, 225 * u, 402 * u, 301 * u), width=2 * u)
    # Powder hopper and dosing throat.
    c.polygon([(85 * u, 218 * u), (145 * u, 218 * u), (132 * u, 263 * u), (98 * u, 263 * u)], width=3 * u)
    c.line([(115 * u, 263 * u), (115 * u, 280 * u)], width=5 * u)
    # Small furnace, measurement cradle, and visibly empty return tray.
    tube_furnace(c, (194 * u, 250 * u, 294 * u, 304 * u))
    c.rounded_box((348 * u, 235 * u, 415 * u, 292 * u), radius=4 * u, width=3 * u)
    c.rounded_box((362 * u, 249 * u, 401 * u, 278 * u), radius=3 * u, width=2 * u)
    c.polygon([(183 * u, 213 * u), (278 * u, 213 * u), (268 * u, 238 * u), (193 * u, 238 * u)], width=2 * u)
    # One small specimen appears once, between the doser and furnace.
    c.rounded_box((151 * u, 269 * u, 169 * u, 285 * u), radius=2 * u, width=2 * u)
    c.path([(115 * u, 280 * u), (160 * u, 280 * u), (194 * u, 277 * u),
            (244 * u, 277 * u), (294 * u, 277 * u), (348 * u, 264 * u),
            (382 * u, 264 * u), (402 * u, 238 * u), (278 * u, 225 * u),
            (230 * u, 225 * u), (183 * u, 225 * u), (115 * u, 280 * u)], width=3 * u)
    return c


def dual_instrument_cartridge_rack() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A03-04"]["dimensions"])
    u = c.unit
    floor(c, 323 * u, 24 * u, 488 * u)
    left = (30 * u, 218 * u, 116 * u, 304 * u)
    right = (396 * u, 218 * u, 482 * u, 304 * u)
    test_instrument(c, left, socket_side="right")
    test_instrument(c, right, socket_side="left")
    c.rounded_box((132 * u, 226 * u, 380 * u, 301 * u), radius=4 * u, width=3 * u)
    c.line([(143 * u, 286 * u), (369 * u, 286 * u)], width=4 * u)
    # Four identical sealed cartridges sit in identical rack cradles.
    for x in (148, 204, 260, 316):
        cartridge(c, (x * u, 247 * u, (x + 48) * u, 273 * u))
        c.rounded_box(((x + 15) * u, 238 * u, (x + 33) * u, 247 * u), radius=2 * u, width=2 * u)
        coupler(c, (x + 48) * u, 260 * u)
    c.path([(73 * u, 260 * u), (116 * u, 260 * u), (148 * u, 260 * u),
            (196 * u, 260 * u), (252 * u, 260 * u), (308 * u, 260 * u),
            (364 * u, 260 * u), (396 * u, 260 * u), (439 * u, 260 * u)], width=3 * u)
    return c


def gated_pilot_pipeline() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A04-01"]["dimensions"])
    u = c.unit
    ground = 414 * u
    floor(c, ground, 20 * u, 492 * u)
    # Hopper, sintering furnace, pressure fixture, inspection gate, and pilot press.
    c.polygon([(32 * u, 278 * u), (103 * u, 278 * u), (89 * u, 333 * u), (46 * u, 333 * u)], width=3 * u)
    c.stipple((49 * u, 288 * u, 87 * u, 313 * u), step=8 * u)
    tube_furnace(c, (125 * u, 301 * u, 228 * u, 373 * u))
    test_instrument(c, (253 * u, 294 * u, 335 * u, 378 * u), socket_side="right")
    # Inspection gate is a physical clamping bridge interrupting the line.
    c.rounded_box((351 * u, 286 * u, 383 * u, 383 * u), radius=4 * u, width=3 * u)
    c.line([(358 * u, 315 * u), (376 * u, 315 * u)], width=5 * u)
    c.line([(367 * u, 315 * u), (367 * u, 350 * u)], width=4 * u)
    c.rounded_box((404 * u, 273 * u, 482 * u, 391 * u), radius=5 * u, width=3 * u)
    c.line([(419 * u, 299 * u), (467 * u, 299 * u)], width=5 * u)
    c.line([(429 * u, 299 * u), (429 * u, 365 * u)], width=4 * u)
    c.line([(457 * u, 299 * u), (457 * u, 365 * u)], width=4 * u)
    pipe(c, [(68 * u, 333 * u), (68 * u, 347 * u), (125 * u, 347 * u)])
    pipe(c, [(228 * u, 347 * u), (253 * u, 347 * u)])
    pipe(c, [(335 * u, 347 * u), (351 * u, 347 * u)])
    pipe(c, [(383 * u, 347 * u), (404 * u, 347 * u)])
    c.path([(68 * u, 305 * u), (68 * u, 347 * u), (125 * u, 347 * u),
            (176 * u, 337 * u), (228 * u, 347 * u), (253 * u, 347 * u),
            (294 * u, 337 * u), (335 * u, 347 * u), (351 * u, 347 * u),
            (367 * u, 347 * u), (383 * u, 347 * u), (404 * u, 347 * u),
            (443 * u, 347 * u)], width=3 * u)
    return c


def calibration_traceability_chain() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A04-02"]["dimensions"])
    u = c.unit
    floor(c, 323 * u, 25 * u, 487 * u)
    # Sealed cradle with one plain calibration artifact.
    c.rounded_box((37 * u, 221 * u, 137 * u, 302 * u), radius=6 * u, width=3 * u)
    c.rounded_box((55 * u, 244 * u, 119 * u, 283 * u), radius=4 * u, width=2 * u)
    c.ellipse((73 * u, 250 * u, 101 * u, 278 * u), width=3 * u)
    # Archive cabinet has plain cartridge bays, not labels or glyphs.
    archive = (207 * u, 207 * u, 329 * u, 305 * u)
    c.rounded_box(archive, radius=4 * u, width=3 * u)
    for y in (227, 260):
        cartridge(c, (224 * u, y * u, 312 * u, (y + 25) * u))
    instrument_feet(c, archive)
    instrument = (393 * u, 215 * u, 477 * u, 304 * u)
    test_instrument(c, instrument, socket_side="left")
    route_y = 266 * u
    pipe(c, [(137 * u, route_y), (207 * u, route_y)])
    pipe(c, [(329 * u, route_y), (393 * u, route_y)])
    for x in (153, 184, 345, 376):
        coupler(c, x * u, route_y)
    c.path([(87 * u, route_y), (137 * u, route_y), (153 * u, route_y),
            (184 * u, route_y), (207 * u, route_y), (268 * u, route_y),
            (329 * u, route_y), (345 * u, route_y), (376 * u, route_y),
            (393 * u, route_y), (435 * u, route_y)], width=3 * u)
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B4-A01-02": coupon_transfer_rail,
    "SW1-B4-A01-03": sealed_evidence_table,
    "SW1-B4-A01-04": instrumented_beam_load_frame,
    "SW1-B4-A02-02": paired_plate_scanner,
    "SW1-B4-A03-02": four_station_materials_loop,
    "SW1-B4-A03-04": dual_instrument_cartridge_rack,
    "SW1-B4-A04-01": gated_pilot_pipeline,
    "SW1-B4-A04-02": calibration_traceability_chain,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
