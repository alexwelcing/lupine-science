#!/usr/bin/env python3
"""Render the five approved campaign storyboards as deterministic MP4s.

Generated source imagery is never modified with text. Editorial titles, captions,
asset IDs, status bounds, and disclosures are drawn here as deterministic
composition layers before the final video encode.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
from collections.abc import Sequence
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
STORYBOARDS = ROOT / "media/brand-campaign-2026-07-27/campaign-video-storyboards.json"
OUTPUT_DIR = ROOT / "public/videos/campaign-2026-07-27"
WIDTH, HEIGHT, FPS = 960, 540, 30
PAPER = "#faf9f6"
INK = "#16171d"
INDIGO = "#3d4db3"
OCHRE = "#8a5e1f"
MUTED = "#55575f"

SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
MONO_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

COMPOSITION_TEXT = {
    "01-z1-campaign-story": [
        ("Four models.\nOne evidence bill.", "Four guidance traces share one union of DFT anchors.", "Bounded result: one panel · one Li-migration chemistry family · one engine"),
        ("Duplicated\nevaluations.", "Four execution lanes make repeated work legible.", "Recorded same-engine campaign"),
        ("Shared\nanchors.", "72.4% fewer DFT evaluations.", "Reviewed public result · bounded panel"),
        ("The receipt.", "$14.65 per 129 anchors\nZero evaluation failures\nSame-engine strong-win gate met by all four", "One functional · seven large paths deferred"),
        ("The split is\nthe result.", "Two models meet the true extrema.\nTwo miss saddles on some paths: 6.8 meV deficit.", "CAUTION · short-path sparsity is not stress-tested"),
        ("Models guide.\nDFT measures.", "Proof keeps the score.", "FOR EDITOR REVIEW · one chemistry family · one engine"),
    ],
    "02-savings-stack": [
        ("The expensive part\nis the call.", "One evaluation pulse crosses the evidence field.", "Seven families reduce different kinds of work"),
        ("Seven layers.\nDifferent savings.", "Surrogate search · active learning · multi-fidelity\nabstention · faster DFT · electronic surrogates\npath and sampling algorithms", "The layers are not independent multipliers"),
        ("Signals are not\ncertificates.", "The gaps align into one shared evidence void.", "Hashable research release · not peer review"),
        ("Reuse the\nevidence.", "72.4% fewer DFT evaluations\non 29 analyzable Z1 paths", "Reviewed public result · no substitute economics"),
        ("Keep the limits.", "Shared anchors feed independent test bays.", "One panel · four models · one engine · one chemistry family"),
    ],
    "03-trust-layer": [
        ("Believable enough\nto try?", "Many candidates approach a load-bearing evidence bridge.", "Prediction is not synthesis"),
        ("Belief is the\nbottleneck.", "Generation and simulation widen. Physical validation stays narrow.", "Primary investment article is Draft"),
        ("A referee, not a\nconfidence score.", "CORRECT where licensed\nANCHOR where reference calculation is required\nABSTAIN where evidence is absent", "CAUTION · unsupported cases stop"),
        ("Trust becomes\nload-bearing.", "External verification · characterized shortlists\nformal methods binding claims to records", "No uncontracted partners are named"),
        ("Checked once.\nBuilt on with limits.", "Evidence · proofs · benchmark data · decisions", "A theorem proves its statement against inputs, not experimental truth"),
    ],
    "04-order-of-effort": [
        ("Do the easiest\nhonest work first.", "A measured seven-rung ladder rises toward unresolved states.", "Tiers describe evidence and strategy, not readiness"),
        ("Seven tiers.\nSeven responses.", "Statics · elastic response · surfaces · defects\nbarriers · interfaces · magnetic and excited states", "Correct · bound · anchor · sparse DFT · on-policy · abstain"),
        ("No family acts\noutside its domain.", "Nested evidence boundaries become a theorem rail.", "Machine-checked limits prevent unsupported correction"),
        ("Work where the\nlicense is live.", "Tier 1: easy-first runtime correction\nTier 5: model-guided sparse DFT", "CAUTION · other tiers remain bounded, on-policy, or abstention work"),
        ("Measured trust.\nPriced accuracy.", "Near-term corrections balance frontier measurements.", "No universal correction law · no universal savings guarantee"),
    ],
    "05-materials-in-society": [
        ("A material must\nsurvive the world.", "Storage · air capture · ammonia · solar\nappear before atomic detail.", "Plausible pathways · not program-produced deployments"),
        ("Barriers decide\nwhat to test next.", "A solid-state electrolyte route enters a practical test bay.", "Computed references · not device outcomes"),
        ("Capacity is not\nenough.", "Humidity stability and makeability still decide usefulness.", "Direct-air-capture pathway remains contingent"),
        ("Activity is not\nenough.", "Catalysts must be active, selective, stable, and verified.", "Proposed ammonia pathway · no deployment claim"),
        ("Safer chemistry\nstill has to survive.", "Efficiency · stability · scale-up must hold together.", "Lead-free absorber target · not an achieved outcome"),
        ("Not a prediction.\nA credible next experiment.", "Correction · proof boundary · partner synthesis\ndevice validation · scale-up", "DRAFT PORTFOLIO · all outcomes remain contingent"),
    ],
}


@lru_cache(maxsize=None)
def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def wrap(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        current = ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if draw.textbbox((0, 0), candidate, font=face)[2] <= width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines


def ease(value: float) -> float:
    value = min(1.0, max(0.0, value))
    return value * value * (3.0 - 2.0 * value)


def reveal(progress: float, start: float, end: float) -> float:
    if end <= start:
        return float(progress >= end)
    return ease((progress - start) / (end - start))


def lerp(start: float, end: float, amount: float) -> float:
    return start + (end - start) * amount


def panel_line(draw: ImageDraw.ImageDraw, points: Sequence[tuple[float, float]], amount: float, *, fill: str = INDIGO, width: int = 4) -> None:
    if amount <= 0 or len(points) < 2:
        return
    lengths = [math.dist(a, b) for a, b in zip(points, points[1:])]
    remaining = sum(lengths) * min(1.0, amount)
    visible = [points[0]]
    for first, second, length in zip(points, points[1:], lengths):
        if remaining >= length:
            visible.append(second)
            remaining -= length
            continue
        if remaining > 0:
            ratio = remaining / length
            visible.append((lerp(first[0], second[0], ratio), lerp(first[1], second[1], ratio)))
        break
    if len(visible) > 1:
        draw.line(visible, fill=fill, width=width, joint="curve")


def draw_motion_panel(draw: ImageDraw.ImageDraw, film_id: str, shot_no: int, progress: float) -> None:
    """Draw a deterministic, text-free storyboard mechanism for one shot."""
    left, top, right, bottom = 520, 120, 920, 450
    draw.rectangle((left, top, right, bottom), fill=PAPER)
    draw.line((left + 20, bottom - 20, right - 20, bottom - 20), fill="#d9d8d3", width=2)
    p = ease(progress)

    if film_id == "01-z1-campaign-story":
        if shot_no == 1:  # Four traces converge at shared anchors.
            anchors = [(670, 205), (770, 285), (860, 225)]
            starts = [(535, 150), (535, 225), (535, 315), (535, 395)]
            for index, start in enumerate(starts):
                route = [start, (610, start[1]), anchors[index % 3], (900, anchors[index % 3][1])]
                panel_line(draw, route, reveal(progress, index * .08, .72 + index * .04), width=3)
            for index, (x, y) in enumerate(anchors):
                if progress > .28 + index * .12:
                    draw.ellipse((x - 8, y - 8, x + 8, y + 8), fill=PAPER, outline=INK, width=3)
        elif shot_no == 2:  # Duplicated dot lanes assemble before the union.
            for lane in range(4):
                y = 165 + lane * 62
                draw.line((550, y, 885, y), fill="#d9d8d3", width=2)
                for column in range(9):
                    if progress > .04 * (column + lane):
                        x = 560 + column * 38
                        draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=INDIGO)
            panel_line(draw, [(550, 418), (885, 418)], reveal(progress, .55, .9), width=7)
        elif shot_no == 3:  # Four lanes fold into one evidence spine.
            target_y = 285
            for lane in range(4):
                source_y = 155 + lane * 82
                amount = reveal(progress, .08 * lane, .8)
                panel_line(draw, [(545, source_y), (670, source_y), (760, target_y), (900, target_y)], amount, width=4)
            fade = int(210 + 45 * p)
            draw.rectangle((550, 345, int(550 + 320 * p), 375), fill=(fade, fade, fade))
        elif shot_no == 4:  # Receipt rules draw and ledger cells type on.
            for row in range(4):
                y = 165 + row * 62
                amount = reveal(progress, row * .12, .52 + row * .1)
                panel_line(draw, [(550, y), (890, y)], amount, fill=INK, width=2)
                if amount > .75:
                    draw.rectangle((565, y - 22, 620 + row * 34, y - 8), fill=INDIGO)
                    draw.rectangle((805, y - 22, 875, y - 8), outline=INDIGO, width=3)
        elif shot_no == 5:  # Matched gauges, two visibly under-covered.
            for index in range(4):
                x = 585 + index * 92
                height = 205 if index < 2 else 145
                draw.rectangle((x, 390 - height, x + 35, 390), outline=INK, width=2)
                fill_height = int(height * reveal(progress, index * .08, .72))
                draw.rectangle((x + 5, 385 - fill_height, x + 30, 385), fill=INDIGO)
                if index >= 2:
                    draw.line((x - 5, 215, x + 40, 215), fill=OCHRE, width=4)
        else:  # Close route deliberately stops halfway.
            panel_line(draw, [(550, 360), (650, 360), (710, 255), (790, 255)], reveal(progress, 0, .7), width=5)
            draw.ellipse((640, 350, 660, 370), fill=PAPER, outline=INK, width=3)
            draw.line((790, 255, 900, 180), fill="#d9d8d3", width=3)

    elif film_id == "02-savings-stack":
        if shot_no == 1:  # One evaluation pulse crosses infrastructure.
            draw.line((550, 285, 890, 285), fill=INK, width=2)
            for x in range(575, 890, 55):
                draw.line((x, 240, x, 330), fill="#d9d8d3", width=2)
            x = int(555 + 325 * p)
            draw.ellipse((x - 12, 273, x + 12, 297), fill=INDIGO)
        elif shot_no == 2:  # Seven plates lock to a spine.
            draw.line((720, 145, 720, 420), fill=INK, width=3)
            for index in range(7):
                y = 155 + index * 40
                from_left = index % 2 == 0
                final_x = 595 if from_left else 735
                start_x = 470 if from_left else 950
                amount = reveal(progress, index * .08, .45 + index * .07)
                x = int(lerp(start_x, final_x, amount))
                draw.rounded_rectangle((x, y, x + 110, y + 25), radius=5, fill=PAPER, outline=INDIGO, width=3)
        elif shot_no == 3:  # Shared evidence void expands.
            for index in range(7):
                y = 155 + index * 39
                gap = int(15 + 65 * p)
                draw.rectangle((550, y, 720 - gap, y + 22), fill=INDIGO)
                draw.rectangle((720 + gap, y, 890, y + 22), outline=INK, width=2)
            draw.rectangle((710 - int(20 * p), 145, 730 + int(20 * p), 425), outline=OCHRE, width=2)
        elif shot_no == 4:  # Four routes merge only at anchor stations.
            stations = [(660, 210), (760, 300), (840, 235)]
            for index, y in enumerate((165, 235, 315, 385)):
                panel_line(draw, [(545, y), stations[index % 3], (900, stations[index % 3][1])], reveal(progress, index * .08, .75), width=3)
            for x, y in stations:
                draw.ellipse((x - 8, y - 8, x + 8, y + 8), fill=PAPER, outline=INK, width=3)
        else:  # Evidence cartridges feed independent bays.
            for index in range(4):
                y = 170 + index * 62
                amount = reveal(progress, index * .1, .72)
                x = int(620 + 180 * amount)
                draw.rounded_rectangle((x, y, x + 62, y + 30), radius=5, fill=INDIGO)
                draw.rectangle((820, y - 8, 895, y + 40), outline=INK, width=2)
            draw.line((570, 145, 570, 420), fill=INK, width=5)

    elif film_id == "03-trust-layer":
        if shot_no == 1:  # Candidates approach a precise bridge.
            draw.line((650, 300, 900, 300), fill=INK, width=5)
            draw.line((690, 300, 730, 220), fill=INK, width=3)
            draw.line((850, 300, 810, 220), fill=INK, width=3)
            for index in range(8):
                x = int(535 + (100 + index * 13) * p)
                y = 155 + (index * 37) % 220
                draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=INDIGO)
        elif shot_no == 2:  # Generation lanes widen; validation stays narrow.
            for index in range(4):
                y = 170 + index * 60
                width = int((100 + index * 42) * p)
                draw.polygon([(550, y), (550 + width, y - 12), (550 + width, y + 12)], fill=INDIGO)
            panel_line(draw, [(790, 285), (895, 285)], p, fill=INK, width=8)
        elif shot_no == 3:  # CORRECT / ANCHOR / ABSTAIN geometry.
            for index in range(3):
                y = 180 + index * 100
                amount = reveal(progress, index * .12, .72)
                stop = 850 if index < 2 else 735
                panel_line(draw, [(550, y), (660, y), (720, y - 25), (stop, y - 25)], amount, width=4)
                draw.rectangle((690, y - 50, 750, y + 20), outline=INK, width=3)
                if index == 2:
                    draw.rectangle((750, y - 33, 760, y - 17), fill=OCHRE)
        elif shot_no == 4:  # Instrument bays lock after gates pass.
            for index in range(3):
                y = 170 + index * 95
                amount = reveal(progress, index * .12, .78)
                panel_line(draw, [(550, y), (690, y), (760, y + 20)], amount, width=4)
                draw.rounded_rectangle((760, y - 30, 885, y + 48), radius=8, outline=INK, width=3)
                if amount > .8:
                    draw.ellipse((810, y - 2, 832, y + 20), fill=INDIGO)
        else:  # Inspectable return loop.
            box = (575, 160, 875, 400)
            draw.rounded_rectangle(box, radius=45, outline="#d9d8d3", width=3)
            amount = reveal(progress, 0, .88)
            steps = 80
            points = []
            for index in range(int(steps * amount) + 1):
                angle = 2 * math.pi * index / steps
                points.append((725 + 145 * math.cos(angle), 280 + 110 * math.sin(angle)))
            if len(points) > 1:
                draw.line(points, fill=INDIGO, width=5)
            draw.line((550, 420, 900, 420), fill=INK, width=3)

    elif film_id == "04-order-of-effort":
        if shot_no in (1, 2):  # Seven-rung ladder assembles in order.
            draw.line((585, 415, 860, 150), fill=INK, width=5)
            draw.line((640, 420, 915, 155), fill=INK, width=5)
            for index in range(7):
                amount = reveal(progress, index * .1, .32 + index * .1)
                x = 610 + index * 42
                y = 390 - index * 40
                if amount > 0:
                    draw.line((x, y, x + 55 * amount, y - 5), fill=INDIGO if index < 5 else INK, width=6)
                    if shot_no == 2 and amount > .75:
                        draw.ellipse((x + 18, y - 17, x + 34, y - 1), outline=INK, width=2)
        elif shot_no == 3:  # Nested domains become a theorem rail.
            center = (720, 285)
            for index in range(4):
                radius = int((45 + index * 38) * reveal(progress, index * .08, .72))
                if radius > 2:
                    draw.ellipse((center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius), outline=INDIGO if index < 3 else INK, width=3)
            panel_line(draw, [(550, 420), (890, 420)], reveal(progress, .35, .85), fill=INK, width=6)
        elif shot_no == 4:  # Two active bays; widening uncertainty; stop.
            for index in range(7):
                x = 545 + index * 50
                height = 80 + index * 25
                color = INDIGO if index in (0, 4) else "#d9d8d3"
                draw.rectangle((x, 405 - height, x + 34, 405), fill=color)
            stop_x = int(790 + 75 * p)
            draw.rectangle((stop_x, 150, stop_x + 8, 405), fill=OCHRE)
        else:  # Balanced near-term correction / frontier measurement.
            draw.line((590, 260, 860, 260), fill=INK, width=7)
            pivot_y = int(260 + 18 * math.sin((1 - p) * math.pi * 2))
            draw.polygon([(710, 420), (740, pivot_y), (770, 420)], outline=INK, fill=PAPER)
            draw.rectangle((570, 170, 675, 250), outline=INDIGO, width=4)
            draw.rectangle((780, 170, 885, 250), outline=INK, width=4)

    else:  # 05-materials-in-society
        if shot_no == 1:  # Infrastructure precedes atomic detail.
            for index, (x, y) in enumerate(((570, 190), (720, 165), (830, 225), (650, 340))):
                amount = reveal(progress, index * .1, .55 + index * .08)
                size = int(35 * amount)
                draw.rectangle((x - size, y - size, x + size, y + size), outline=INK, width=3)
            panel_line(draw, [(565, 390), (650, 340), (720, 165), (830, 225)], reveal(progress, .35, .9), width=4)
        elif shot_no == 2:  # Restrained barrier route enters a test bay.
            panel_line(draw, [(550, 350), (650, 350), (720, 190), (790, 350), (885, 350)], p, width=5)
            draw.rectangle((800, 260, 900, 405), outline=INK, width=3)
            x = int(555 + 320 * p)
            y = int(350 - 150 * math.sin(math.pi * p))
            draw.ellipse((x - 8, y - 8, x + 8, y + 8), fill=INDIGO)
        elif shot_no == 3:  # Sparse airflow through contactor to cartridge.
            draw.rectangle((690, 165, 795, 400), outline=INK, width=4)
            for index in range(6):
                y = 190 + index * 35
                start = 545 - index * 20
                x = int(start + 300 * ((p + index * .1) % 1.0))
                draw.line((x, y, x + 35, y), fill=INDIGO, width=3)
            draw.rectangle((820, 255, 895, 330), outline=INK, width=3)
        elif shot_no == 4:  # Reactor zones assemble into a pilot handoff.
            for index in range(4):
                amount = reveal(progress, index * .12, .55 + index * .1)
                x = 560 + index * 72
                top_y = int(390 - 170 * amount)
                draw.rounded_rectangle((x, top_y, x + 55, 390), radius=8, outline=INDIGO if index < 3 else INK, width=3)
            panel_line(draw, [(820, 305), (895, 305)], reveal(progress, .55, .9), width=4)
        elif shot_no == 5:  # Module remains partly inside durability chamber.
            draw.rectangle((650, 155, 875, 405), outline=INK, width=4)
            x = int(550 + 175 * p)
            draw.rectangle((x, 215, x + 135, 350), fill=PAPER, outline=INDIGO, width=5)
            draw.line((680, 180, 840, 380), fill="#d9d8d3", width=3)
        else:  # Five evidence streams; only next experiment activates.
            stages = [565, 635, 705, 775, 845]
            for index, x in enumerate(stages):
                amount = reveal(progress, index * .1, .5 + index * .08)
                draw.rectangle((x, 220, x + 42, 350), outline=INK, width=3)
                if amount > .75 and index == 0:
                    draw.rectangle((x + 6, 226, x + 36, 344), fill=INDIGO)
                if index < 4:
                    panel_line(draw, [(x + 42, 285), (stages[index + 1], 285)], amount, width=3)
            draw.line((845, 370, 905, 420), fill="#d9d8d3", width=3)


def make_card(film: dict, shot: dict, text: tuple[str, str, str], progress: float) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(canvas)
    shot_no = shot["shot"]

    # Paper gutter, deterministic editorial frame, and QA-safe mechanism panel.
    draw.rectangle((0, 0, WIDTH, 84), fill=PAPER)
    draw.rectangle((0, 474, WIDTH, HEIGHT), fill=PAPER)
    draw.line((42, 70, 918, 70), fill=INDIGO, width=1)
    draw.rectangle((42, 91, 126, 97), fill=OCHRE if shot["role"] in {"caveat", "non-competition rule"} else INDIGO)
    draw.rectangle((504, 105, 936, 467), outline=INK, width=1)
    draw_motion_panel(draw, film["id"], shot_no, progress)

    draw.text((42, 26), "LUPINE SCIENCE / CAMPAIGN 2026", font=font(MONO_BOLD, 12), fill=INDIGO)
    draw.text((42, 49), f"{film['required_film'].upper()} / {shot['role'].upper()}", font=font(MONO, 10), fill=MUTED)
    draw.text((860, 27), f"{shot_no:02d}/{len(film['shots']):02d}", font=font(MONO_BOLD, 12), fill=INK)

    title, body, footer = text
    title_face = font(SERIF_BOLD, 35)
    body_face = font(SERIF, 17)
    y = 118
    for line in wrap(draw, title, title_face, 425):
        draw.text((42, y), line, font=title_face, fill=INK)
        y += 43
    y += 10
    for line in wrap(draw, body, body_face, 420):
        draw.text((42, y), line, font=body_face, fill=MUTED)
        y += 25

    footer_color = OCHRE if footer.startswith(("CAUTION", "DRAFT", "FOR EDITOR")) else MUTED
    footer_face = font(MONO, 10)
    footer_lines = wrap(draw, footer, footer_face, 820)
    fy = 490
    for line in footer_lines[:2]:
        draw.text((42, fy), line, font=footer_face, fill=footer_color)
        fy += 15
    draw.text((690, 490), "QA RETRY / PROCEDURAL MOTION", font=font(MONO, 9), fill=MUTED)
    draw.text((690, 507), "TEXT + ART: DETERMINISTIC", font=font(MONO, 9), fill=MUTED)
    return canvas


def render_film(film: dict, qa_attempt: int | None = None) -> dict:
    duration = int(film["duration_seconds"])
    total_frames = duration * FPS
    transition_frames = 12
    original_name = film["output_spec"]["suggested_filename"]
    if qa_attempt is None:
        output_name = original_name
    else:
        output_name = f"{Path(original_name).stem}-qa-attempt-{qa_attempt}.mp4"
    output = OUTPUT_DIR / output_name
    if output.exists():
        raise FileExistsError(f"Refusing a second render attempt over existing evidence: {output}")
    audio = (
        f"aevalsrc=0.020*sin(2*PI*110*t)+0.012*sin(2*PI*165*t):"
        f"s=48000:d={duration}"
    )
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", f"{WIDTH}x{HEIGHT}",
        "-framerate", str(FPS), "-i", "-",
        "-f", "lavfi", "-i", audio,
        "-filter_complex", "[0:v]scale=1920:1080:flags=lanczos,format=yuv420p[v];[1:a]loudnorm=I=-18:TP=-2:LRA=7[a]",
        "-map", "[v]", "-map", "[a]", "-t", str(duration),
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "1",
        "-movflags", "+faststart", str(output),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    boundaries = [round(duration_from_tc(shot["timecode"])[1] * FPS) for shot in film["shots"]]
    starts = [0] + boundaries[:-1]
    for frame_no in range(total_frames):
        shot_index = max(i for i, start in enumerate(starts) if frame_no >= start)
        shot_start = starts[shot_index]
        end = boundaries[shot_index]
        shot_progress = (frame_no - shot_start) / max(1, end - shot_start - 1)
        frame = make_card(
            film,
            film["shots"][shot_index],
            COMPOSITION_TEXT[film["id"]][shot_index],
            shot_progress,
        )
        if shot_index + 1 < len(film["shots"]) and end - transition_frames <= frame_no < end:
            alpha = (frame_no - (end - transition_frames)) / transition_frames
            next_frame = make_card(
                film,
                film["shots"][shot_index + 1],
                COMPOSITION_TEXT[film["id"]][shot_index + 1],
                0.0,
            )
            frame = Image.blend(frame, next_frame, alpha)
        progress = int((frame_no + 1) / total_frames * (WIDTH - 84))
        frame_draw = ImageDraw.Draw(frame)
        frame_draw.rectangle((42, 532, 42 + progress, 536), fill=INDIGO)
        process.stdin.write(frame.tobytes())
    process.stdin.close()
    code = process.wait()
    if code:
        raise RuntimeError(f"ffmpeg failed for {film['id']} with exit code {code}")
    return {"film_id": film["id"], "output": str(output.relative_to(ROOT)), "duration_seconds": duration}


def duration_from_tc(timecode: str) -> tuple[float, float]:
    start, end = timecode.split("-")
    def seconds(value: str) -> float:
        minutes, sec = value.split(":")
        return int(minutes) * 60 + float(sec)
    return seconds(start), seconds(end)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--qa-attempt",
        type=int,
        help="Write immutable *-qa-attempt-N.mp4 evidence; refuse overwrite.",
    )
    parser.add_argument(
        "--film-id",
        action="append",
        help="Render only this film id (repeatable); defaults to all five.",
    )
    args = parser.parse_args()
    if args.qa_attempt is not None and args.qa_attempt < 1:
        parser.error("--qa-attempt must be a positive integer")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(STORYBOARDS.read_text())
    if manifest["film_count"] != 5:
        raise ValueError("Storyboard manifest must contain exactly five films")
    selected_ids = set(args.film_id or [])
    films = [film for film in manifest["films"] if not selected_ids or film["id"] in selected_ids]
    missing_ids = selected_ids.difference(film["id"] for film in films)
    if missing_ids:
        parser.error(f"unknown --film-id: {', '.join(sorted(missing_ids))}")
    results = [render_film(film, qa_attempt=args.qa_attempt) for film in films]
    storyboard_sha = hashlib.sha256(STORYBOARDS.read_bytes()).hexdigest()
    print(json.dumps({"storyboard_sha256": storyboard_sha, "renders": results}, indent=2))


if __name__ == "__main__":
    main()
