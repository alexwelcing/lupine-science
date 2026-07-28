#!/usr/bin/env python3
"""Wave-4 batch 02 scenes built from deterministic, glyph-free PIL primitives."""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from wave4_scene_components import (
    INK,
    PAPER,
    SceneCanvas,
    cabinet,
    floor,
    instrument_feet,
    pipe,
    vessel,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B1-A04-04": {
        "archetype": "grain-boundary-diffusion-cell",
        "dimensions": (1536, 1024),
        "filename": "SW1-B1-A04-04--grain-boundary-diffusion-cell.png",
        "scene": (
            "A solid-electrolyte diffusion cell mounted in a small test rig, with one ceramic "
            "grain boundary enlarged in cutaway and a restrained indigo path crossing it."
        ),
        "mechanism": "the test rig measures the ion migration barrier across one grain boundary",
    },
    "SW1-B1-A04-05": {
        "archetype": "storage-backed-fleet-depot",
        "dimensions": (1536, 864),
        "filename": "SW1-B1-A04-05--storage-backed-fleet-depot.png",
        "scene": (
            "An empty fleet-charging depot with a row of chargers backed by sealed solid-state "
            "storage cabinets; two electrolyte coupons lie in a foreground test tray."
        ),
        "mechanism": "the storage cabinets discharge into the chargers during a brief demand peak",
    },
    "SW1-B2-A01-02": {
        "archetype": "substation-cell-cutaway",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A01-02--substation-cell-cutaway.png",
        "scene": (
            "A substation battery enclosure in cutaway beside a transformer, showing one layered "
            "cell stack with cathode, ceramic separator, and current collector as plain unmarked slabs."
        ),
        "mechanism": (
            "the thin ceramic separator carries the indigo ion path while keeping the two "
            "electrodes apart"
        ),
    },
    "SW1-B2-A01-03": {
        "archetype": "direct-air-capture-contactor",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A01-03--direct-air-capture-contactor.png",
        "scene": (
            "A modular direct-air-capture contactor standing alone on a concrete pad, its front "
            "panel cut away to reveal a pleated porous sorbent sheet."
        ),
        "mechanism": "sparse indigo airflow passes through the pleated sorbent and exits the rear plenum",
    },
    "SW1-B2-A01-04": {
        "archetype": "ammonia-reactor-skid",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A01-04--ammonia-reactor-skid.png",
        "scene": (
            "A compact ammonia reactor skid with an insulated reaction tube, heat exchanger, and "
            "one catalyst cartridge visible through a clean cutaway."
        ),
        "mechanism": "the catalyst cartridge enables ammonia conversion inside the single reaction tube",
    },
    "SW1-B2-A02-02": {
        "archetype": "cement-kiln-capture-duct",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A02-02--cement-kiln-capture-duct.png",
        "scene": (
            "A rotary cement kiln and calciner in side cutaway, with a narrow process-gas duct "
            "leading from the calciner to one capture vessel."
        ),
        "mechanism": "the capture vessel receives the calcination gas stream through the dedicated duct",
    },
    "SW1-B2-A02-03": {
        "archetype": "calcined-clay-batching-bay",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A02-03--calcined-clay-batching-bay.png",
        "scene": (
            "A concrete batching bay where a calcined-clay hopper feeds one mixer, which pours a "
            "single beam mold positioned beneath a load frame."
        ),
        "mechanism": "the calcined-clay blend moves from hopper through mixer into a structural test beam",
    },
    "SW1-B2-A02-04": {
        "archetype": "beam-interface-load-frame",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A02-04--beam-interface-load-frame.png",
        "scene": (
            "A full-scale concrete beam in a four-point load frame, with one enlarged cutaway "
            "window showing the binder-to-aggregate interface beneath the loading nose."
        ),
        "mechanism": "the load frame tests whether the material interface transfers force without separating",
    },
}


