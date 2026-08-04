#!/usr/bin/env python3
"""Wave-4 batch 03 scenes built from deterministic, glyph-free PIL primitives."""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from wave4_scene_components import (
    INK,
    PAPER,
    SceneCanvas,
    bench,
    floor,
    instrument_feet,
    pipe,
    probe,
    vessel,
)

PROJECT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"

SPECS = {
    "SW1-B2-A02-05": {
        "archetype": "aggregate-precast-sorting-bay",
        "dimensions": (1536, 864),
        "filename": "SW1-B2-A02-05--aggregate-precast-sorting-bay.png",
        "scene": (
            "An unoccupied construction-material sorting bay with a conveyor separating reclaimed "
            "aggregate into a clean hopper feeding one precast panel mold."
        ),
        "mechanism": "reclaimed aggregate is graded and returned to a new precast panel",
    },
    "SW1-B2-A03-03": {
        "archetype": "methane-pyrolysis-cutaway",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A03-03--methane-pyrolysis-cutaway.png",
        "scene": (
            "A methane-pyrolysis vessel in cutaway with solid carbon dropping into shallow "
            "collection trays and one gas conduit leaving the top."
        ),
        "mechanism": (
            "the hot reactor splits methane while solid carbon is physically removed into trays"
        ),
    },
    "SW1-B2-A03-04": {
        "archetype": "caloric-module-service-cabinet",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A03-04--caloric-module-service-cabinet.png",
        "scene": (
            "A building cooling plant with one solid-state caloric module clamped between a warm "
            "loop and a cold loop inside an accessible service cabinet."
        ),
        "mechanism": "the caloric module pumps heat between the two closed fluid loops",
    },
    "SW1-B2-A03-05": {
        "archetype": "refrigerated-warehouse-loop",
        "dimensions": (1536, 864),
        "filename": "SW1-B2-A03-05--refrigerated-warehouse-loop.png",
        "scene": (
            "An empty refrigerated food warehouse with a rooftop heat-pump module connected to "
            "one interior cold-room heat exchanger; most of the frame is pale sky and wall."
        ),
        "mechanism": (
            "the closed refrigerant loop moves heat from the cold room to the rooftop exchanger"
        ),
    },
    "SW1-B2-A04-02": {
        "archetype": "reverse-osmosis-cutaway",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A04-02--reverse-osmosis-cutaway.png",
        "scene": (
            "A reverse-osmosis pressure vessel shown in long cutaway, with a spiral membrane "
            "element separating an inlet channel from a clean-water collection tube."
        ),
        "mechanism": (
            "pressure drives water through the membrane into the central collection tube"
        ),
    },
    "SW1-B2-A04-03": {
        "archetype": "atmospheric-water-harvester",
        "dimensions": (1536, 1024),
        "filename": "SW1-B2-A04-03--atmospheric-water-harvester.png",
        "scene": (
            "A rooftop atmospheric-water harvester in a dry built landscape, with a finned "
            "sorbent cassette above a small condenser and covered cistern."
        ),
        "mechanism": (
            "the sorbent cassette releases captured moisture to the condenser and cistern"
        ),
    },
    "SW1-B3-A01-03": {
        "archetype": "corrosion-test-loop",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A01-03--corrosion-test-loop.png",
        "scene": (
            "A recirculating corrosion-test loop with four metal coupons mounted along one pipe "
            "and a single scanning probe moving across their exposed surfaces."
        ),
        "mechanism": (
            "the scanning probe measures local surface error against the same flowing environment"
        ),
    },
    "SW1-B3-A01-04": {
        "archetype": "calibrated-holder-filtration-skid",
        "dimensions": (1536, 1024),
        "filename": "SW1-B3-A01-04--calibrated-holder-filtration-skid.png",
        "scene": (
            "A central instrument bench with one calibrated sample holder connected by a "
            "restrained indigo line to a compact water-filtration pilot skid across the room."
        ),
        "mechanism": (
            "the calibrated holder transfers a measured material result into one filtration "
            "pilot decision"
        ),
    },
}


