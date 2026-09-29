#!/usr/bin/env python3
"""Render deterministic semantic states from the reviewed final composites.

Pending causal regions are explicitly occluded, then revealed in authored order. The
final state is byte-identical in pixels to the reviewed composite. These states let
the assembler animate evidence rather than move a camera over a static slide.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
COMPOSITES = ROOT / "assets" / "composites"
OUT = ROOT / "assets" / "motion-states"
REPORT = ROOT / "reports" / "motion-state-report.json"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
C = {"field": "#101513", "evidence": "#F2EFE6", "warning": "#D36B61", "muted": "#87908A", "black": "#090C0B"}

# Three semantic reveal groups per scene. Coordinates preserve header/footer.
# Group order is the causal order asserted by storyboard.motion_purpose.
REGIONS = {
    "01-opposite-streams": [
        [(70, 190, 690, 945)],
        [(690, 190, 1230, 945)],
        [(1230, 190, 1850, 945)],
    ],
    "02-selective-cartridges": [
        [(90, 230, 650, 925)],
        [(650, 230, 1240, 925)],
        [(1240, 230, 1835, 925)],
    ],
    "03-bind-release-break": [
        [(85, 225, 635, 925)],
        [(675, 225, 1240, 925)],
        [(1280, 225, 1840, 925)],
    ],
    "04-softened-landscape": [
        [(90, 225, 1260, 925)],
        [(560, 315, 750, 815)],
        [(1290, 225, 1840, 925)],
    ],
    "05-measure-correct-bound": [
        [(95, 225, 655, 925)],
        [(665, 225, 1235, 925)],
        [(1235, 225, 1825, 925)],
    ],
    "06-return-scarce-atoms": [
        [(80, 215, 625, 925)],
        [(625, 215, 1250, 925)],
        [(1250, 215, 1840, 925)],
    ],
    "07-destroy-dont-relocate": [
        [(70, 210, 560, 935)],
        [(540, 210, 1470, 935)],
        [(1470, 210, 1850, 935)],
    ],
    "08-common-test-discipline": [
        [(75, 215, 810, 930)],
        [(500, 260, 1425, 480)],
        [(1010, 470, 1845, 930)],
    ],
    "09-supported-disposition": [
        [(95, 225, 950, 890)],
        [(950, 225, 1825, 890)],
        [(210, 775, 1710, 855)],
    ],
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def mask_pending(image: Image.Image, regions: list[list[tuple[int, int, int, int]]], reveal_count: int) -> Image.Image:
    out = image.copy().convert("RGBA")
    draw = ImageDraw.Draw(out, "RGBA")
    font = ImageFont.truetype(FONT, 18)
    for group_index, boxes in enumerate(regions):
        if group_index < reveal_count:
            continue
        for box in boxes:
            x0, y0, x1, y1 = box
            draw.rounded_rectangle(box, radius=18, fill=(16, 21, 19, 246), outline=(135, 144, 138, 210), width=2)
            label = f"STEP {group_index + 1} WITHHELD"
            bbox = draw.textbbox((0, 0), label, font=font)
            width = bbox[2] - bbox[0]
            draw.rounded_rectangle((x0 + 18, y0 + 18, x0 + 54 + width, y0 + 58), radius=9, fill=(9, 12, 11, 240), outline=(201, 119, 69, 220), width=2)
            draw.text((x0 + 36, y0 + 38), label, font=font, fill="#F2EFE6", anchor="lm")
    return out


def scene04_state(image: Image.Image, state_index: int) -> Image.Image:
    """Author reference → softened raw landscape → rank inversion as distinct states."""
    if state_index == 3:
        return image.copy()
    out = image.copy().convert("RGBA")
    draw = ImageDraw.Draw(out, "RGBA")
    regular = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 17)
    bold = ImageFont.truetype(FONT, 17)
    # Rebuild the chart panel so state 1 contains reference only and state 2 adds raw failure.
    draw.rounded_rectangle((95, 240, 1250, 900), radius=25, fill=C["black"], outline=C["evidence"], width=3)
    draw.text((145, 292), "ENERGY LANDSCAPE · SCHEMATIC", font=ImageFont.truetype(FONT, 20), fill=C["evidence"], anchor="lm")
    draw.line((180, 790, 1160, 790), fill=C["evidence"], width=4)
    draw.line((180, 790, 180, 365), fill=C["evidence"], width=4)
    draw.text((670, 840), "reaction coordinate", font=regular, fill=C["evidence"], anchor="mm")
    draw.text((128, 575), "energy", font=regular, fill=C["evidence"], anchor="mm")
    reference = [(210, 740), (350, 715), (500, 520), (650, 390), (800, 540), (960, 700), (1120, 735)]
    raw = [(210, 740), (350, 720), (500, 625), (650, 555), (800, 635), (960, 710), (1120, 735)]
    draw.line(reference, fill=C["evidence"], width=9, joint="curve")
    draw.text((985, 645), "REFERENCE", font=bold, fill=C["evidence"], anchor="lm")
    if state_index >= 2:
        draw.rounded_rectangle((565, 330, 735, 805), radius=18, fill=(211, 107, 97, 28), outline=C["warning"], width=3)
        draw.text((650, 315), "UNDER-COORDINATED SITE", font=ImageFont.truetype(FONT, 15), fill=C["warning"], anchor="mm")
        draw.line(raw, fill=C["warning"], width=9, joint="curve")
        draw.text((985, 690), "RAW FAST MODEL", font=bold, fill=C["warning"], anchor="lm")
    else:
        draw.rounded_rectangle((820, 655, 1160, 720), radius=10, fill=C["field"], outline=C["warning"], width=2)
        draw.text((990, 687), "RAW CURVE WITHHELD", font=bold, fill=C["evidence"], anchor="mm")
    # Candidate ordering remains explicitly withheld until the final state.
    draw.rounded_rectangle((1310, 240, 1825, 900), radius=25, fill=(16, 21, 19, 246), outline=C["muted"], width=2)
    draw.rounded_rectangle((1330, 260, 1585, 310), radius=9, fill=C["black"], outline=C["warning"], width=2)
    draw.text((1457, 285), "RANKING WITHHELD", font=bold, fill=C["evidence"], anchor="mm")
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    for scene_id, groups in REGIONS.items():
        source = COMPOSITES / f"{scene_id}.png"
        if not source.is_file():
            raise SystemExit(f"BLOCKER: missing final composite: {source}")
        image = Image.open(source).convert("RGBA")
        if image.size != (1920, 1080):
            raise SystemExit(f"BLOCKER: wrong composite dimensions: {scene_id}")
        states = []
        # State 1 reveals first relationship; state 2 reveals first two; state 3 is exact final.
        for state_index in (1, 2, 3):
            path = OUT / f"{scene_id}-state-{state_index}.png"
            if scene_id == "04-softened-landscape":
                state = scene04_state(image, state_index)
            else:
                state = image if state_index == 3 else mask_pending(image, groups, state_index)
            state.save(path, format="PNG", optimize=False, compress_level=9)
            states.append({
                "state": state_index,
                "path": str(path.relative_to(ROOT)),
                "sha256": digest(path),
                "width": state.width,
                "height": state.height,
                "revealedRelationshipGroups": state_index,
                "finalCompositePixelIdentity": state_index == 3 and ImageChops.difference(state, image).getbbox() is None,
            })
        records.append({
            "sceneId": scene_id,
            "sourceComposite": str(source.relative_to(ROOT)),
            "sourceCompositeSha256": digest(source),
            "stateCount": 3,
            "semanticProgression": "authored-region-reveal",
            "states": states,
        })
    report = {
        "schemaVersion": 1,
        "renderer": "scripts/render_motion_states.py",
        "deterministic": True,
        "font": FONT,
        "fontSha256": digest(Path(FONT)),
        "scenes": records,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"decision": "pass", "scenes": len(records), "states": sum(len(r["states"]) for r in records)}, indent=2))


if __name__ == "__main__":
    main()