def grain_boundary_diffusion_cell() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A04-04"]["dimensions"])
    u = c.unit
    floor(c, 326 * u, 45 * u, 470 * u)
    # A small fixture clamps one ceramic disk between opposed contacts.
    c.rounded_box((55 * u, 218 * u, 228 * u, 311 * u), radius=5 * u, width=3 * u)
    c.line([(82 * u, 265 * u), (126 * u, 265 * u)], width=7 * u)
    c.line([(166 * u, 265 * u), (205 * u, 265 * u)], width=7 * u)
    c.ellipse((124 * u, 233 * u, 168 * u, 297 * u), width=3 * u)
    instrument_feet(c, (55 * u, 218 * u, 228 * u, 311 * u))
    # The enlarged physical cutaway contains two grains divided by one irregular boundary.
    c.rounded_box((285 * u, 199 * u, 461 * u, 311 * u), radius=7 * u, width=3 * u)
    boundary = [(368 * u, 211 * u), (357 * u, 229 * u), (374 * u, 247 * u),
                (360 * u, 266 * u), (377 * u, 283 * u), (366 * u, 299 * u)]
    c.line(boundary, width=3 * u)
    c.hatch((303 * u, 217 * u, 348 * u, 293 * u), spacing=11 * u)
    c.stipple((389 * u, 218 * u, 443 * u, 292 * u), step=12 * u)
    c.line([(228 * u, 265 * u), (285 * u, 265 * u)], width=2 * u)
    c.path([(82 * u, 265 * u), (146 * u, 265 * u), (228 * u, 265 * u),
            (285 * u, 265 * u), (337 * u, 265 * u), (360 * u, 266 * u),
            (377 * u, 266 * u), (438 * u, 266 * u)], width=3 * u)
    return c


def storage_backed_fleet_depot() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A04-05"]["dimensions"])
    u = c.unit
    ground = 408 * u
    floor(c, ground, 24 * u, 742 * u)
    # Sealed storage cabinets stand behind four plain charging pedestals.
    for x in (62, 126, 190):
        cabinet(c, (x * u, 246 * u, (x + 48) * u, 365 * u))
    for x in (345, 438, 531, 624):
        c.rounded_box((x * u, 300 * u, (x + 31) * u, ground), radius=4 * u)
        c.line([((x + 15) * u, 328 * u), ((x + 15) * u, 381 * u)], width=3 * u)
        c.ellipse(((x + 8) * u, 350 * u, (x + 22) * u, 364 * u), width=2 * u)
    # Two unmarked electrolyte coupons rest in a separate foreground tray.
    c.rounded_box((82 * u, 374 * u, 270 * u, 426 * u), radius=4 * u, width=2 * u)
    for x in (109, 190):
        c.rounded_box((x * u, 389 * u, (x + 54) * u, 411 * u), radius=3 * u, width=2 * u)
        c.hatch(((x + 7) * u, 394 * u, (x + 47) * u, 406 * u), spacing=8 * u)
    c.path([(86 * u, 330 * u), (214 * u, 330 * u), (279 * u, 330 * u),
            (279 * u, 385 * u), (360 * u, 385 * u), (453 * u, 385 * u),
            (546 * u, 385 * u), (639 * u, 385 * u)], width=4 * u)
    return c


def substation_cell_cutaway() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A01-02"]["dimensions"])
    u = c.unit
    floor(c, 326 * u, 34 * u, 479 * u)
    cabinet(c, (44 * u, 185 * u, 306 * u, 312 * u), cutaway=False)
    # Three plain horizontal slabs remain physically separated inside the enclosure.
    slabs = ((82, 220, 270, 239), (82, 250, 270, 259), (82, 270, 270, 291))
    for index, (x0, y0, x1, y1) in enumerate(slabs):
        c.rounded_box((x0 * u, y0 * u, x1 * u, y1 * u), radius=2 * u, width=2 * u)
        if index == 0:
            c.hatch(((x0 + 8) * u, (y0 + 4) * u, (x1 - 8) * u, (y1 - 4) * u), spacing=10 * u)
        elif index == 2:
            c.stipple(((x0 + 8) * u, (y0 + 4) * u, (x1 - 8) * u, (y1 - 4) * u), step=12 * u)
    # Adjacent transformer has a closed core and paired physical windings.
    c.rounded_box((356 * u, 204 * u, 462 * u, 312 * u), radius=6 * u, width=3 * u)
    for x in (382, 418):
        c.ellipse(((x - 16) * u, 225 * u, (x + 16) * u, 287 * u), width=3 * u)
        c.ellipse(((x - 8) * u, 235 * u, (x + 8) * u, 277 * u), width=2 * u)
    c.line([(306 * u, 279 * u), (356 * u, 279 * u)], width=7 * u)
    c.line([(306 * u, 279 * u), (356 * u, 279 * u)], fill=PAPER, width=3 * u)
    c.path([(101 * u, 250 * u), (153 * u, 250 * u), (176 * u, 254 * u),
            (205 * u, 254 * u), (258 * u, 254 * u)], width=3 * u)
    return c


