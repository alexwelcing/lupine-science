#!/usr/bin/env python3
"""Generate the Lupine article-video review training reel.

Creates eight deterministic 1920x1080 SVG/PNG frames, a contact sheet, and a
short H.264 reel. The examples are synthetic and contain no unsupported claims:
all numbers are explicitly labelled as training data.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REEL = ROOT / "reel"
PAPER = "#faf9f6"
INK = "#1a1a1a"
INDIGO = "#3d4db3"
AMBER = "#e8a838"
SAGE = "#5a8a6e"
SLATE = "#6b7c8e"
ROSE = "#c75b5b"


def esc(text: str) -> str:
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def text(x: int, y: int, value: str, size: int, *, family: str = "Newsreader", color: str = INK,
         weight: int = 400, anchor: str = "start", tracking: str = "0", opacity: float = 1.0) -> str:
    return (
        f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" '
        f'font-weight="{weight}" fill="{color}" text-anchor="{anchor}" '
        f'letter-spacing="{tracking}" opacity="{opacity}">{esc(value)}</text>'
    )


def base(content: str, *, bg: str = PAPER, extra_defs: str = "") -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
<defs>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="19"/><feColorMatrix values="0 0 0 0 0.24 0 0 0 0 0.30 0 0 0 0 0.70 0 0 0 .10 0"/></filter>
  <radialGradient id="wash"><stop offset="0" stop-color="{INDIGO}" stop-opacity=".22"/><stop offset="1" stop-color="{INDIGO}" stop-opacity="0"/></radialGradient>
  {extra_defs}
</defs>
<rect width="1920" height="1080" fill="{bg}"/>
<rect width="1920" height="1080" fill="url(#wash)" opacity=".58"/>
<rect width="1920" height="1080" filter="url(#grain)" opacity=".22"/>
{content}
</svg>'''


def chrome(frame: str, section: str) -> str:
    return "".join([
        text(120, 112, section.upper(), 36, family="IBM Plex Mono", color=INDIGO, weight=600, tracking="4"),
        f'<line x1="120" y1="142" x2="1800" y2="142" stroke="{INDIGO}" stroke-width="2"/>',
        text(1800, 112, frame, 36, family="IBM Plex Mono", color=SLATE, anchor="end"),
        f'<path d="M120 934v28h28 M1800 934v28h-28" fill="none" stroke="{INDIGO}" stroke-width="3"/>',
        text(120, 1012, "LUPINE SCIENCE · REVIEW CALIBRATION", 28, family="IBM Plex Mono", color=SLATE, tracking="2"),
    ])


def frame_01() -> str:
    c = chrome("01 / 08", "Claim + evidence")
    c += text(120, 305, "A claim is only as strong", 104)
    c += text(120, 414, "as its visible evidence.", 104, color=INDIGO)
    c += text(124, 506, "Training proposition · not a scientific result", 38, family="IBM Plex Mono", color=SLATE)
    c += f'<line x1="1160" y1="252" x2="1160" y2="790" stroke="{INDIGO}" stroke-width="4"/>'
    c += text(1250, 460, "84%", 168, family="IBM Plex Mono", color=INDIGO, weight=600)
    c += text(1254, 534, "OF REVIEW ATTENTION", 36, family="IBM Plex Mono", color=INK, weight=600, tracking="3")
    c += text(1254, 588, "should land on the", 48)
    c += text(1254, 644, "proof, not decoration.", 48)
    c += f'<rect x="1250" y="700" width="450" height="20" rx="10" fill="{SLATE}" opacity=".24"/>'
    c += f'<rect x="1250" y="700" width="378" height="20" rx="10" fill="{INDIGO}"/>'
    c += text(1250, 766, "SYNTHETIC TRAINING METRIC", 30, family="IBM Plex Mono", color=SLATE, tracking="2")
    return base(c)


def frame_02() -> str:
    c = chrome("02 / 08", "Data field")
    c += text(120, 245, "Motion should reveal the comparison.", 82)
    c += text(124, 310, "Synthetic values for reviewer calibration", 34, family="IBM Plex Mono", color=SLATE)
    labels = [("EVIDENCE", 72, INDIGO), ("CONTEXT", 49, SLATE), ("NOISE", 21, AMBER)]
    for i, (label, value, color) in enumerate(labels):
        y = 440 + i * 150
        c += text(120, y + 44, label, 36, family="IBM Plex Mono", color=INK, weight=600, tracking="3")
        c += f'<rect x="480" y="{y}" width="1080" height="64" rx="8" fill="{SLATE}" opacity=".14"/>'
        c += f'<rect x="480" y="{y}" width="{value * 12}" height="64" rx="8" fill="{color}"/>'
        c += text(1600, y + 49, f"{value}", 54, family="IBM Plex Mono", color=color, weight=600)
    c += f'<path d="M480 380v530 M480 910h1120" fill="none" stroke="{INDIGO}" stroke-width="3"/>'
    c += text(1520, 890, "DIRECT LABELS · NO LEGEND HUNT", 28, family="IBM Plex Mono", color=INDIGO, anchor="end", tracking="2")
    return base(c)


def frame_03() -> str:
    c = chrome("03 / 08", "Mechanism")
    c += text(120, 252, "Scattered signals resolve into structure.", 80)
    c += text(124, 314, "A mechanism frame must show cause, not science-themed decoration.", 36, family="IBM Plex Mono", color=SLATE)
    # Deterministic field of evidence points.
    pts = [(170,520),(280,450),(360,640),(480,520),(560,760),(680,430),(770,620),(850,500),(950,730),(1040,460),(1160,620),(1280,490),(1400,700),(1540,530),(1690,650)]
    for i, (x, y) in enumerate(pts):
        color = INDIGO if i % 3 else SAGE
        c += f'<circle cx="{x}" cy="{y}" r="{10 + (i % 3)*4}" fill="{color}" opacity=".72"/>'
        if i < len(pts)-1:
            x2,y2=pts[i+1]
            c += f'<line x1="{x}" y1="{y}" x2="{x2}" y2="{y2}" stroke="{SLATE}" stroke-width="2" opacity=".32"/>'
    c += f'<path d="M150 780 C430 330 720 850 1000 510 S1510 360 1770 690" fill="none" stroke="{INDIGO}" stroke-width="10"/>'
    c += f'<path d="M150 806 C430 356 720 876 1000 536 S1510 386 1770 716" fill="none" stroke="{INDIGO}" stroke-width="2" opacity=".45"/>'
    c += text(1270, 842, "RESOLVED MANIFOLD", 34, family="IBM Plex Mono", color=INDIGO, weight=600, tracking="3")
    return base(c)


def frame_04() -> str:
    # Intentionally sparse and slide-like.
    c = text(960, 250, "Key Findings", 68, family="Arial", anchor="middle", weight=700)
    c += f'<line x1="620" y1="285" x2="1300" y2="285" stroke="#999999" stroke-width="1"/>'
    for y, s in [(430,"• Finding number one"),(530,"• Finding number two"),(630,"• Finding number three")]:
        c += text(620, y, s, 42, family="Arial", color="#444444")
    c += text(960, 920, "Training deck", 22, family="Arial", color="#999999", anchor="middle")
    return base(c, bg="#ffffff", extra_defs='<radialGradient id="wash"><stop stop-color="#ffffff"/></radialGradient>')


def frame_05() -> str:
    # Intentionally overlapped, undersized, and unsafe.
    c = text(28, 54, "EVIDENCE SUMMARY", 26, family="IBM Plex Mono", color=INDIGO, weight=600)
    c += text(60, 300, "The result is clear", 118)
    c += text(530, 330, "but the layout is not.", 112, color=INDIGO)
    c += f'<rect x="470" y="220" width="920" height="220" fill="{AMBER}" opacity=".38"/>'
    c += text(490, 370, "OVERLAPPING CALLOUT", 44, family="IBM Plex Mono", color=INK, weight=600)
    for i in range(9):
        c += text(80, 520+i*42, "Dense explanatory copy at 28 px collides with the chart and cannot survive mobile playback.", 28, color=SLATE)
    c += f'<circle cx="1510" cy="670" r="260" fill="{INDIGO}" opacity=".88"/>'
    c += text(1510, 665, "42", 150, family="IBM Plex Mono", color=PAPER, anchor="middle", weight=600)
    c += text(1320, 1012, "critical label outside safe zone", 28, family="IBM Plex Mono", color=ROSE)
    return base(c)


def frame_06() -> str:
    # Intentionally off-brand: dark neon, generic network, wrong type.
    c = text(960, 180, "THE FUTURE OF AI SCIENCE", 72, family="Arial", color="#00ffff", anchor="middle", weight=700)
    c += text(960, 245, "UNLOCKING LIMITLESS INNOVATION", 28, family="Arial", color="#ff00ff", anchor="middle", tracking="6")
    pts = [(240,520),(500,360),(760,610),(980,410),(1240,650),(1530,400),(1730,620)]
    for i,(x,y) in enumerate(pts):
        for j,(x2,y2) in enumerate(pts):
            if j>i and (j-i)<=2:
                c += f'<line x1="{x}" y1="{y}" x2="{x2}" y2="{y2}" stroke="#00ffff" stroke-width="3" opacity=".35"/>'
        c += f'<circle cx="{x}" cy="{y}" r="38" fill="#12002e" stroke="#ff00ff" stroke-width="7"/>'
    c += text(960, 880, "Generic network ≠ mechanism", 46, family="Arial", color="#ffffff", anchor="middle")
    return base(c, bg="#050019", extra_defs='<radialGradient id="wash"><stop offset="0" stop-color="#8a00ff" stop-opacity=".8"/><stop offset="1" stop-color="#050019"/></radialGradient>')


def frame_07() -> str:
    # Edge case: polished and on-brand, but 30 px labels violate the 36 px floor.
    c = chrome("07 / 08", "Edge case · data")
    c += text(120, 250, "Beautiful is not the same as compliant.", 82)
    c += f'<rect x="120" y="350" width="1680" height="510" rx="10" fill="{PAPER}" stroke="{INDIGO}" stroke-width="3"/>'
    for i in range(6):
        x=220+i*260
        h=[180,260,220,350,300,410][i]
        c += f'<rect x="{x}" y="{790-h}" width="112" height="{h}" rx="6" fill="{INDIGO if i==5 else SLATE}" opacity="{1 if i==5 else .72}"/>'
        c += text(x+56, 828, f"S{i+1}", 30, family="IBM Plex Mono", color=INK, anchor="middle")
        c += text(x+56, 760-h, f"{[18,27,23,36,31,44][i]}", 30, family="IBM Plex Mono", color=INDIGO, anchor="middle", weight=600)
    c += text(1580, 430, "PEAK", 30, family="IBM Plex Mono", color=INDIGO, anchor="middle", weight=600, tracking="2")
    return base(c)


def frame_08() -> str:
    # Edge case: excellent static frame, but motion claims cannot be verified from one still.
    c = chrome("08 / 08", "Edge case · motion proof")
    c += text(120, 250, "The still passes. Does the motion?", 86)
    c += text(124, 318, "A single frame cannot prove entrance, causal reveal, or transition continuity.", 36, family="IBM Plex Mono", color=SLATE)
    c += f'<path d="M180 760 C420 720 540 510 760 580 S1080 800 1320 520 S1600 420 1770 360" fill="none" stroke="{SLATE}" stroke-width="4" opacity=".35"/>'
    c += f'<path d="M180 760 C420 720 540 510 760 580 S1080 800 1320 520" fill="none" stroke="{INDIGO}" stroke-width="12"/>'
    for x,y,label in [(180,760,"AXIS"),(760,580,"INFLECTION"),(1320,520,"CURRENT")]:
        c += f'<circle cx="{x}" cy="{y}" r="18" fill="{PAPER}" stroke="{INDIGO}" stroke-width="7"/>'
        c += text(x, y-46, label, 36, family="IBM Plex Mono", color=INDIGO, anchor="middle", weight=600)
    c += f'<rect x="1240" y="690" width="500" height="132" rx="10" fill="{INDIGO}"/>'
    c += text(1490, 750, "REQUEST TIMELINE", 36, family="IBM Plex Mono", color=PAPER, anchor="middle", weight=600, tracking="2")
    c += text(1490, 796, "EVIDENCE BEFORE PASS", 30, family="IBM Plex Mono", color=PAPER, anchor="middle")
    return base(c)


FRAMES = [frame_01, frame_02, frame_03, frame_04, frame_05, frame_06, frame_07, frame_08]
EXPECTED = [
    {"id":"frame-01","expected":"PASS","class":"positive","teaches":"claim/evidence hierarchy, brand, scale, density"},
    {"id":"frame-02","expected":"PASS","class":"positive","teaches":"direct-labelled data field and visible hierarchy"},
    {"id":"frame-03","expected":"PASS","class":"positive","teaches":"scientific mechanism rather than decorative science"},
    {"id":"frame-04","expected":"REJECT","class":"negative","teaches":"static slide, sparse frame, wrong fonts and palette"},
    {"id":"frame-05","expected":"REJECT","class":"negative","teaches":"overlap, unreadable 28 px copy, unsafe placement"},
    {"id":"frame-06","expected":"REJECT","class":"negative","teaches":"off-brand dark neon and generic AI imagery"},
    {"id":"frame-07","expected":"REJECT","class":"edge","teaches":"polish does not override the 36 px label floor"},
    {"id":"frame-08","expected":"HOLD","class":"edge","teaches":"a still cannot prove motion; request timeline evidence"},
]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def main() -> None:
    REEL.mkdir(parents=True, exist_ok=True)
    pngs: list[Path] = []
    for index, factory in enumerate(FRAMES, 1):
        stem = f"frame-{index:02d}"
        svg = REEL / f"{stem}.svg"
        png = REEL / f"{stem}.png"
        svg.write_text(factory(), encoding="utf-8")
        run(["inkscape", str(svg), "--export-type=png", f"--export-filename={png}", "--export-width=1920", "--export-height=1080"])
        pngs.append(png)
    (REEL / "expected-decisions.json").write_text(json.dumps(EXPECTED, indent=2) + "\n", encoding="utf-8")
    run(["montage", *map(str, pngs), "-thumbnail", "640x360", "-tile", "2x4", "-geometry", "+18+18", "-background", PAPER, str(REEL / "contact-sheet.png")])
    concat = REEL / "reel.ffconcat"
    lines = ["ffconcat version 1.0"]
    for png in pngs:
        lines += [f"file '{png}'", "duration 2.5"]
    lines += [f"file '{pngs[-1]}'"]
    concat.write_text("\n".join(lines) + "\n", encoding="utf-8")
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(concat),
         "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", "-movflags", "+faststart", str(REEL / "training-reel.mp4")])
    print(f"Generated {len(pngs)} frames in {REEL}")


if __name__ == "__main__":
    main()
