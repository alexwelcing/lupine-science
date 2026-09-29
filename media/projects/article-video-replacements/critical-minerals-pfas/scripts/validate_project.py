#!/usr/bin/env python3
"""Fail-closed integrity validator for the private PFAS replacement project.

A passing integrity scope never means owner or deployment approval. Unreviewed claims
may remain only when their gaps are publicly and machine-verifiably disclosed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[3]
SLUG = "critical-minerals-pfas-and-the-remediation-imperative"
PROHIBITED_PATTERNS = [
    r"190\s+build-locked\s+Lean\s+4\s+theorems",
    r"\$14\.65\s+per\s+129\s+anchors",
    r"\$4\.65\s+per\s+129\s+anchors",
    r"72\.4%\s+fewer\s+DFT\s+evaluations",
]


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"BLOCKER: {message}")


def run(args: list[str]) -> str:
    result = subprocess.run(args, cwd=REPO, text=True, capture_output=True)
    require(result.returncode == 0, f"command failed: {' '.join(args)}\n{result.stderr[-2000:]}")
    return result.stdout


def check_text(path: Path) -> None:
    text = path.read_text(errors="replace")
    for pattern in PROHIBITED_PATTERNS:
        require(re.search(pattern, text, re.I) is None, f"prohibited audience claim present in {path}: {pattern}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", choices=("prebuild", "candidate"), default="prebuild")
    args = parser.parse_args()

    contract = json.loads((ROOT / "production-contract.json").read_text())
    manifest = json.loads((ROOT / "generation-manifest.json").read_text())
    plate_control = json.loads((ROOT / "plate-control.json").read_text())
    storyboard = yaml.safe_load((ROOT / "storyboard.yaml").read_text())
    claim_map = json.loads((ROOT / "claim-evidence-map.json").read_text())
    scene_report = json.loads((ROOT / "reports/scene-render-report.json").read_text())
    motion_report = json.loads((ROOT / "reports/motion-state-report.json").read_text())

    require(contract["publication"]["eligible"] is False, "private contract became publication eligible")
    require(claim_map["publicationEligible"] is True, "gap-labeled claim map is not publication eligible")
    require(claim_map["articleStatus"] == "published-with-labeled-evidence-gaps", "article disclosure status drift")
    require(len(claim_map["claims"]) == 5, "quantitative claim inventory drift")
    require(all(c["status"] == "source-cited-needs-independent-evidence-review" for c in claim_map["claims"]), "claim status was promoted without review")
    article_text = (REPO / f"articles/{SLUG}.md").read_text()
    require("> **Date:** 2026-07-16" in article_text, "original publication date changed")
    require("> **Updated:** 2026-08-12" in article_text, "update date missing or changed")
    require("> **Status:** Published" in article_text, "published editorial status missing")
    require("> **Evidence Status:**" in article_text, "first-class evidence status missing")
    for phrase in claim_map["publicDisclosure"]["requiredPhrases"]:
        require(phrase in article_text, f"required public gap disclosure missing: {phrase}")
    require(contract["method"] == "fal-first-with-deterministic-evidence-overlays", "production method drift")
    require(len(storyboard["scenes"]) == 9, "scene inventory is not exactly nine")

    cues: list[int] = []
    previous_end = 0.0
    for scene in storyboard["scenes"]:
        require(abs(float(scene["time_start"]) - previous_end) < 1e-9, f"timing gap before {scene['id']}")
        previous_end = float(scene["time_end"])
        require(1 <= len(scene["visible_relationships"]) <= 3, f"relationship count invalid for {scene['id']}")
        cues.extend(scene["caption_cues"])
    require(abs(previous_end - float(storyboard["target_duration_seconds"])) < 1e-9, "terminal duration mismatch")
    require(cues == list(range(1, 28)), "caption cues must be exactly 1..27")

    vtt = REPO / f"public/videos/{SLUG}.vtt"
    narration = REPO / f"data/narration-scripts/{SLUG}.json"
    require(len(re.findall(r"(?m)^\d+\n\d\d:", vtt.read_text())) == 27, "VTT cue count changed")
    for key, source in contract["sources"].items():
        path = REPO / source["path"]
        require(path.is_file(), f"missing source {key}")
        require(digest(path) == source["sha256"], f"source hash drift: {key}")

    for path in (vtt, narration, ROOT / "storyboard.yaml", ROOT / "treatment.md", ROOT / "claim-evidence-map.json"):
        check_text(path)

    rejected = manifest["rejectedShots"]
    require(len(rejected) == 3 and all(s["status"].startswith("rejected-") for s in rejected), "rejected pilot state drift")
    for shot in rejected:
        path = ROOT / shot["output"]
        require(path.is_file() and digest(path) == shot["sha256"], f"rejected pilot hash drift: {shot['id']}")

    controls = {plate["id"]: plate for plate in plate_control["plates"]}
    for plate in manifest["atmospherePlates"]:
        path = ROOT / plate["output"]
        require(path.is_file() and digest(path) == plate["sha256"], f"atmosphere plate drift: {plate['id']}")
        with Image.open(path) as image:
            require(image.size == tuple(plate["dimensions"]), f"plate dimensions drift: {plate['id']}")
        require(plate["id"] in controls and controls[plate["id"]]["sha256"] == plate["sha256"], f"plate control mismatch: {plate['id']}")
        if plate["status"] == "conditional-mandatory-occlusion":
            require(bool(controls[plate["id"]]["mandatoryOcclusionRectsAt1024x576"]), f"conditional plate lacks masks: {plate['id']}")
    require(plate_control["sanitizationAttempt"]["outputsEligible"] is False, "failed sanitization became eligible")

    scene_by_id = {row["sceneId"]: row for row in scene_report["scenes"]}
    require(set(scene_by_id) == {s["id"] for s in storyboard["scenes"] if s["id"] != "01-opposite-streams"}, "scene report inventory drift")
    composite_hashes: dict[str, str] = {}
    for scene in storyboard["scenes"]:
        path = ROOT / f"assets/composites/{scene['id']}.png"
        require(path.is_file(), f"missing composite: {scene['id']}")
        with Image.open(path) as image:
            require(image.size == (1920, 1080), f"composite dimensions drift: {scene['id']}")
        composite_hashes[scene["id"]] = digest(path)
        if scene["id"] in scene_by_id:
            require(scene_by_id[scene["id"]]["sha256"] == digest(path), f"scene report hash mismatch: {scene['id']}")

    motion_by_id = {row["sceneId"]: row for row in motion_report["scenes"]}
    require(set(motion_by_id) == set(composite_hashes), "motion-state scene inventory drift")
    for scene_id, row in motion_by_id.items():
        require(row["sourceCompositeSha256"] == composite_hashes[scene_id], f"motion source hash mismatch: {scene_id}")
        require(row["stateCount"] == 3 and len(row["states"]) == 3, f"motion state count drift: {scene_id}")
        for state in row["states"]:
            path = ROOT / state["path"]
            require(path.is_file() and digest(path) == state["sha256"], f"motion state hash drift: {scene_id}/{state['state']}")
            with Image.open(path) as image:
                require(image.size == (1920, 1080), f"motion dimensions drift: {scene_id}/{state['state']}")
        require(row["states"][-1]["finalCompositePixelIdentity"] is True, f"final state is not reviewed composite: {scene_id}")

    output = {
        "decision": "pass-project-publication-integrity",
        "scope": args.scope,
        "publicationEligible": True,
        "scenes": 9,
        "compositesValidated": 9,
        "motionStatesValidated": 27,
        "captionCues": 27,
        "unreviewedQuantitativeClaims": len(claim_map["claims"]),
        "retainedEvidenceGaps": claim_map["retainedGaps"],
        "releaseBlockers": claim_map["releaseBlockers"],
    }

    if args.scope == "candidate":
        report_path = ROOT / "build/candidate-build-report.json"
        require(report_path.is_file(), "candidate build report missing")
        report = json.loads(report_path.read_text())
        require(report["publicationEligible"] is False, "candidate report became publication eligible")
        candidate = ROOT / report["candidate"]
        require(candidate.is_file() and digest(candidate) == report["sha256"], "candidate hash mismatch")
        require(report["decodedVideoFrames"] == report["totalFramesRequested"] == 4431, "candidate frame inventory drift")
        require(report["audioPacketIdentity"] is True, "source audio identity failed")
        require(report["sourceAudioStreamSha256"] == report["candidateAudioStreamSha256"], "audio stream hash mismatch")
        require("zoompan" not in (ROOT / "scripts/build_candidate.py").read_text(), "static-slide zoompan method returned")
        require(report["motionMethod"].startswith("three authored semantic states"), "candidate motion method drift")
        run(["ffmpeg", "-v", "error", "-i", str(candidate), "-map", "0:v:0", "-f", "null", "-"])
        metadata = run(["ffprobe", "-v", "error", "-count_frames", "-show_entries", "stream=codec_type,width,height,pix_fmt,nb_read_frames,sample_rate,channels", "-of", "json", str(candidate)])
        streams = json.loads(metadata)["streams"]
        video = next(stream for stream in streams if stream["codec_type"] == "video")
        audio = next(stream for stream in streams if stream["codec_type"] == "audio")
        require((video["width"], video["height"], video["pix_fmt"], int(video["nb_read_frames"])) == (1920, 1080, "yuv420p", 4431), "candidate video probe failed")
        require((audio["sample_rate"], audio["channels"]) == ("44100", 1), "candidate audio probe failed")
        output["candidateSha256"] = report["sha256"]
        output["candidateDecode"] = "pass"

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