def direct_air_capture_contactor() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A01-03"]["dimensions"])
    u = c.unit
    floor(c, 326 * u, 91 * u, 430 * u)
    c.rounded_box((118 * u, 181 * u, 400 * u, 312 * u), radius=7 * u, width=3 * u)
    c.rounded_box((145 * u, 204 * u, 335 * u, 293 * u), radius=4 * u, width=2 * u)
    # Pleats are physical folds, and a rear plenum occupies the enclosed right bay.
    pleats = [(160 * u, 273 * u)]
    for x in range(172, 292, 18):
        pleats.extend([(x * u, 220 * u), ((x + 9) * u, 273 * u)])
    c.line(pleats, width=2 * u)
    c.line([(335 * u, 204 * u), (335 * u, 293 * u)], width=4 * u)
    c.rounded_box((350 * u, 219 * u, 383 * u, 278 * u), radius=3 * u, width=2 * u)
    instrument_feet(c, (118 * u, 181 * u, 400 * u, 312 * u))
    # A straight, sparse flow crossing the folds reads as process motion, not a plot trace.
    c.path([(73 * u, 246 * u), (146 * u, 246 * u), (225 * u, 246 * u),
            (309 * u, 246 * u), (350 * u, 246 * u), (438 * u, 246 * u)], width=3 * u)
    return c


def ammonia_reactor_skid() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A01-04"]["dimensions"])
    u = c.unit
    floor(c, 327 * u, 32 * u, 483 * u)
    # Insulated horizontal reaction tube with a visible removable catalyst cartridge.
    c.rounded_box((109 * u, 215 * u, 331 * u, 282 * u), radius=30 * u, width=3 * u)
    c.rounded_box((153 * u, 231 * u, 274 * u, 266 * u), radius=12 * u, width=2 * u)
    c.hatch((169 * u, 237 * u, 258 * u, 260 * u), spacing=9 * u)
    for x in (130, 310):
        c.line([(x * u, 282 * u), (x * u, 318 * u)], width=5 * u)
    # A compact exchanger is formed by nested serpentine-free plates.
    c.rounded_box((371 * u, 206 * u, 460 * u, 294 * u), radius=5 * u, width=3 * u)
    for y in (221, 238, 255, 272):
        c.line([(384 * u, y * u), (447 * u, y * u)], width=2 * u)
    instrument_feet(c, (371 * u, 206 * u, 460 * u, 294 * u))
    pipe(c, [(45 * u, 248 * u), (109 * u, 248 * u)])
    pipe(c, [(331 * u, 248 * u), (371 * u, 248 * u)])
    c.path([(45 * u, 248 * u), (109 * u, 248 * u), (153 * u, 248 * u),
            (213 * u, 248 * u), (274 * u, 248 * u), (331 * u, 248 * u),
            (371 * u, 248 * u), (415 * u, 248 * u), (478 * u, 248 * u)], width=3 * u)
    return c


def cement_kiln_capture_duct() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A02-02"]["dimensions"])
    u = c.unit
    floor(c, 328 * u, 27 * u, 486 * u)
    # Inclined rotary kiln with a plain interior heat shell.
    kiln = [(44 * u, 278 * u), (267 * u, 220 * u), (279 * u, 270 * u), (56 * u, 315 * u)]
    c.polygon(kiln, width=3 * u)
    c.line([(75 * u, 282 * u), (252 * u, 238 * u)], width=3 * u)
    for x, y in ((91, 281), (167, 261), (239, 242)):
        c.ellipse(((x - 12) * u, (y - 14) * u, (x + 12) * u, (y + 14) * u), width=2 * u)
    # Upright calciner joins one dedicated narrow duct and capture vessel.
    c.rounded_box((277 * u, 198 * u, 341 * u, 304 * u), radius=8 * u, width=3 * u)
    c.hatch((291 * u, 225 * u, 327 * u, 282 * u), spacing=9 * u)
    vessel(c, (407 * u, 214 * u, 476 * u, 309 * u), cutaway=True)
    pipe(c, [(309 * u, 198 * u), (309 * u, 179 * u), (442 * u, 179 * u), (442 * u, 206 * u)])
    c.path([(295 * u, 263 * u), (309 * u, 224 * u), (309 * u, 179 * u),
            (375 * u, 179 * u), (442 * u, 179 * u), (442 * u, 214 * u),
            (442 * u, 276 * u)], width=3 * u)
    return c


