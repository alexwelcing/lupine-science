#!/usr/bin/env python3
"""Deterministic keyframe renderer for critical-minerals/PFAS scenes 02–09.

All evidentiary topology, labels, mechanisms, and status marks are drawn here.
The sole photographic plate is used as non-evidentiary atmosphere only.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Iterable

from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "composites"
REPORT = ROOT / "reports" / "scene-render-report.json"
PLATE = ROOT / "assets" / "plates" / "plate-01-civic-hall.png"

C = {
    "field": "#101513", "evidence": "#F2EFE6", "correction": "#C97745",
    "water": "#76A9C3", "regeneration": "#B4BE92", "warning": "#D36B61",
    "muted": "#87908A", "black": "#090C0B",
}
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def f(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_B if bold else FONT, size)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canvas(plate: bool = False) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    if plate:
        im = Image.open(PLATE).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
        shade = Image.new("RGBA", (W, H), (16, 21, 19, 132))
        im = Image.alpha_composite(im.convert("RGBA"), shade)
    else:
        im = Image.new("RGBA", (W, H), C["field"])
        d = ImageDraw.Draw(im)
        # Authored mineral-black environment: quiet structural grid, not data.
        for x in range(0, W, 120):
            d.line((x, 0, x, H), fill=(242, 239, 230, 10), width=1)
        for y in range(0, H, 120):
            d.line((0, y, W, y), fill=(242, 239, 230, 10), width=1)
        d.polygon([(0, 850), (520, 610), (1400, 690), (1920, 500), (1920, 1080), (0, 1080)], fill=(8, 12, 10, 115))
    return im, ImageDraw.Draw(im)


def rr(d, box, r=18, fill: Any=C["field"], outline: Any=None, width=1):
    d.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)


def text(d, xy, s, size=24, color=C["evidence"], bold=False, anchor="la", spacing=6):
    d.multiline_text(xy, s, font=f(size, bold), fill=color, anchor=anchor, spacing=spacing)


def header(d, n: str, kicker: str, title: str, status: str):
    rr(d, (72, 58, 1848, 178), 20, (16, 21, 19, 235), C["evidence"], 2)
    text(d, (108, 91), f"SCENE {n}  ·  {kicker}", 17, C["evidence"], True, "lm")
    # Reserve the right-hand status zone; long titles must never run under it.
    title_size = 33 if len(title) > 50 else (37 if len(title) > 42 else 43)
    text(d, (108, 139), title, title_size, C["evidence"], True, "lm")
    rr(d, (1472, 86, 1810, 150), 13, C["field"], C["correction"], 3)
    text(d, (1641, 118), status, 17, C["evidence"], True, "mm")


def footer(d, label: str):
    rr(d, (72, 974, 1848, 1032), 16, (16, 21, 19, 242), None)
    text(d, (960, 1003), label, 18, C["evidence"], True, "mm")


def arrow(d, pts: Iterable[tuple[int, int]], color: str, width=18, head=22, dashed=False):
    pts = list(pts)
    if dashed:
        a, b = pts[0], pts[-1]
        steps = 14
        for i in range(0, steps, 2):
            t0, t1 = i / steps, min((i + 1) / steps, 1)
            x0, y0 = a[0]+(b[0]-a[0])*t0, a[1]+(b[1]-a[1])*t0
            x1, y1 = a[0]+(b[0]-a[0])*t1, a[1]+(b[1]-a[1])*t1
            d.line((x0, y0, x1, y1), fill=color, width=width)
    else:
        d.line(pts, fill=color, width=width, joint="curve")
    (x1, y1), (x2, y2) = pts[-2], pts[-1]
    import math
    a = math.atan2(y2-y1, x2-x1)
    p1 = (x2-head*math.cos(a-0.55), y2-head*math.sin(a-0.55))
    p2 = (x2-head*math.cos(a+0.55), y2-head*math.sin(a+0.55))
    d.polygon([(x2, y2), p1, p2], fill=color)


def cartridge(d, x, y, label, medium, removable=True):
    rr(d, (x, y, x+210, y+360), 28, C["evidence"], C["field"], 6)
    rr(d, (x+42, y+58, x+168, y+270), 15, medium, C["field"], 5)
    for yy in (y+108, y+163, y+218): d.line((x+60, yy, x+150, yy), fill=C["field"], width=5)
    rr(d, (x+25, y+300, x+185, y+345), 10, C["field"])
    text(d, (x+105, y+323), label, 15, C["evidence"], True, "mm")
    if removable:
        d.line((x+65, y+28, x+145, y+28), fill=C["correction"], width=10)


def vessel(d, x, y, label, fill):
    d.rounded_rectangle((x, y, x+190, y+280), 40, fill=C["evidence"], outline=C["field"], width=6)
    d.rectangle((x+28, y+150, x+162, y+238), fill=fill)
    rr(d, (x-8, y+292, x+198, y+348), 12, C["field"])
    text(d, (x+95, y+320), label, 16, C["evidence"], True, "mm")


def scene02():
    im, d = canvas(True)
    header(d, "02", "SELECTIVITY IS THE MACHINE", "Accessible cartridges separate one fraction", "ILLUSTRATIVE")
    # Three-step causal sequence, left to right.
    rr(d, (92, 245, 1828, 910), 28, (16, 21, 19, 218), C["evidence"], 2)
    for x, n, lab in [(155, "1", "COMPLEX FEED"), (720, "2", "SELECTIVE CAPTURE"), (1310, "3", "REMOVE + REGENERATE")]:
        d.ellipse((x, 276, x+54, 330), fill=C["evidence"]); text(d, (x+27, 303), n, 22, C["field"], True, "mm")
        text(d, (x+72, 303), lab, 18, C["evidence"], True, "lm")
    # feed ions (explicitly examples, not performance data)
    rr(d, (145, 405, 530, 705), 24, C["field"], C["water"], 5)
    text(d, (337, 442), "BRINE · MIXED IONS", 18, C["evidence"], True, "mm")
    ions=[("Li⁺",C["correction"]),("Na⁺",C["water"]),("K⁺",C["water"]),("Mg²⁺",C["water"])]
    for i,(lab,col) in enumerate(ions):
        x=205+(i%2)*165; y=510+(i//2)*100
        d.ellipse((x,y,x+62,y+62), fill=col, outline=C["evidence"], width=3); text(d,(x+31,y+31),lab,17,C["field"],True,"mm")
    cartridge(d, 790, 400, "REMOVABLE", C["regeneration"])
    arrow(d, [(530,555),(760,555)], C["water"], 17)
    arrow(d, [(1000,510),(1260,510)], C["correction"], 17)
    rr(d,(1250,398,1520,590),20,C["field"],C["correction"],5); text(d,(1385,465),"SELECTED\nFRACTION",22,C["evidence"],True,"mm")
    arrow(d, [(895,400),(895,352),(1590,352),(1590,690),(1530,690)], C["regeneration"], 15)
    cartridge(d, 1535, 540, "REGENERATED", C["regeneration"])
    text(d,(1610,515),"separate outlet",16,C["correction"],True,"lm")
    text(d,(1515,835),"service return",16,C["regeneration"],True,"ra")
    footer(d,"RELATIONSHIPS: complex feed enters · selected fraction exits separately · cartridge returns to service")
    return im


def scene03():
    im,d=canvas(False)
    header(d,"03","BIND · RELEASE · BREAK","Different barriers, different obligations","SOURCE-BOUND EXPLANATORY")
    panels=[(90,245,620,900),(695,245,1225,900),(1300,245,1830,900)]
    for b in panels: rr(d,b,26,C["black"],C["evidence"],3)
    text(d,(355,300),"BIND + RELEASE",23,C["evidence"],True,"mm")
    text(d,(960,300),"GEOMETRIC EXCLUSION",23,C["evidence"],True,"mm")
    text(d,(1565,300),"C–F ACTIVATION",23,C["evidence"],True,"mm")
    # pocket and fitting Li-like ion
    d.arc((180,430,530,760),0,180,fill=C["regeneration"],width=24)
    d.ellipse((325,478,385,538),fill=C["correction"],outline=C["evidence"],width=3)
    text(d,(355,508),"Li⁺",18,C["field"],True,"mm")
    arrow(d,[(355,405),(355,470)],C["water"],12,18)
    arrow(d,[(400,575),(400,420)],C["regeneration"],10,17,dashed=True)
    text(d,(355,795),"fits pocket · release remains required",17,C["evidence"],False,"mm")
    # competing ion cannot enter
    d.arc((785,480,1135,810),0,180,fill=C["muted"],width=24)
    d.ellipse((915,390,1005,480),fill=C["water"],outline=C["evidence"],width=3)
    text(d,(960,435),"Mg²⁺",17,C["field"],True,"mm")
    d.line((915,520,1005,610),fill=C["warning"],width=13); d.line((1005,520,915,610),fill=C["warning"],width=13)
    text(d,(960,795),"excluded by authored pocket geometry",17,C["evidence"],False,"mm")
    # exact bond and barrier concept
    d.ellipse((1390,500,1460,570),fill=C["field"],outline=C["evidence"],width=5); text(d,(1425,535),"C",20,C["evidence"],True,"mm")
    d.ellipse((1670,500,1740,570),fill=C["warning"],outline=C["evidence"],width=5); text(d,(1705,535),"F",20,C["field"],True,"mm")
    d.line((1460,535,1670,535),fill=C["warning"],width=12)
    arrow(d,[(1565,475),(1565,370)],C["warning"],12,20)
    text(d,(1565,340),"ACTIVATION BARRIER",17,C["warning"],True,"mm")
    text(d,(1565,630),"≈ 485 kJ mol⁻¹",30,C["evidence"],True,"mm")
    text(d,(1565,680),"source value · not candidate performance",15,C["muted"],False,"mm")
    text(d,(1565,795),"capture is not destruction",17,C["evidence"],False,"mm")
    footer(d,"THREE DISTINCT RELATIONSHIPS · no measured candidate performance implied")
    return im


def scene04():
    im,d=canvas(False)
    header(d,"04","WHY FAST MODELS FAIL HERE","Raw barriers soften at under-coordinated sites","SOURCE-BOUND EXPLANATORY")
    rr(d,(95,240,1250,900),25,C["black"],C["evidence"],3)
    text(d,(145,292),"ENERGY LANDSCAPE · SCHEMATIC",20,C["evidence"],True)
    # axes and barriers
    d.line((180,790,1160,790),fill=C["evidence"],width=4); d.line((180,790,180,365),fill=C["evidence"],width=4)
    text(d,(670,840),"reaction coordinate",17,C["evidence"],False,"mm"); text(d,(128,575),"energy",17,C["evidence"],False,"mm")
    ref=[(210,740),(350,715),(500,520),(650,390),(800,540),(960,700),(1120,735)]
    raw=[(210,740),(350,720),(500,625),(650,555),(800,635),(960,710),(1120,735)]
    d.line(ref,fill=C["evidence"],width=9,joint="curve"); d.line(raw,fill=C["warning"],width=9,joint="curve")
    text(d,(985,645),"REFERENCE",17,C["evidence"],True); text(d,(985,690),"RAW FAST MODEL",17,C["warning"],True)
    rr(d,(565,330,735,805),18,(211,107,97,28),C["warning"],3); text(d,(650,315),"UNDER-COORDINATED SITE",15,C["warning"],True,"mm")
    # ranking lanes
    rr(d,(1310,240,1825,900),25,C["black"],C["evidence"],3)
    text(d,(1568,292),"CANDIDATE ORDER",20,C["evidence"],True,"mm")
    text(d,(1400,365),"RAW",17,C["warning"],True,"mm"); text(d,(1695,365),"REFERENCE",17,C["evidence"],True,"mm")
    for x,y,lab,col in [(1390,430,"A · 1",C["warning"]),(1390,540,"B · 2",C["warning"]),(1685,430,"B · 1",C["evidence"]),(1685,540,"A · 2",C["evidence"])]:
        rr(d,(x,y,x+165,y+70),12,C["field"],col,4); text(d,(x+82,y+35),lab,19,col,True,"mm")
    d.line((1555,465,1685,575),fill=C["warning"],width=5); d.line((1555,575,1685,465),fill=C["warning"],width=5)
    rr(d,(1370,690,1765,790),14,C["field"],C["regeneration"],3); text(d,(1568,740),"BULK REFERENCE\nREMAINS ANCHORED",17,C["regeneration"],True,"mm")
    text(d,(1568,825),"ordering is not support",16,C["muted"],False,"mm")
    footer(d,"RAW uMLIP SOFTENING: 15–60% IN SOURCE-BOUND UNDER-COORDINATED REGIONS · schematic, not new data")
    return im


def scene05():
    im,d=canvas(False)
    header(d,"05","MEASURE · CORRECT · BOUND","Correction applies only inside measured support","SOURCE-BOUND EXPLANATORY")
    # three sequential columns
    xs=[105,675,1245]
    titles=["1 · ANCHOR OBSERVATIONS","2 · CORRECTED RANKING","3 · DOMAIN DECISION"]
    for x,t in zip(xs,titles):
        rr(d,(x,245,x+540,900),25,C["black"],C["evidence"],3); text(d,(x+270,295),t,19,C["evidence"],True,"mm")
    # anchors / bounded curve
    d.line((175,760,570,760),fill=C["evidence"],width=3); d.line((175,760,175,390),fill=C["evidence"],width=3)
    curve=[(190,700),(260,650),(330,570),(400,520),(470,470),(555,430)]
    d.line(curve,fill=C["correction"],width=8,joint="curve")
    for x,y in [(220,680),(330,570),(470,470)]: d.ellipse((x-12,y-12,x+12,y+12),fill=C["evidence"],outline=C["correction"],width=4)
    text(d,(375,820),"local environment",16,C["evidence"],False,"mm"); text(d,(140,560),"error",16,C["evidence"],False,"mm")
    text(d,(375,355),"anchors constrain the field",16,C["correction"],True,"mm")
    # ranking before/after
    text(d,(750,390),"RAW",17,C["warning"],True); text(d,(1030,390),"CORRECTED",17,C["correction"],True)
    for x,y,lab,col in [(740,445,"A · 1",C["warning"]),(740,560,"B · 2",C["warning"]),(1015,445,"B · 1",C["correction"]),(1015,560,"A · 2",C["correction"])]:
        rr(d,(x,y,x+150,y+72),11,C["field"],col,4); text(d,(x+75,y+36),lab,18,col,True,"mm")
    arrow(d,[(905,625),(1000,625)],C["correction"],9,16)
    text(d,(945,680),"ranking restored\nwithin support",17,C["evidence"],True,"mm")
    # domain ring and explicit outside candidate
    d.ellipse((1325,370,1665,710),fill=(201,119,69,28),outline=C["correction"],width=8)
    text(d,(1495,420),"MEASURED\nDOMAIN",19,C["correction"],True,"mm")
    d.ellipse((1460,520,1515,575),fill=C["regeneration"],outline=C["evidence"],width=3); text(d,(1487,548),"B",18,C["field"],True,"mm")
    d.ellipse((1690,575,1755,640),fill=C["warning"],outline=C["evidence"],width=3); text(d,(1722,607),"X",18,C["field"],True,"mm")
    d.line((1655,555,1780,680),fill=C["warning"],width=8)
    rr(d,(1325,750,1755,830),13,C["field"],C["warning"],4); text(d,(1540,790),"X · UNSUPPORTED · WITHHELD",17,C["warning"],True,"mm")
    footer(d,"NO UNIVERSAL COVERAGE CLAIM · outside-domain state remains visible and does not advance")
    return im


def scene06():
    im,d=canvas(True)
    header(d,"06","RETURN SCARCE ATOMS","One recovery and regeneration loop","ILLUSTRATIVE · NOT PERFORMANCE DATA")
    rr(d,(80,225,1840,920),28,(16,21,19,220),C["evidence"],2)
    text(d,(220,295),"COMPLEX FEED",18,C["evidence"],True,"mm"); text(d,(855,295),"SERVICEABLE CAPTURE",18,C["evidence"],True,"mm"); text(d,(1515,295),"DEDICATED FRACTION",18,C["evidence"],True,"mm")
    rr(d,(115,390,420,650),22,C["field"],C["water"],5); text(d,(267,520),"MINERAL-RICH\nFEED",24,C["evidence"],True,"mm")
    cartridge(d,750,365,"REMOVABLE",C["regeneration"])
    vessel(d,1415,400,"RECOVERED FRACTION",C["correction"])
    arrow(d,[(420,520),(720,520)],C["water"],20)
    arrow(d,[(960,520),(1385,520)],C["correction"],20)
    # physical wash station and return loop
    rr(d,(625,760,1085,855),18,C["field"],C["regeneration"],4); text(d,(855,807),"WASH + REGENERATE",20,C["regeneration"],True,"mm")
    # Explicit service cycle: remove downward into wash, return upward to the housing.
    arrow(d,[(815,725),(745,760)],C["regeneration"],12,18,dashed=True)
    arrow(d,[(1010,760),(1070,690),(1070,355),(960,400)],C["regeneration"],12,18)
    rr(d,(1260,760,1740,855),18,C["field"],C["evidence"],3); text(d,(1500,807),"NO YIELD OR SCALE CLAIM",18,C["evidence"],True,"mm")
    footer(d,"FEED → REMOVABLE CARTRIDGE → DEDICATED VESSEL · WASHED CARTRIDGE RETURNS TO SERVICE")
    return im


def scene07():
    im,d=canvas(True)
    header(d,"07","DESTROY · DON’T RELOCATE","Contained proposed pathway; validation is unresolved","ILLUSTRATIVE PROPOSED PILOT")
    rr(d,(75,220,1845,925),28,(16,21,19,224),C["warning"],3)
    cartridge(d,155,390,"CAPTURE",C["warning"])
    text(d,(260,330),"PFAS CAPTURE COLUMN",19,C["evidence"],True,"mm")
    # double contained transfer
    d.line((365,550,920,550),fill=C["field"],width=44); d.line((365,550,920,550),fill=C["correction"],width=22); d.line((365,550,920,550),fill=C["evidence"],width=5)
    arrow(d,[(450,550),(890,550)],C["correction"],10,18)
    text(d,(645,505),"SEALED DOUBLE-CONTAINED TRANSFER",16,C["evidence"],True,"mm")
    # pilot enclosure + inner chamber
    rr(d,(910,325,1435,800),30,C["field"],C["warning"],9)
    rr(d,(970,390,1375,675),20,C["evidence"],C["field"],5)
    d.line((1060,600,1060,455,1285,455,1285,600),fill=C["correction"],width=18,joint="curve")
    text(d,(1172,640),"SEALED CHAMBER",17,C["field"],True,"mm")
    rr(d,(980,710,1365,770),12,C["field"],C["warning"],3); text(d,(1172,740),"DESTRUCTIVE-TREATMENT PILOT",16,C["evidence"],True,"mm")
    # status gate
    rr(d,(1510,350,1785,770),22,C["black"],C["warning"],5)
    text(d,(1647,405),"STATUS",18,C["warning"],True,"mm")
    d.line((1570,475,1725,630),fill=C["warning"],width=14); d.line((1725,475,1570,630),fill=C["warning"],width=14)
    text(d,(1647,680),"UNVALIDATED",22,C["warning"],True,"mm")
    text(d,(1647,724),"NO COMMERCIAL\nCATALYST CLAIM",15,C["evidence"],True,"mm")
    rr(d,(260,825,1660,885),12,C["field"],C["evidence"],3); text(d,(960,855),"CAPTURE ALONE RELOCATES · PROPOSED DESTRUCTION REQUIRES VALIDATION",18,C["evidence"],True,"mm")
    footer(d,"NO VISIBLE EMISSIONS · NO LANDFILL-AS-SOLUTION · unsupported pilot status remains explicit")
    return im


def scene08():
    im,d=canvas(True)
    header(d,"08","ONE SHARED TEST DISCIPLINE","Same fixture conditions; samples and outputs stay separate","ILLUSTRATIVE")
    rr(d,(82,225,1838,920),28,(16,21,19,224),C["evidence"],2)
    # shared measurement spine across top
    rr(d,(505,280,1415,390),18,C["field"],C["evidence"],4)
    text(d,(960,320),"CONTROLLED FLOW + REGENERATION FIXTURE",21,C["evidence"],True,"mm")
    text(d,(960,360),"shared measurement spine · no invented readout",16,C["muted"],False,"mm")
    d.line((960,390,960,840),fill=C["evidence"],width=3)
    d.line((960,470,570,470),fill=C["evidence"],width=4); d.line((960,470,1350,470),fill=C["evidence"],width=4)
    cartridge(d,360,505,"MINERAL CLASS",C["regeneration"])
    cartridge(d,1350,505,"PFAS CLASS",C["warning"])
    arrow(d,[(120,685),(330,685)],C["water"],18)
    arrow(d,[(1800,685),(1590,685)],C["water"],18)
    vessel(d,680,565,"SEPARATE OUTPUT A",C["correction"])
    rr(d,(1025,565,1265,850),25,C["field"],C["warning"],5); text(d,(1145,680),"SEALED\nOUTPUT B",21,C["evidence"],True,"mm"); text(d,(1145,795),"distinct path",16,C["warning"],True,"mm")
    arrow(d,[(570,650),(650,650)],C["correction"],14)
    arrow(d,[(1350,650),(1295,650)],C["correction"],14)
    rr(d,(805,410,1115,455),10,C["field"],C["evidence"],3); text(d,(960,432),"SAMPLES DO NOT MIX",15,C["evidence"],True,"mm")
    footer(d,"IDENTICAL CONTROL DISCIPLINE ≠ IDENTICAL MATERIAL · cartridge identities and outputs remain distinct")
    return im


def scene09():
    im,d=canvas(False)
    header(d,"09","SUPPORTED DISPOSITION","Advance inside support; stop visibly outside it","SOURCE-BOUND EXPLANATORY")
    # measured boundary
    rr(d,(105,245,1815,865),30,C["black"],C["evidence"],3)
    d.line((960,275,960,835),fill=C["evidence"],width=4)
    text(d,(530,310),"INSIDE MEASURED DOMAIN",22,C["correction"],True,"mm")
    text(d,(1390,310),"OUTSIDE MEASURED DOMAIN",22,C["warning"],True,"mm")
    # supported candidate advances
    d.ellipse((260,460,350,550),fill=C["regeneration"],outline=C["evidence"],width=4); text(d,(305,505),"S",25,C["field"],True,"mm")
    arrow(d,[(370,505),(770,505)],C["regeneration"],20,26)
    rr(d,(770,430,900,580),18,C["field"],C["regeneration"],5); text(d,(835,505),"PHYSICAL\nTEST",18,C["regeneration"],True,"mm")
    rr(d,(245,650,700,730),14,C["field"],C["correction"],4); text(d,(472,690),"SUPPORTED · ADVANCE",19,C["correction"],True,"mm")
    # unsupported state ends at explicit stop, remains present
    d.ellipse((1160,460,1250,550),fill=C["warning"],outline=C["evidence"],width=4); text(d,(1205,505),"X",25,C["field"],True,"mm")
    arrow(d,[(1270,505),(1485,505)],C["warning"],16,22,dashed=True)
    d.line((1510,420,1510,590),fill=C["warning"],width=18)
    text(d,(1510,625),"STOP",22,C["warning"],True,"mm")
    rr(d,(1170,650,1625,730),14,C["field"],C["warning"],4); text(d,(1397,690),"UNSUPPORTED · WITHHELD",19,C["warning"],True,"mm")
    # distinct closing loops
    rr(d,(220,790,820,840),12,C["field"],C["regeneration"],3); text(d,(520,815),"SCARCE ATOMS → RETURN TO CIRCULATION",15,C["regeneration"],True,"mm")
    rr(d,(1100,790,1700,840),12,C["field"],C["warning"],3); text(d,(1400,815),"HARMFUL MATERIAL → CONTAINED PATH",15,C["warning"],True,"mm")
    footer(d,"RECOVER WHAT WE NEED.  DESTROY WHAT WE DON’T. · no success claim beyond the support boundary")
    return im


SCENES = [
    ("02-selective-cartridges", scene02, "accepted plate-01 atmosphere + deterministic topology", "illustrative"),
    ("03-bind-release-break", scene03, "deterministic mineral-black environment", "source-bound-explanatory"),
    ("04-softened-landscape", scene04, "deterministic mineral-black environment", "source-bound-explanatory"),
    ("05-measure-correct-bound", scene05, "deterministic mineral-black environment", "source-bound-explanatory"),
    ("06-return-scarce-atoms", scene06, "accepted plate-01 atmosphere + deterministic topology", "illustrative"),
    ("07-destroy-dont-relocate", scene07, "accepted plate-01 atmosphere + deterministic topology", "illustrative-proposed-pilot"),
    ("08-common-test-discipline", scene08, "accepted plate-01 atmosphere + deterministic topology", "illustrative"),
    ("09-supported-disposition", scene09, "deterministic mineral-black environment", "source-bound-explanatory"),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    outputs=[]
    for sid, maker, method, status in SCENES:
        path=OUT/f"{sid}.png"
        im=maker().convert("RGBA")
        im.save(path, format="PNG", optimize=False, compress_level=9)
        outputs.append({"sceneId":sid,"path":str(path.relative_to(ROOT)),"sha256":sha(path),"width":im.width,"height":im.height,"mode":im.mode,"visualMethod":method,"epistemicStatus":status})
    inputs=[]
    for rel in ["brief.md","treatment.md","production-contract.json","storyboard.yaml","assets/plates/plate-01-civic-hall.png","overlays/01-opposite-streams.svg","assets/composites/01-opposite-streams.png"]:
        p=ROOT/rel
        inputs.append({"path":rel,"sha256":sha(p)})
    vtt=ROOT.parents[3]/"public/videos/critical-minerals-pfas-and-the-remediation-imperative.vtt"
    inputs.append({"path":str(vtt),"sha256":sha(vtt)})
    report={
        "schemaVersion":1,"renderer":"scripts/render_scenes.py","deterministic":True,
        "resolution":[W,H],"outputFormat":"PNG RGBA","scenes":outputs,"inputs":inputs,
        "palette":C,"constraints":{
            "generatedText":False,"generatedMeasurements":False,"generatedTopology":False,
            "falPlateRole":"background atmosphere only","publicationEligible":False,
            "unsupportedStatesRemainVisible":True,"economicClaimsIntroduced":False
        }
    }
    REPORT.write_text(json.dumps(report,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print(f"rendered {len(outputs)} scenes at {W}x{H}")
    for o in outputs: print(f"{o['sceneId']}  {o['sha256']}")
    print(f"report  {REPORT}  {sha(REPORT)}")

if __name__ == "__main__":
    main()
