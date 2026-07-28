#!/usr/bin/env python3
"""Wave-4 batch 04 scenes built from deterministic, glyph-free PIL primitives."""

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
    pipe,
    vessel,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B3-A02-02": {
        "archetype": "ion-selective-tailings-skid",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A02-02--ion-selective-tailings-skid.png",
        "scene": "A contained mine-tailings water skid with one ion-selective membrane cassette between a feed tank and a recovered-mineral vessel.",
        "mechanism": "the membrane cassette separates dissolved critical ions into the recovery vessel",
    },
    "SW1-B3-A02-03": {
        "archetype": "pfas-sorbent-column",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A02-03--pfas-sorbent-column.png",
        "scene": "A PFAS treatment column in cutaway, packed with granular sorbent between an inlet pipe and a sealed effluent sampling bottle.",
        "mechanism": "the packed sorbent captures persistent contaminants before the sampling bottle",
    },
    "SW1-B3-A02-04": {
        "archetype": "shared-pressure-flow-fixture",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A02-04--shared-pressure-flow-fixture.png",
        "scene": "Two unmarked sample cartridges, one mineral-bearing water and one contaminated water, entering the same modular pressure-flow test fixture from opposite sides.",
        "mechanism": "the shared fixture ranks cartridge performance under an identical controlled flow test",
    },
    "SW1-B3-A03-02": {
        "archetype": "cold-room-research-cartridge",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A03-02--cold-room-research-cartridge.png",
        "scene": "An empty supermarket cold room with a compact heat-pump cabinet; one removable research cartridge is seated beside the finned heat exchanger.",
        "mechanism": "the removable cartridge exposes refrigerant-property evidence to the real heat-exchanger loop",
    },
    "SW1-B3-A03-03": {
        "archetype": "sealed-loop-calorimeter",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A03-03--sealed-loop-calorimeter.png",
        "scene": "A sealed calorimeter chamber containing one compact refrigerant loop, with a compressor, condenser coil, expansion restriction, and evaporator coil drawn as plain hardware.",
        "mechanism": "the chamber measures heat moved around one closed refrigerant loop",
    },
    "SW1-B3-A03-04": {
        "archetype": "keyed-cartridge-calorimeter",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A03-04--keyed-cartridge-calorimeter.png",
        "scene": "A bench calorimeter with an unmarked sealed refrigerant cartridge being inserted into a keyed mechanical cradle beside one heat-exchanger coil.",
        "mechanism": "the keyed cradle transfers the same cartridge from evidence storage into calorimeter measurement",
    },
    "SW1-B3-A04-03": {
        "archetype": "catalyst-flow-reactor",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A04-03--catalyst-flow-reactor.png",
        "scene": "A methane catalyst coupon mounted inside a small flow reactor, with an inlet manifold and one downstream sampling vessel.",
        "mechanism": "the reactor tests conversion across the catalyst coupon before the downstream sample is collected",
    },
    "SW1-B3-A04-04": {
        "archetype": "measured-branch-manifold",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A04-04--measured-branch-manifold.png",
        "scene": "A physical gas-control manifold with three pipes ending at closed valves and one pipe continuing through a measurement vessel.",
        "mechanism": "only the measured branch remains open and carries the restrained indigo flow",
    },
}


def coil(canvas: SceneCanvas, box: tuple[int, int, int, int], *, turns: int = 5) -> None:
    """Draw a plain serpentine heat-exchanger tube, without symbols or marks."""
    x0, y0, x1, y1 = box
    step = (y1 - y0) // turns
    points = [(x0, y0)]
    for index in range(turns + 1):
        y = min(y0 + index * step, y1)
        points.append((x1 if index % 2 == 0 else x0, y))
    canvas.line(points, width=3 * canvas.unit)
    for x in range(x0 + 5 * canvas.unit, x1, 8 * canvas.unit):
        canvas.line([(x, y0 - 3 * canvas.unit), (x, y1 + 3 * canvas.unit)], width=canvas.unit)


def gate_valve(canvas: SceneCanvas, x: int, y: int, *, closed: bool = True) -> None:
    """Draw a physical gate-valve body and stem, not a schematic valve glyph."""
    u = canvas.unit
    canvas.rounded_box((x - 10 * u, y - 8 * u, x + 10 * u, y + 8 * u), radius=3 * u)
    canvas.line([(x, y - 8 * u), (x, y - 20 * u)], width=3 * u)
    if closed:
        canvas.rounded_box((x - 12 * u, y - 24 * u, x + 12 * u, y - 19 * u), radius=2 * u)
    else:
        canvas.ellipse((x - 8 * u, y - 28 * u, x + 8 * u, y - 12 * u), width=2 * u)


