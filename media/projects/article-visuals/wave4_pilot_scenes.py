#!/usr/bin/env python3
"""Four Wave-4 pilot scenes built from deterministic Lupine line-art primitives."""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from wave4_scene_components import (
    INDIGO,
    INK,
    PAPER,
    SceneCanvas,
    cabinet,
    floor,
    instrument_feet,
    pipe,
    probe,
    vessel,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B1-A01-01": {
        "archetype": "industrial-cabinet-row",
        "dimensions": (1536, 864),
        "filename": "SW1-B1-A01-01--industrial-cabinet-row.png",
        "scene": (
            "A row of three grid-scale battery cabinets at dawn; the nearest cabinet is a simple "
            "cutaway with one ceramic electrolyte plate seated between two flat electrodes, "
            "while the other cabinets remain closed."
        ),
        "mechanism": (
            "the ceramic electrolyte plate separates the electrodes while carrying the "
            "single indigo ion path inside the nearest cabinet"
        ),
    },
    "SW1-B1-A02-01": {
        "archetype": "laboratory-apparatus",
        "dimensions": (1536, 864),
        "filename": "SW1-B1-A02-01--laboratory-apparatus.png",
        "scene": (
            "A long laboratory bench with many empty ceramic sample boats entering a small tube "
            "furnace and only one finished electrolyte pellet resting in a coin-cell test clamp."
        ),
        "mechanism": "the narrow furnace-to-test route makes the physical synthesis bottleneck visible",
    },
    "SW1-B2-A03-01": {
        "archetype": "field-infrastructure",
        "dimensions": (1536, 864),
        "filename": "SW1-B2-A03-01--field-infrastructure.png",
        "scene": (
            "A landfill gas well manifold feeding a sealed catalytic oxidation unit on a bare "
            "service pad, with one pipe route and no visible plume."
        ),
        "mechanism": "the oxidation unit converts collected methane within the sealed vessel",
    },
    "SW1-B4-A02-03": {
        "archetype": "cell-assembly-cutaway",
        "dimensions": (1536, 1024),
        "filename": "SW1-B4-A02-03--cell-assembly-cutaway.png",
        "scene": (
            "A practical solid-state cell casing in cutaway beneath a scanning probe, revealing "
            "a ceramic electrolyte pressed against one electrode interface."
        ),
        "mechanism": "the probe inspects the buried electrolyte-to-electrode interface inside the cell",
    },
}


def industrial_cabinet_row() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A01-01"]["dimensions"])
    u = c.unit
    baseline = c.height - 70 * u
    floor(c, baseline, 70 * u, c.width - 50 * u)

    # Closed cabinets recede behind the cutaway and establish a real industrial row.
    cabinet(c, (74 * u, baseline - 100 * u, 140 * u, baseline))
    cabinet(c, (147 * u, baseline - 112 * u, 225 * u, baseline))
    cabinet(
        c,
        (235 * u, baseline - 133 * u, 345 * u, baseline),
        cutaway=True,
        layers=(("hatch", 4), ("stipple", 2), ("hatch", 4)),
    )

    # Ceramic layer is the thin middle slab. The single route stays inside the cutaway.
    path_y = baseline - 65 * u
    c.path(
        [(265 * u, path_y), (286 * u, path_y - 7 * u),
         (309 * u, path_y + 6 * u), (330 * u, path_y)],
        width=3 * u,
    )

    # Sparse conduits/feet keep the row physically grounded without stealing sky.
    for x in (101, 185, 287):
        c.line([(x * u, baseline), (x * u, baseline + 8 * u)], width=4 * u)
    return c


def laboratory_apparatus() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B1-A02-01"]["dimensions"])
    u = c.unit
    bench_y = c.height - 68 * u
    c.rounded_box((38 * u, bench_y, 344 * u, bench_y + 12 * u), radius=2 * u)
    for x in (55, 175, 325):
        c.line([(x * u, bench_y + 12 * u), (x * u, bench_y + 38 * u)], width=4 * u)

    # Empty ceramic boats queue before a compact tube furnace.
    for x in (58, 84, 110, 136):
        c.polygon(
            [(x * u, bench_y - 10 * u), ((x + 18) * u, bench_y - 10 * u),
             ((x + 14) * u, bench_y), ((x + 4) * u, bench_y)],
            width=u,
        )
        c.line([((x + 5) * u, bench_y - 6 * u), ((x + 13) * u, bench_y - 6 * u)], width=u)

    furnace = (170 * u, bench_y - 64 * u, 254 * u, bench_y)
    c.rounded_box(furnace, radius=7 * u)
    c.ellipse((183 * u, bench_y - 47 * u, 241 * u, bench_y - 13 * u), width=3 * u)
    c.ellipse((197 * u, bench_y - 38 * u, 227 * u, bench_y - 22 * u), width=u)
    instrument_feet(c, furnace)

    # One finished pellet and a physical spring clamp at the end of the route.
    pellet_x, pellet_y = 283 * u, bench_y - 8 * u
    c.ellipse((pellet_x - 8 * u, pellet_y - 5 * u, pellet_x + 8 * u, pellet_y + 5 * u),
              width=2 * u)
    c.rounded_box((302 * u, bench_y - 40 * u, 337 * u, bench_y), radius=3 * u)
    c.line([(309 * u, bench_y - 24 * u), (330 * u, bench_y - 24 * u)], width=3 * u)
    c.ellipse((316 * u, bench_y - 30 * u, 326 * u, bench_y - 18 * u), width=u)

    c.path(
        [(151 * u, bench_y - 5 * u), (170 * u, bench_y - 5 * u),
         (183 * u, bench_y - 30 * u), (241 * u, bench_y - 30 * u),
         (254 * u, bench_y - 5 * u), (pellet_x, pellet_y),
         (319 * u, bench_y - 24 * u)],
        width=3 * u,
    )
    return c


