#!/usr/bin/env python3
"""Wave-4 batch 01 scenes built from deterministic, glyph-free PIL primitives."""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from wave4_scene_components import (
    INK,
    PAPER,
    SceneCanvas,
    bench,
    cabinet,
    cartridge,
    floor,
    instrument_feet,
    sample_boat,
    test_instrument,
    tube_furnace,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B1-A01-04": {
        "archetype": "pilot-material-line",
        "dimensions": (1536, 1024),
        "filename": "SW1-B1-A01-04--pilot-material-line.png",
        "scene": (
            "A waist-high pilot line on a bare factory floor: a covered powder hopper feeds one "
            "compact sintering furnace, then a ceramic pellet exits onto a cell-test cradle."
        ),
        "mechanism": (
            "one continuous indigo material route follows the sample from hopper through furnace "
            "to the test cradle"
        ),
    },
    "SW1-B1-A01-05": {
        "archetype": "electric-bus-depot",
        "dimensions": (1536, 864),
        "filename": "SW1-B1-A01-05--electric-bus-depot.png",
        "scene": (
            "An empty electric-bus depot beneath a broad solar canopy, with a quiet row of "
            "stationary battery cabinets beside the charging bays and a vast pale sky."
        ),
        "mechanism": (
            "the battery cabinets buffer power from the canopy before it reaches the charging "
            "pedestals"
        ),
    },
    "SW1-B1-A02-02": {
        "archetype": "pilot-furnace-corridor",
        "dimensions": (1536, 1024),
        "filename": "SW1-B1-A02-02--pilot-furnace-corridor.png",
        "scene": (
            "A clean pilot corridor of three identical tube furnaces with sample boats; most "
            "boats stop on cooling racks and one intact pellet reaches a pressure-test fixture."
        ),
        "mechanism": (
            "one indigo route tracks the sole pellet that survives firing and reaches mechanical "
            "testing"
        ),
    },
    "SW1-B1-A02-03": {
        "archetype": "pressure-heat-chamber",
        "dimensions": (1536, 1024),
        "filename": "SW1-B1-A02-03--pressure-heat-chamber.png",
        "scene": (
            "A single ceramic electrolyte disk clamped inside a transparent-sided "
            "pressure-and-heat cycling chamber, with a fine crack beginning at its metal "
            "interface."
        ),
        "mechanism": (
            "the chamber applies combined manufacturing pressure and heat to reveal interface "
            "cracking"
        ),
    },
    "SW1-B1-A02-04": {
        "archetype": "pellet-inspection-station",
        "dimensions": (1536, 1024),
        "filename": "SW1-B1-A02-04--pellet-inspection-station.png",
        "scene": (
            "An idle pellet-press station beside orderly trays of warped ceramic disks and one "
            "measurement jig holding the next candidate."
        ),
        "mechanism": (
            "the measurement jig rejects distorted pellets before they enter the pilot line"
        ),
    },
    "SW1-B1-A02-05": {
        "archetype": "battery-module-assembly",
        "dimensions": (1536, 864),
        "filename": "SW1-B1-A02-05--battery-module-assembly.png",
        "scene": (
            "A compact battery-module assembly cell with one verified ceramic-pellet cartridge "
            "feeding a precise stack press; the rest of the factory floor is empty paper."
        ),
        "mechanism": (
            "the cartridge meters one qualified electrolyte pellet into each cell stack"
        ),
    },
    "SW1-B1-A03-02": {
        "archetype": "screening-fixture-bench",
        "dimensions": (1536, 1024),
        "filename": "SW1-B1-A03-02--screening-fixture-bench.png",
        "scene": (
            "A sequence of three physical screening fixtures on one bench: a wide tray of "
            "candidate coupons, a smaller thermal-test rack, and one final "
            "reference-calculation instrument."
        ),
        "mechanism": (
            "successive screening fixtures narrow the candidate set before the expensive "
            "reference instrument"
        ),
    },
    "SW1-B1-A03-04": {
        "archetype": "standardized-cartridge-rack",
        "dimensions": (1536, 1024),
        "filename": "SW1-B1-A03-04--standardized-cartridge-rack.png",
        "scene": (
            "An open rack of identical unmarked sample cartridges feeding two separated battery "
            "test instruments through standardized mechanical sockets."
        ),
        "mechanism": (
            "the standardized cartridge socket lets the same physical reference sample serve "
            "independent instruments"
        ),
    },
}