def ion_selective_tailings_skid() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A02-02"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 28 * u, 486 * u)

    feed = (43 * u, 207 * u, 139 * u, 306 * u)
    vessel(c, feed, cutaway=True)
    instrument_feet(c, feed)
    c.stipple((60 * u, 269 * u, 122 * u, 296 * u), step=8 * u)

    cassette = (204 * u, 220 * u, 314 * u, 302 * u)
    c.rounded_box(cassette, radius=5 * u, width=3 * u)
    for x in (224, 246, 268, 290):
        c.rounded_box((x * u, 235 * u, (x + 9) * u, 287 * u), radius=2 * u, width=u)
        c.hatch(((x + 2) * u, 241 * u, (x + 7) * u, 281 * u), spacing=5 * u)
    instrument_feet(c, cassette)

    recovery = (380 * u, 218 * u, 458 * u, 306 * u)
    vessel(c, recovery, cutaway=False)
    instrument_feet(c, recovery)
    pipe(c, [(139 * u, 258 * u), (204 * u, 258 * u)])
    pipe(c, [(314 * u, 258 * u), (380 * u, 258 * u)])
    c.path([(85 * u, 252 * u), (139 * u, 258 * u), (204 * u, 258 * u),
            (259 * u, 258 * u), (314 * u, 258 * u), (380 * u, 258 * u),
            (419 * u, 258 * u)], width=3 * u)
    return c


def pfas_sorbent_column() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A02-03"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 34 * u, 476 * u)

    inlet = [(48 * u, 281 * u), (132 * u, 281 * u), (132 * u, 246 * u), (190 * u, 246 * u)]
    pipe(c, inlet)
    column = (190 * u, 195 * u, 304 * u, 307 * u)
    c.rounded_box(column, radius=18 * u, width=3 * u)
    c.rounded_box((208 * u, 217 * u, 286 * u, 287 * u), radius=6 * u, width=2 * u)
    c.stipple((216 * u, 225 * u, 278 * u, 279 * u), step=8 * u)
    for y in (213, 291):
        c.line([(209 * u, y * u), (285 * u, y * u)], width=3 * u)
    instrument_feet(c, column)

    bottle = (390 * u, 247 * u, 450 * u, 307 * u)
    vessel(c, bottle)
    instrument_feet(c, bottle)
    outlet = [(304 * u, 246 * u), (344 * u, 246 * u), (344 * u, 270 * u), (390 * u, 270 * u)]
    pipe(c, outlet)
    c.path([(48 * u, 281 * u), (132 * u, 281 * u), (132 * u, 246 * u),
            (190 * u, 246 * u), (247 * u, 246 * u), (304 * u, 246 * u),
            (344 * u, 246 * u), (344 * u, 270 * u), (420 * u, 270 * u)], width=3 * u)
    return c


def shared_pressure_flow_fixture() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A02-04"]["dimensions"])
    u = c.unit
    bench_y = 300 * u
    bench(c, bench_y, 26 * u, 486 * u)

    cartridge(c, (46 * u, 252 * u, 160 * u, 281 * u))
    cartridge(c, (352 * u, 252 * u, 466 * u, 281 * u))
    c.stipple((66 * u, 259 * u, 139 * u, 274 * u), step=9 * u)
    c.hatch((373 * u, 259 * u, 445 * u, 274 * u), spacing=7 * u)

    fixture = (196 * u, 210 * u, 316 * u, 298 * u)
    c.rounded_box(fixture, radius=5 * u, width=3 * u)
    c.rounded_box((218 * u, 232 * u, 294 * u, 280 * u), radius=4 * u, width=2 * u)
    c.ellipse((239 * u, 242 * u, 273 * u, 270 * u), width=3 * u)
    c.line([(196 * u, 266 * u), (218 * u, 266 * u)], width=7 * u)
    c.line([(294 * u, 266 * u), (316 * u, 266 * u)], width=7 * u)
    instrument_feet(c, fixture)
    pipe(c, [(160 * u, 266 * u), (196 * u, 266 * u)])
    pipe(c, [(316 * u, 266 * u), (352 * u, 266 * u)])
    c.path([(73 * u, 266 * u), (160 * u, 266 * u), (196 * u, 266 * u),
            (256 * u, 256 * u), (316 * u, 266 * u), (352 * u, 266 * u),
            (439 * u, 266 * u)], width=3 * u)
    return c