def aggregate_precast_sorting_bay() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A02-05"]["dimensions"])
    u = c.unit
    ground = 409 * u
    floor(c, ground, 24 * u, 488 * u)

    # Covered belt carries rubble through two physical grading gaps.
    c.polygon([(38*u, 292*u), (226*u, 292*u), (238*u, 318*u), (50*u, 318*u)])
    for x in (61, 207):
        c.line([(x*u, 318*u), (x*u, ground)], width=5*u)
    for x, y, r in ((64, 286, 8), (92, 281, 6), (120, 287, 9),
                    (149, 280, 7), (178, 285, 8), (207, 281, 6)):
        c.polygon([(x*u, y*u), ((x+r)*u, (y-5)*u), ((x+2*r)*u, y*u),
                   ((x+r)*u, (y+7)*u)], width=u)
    for x in (118, 160):
        c.line([(x*u, 292*u), ((x+10)*u, 318*u)], width=2*u)

    # Clean graded stream falls through a hopper into one open panel mold.
    c.polygon([(260*u, 273*u), (342*u, 273*u), (329*u, 334*u), (274*u, 334*u)])
    c.line([(286*u, 334*u), (286*u, ground)], width=4*u)
    c.line([(318*u, 334*u), (318*u, ground)], width=4*u)
    c.rounded_box((374*u, 348*u, 478*u, 399*u), radius=3*u, width=3*u)
    c.rounded_box((385*u, 358*u, 467*u, 389*u), radius=2*u, width=u)
    c.hatch((390*u, 362*u, 462*u, 385*u), spacing=8*u)
    pipe(c, [(226*u, 305*u), (260*u, 305*u)])
    pipe(c, [(302*u, 334*u), (302*u, 365*u), (374*u, 365*u)])
    c.path([(55*u, 303*u), (226*u, 303*u), (260*u, 303*u),
            (302*u, 303*u), (302*u, 365*u), (426*u, 365*u)], width=3*u)
    return c


def methane_pyrolysis_cutaway() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A03-03"]["dimensions"])
    u = c.unit
    floor(c, 326*u, 67*u, 446*u)
    reactor = (174*u, 179*u, 332*u, 301*u)
    vessel(c, reactor)
    # Inner hot zone and descending carbon granules are physical cutaway details.
    c.rounded_box((210*u, 207*u, 296*u, 267*u), radius=8*u, width=2*u)
    c.hatch((222*u, 220*u, 284*u, 249*u), spacing=7*u)
    for x, y in ((235, 260), (253, 266), (271, 258), (244, 279), (264, 284)):
        c.ellipse(((x-2)*u, (y-2)*u, (x+2)*u, (y+2)*u), fill=INK, width=u)
    # Two shallow removable collection trays beneath the vessel.
    for x in (194, 263):
        c.polygon([(x*u, 302*u), ((x+58)*u, 302*u), ((x+52)*u, 321*u),
                   ((x+6)*u, 321*u)], width=2*u)
        c.stipple(((x+9)*u, 304*u, (x+49)*u, 317*u), step=7*u)
    # One top gas conduit and one side feed are unmarked physical pipes.
    pipe(c, [(253*u, 171*u), (253*u, 157*u), (401*u, 157*u), (401*u, 210*u)])
    pipe(c, [(92*u, 246*u), (174*u, 246*u)])
    c.path([(92*u, 246*u), (174*u, 246*u), (218*u, 246*u),
            (253*u, 260*u), (253*u, 302*u), (292*u, 310*u)], width=3*u)
    return c


def caloric_module_service_cabinet() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A03-04"]["dimensions"])
    u = c.unit
    floor(c, 326*u, 52*u, 460*u)
    c.rounded_box((126*u, 174*u, 390*u, 315*u), radius=3*u, width=2*u)
    c.line([(126*u, 201*u), (390*u, 201*u)], width=2*u)
    # Central clamped caloric slab between opposed exchanger jaws.
    c.rounded_box((231*u, 221*u, 285*u, 277*u), radius=3*u, width=3*u)
    c.hatch((239*u, 229*u, 277*u, 269*u), spacing=7*u)
    for x0, x1 in ((166, 231), (285, 350)):
        c.rounded_box((x0*u, 231*u, x1*u, 267*u), radius=4*u, width=2*u)
        for x in range(x0 + 10, x1 - 5, 12):
            c.line([(x*u, 237*u), (x*u, 261*u)], width=u)
    # One continuous route describes both closed sides using only physical linework.
    c.path([(231*u, 249*u), (188*u, 249*u), (188*u, 294*u),
            (148*u, 294*u), (148*u, 199*u), (188*u, 199*u),
            (188*u, 249*u), (258*u, 249*u), (324*u, 249*u),
            (324*u, 199*u), (368*u, 199*u), (368*u, 294*u),
            (324*u, 294*u), (324*u, 249*u), (285*u, 249*u)], width=3*u)
    return c


