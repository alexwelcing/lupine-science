#!/usr/bin/env python3
"""Generate and quality-check WebVTT captions for article videos.

Input JSON may be either a list of cues or an object with a ``cues`` key. Each
cue requires ``start`` and ``end`` (seconds or WebVTT timestamps) and ``text``.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

TIMESTAMP = re.compile(r"^(?:(\d{2,}):)?([0-5]\d):([0-5]\d)\.(\d{3})$")
CUE_TIMING = re.compile(r"^(\S+)\s+-->\s+(\S+)(?:\s+.*)?$")
WORD = re.compile(r"[A-Za-z][A-Za-z'’-]*")


def seconds(value: object) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    match = TIMESTAMP.match(str(value))
    if not match:
        raise ValueError(f"invalid timestamp: {value!r}")
    hours, minutes, secs, millis = match.groups()
    return int(hours or 0) * 3600 + int(minutes) * 60 + int(secs) + int(millis) / 1000


def timestamp(value: float) -> str:
    millis = round(value * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def load_cues(path: Path) -> list[dict[str, object]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    cues = data.get("cues") if isinstance(data, dict) else data
    if not isinstance(cues, list):
        raise ValueError("input must be a cue list or an object containing a cues list")
    return cues


def generate(source: Path, output: Path) -> None:
    cues = load_cues(source)
    lines = ["WEBVTT", ""]
    previous_end = 0.0
    for index, cue in enumerate(cues, 1):
        if not isinstance(cue, dict) or not {"start", "end", "text"} <= cue.keys():
            raise ValueError(f"cue {index} requires start, end, and text")
        start, end = seconds(cue["start"]), seconds(cue["end"])
        text = str(cue["text"]).strip()
        if start < previous_end or end <= start or not text:
            raise ValueError(f"cue {index} overlaps, has non-positive duration, or is empty")
        lines.extend((str(cue.get("id", index)), f"{timestamp(start)} --> {timestamp(end)}", text, ""))
        previous_end = end
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")


def parse_vtt(path: Path) -> list[dict[str, object]]:
    raw = path.read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    if not raw.startswith("WEBVTT"):
        raise ValueError("missing WEBVTT header")
    cues: list[dict[str, object]] = []
    blocks = re.split(r"\n\s*\n", raw)[1:]
    for block in blocks:
        lines = block.splitlines()
        timing_index = next((i for i, line in enumerate(lines) if "-->" in line), None)
        if timing_index is None:
            continue
        match = CUE_TIMING.match(lines[timing_index])
        if not match:
            raise ValueError(f"invalid cue timing: {lines[timing_index]}")
        text = " ".join(lines[timing_index + 1 :]).strip()
        cues.append({"start": seconds(match.group(1)), "end": seconds(match.group(2)), "text": text})
    if not cues:
        raise ValueError("no cues found")
    return cues


def media_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
        check=True, capture_output=True, text=True,
    )
    return float(result.stdout.strip())


def spellcheck(cues: list[dict[str, object]], allow: set[str]) -> list[str]:
    if not shutil.which("aspell"):
        raise RuntimeError("aspell is required for spell-checking (install: sudo apt install aspell-en)")
    text = html.unescape(" ".join(str(cue["text"]) for cue in cues))
    words = "\n".join(WORD.findall(re.sub(r"<[^>]+>", " ", text))) + "\n"
    result = subprocess.run(["aspell", "--lang=en_US", "list"], input=words, capture_output=True, text=True, check=True)
    return sorted({word for word in result.stdout.splitlines() if word.casefold() not in allow}, key=str.casefold)


def check(vtt: Path, video: Path, allow_file: Path | None, edge_tolerance: float) -> int:
    cues = parse_vtt(vtt)
    duration = media_duration(video)
    errors: list[str] = []
    previous_end = 0.0
    for index, cue in enumerate(cues, 1):
        start, end, text = seconds(cue["start"]), seconds(cue["end"]), str(cue["text"])
        if start < previous_end:
            errors.append(f"cue {index}: overlap ({start:.3f}s < {previous_end:.3f}s)")
        if end <= start:
            errors.append(f"cue {index}: non-positive duration")
        if end > duration + edge_tolerance:
            errors.append(f"cue {index}: ends at {end:.3f}s after video duration {duration:.3f}s")
        if len(re.sub(r"<[^>]+>", "", text)) > 84:
            errors.append(f"cue {index}: text exceeds 84 characters")
        previous_end = end
    allow = {line.strip().casefold() for line in (allow_file.read_text(encoding="utf-8").splitlines() if allow_file else []) if line.strip() and not line.startswith("#")}
    misspellings = spellcheck(cues, allow)
    if misspellings:
        errors.append("possible misspellings: " + ", ".join(misspellings))
    gap = duration - seconds(cues[-1]["end"])
    print(f"video={duration:.3f}s cues={len(cues)} first={seconds(cues[0]['start']):.3f}s last={seconds(cues[-1]['end']):.3f}s trailing_gap={gap:.3f}s")
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    if errors:
        return 1
    print("PASS: VTT structure, spelling, monotonic timing, and MP4 bounds")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    make = sub.add_parser("generate", help="generate VTT from timestamped JSON cues")
    make.add_argument("source", type=Path)
    make.add_argument("output", type=Path)
    verify = sub.add_parser("check", help="spell-check and verify VTT against an MP4")
    verify.add_argument("vtt", type=Path)
    verify.add_argument("video", type=Path)
    verify.add_argument("--allow", type=Path, help="newline-separated project vocabulary")
    verify.add_argument("--edge-tolerance", type=float, default=0.10)
    args = parser.parse_args()
    try:
        if args.command == "generate":
            generate(args.source, args.output)
            print(f"wrote {args.output}")
            return 0
        return check(args.vtt, args.video, args.allow, args.edge_tolerance)
    except (ValueError, OSError, subprocess.CalledProcessError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