def cold_room_research_cartridge() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A03-02"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 30 * u, 486 * u)
    # Empty insulated room: plain wall seams and floor drain, never signage.
    c.line([(42 * u, 182 * u), (42 * u, ground)], width=2 * u)
    c.line([(470 * u, 182 * u), (470 * u, ground)], width=2 * u)
    for x in (92, 142):
        c.line([(x * u, 292 * u), ((x + 20) * u, 292 * u)], width=u)

    heat_pump = (196 * u, 202 * u, 344 * u, 306 * u)
    cabinet(c, heat_pump, cutaway=True)
    coil(c, (220 * u, 242 * u, 278 * u, 284 * u), turns=5)
    c.ellipse((300 * u, 246 * u, 326 * u, 272 * u), width=3 * u)
    instrument_feet(c, heat_pump)

    cartridge(c, (366 * u, 246 * u, 458 * u, 278 * u))
    c.rounded_box((350 * u, 239 * u, 370 * u, 286 * u), radius=3 * u)
    c.path([(420 * u, 262 * u), (370 * u, 262 * u), (344 * u, 262 * u),
            (326 * u, 259 * u), (300 * u, 259 * u), (278 * u, 263 * u),
            (220 * u, 263 * u)], width=3 * u)
    return c


def sealed_loop_calorimeter() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A03-03"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 38 * u, 474 * u)
    chamber = (72 * u, 185 * u, 440 * u, 307 * u)
    c.rounded_box(chamber, radius=8 * u, width=3 * u)
    c.rounded_box((91 * u, 204 * u, 421 * u, 289 * u), radius=4 * u, width=2 * u)
    for x in (82, 426):
        for y in (195, 290):
            c.ellipse((x * u, y * u, (x + 6) * u, (y + 6) * u), fill=INK, width=u)

    # Compressor, condenser, physical capillary restriction, and evaporator.
    c.ellipse((112 * u, 239 * u, 168 * u, 283 * u), width=3 * u)
    c.line([(124 * u, 261 * u), (156 * u, 261 * u)], width=4 * u)
    coil(c, (204 * u, 222 * u, 252 * u, 274 * u), turns=6)
    c.rounded_box((278 * u, 238 * u, 308 * u, 258 * u), radius=3 * u, width=2 * u)
    c.rounded_box((287 * u, 243 * u, 299 * u, 253 * u), radius=2 * u, width=u)
    coil(c, (342 * u, 222 * u, 390 * u, 274 * u), turns=6)

    loop = [(140 * u, 239 * u), (140 * u, 216 * u), (228 * u, 216 * u),
            (228 * u, 248 * u), (278 * u, 248 * u), (308 * u, 248 * u),
            (366 * u, 248 * u), (366 * u, 284 * u), (140 * u, 284 * u),
            (140 * u, 239 * u)]
    c.path(loop, width=3 * u)
    return c


def keyed_cartridge_calorimeter() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A03-04"]["dimensions"])
    u = c.unit
    bench_y = 300 * u
    bench(c, bench_y, 28 * u, 484 * u)

    cartridge(c, (54 * u, 251 * u, 174 * u, 282 * u))
    # A stepped physical key on the cartridge matches the cradle recess.
    c.polygon([(174 * u, 258 * u), (184 * u, 258 * u), (184 * u, 265 * u),
               (194 * u, 265 * u), (194 * u, 274 * u), (174 * u, 274 * u)], width=2 * u)
    cradle = (208 * u, 238 * u, 286 * u, 291 * u)
    c.rounded_box(cradle, radius=4 * u, width=3 * u)
    c.line([(208 * u, 258 * u), (226 * u, 258 * u), (226 * u, 265 * u),
            (237 * u, 265 * u), (237 * u, 274 * u), (208 * u, 274 * u)], width=2 * u)

    calorimeter = (310 * u, 205 * u, 462 * u, 298 * u)
    c.rounded_box(calorimeter, radius=6 * u, width=3 * u)
    c.rounded_box((331 * u, 224 * u, 441 * u, 283 * u), radius=3 * u, width=2 * u)
    coil(c, (352 * u, 239 * u, 417 * u, 270 * u), turns=4)
    instrument_feet(c, calorimeter)
    c.path([(91 * u, 266 * u), (174 * u, 266 * u), (194 * u, 270 * u),
            (208 * u, 270 * u), (247 * u, 264 * u), (286 * u, 264 * u),
            (310 * u, 255 * u), (352 * u, 255 * u), (417 * u, 255 * u)], width=3 * u)
    return c