def refrigerated_warehouse_loop() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A03-05"]["dimensions"])
    u = c.unit
    ground = 410*u
    # Empty warehouse shell starts below the required open-paper sky.
    c.polygon([(37*u, 254*u), (347*u, 254*u), (389*u, 286*u),
               (389*u, ground), (37*u, ground)], width=3*u)
    c.line([(37*u, 286*u), (389*u, 286*u)], width=2*u)
    # Rooftop heat-pump module with plain fin bank.
    c.rounded_box((249*u, 211*u, 342*u, 260*u), radius=4*u, width=2*u)
    for x in range(261, 333, 12):
        c.line([(x*u, 220*u), (x*u, 250*u)], width=u)
    instrument_feet(c, (249*u, 211*u, 342*u, 260*u))
    # Interior cold-room exchanger and unobstructed service bay.
    c.rounded_box((92*u, 321*u, 181*u, 385*u), radius=4*u, width=2*u)
    for y in (333, 346, 359, 372):
        c.line([(104*u, y*u), (169*u, y*u)], width=u)
    c.line([(205*u, 300*u), (205*u, 397*u)], width=2*u)
    c.path([(136*u, 352*u), (220*u, 352*u), (220*u, 276*u),
            (270*u, 276*u), (270*u, 237*u), (320*u, 237*u),
            (320*u, 292*u), (238*u, 292*u), (238*u, 372*u),
            (136*u, 372*u), (136*u, 352*u)], width=3*u)
    return c