def field_infrastructure() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A03-01"]["dimensions"])
    u = c.unit
    ground = c.height - 62 * u
    floor(c, ground, 35 * u, c.width - 35 * u)

    # Three capped gas wells meet a low manifold on a bare service pad.
    well_xs = (55, 105, 155)
    manifold_y = ground - 24 * u
    for x in well_xs:
        c.line([(x * u, ground), (x * u, ground - 56 * u)], width=8 * u)
        c.line([((x - 9) * u, ground - 56 * u), ((x + 9) * u, ground - 56 * u)], width=4 * u)
        c.rounded_box(((x - 11) * u, ground - 70 * u,
                       (x + 11) * u, ground - 56 * u), radius=3 * u)
        pipe(c, [(x * u, ground - 42 * u), (x * u, manifold_y)], functional=False)

    route = [
        (55 * u, manifold_y), (170 * u, manifold_y), (196 * u, manifold_y - 16 * u),
        (232 * u, manifold_y - 16 * u), (232 * u, ground - 58 * u),
    ]
    pipe(c, route, functional=True)

    # Sealed oxidation vessel, catalyst bed in cutaway, and a closed outlet loop.
    vessel_box = (210 * u, ground - 132 * u, 274 * u, ground)
    vessel(c, vessel_box, cutaway=True)
    c.hatch((220 * u, ground - 74 * u, 264 * u, ground - 49 * u), spacing=6 * u)
    outlet = [(242 * u, ground - 140 * u), (303 * u, ground - 140 * u),
              (303 * u, ground - 22 * u), (282 * u, ground - 22 * u)]
    pipe(c, outlet, functional=False)
    return c


def cell_assembly_cutaway() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B4-A02-03"]["dimensions"])
    u = c.unit
    base_y = c.height - 65 * u
    floor(c, base_y, 50 * u, c.width - 45 * u)

    # Practical bolted casing, open in cutaway, with pressure plates and ceramic layer.
    casing = (132 * u, base_y - 118 * u, 340 * u, base_y)
    c.rounded_box(casing, radius=8 * u, width=3 * u)
    for x in (146, 326):
        for y in (base_y - 103 * u, base_y - 16 * u):
            c.ellipse((x * u, y, (x + 8) * u, y + 8 * u), fill=INK, width=u)

    layer_x0, layer_x1 = 162 * u, 312 * u
    top = base_y - 92 * u
    layers = [
        (top, top + 25 * u, "hatch"),
        (top + 29 * u, top + 48 * u, "stipple"),
        (top + 52 * u, top + 77 * u, "hatch"),
    ]
    for y0, y1, texture in layers:
        c.rounded_box((layer_x0, y0, layer_x1, y1), radius=2 * u, width=u)
        if texture == "hatch":
            c.hatch((layer_x0 + 4 * u, y0 + 3 * u, layer_x1 - 4 * u, y1 - 3 * u))
        else:
            c.stipple((layer_x0 + 4 * u, y0 + 3 * u, layer_x1 - 4 * u, y1 - 3 * u))

    # Probe is mechanically mounted above the buried upper interface.
    probe_x = 237 * u
    probe(c, probe_x, base_y - 115 * u, top - 5 * u)
    c.line([(190 * u, base_y - 118 * u), (285 * u, base_y - 118 * u)], width=5 * u)
    c.line([(190 * u, base_y - 118 * u), (190 * u, base_y - 103 * u)], width=4 * u)
    c.line([(285 * u, base_y - 118 * u), (285 * u, base_y - 103 * u)], width=4 * u)

    interface_y = top + 27 * u
    c.path(
        [(174 * u, interface_y), (202 * u, interface_y - 3 * u),
         (230 * u, interface_y + 3 * u), (258 * u, interface_y - 2 * u),
         (288 * u, interface_y)],
        width=3 * u,
    )
    c.line([(probe_x, top - 5 * u), (probe_x, interface_y)], fill=INDIGO, width=2 * u)
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B1-A01-01": industrial_cabinet_row,
    "SW1-B1-A02-01": laboratory_apparatus,
    "SW1-B2-A03-01": field_infrastructure,
    "SW1-B4-A02-03": cell_assembly_cutaway,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