def pilot_material_line() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A01-04"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 30 * u, 490 * u)

    # Covered hopper and its narrow gravity throat.
    c.polygon(
        [(45 * u, 203 * u), (117 * u, 203 * u), (105 * u, 255 * u),
         (67 * u, 255 * u)],
        width=2 * u,
    )
    c.polygon(
        [(39 * u, 203 * u), (81 * u, 184 * u), (123 * u, 203 * u)],
        width=2 * u,
    )
    c.rounded_box((72 * u, 255 * u, 100 * u, 284 * u), radius=2 * u)
    for x in (56, 108):
        c.line([(x * u, 255 * u), (x * u, ground)], width=4 * u)

    furnace = (160 * u, 225 * u, 285 * u, 307 * u)
    tube_furnace(c, furnace)
    c.line([(100 * u, 273 * u), (160 * u, 273 * u)], width=7 * u)
    c.line([(100 * u, 273 * u), (160 * u, 273 * u)], fill=PAPER, width=3 * u)

    # Pellet and spring-loaded cell-test cradle.
    c.ellipse((325 * u, 280 * u, 347 * u, 292 * u), width=2 * u)
    c.rounded_box((373 * u, 252 * u, 448 * u, 307 * u), radius=4 * u)
    c.line([(386 * u, 281 * u), (435 * u, 281 * u)], width=4 * u)
    c.ellipse((403 * u, 271 * u, 419 * u, 291 * u), width=2 * u)
    instrument_feet(c, (373 * u, 252 * u, 448 * u, 307 * u))

    c.path(
        [(86 * u, 220 * u), (86 * u, 273 * u), (160 * u, 273 * u),
         (222 * u, 266 * u), (285 * u, 273 * u), (336 * u, 286 * u),
         (411 * u, 281 * u)],
        width=3 * u,
    )
    return c


def electric_bus_depot() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A01-05"]["dimensions"])
    u = c.unit
    ground = 405 * u
    floor(c, ground, 22 * u, 490 * u)

    # Broad solar canopy, pitched only enough to remain a physical roof.
    c.polygon(
        [(28 * u, 211 * u), (438 * u, 211 * u), (474 * u, 242 * u),
         (64 * u, 242 * u)],
        width=3 * u,
    )
    for x in (100, 172, 244, 316, 388):
        c.line([(x * u, 217 * u), ((x + 22) * u, 236 * u)], width=u)
    for x in (72, 232, 430):
        c.line([(x * u, 242 * u), (x * u, ground)], width=5 * u)

    for x in (100, 153, 206):
        cabinet(c, (x * u, 302 * u, (x + 40) * u, ground))

    # Empty charging bays are represented only by plain pedestals and ground sockets.
    for x in (318, 382, 446):
        c.rounded_box((x * u, 327 * u, (x + 25) * u, ground), radius=3 * u)
        c.line([((x + 12) * u, 343 * u), ((x + 12) * u, 385 * u)], width=2 * u)
        c.ellipse(((x + 6) * u, 369 * u, (x + 18) * u, 381 * u), width=u)

    c.path(
        [(82 * u, 227 * u), (82 * u, 288 * u), (120 * u, 288 * u),
         (120 * u, 352 * u), (226 * u, 352 * u), (264 * u, 384 * u),
         (330 * u, 384 * u), (394 * u, 384 * u), (458 * u, 384 * u)],
        width=3 * u,
    )
    return c


def pilot_furnace_corridor() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A02-02"]["dimensions"])
    u = c.unit
    bench_y = 296 * u
    bench(c, bench_y, 24 * u, 488 * u)

    furnace_xs = (48, 174, 300)
    for x in furnace_xs:
        tube_furnace(c, (x * u, 218 * u, (x + 92) * u, bench_y))
        sample_boat(c, ((x + 19) * u, 282 * u, (x + 47) * u, 292 * u))
        # Cooling rack with stopped, empty boats below each furnace outlet.
        c.rounded_box(((x + 95) * u, 267 * u, (x + 119) * u, 296 * u), radius=2 * u)
        c.line([((x + 99) * u, 276 * u), ((x + 115) * u, 276 * u)], width=u)
        c.line([((x + 99) * u, 286 * u), ((x + 115) * u, 286 * u)], width=u)

    fixture = (430 * u, 235 * u, 480 * u, 296 * u)
    test_instrument(c, fixture)
    c.ellipse((409 * u, 277 * u, 423 * u, 287 * u), width=2 * u)

    c.path(
        [(73 * u, 274 * u), (119 * u, 274 * u), (199 * u, 274 * u),
         (245 * u, 274 * u), (325 * u, 274 * u), (371 * u, 274 * u),
         (416 * u, 274 * u), (430 * u, 264 * u)],
        width=3 * u,
    )
    return c