def calcined_clay_batching_bay() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A02-03"]["dimensions"])
    u = c.unit
    floor(c, 328 * u, 25 * u, 487 * u)
    # Covered clay hopper gravity-feeds one drum mixer.
    c.polygon([(38 * u, 197 * u), (139 * u, 197 * u), (124 * u, 260 * u),
               (55 * u, 260 * u)], width=3 * u)
    c.polygon([(31 * u, 197 * u), (88 * u, 177 * u), (146 * u, 197 * u)], width=2 * u)
    c.ellipse((164 * u, 231 * u, 286 * u, 304 * u), width=3 * u)
    c.ellipse((180 * u, 242 * u, 270 * u, 293 * u), width=2 * u)
    for x in (184, 267):
        c.line([(x * u, 293 * u), (x * u, 325 * u)], width=5 * u)
    pipe(c, [(91 * u, 260 * u), (91 * u, 275 * u), (164 * u, 275 * u)])
    # The single beam mold sits under a four-post load frame.
    c.rounded_box((348 * u, 279 * u, 474 * u, 315 * u), radius=3 * u, width=3 * u)
    c.hatch((359 * u, 288 * u, 463 * u, 307 * u), spacing=10 * u)
    for x in (329, 482):
        c.line([(x * u, 211 * u), (x * u, 328 * u)], width=6 * u)
    c.line([(329 * u, 211 * u), (482 * u, 211 * u)], width=6 * u)
    for x in (382, 440):
        c.line([(x * u, 211 * u), (x * u, 279 * u)], width=4 * u)
        c.rounded_box(((x - 8) * u, 267 * u, (x + 8) * u, 283 * u), radius=2 * u)
    pipe(c, [(286 * u, 270 * u), (319 * u, 270 * u), (348 * u, 293 * u)])
    c.path([(73 * u, 226 * u), (91 * u, 260 * u), (91 * u, 275 * u),
            (164 * u, 275 * u), (225 * u, 267 * u), (286 * u, 270 * u),
            (319 * u, 270 * u), (348 * u, 293 * u), (411 * u, 297 * u)], width=3 * u)
    return c


def beam_interface_load_frame() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A02-04"]["dimensions"])
    u = c.unit
    floor(c, 329 * u, 26 * u, 486 * u)
    # Four-point frame: two supports below and two loading noses above one full beam.
    for x in (48, 463):
        c.line([(x * u, 181 * u), (x * u, 329 * u)], width=7 * u)
    c.line([(48 * u, 181 * u), (463 * u, 181 * u)], width=7 * u)
    beam = (88 * u, 271 * u, 423 * u, 309 * u)
    c.rounded_box(beam, radius=3 * u, width=3 * u)
    for x in (151, 360):
        c.polygon([((x - 14) * u, 329 * u), ((x + 14) * u, 329 * u),
                   (x * u, 309 * u)], width=2 * u)
    for x in (191, 320):
        c.line([(x * u, 181 * u), (x * u, 252 * u)], width=5 * u)
        c.rounded_box(((x - 11) * u, 250 * u, (x + 11) * u, 273 * u), radius=3 * u)
    # Enlarged cutaway window exposes aggregate pieces and one continuous binder interface.
    c.rounded_box((210 * u, 218 * u, 301 * u, 302 * u), radius=6 * u, width=3 * u)
    for x, y, rx, ry in ((230, 239, 10, 8), (272, 240, 12, 9),
                         (243, 275, 13, 9), (278, 277, 9, 8)):
        c.ellipse(((x - rx) * u, (y - ry) * u, (x + rx) * u, (y + ry) * u), width=2 * u)
    c.line([(219 * u, 258 * u), (238 * u, 251 * u), (257 * u, 260 * u),
            (277 * u, 251 * u), (292 * u, 260 * u)], width=2 * u)
    c.path([(191 * u, 205 * u), (191 * u, 252 * u), (210 * u, 271 * u),
            (238 * u, 251 * u), (257 * u, 260 * u), (277 * u, 251 * u),
            (301 * u, 271 * u), (320 * u, 252 * u), (320 * u, 205 * u)], width=3 * u)
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B1-A04-04": grain_boundary_diffusion_cell,
    "SW1-B1-A04-05": storage_backed_fleet_depot,
    "SW1-B2-A01-02": substation_cell_cutaway,
    "SW1-B2-A01-03": direct_air_capture_contactor,
    "SW1-B2-A01-04": ammonia_reactor_skid,
    "SW1-B2-A02-02": cement_kiln_capture_duct,
    "SW1-B2-A02-03": calcined_clay_batching_bay,
    "SW1-B2-A02-04": beam_interface_load_frame,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