def reverse_osmosis_cutaway() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A04-02"]["dimensions"])
    u = c.unit
    floor(c, 325*u, 35*u, 480*u)
    # Long pressure shell and open cutaway window.
    c.rounded_box((45*u, 205*u, 470*u, 295*u), radius=45*u, width=3*u)
    c.rounded_box((80*u, 220*u, 432*u, 280*u), radius=25*u, width=2*u)
    # Spiral-wound membrane leaves alternate inlet layers around a central tube.
    for inset in (0, 10, 20):
        c.rounded_box(((105+inset)*u, (230+inset//2)*u,
                       (345-inset)*u, (270-inset//2)*u),
                      radius=(19-inset//2)*u, width=u)
    c.line([(103*u, 250*u), (383*u, 250*u)], width=9*u)
    c.line([(103*u, 250*u), (383*u, 250*u)], fill=PAPER, width=4*u)
    c.ellipse((372*u, 241*u, 392*u, 259*u), width=2*u)
    # Feed coupling and clean-water collection outlet.
    pipe(c, [(26*u, 250*u), (80*u, 250*u)])
    pipe(c, [(392*u, 250*u), (488*u, 250*u)])
    c.path([(26*u, 250*u), (80*u, 250*u), (117*u, 233*u),
            (212*u, 233*u), (245*u, 250*u), (383*u, 250*u),
            (392*u, 250*u), (488*u, 250*u)], width=3*u)
    return c


def atmospheric_water_harvester() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B2-A04-03"]["dimensions"])
    u = c.unit
    roof = 321*u
    # Bare built rooftop; no vegetation or landscape ornament.
    c.line([(30*u, roof), (490*u, roof)], width=5*u)
    for x in (55, 465):
        c.line([(x*u, roof), (x*u, 337*u)], width=3*u)
    # Raised finned sorbent cassette.
    c.rounded_box((82*u, 180*u, 242*u, 232*u), radius=4*u, width=2*u)
    for x in range(96, 232, 14):
        c.line([(x*u, 188*u), (x*u, 224*u)], width=2*u)
    c.line([(104*u, 232*u), (104*u, 247*u)], width=4*u)
    c.line([(220*u, 232*u), (220*u, 247*u)], width=4*u)
    # Condenser below cassette and a separately covered cistern.
    c.rounded_box((119*u, 247*u, 208*u, 302*u), radius=5*u, width=2*u)
    for y in (258, 270, 282, 294):
        c.line([(130*u, y*u), (197*u, y*u)], width=u)
    c.rounded_box((290*u, 247*u, 438*u, 315*u), radius=8*u, width=3*u)
    c.polygon([(282*u, 247*u), (364*u, 229*u), (446*u, 247*u)], width=2*u)
    pipe(c, [(164*u, 302*u), (164*u, 309*u), (290*u, 309*u)])
    c.path([(102*u, 205*u), (162*u, 205*u), (162*u, 247*u),
            (162*u, 275*u), (162*u, 309*u), (290*u, 309*u),
            (361*u, 281*u)], width=3*u)
    return c


def corrosion_test_loop() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A01-03"]["dimensions"])
    u = c.unit
    bench(c, 301*u, 25*u, 489*u)
    # Four identical coupons are mounted physically across one pipe.
    pipe(c, [(67*u, 264*u), (444*u, 264*u)])
    for x in (132, 205, 278, 351):
        c.rounded_box(((x-15)*u, 246*u, (x+15)*u, 282*u), radius=3*u, width=2*u)
        c.hatch(((x-9)*u, 251*u, (x+9)*u, 277*u), spacing=6*u)
    # Recirculation reservoir and pump casing close the environment loop.
    vessel(c, (51*u, 219*u, 103*u, 294*u), cutaway=True)
    c.ellipse((420*u, 282*u, 466*u, 321*u), width=3*u)
    pipe(c, [(80*u, 294*u), (80*u, 316*u), (443*u, 316*u), (443*u, 301*u)])
    # One scanning head and rail traverse above the exposed coupon faces.
    c.line([(112*u, 207*u), (372*u, 207*u)], width=4*u)
    probe(c, 247*u, 190*u, 246*u)
    c.path([(80*u, 264*u), (132*u, 264*u), (205*u, 264*u),
            (278*u, 264*u), (351*u, 264*u), (443*u, 264*u),
            (443*u, 316*u), (80*u, 316*u), (80*u, 264*u)], width=3*u)
    return c


def calibrated_holder_filtration_skid() -> SceneCanvas:
    c = SceneCanvas(*SPECS["SW1-B3-A01-04"]["dimensions"])
    u = c.unit
    floor(c, 326*u, 25*u, 490*u)
    # Central bench and calibrated geometry-only holder.
    bench(c, 286*u, 58*u, 285*u)
    c.rounded_box((124*u, 219*u, 221*u, 281*u), radius=5*u, width=3*u)
    c.line([(145*u, 242*u), (200*u, 242*u)], width=5*u)
    c.ellipse((162*u, 231*u, 183*u, 252*u), width=2*u)
    c.line([(145*u, 228*u), (145*u, 269*u)], width=3*u)
    c.line([(200*u, 228*u), (200*u, 269*u)], width=3*u)
    # Compact filtration skid: feed vessel, membrane housing, recovery vessel.
    c.rounded_box((330*u, 207*u, 475*u, 314*u), radius=5*u, width=3*u)
    vessel(c, (344*u, 235*u, 382*u, 299*u), cutaway=True)
    c.rounded_box((394*u, 238*u, 452*u, 264*u), radius=12*u, width=2*u)
    for x in (405, 416, 427, 438):
        c.line([(x*u, 243*u), (x*u, 259*u)], width=u)
    vessel(c, (407*u, 272*u, 447*u, 307*u))
    instrument_feet(c, (330*u, 207*u, 475*u, 314*u))
    c.path([(172*u, 242*u), (221*u, 242*u), (275*u, 242*u),
            (330*u, 242*u), (363*u, 242*u), (394*u, 251*u),
            (452*u, 251*u), (452*u, 287*u), (427*u, 287*u)], width=3*u)
    return c


RENDERERS: dict[str, Callable[[], SceneCanvas]] = {
    "SW1-B2-A02-05": aggregate_precast_sorting_bay,
    "SW1-B2-A03-03": methane_pyrolysis_cutaway,
    "SW1-B2-A03-04": caloric_module_service_cabinet,
    "SW1-B2-A03-05": refrigerated_warehouse_loop,
    "SW1-B2-A04-02": reverse_osmosis_cutaway,
    "SW1-B2-A04-03": atmospheric_water_harvester,
    "SW1-B3-A01-03": corrosion_test_loop,
    "SW1-B3-A01-04": calibrated_holder_filtration_skid,
}


def render(asset_id: str) -> Path:
    spec = SPECS[asset_id]
    canvas = RENDERERS[asset_id]()
    return canvas.save(OUTPUT_DIR / str(spec["filename"]))