def pressure_heat_chamber() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A02-03"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 70 * u, 440 * u)

    chamber = (126 * u, 185 * u, 382 * u, 308 * u)
    c.rounded_box(chamber, radius=8 * u, width=3 * u)
    c.rounded_box((149 * u, 205 * u, 359 * u, 288 * u), radius=4 * u, width=2 * u)
    for x in (139, 369):
        for y in (197, 286):
            c.ellipse((x * u, y * u, (x + 7) * u, (y + 7) * u), fill=INK, width=u)

    # Opposed pressure platens clamp one ceramic disk at a metal interface.
    c.rounded_box((172 * u, 229 * u, 235 * u, 267 * u), radius=3 * u)
    c.rounded_box((274 * u, 229 * u, 337 * u, 267 * u), radius=3 * u)
    c.ellipse((234 * u, 224 * u, 275 * u, 272 * u), width=3 * u)
    c.line([(188 * u, 248 * u), (234 * u, 248 * u)], width=6 * u)
    c.line([(275 * u, 248 * u), (321 * u, 248 * u)], width=6 * u)

    # Fine crack begins at the right metal interface; sparse coils show heat cycling.
    c.line([(275 * u, 248 * u), (287 * u, 242 * u), (280 * u, 235 * u),
            (292 * u, 229 * u)], width=u)
    for y in (216, 281):
        c.line([(164 * u, y * u), (181 * u, (y - 5) * u),
                (198 * u, y * u), (215 * u, (y - 5) * u)], width=u)
        c.line([(294 * u, y * u), (311 * u, (y - 5) * u),
                (328 * u, y * u), (345 * u, (y - 5) * u)], width=u)

    c.path(
        [(105 * u, 248 * u), (172 * u, 248 * u), (234 * u, 248 * u),
         (254 * u, 248 * u), (275 * u, 248 * u), (337 * u, 248 * u),
         (404 * u, 248 * u), (404 * u, 207 * u), (345 * u, 207 * u)],
        width=3 * u,
    )
    return c


def pellet_inspection_station() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A02-04"]["dimensions"])
    u = c.unit
    bench_y = 298 * u
    bench(c, bench_y, 28 * u, 488 * u)

    # Idle pellet press with opposed platens and a clear empty die.
    c.rounded_box((45 * u, 203 * u, 142 * u, bench_y), radius=5 * u)
    c.line([(67 * u, 223 * u), (120 * u, 223 * u)], width=6 * u)
    c.line([(94 * u, 223 * u), (94 * u, 263 * u)], width=6 * u)
    c.rounded_box((73 * u, 263 * u, 115 * u, 278 * u), radius=2 * u)
    c.ellipse((80 * u, 281 * u, 108 * u, 294 * u), width=2 * u)

    # Two orderly trays make the warped geometry visible without marks or labels.
    for tray_x in (165, 262):
        c.rounded_box((tray_x * u, 252 * u, (tray_x + 78) * u, 296 * u), radius=3 * u)
        for row in range(2):
            for column in range(3):
                x0 = (tray_x + 8 + column * 22) * u
                y0 = (260 + row * 17) * u
                sample_boat(c, (x0, y0, x0 + 17 * u, y0 + 8 * u), warped=True)

    # Measurement jig holds one candidate between fixed contacts.
    jig = (379 * u, 215 * u, 463 * u, 298 * u)
    c.rounded_box(jig, radius=5 * u)
    c.line([(394 * u, 249 * u), (448 * u, 249 * u)], width=5 * u)
    c.ellipse((410 * u, 241 * u, 432 * u, 257 * u), width=2 * u)
    c.line([(394 * u, 232 * u), (394 * u, 278 * u)], width=3 * u)
    c.line([(448 * u, 232 * u), (448 * u, 278 * u)], width=3 * u)
    instrument_feet(c, jig)

    c.path(
        [(205 * u, 271 * u), (241 * u, 271 * u), (301 * u, 271 * u),
         (340 * u, 271 * u), (379 * u, 271 * u), (421 * u, 249 * u),
         (462 * u, 271 * u)],
        width=3 * u,
    )
    return c