def catalyst_flow_reactor() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A04-03"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 32 * u, 480 * u)

    # Four-port inlet manifold converges physically into one reactor feed.
    c.rounded_box((45 * u, 237 * u, 121 * u, 282 * u), radius=4 * u)
    for y in (246, 258, 270):
        c.line([(30 * u, y * u), (45 * u, y * u)], width=5 * u)
    pipe(c, [(121 * u, 259 * u), (180 * u, 259 * u)])

    reactor = (180 * u, 207 * u, 326 * u, 304 * u)
    c.rounded_box(reactor, radius=20 * u, width=3 * u)
    c.rounded_box((206 * u, 227 * u, 300 * u, 284 * u), radius=5 * u, width=2 * u)
    # One catalyst coupon held between two plain clamps.
    c.rounded_box((235 * u, 239 * u, 271 * u, 273 * u), radius=2 * u, width=3 * u)
    c.hatch((241 * u, 245 * u, 265 * u, 267 * u), spacing=6 * u)
    c.line([(218 * u, 256 * u), (235 * u, 256 * u)], width=5 * u)
    c.line([(271 * u, 256 * u), (288 * u, 256 * u)], width=5 * u)
    instrument_feet(c, reactor)

    sample = (397 * u, 238 * u, 457 * u, 304 * u)
    vessel(c, sample)
    instrument_feet(c, sample)
    pipe(c, [(326 * u, 256 * u), (397 * u, 256 * u)])
    c.path([(30 * u, 258 * u), (45 * u, 258 * u), (121 * u, 259 * u),
            (180 * u, 259 * u), (206 * u, 256 * u), (253 * u, 256 * u),
            (300 * u, 256 * u), (326 * u, 256 * u), (397 * u, 256 * u),
            (427 * u, 256 * u)], width=3 * u)
    return c


def measured_branch_manifold() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A04-04"]["dimensions"])
    u = c.unit
    ground = 320 * u
    floor(c, ground, 30 * u, 480 * u)

    c.rounded_box((48 * u, 246 * u, 142 * u, 278 * u), radius=5 * u)
    c.line([(28 * u, 262 * u), (48 * u, 262 * u)], width=7 * u)
    # Three separate closed branches terminate at substantial physical gate valves.
    for index, y in enumerate((218, 251, 284)):
        x_end = (245 + index * 18) * u
        branch = [(142 * u, 262 * u), (178 * u, 262 * u), (178 * u, y * u), (x_end, y * u)]
        pipe(c, branch)
        gate_valve(c, x_end, y * u, closed=True)

    measured_y = 294 * u
    measured = [(142 * u, 262 * u), (202 * u, 262 * u), (202 * u, measured_y), (350 * u, measured_y)]
    pipe(c, measured)
    gate_valve(c, 254 * u, measured_y, closed=False)
    meter = (350 * u, 247 * u, 433 * u, 307 * u)
    vessel(c, meter)
    instrument_feet(c, meter)
    pipe(c, [(433 * u, measured_y), (476 * u, measured_y)])
    c.path([(28 * u, 262 * u), (48 * u, 262 * u), (142 * u, 262 * u),
            (202 * u, 262 * u), (202 * u, measured_y), (254 * u, measured_y),
            (350 * u, measured_y), (391 * u, measured_y), (433 * u, measured_y),
            (476 * u, measured_y)], width=3 * u)
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B3-A02-02": ion_selective_tailings_skid,
    "SW1-B3-A02-03": pfas_sorbent_column,
    "SW1-B3-A02-04": shared_pressure_flow_fixture,
    "SW1-B3-A03-02": cold_room_research_cartridge,
    "SW1-B3-A03-03": sealed_loop_calorimeter,
    "SW1-B3-A03-04": keyed_cartridge_calorimeter,
    "SW1-B3-A04-03": catalyst_flow_reactor,
    "SW1-B3-A04-04": measured_branch_manifold,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