def battery_module_assembly() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A02-05"]["dimensions"])
    u = c.unit
    ground = 405 * u
    floor(c, ground, 32 * u, 338 * u)

    # Verified pellet cartridge is mechanically keyed above the compact stack press.
    cartridge(c, (58 * u, 248 * u, 172 * u, 281 * u))
    c.line([(172 * u, 264 * u), (220 * u, 264 * u), (220 * u, 303 * u)], width=7 * u)
    c.line([(172 * u, 264 * u), (220 * u, 264 * u), (220 * u, 303 * u)],
           fill=PAPER, width=3 * u)
    c.ellipse((205 * u, 297 * u, 235 * u, 311 * u), width=2 * u)

    press = (194 * u, 304 * u, 326 * u, 394 * u)
    c.rounded_box(press, radius=5 * u)
    c.line([(218 * u, 326 * u), (302 * u, 326 * u)], width=6 * u)
    c.line([(260 * u, 326 * u), (260 * u, 351 * u)], width=6 * u)
    for y in (355, 365, 375):
        c.rounded_box((225 * u, y * u, 295 * u, (y + 7) * u), radius=u, width=u)
    instrument_feet(c, press)

    c.path(
        [(82 * u, 264 * u), (145 * u, 264 * u), (220 * u, 264 * u),
         (220 * u, 304 * u), (260 * u, 304 * u), (260 * u, 355 * u),
         (260 * u, 378 * u)],
        width=3 * u,
    )
    return c


def screening_fixture_bench() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A03-02"]["dimensions"])
    u = c.unit
    bench_y = 298 * u
    bench(c, bench_y, 25 * u, 488 * u)

    # Wide physical coupon tray starts the screening sequence.
    c.rounded_box((40 * u, 245 * u, 190 * u, 296 * u), radius=3 * u)
    for row in range(2):
        for column in range(5):
            x0 = (49 + column * 27) * u
            y0 = (254 + row * 18) * u
            c.rounded_box((x0, y0, x0 + 19 * u, y0 + 10 * u), radius=u, width=u)
            if (row + column) % 2:
                c.hatch((x0 + 2 * u, y0 + 2 * u, x0 + 17 * u, y0 + 8 * u), spacing=5 * u)

    # Smaller thermal rack holds a visibly narrowed set.
    c.rounded_box((228 * u, 224 * u, 323 * u, 296 * u), radius=4 * u)
    for x in (243, 270, 297):
        c.rounded_box((x * u, 249 * u, (x + 15) * u, 286 * u), radius=3 * u, width=u)
        c.stipple(((x + 3) * u, 256 * u, (x + 12) * u, 280 * u), step=5 * u)

    # One plain reference-calculation instrument remains at the end.
    reference = (378 * u, 216 * u, 467 * u, 296 * u)
    test_instrument(c, reference)
    c.ellipse((352 * u, 274 * u, 367 * u, 286 * u), width=2 * u)

    c.path(
        [(58 * u, 284 * u), (104 * u, 284 * u), (150 * u, 284 * u),
         (190 * u, 284 * u), (228 * u, 270 * u), (276 * u, 270 * u),
         (323 * u, 270 * u), (360 * u, 280 * u), (378 * u, 260 * u)],
        width=3 * u,
    )
    return c


def standardized_cartridge_rack() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A03-04"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 28 * u, 488 * u)

    # Open rack with identical, deliberately unmarked cartridges.
    c.rounded_box((40 * u, 203 * u, 180 * u, 306 * u), radius=4 * u)
    for y in (232, 272):
        c.line([(51 * u, y * u), (169 * u, y * u)], width=3 * u)
    for row, y in enumerate((211, 251)):
        for column in range(3):
            x0 = (52 + column * 38) * u
            cartridge(c, (x0, y * u, x0 + 31 * u, (y + 17) * u))

    left = (245 * u, 225 * u, 335 * u, 306 * u)
    right = (390 * u, 225 * u, 480 * u, 306 * u)
    test_instrument(c, left)
    test_instrument(c, right)

    # One continuous socket bus physically serves both separated instruments.
    c.path(
        [(83 * u, 260 * u), (180 * u, 260 * u), (210 * u, 260 * u),
         (245 * u, 254 * u), (335 * u, 254 * u), (362 * u, 254 * u),
         (390 * u, 254 * u), (480 * u, 254 * u)],
        width=3 * u,
    )
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B1-A01-04": pilot_material_line,
    "SW1-B1-A01-05": electric_bus_depot,
    "SW1-B1-A02-02": pilot_furnace_corridor,
    "SW1-B1-A02-03": pressure_heat_chamber,
    "SW1-B1-A02-04": pellet_inspection_station,
    "SW1-B1-A02-05": battery_module_assembly,
    "SW1-B1-A03-02": screening_fixture_bench,
    "SW1-B1-A03-04": standardized_cartridge_rack,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
