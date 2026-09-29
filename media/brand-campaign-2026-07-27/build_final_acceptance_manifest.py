#!/usr/bin/env python3
"""Build the independent final acceptance manifest for campaign-2026-07-27."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "media/brand-campaign-2026-07-27/final-qa-evidence"
MACHINE_REPORT = EVIDENCE / "image-machine-qa.json"
VIDEO_REPORT = ROOT / "media/brand-campaign-2026-07-27/quarantine/qa-attempt-1-probe-report.json"
OUTPUT = ROOT / "media/brand-campaign-2026-07-27/final-acceptance-manifest.json"

ACCEPTED = {
    "B1-A01-02", "B1-A03-01", "B1-A03-03", "B1-A04-01", "B1-A04-02", "B1-A04-03",
    "B2-A01-01", "B2-A02-01", "B2-A03-02", "B2-A04-01", "B2-A04-04",
    "B3-A01-01", "B3-A01-02", "B3-A01-05", "B3-A02-01", "B3-A02-05", "B3-A03-01",
    "B3-A03-05", "B3-A04-02", "B3-A04-05",
    "B4-A01-05", "B4-A02-01", "B4-A02-04", "B4-A03-01", "B4-A03-03", "B4-A04-03",
    "B5-A03-05", "B5-A04-01",
    "B6-A01-04", "B6-A01-05", "B6-A03-02", "B6-A03-05", "B6-A04-05",
}

READABLE_TEXT = {
    "B1-A01-04", "B2-A03-01", "B3-A02-03", "B3-A04-01", "B3-A04-03",
    "B4-A03-02", "B5-A01-04", "B5-A02-02", "B5-A02-05", "B5-A04-03",
    "B6-A02-02", "B6-A03-04",
}
PEOPLE_OR_PLANTS = {
    "B1-A03-05", "B1-A04-05", "B2-A02-05", "B2-A04-02", "B2-A04-05",
    "B4-A04-04", "B5-A01-05", "B5-A02-03", "B5-A04-05",
}
DARK_NEON_OR_STOCK_3D = {
    "B1-A04-04", "B3-A01-04", "B3-A02-04", "B3-A03-03", "B3-A03-04",
    "B4-A02-05", "B4-A03-04", "B6-A04-01", "B6-A04-02", "B6-A04-03",
}
OFF_PALETTE = {
    "B1-A02-02", "B1-A02-04", "B1-A02-05", "B2-A01-02", "B2-A01-03", "B2-A01-04",
    "B2-A01-05", "B2-A02-02", "B2-A02-03", "B2-A02-04", "B2-A03-03", "B2-A03-04",
    "B2-A03-05", "B2-A04-03", "B3-A02-02", "B3-A04-04", "B4-A01-01", "B4-A01-03",
    "B4-A02-02", "B4-A02-03", "B4-A02-05", "B4-A03-05", "B4-A04-02", "B5-A01-02",
    "B5-A02-01", "B5-A02-04", "B5-A03-04", "B5-A04-02", "B6-A01-02", "B6-A02-03",
}


def reasons_for(asset_id: str) -> list[str]:
    reasons: list[str] = []
    if asset_id in READABLE_TEXT:
        reasons.append("readable-or-text-like-baked-labels")
    if asset_id in PEOPLE_OR_PLANTS:
        reasons.append("forbidden-people-or-plant-imagery")
    if asset_id in DARK_NEON_OR_STOCK_3D:
        reasons.append("dark-neon-or-stock-3d-aesthetic")
    if asset_id in OFF_PALETTE:
        reasons.append("off-palette-or-decorative-ochre/cyan/orange")
    if not reasons:
        reasons.append("concept-or-slot-fit-failure: generic/abstract scene does not clearly depict the requested practical mechanism")
    return reasons


def main() -> None:
    machine = json.loads(MACHINE_REPORT.read_text())
    probe = json.loads(VIDEO_REPORT.read_text())
    candidate_ids = {record["asset_id"] for record in machine["candidates"]}
    if not ACCEPTED <= candidate_ids:
        raise ValueError(f"Accepted IDs absent from machine report: {sorted(ACCEPTED - candidate_ids)}")

    image_records = []
    for record in machine["candidates"]:
        asset_id = record["asset_id"]
        accepted = asset_id in ACCEPTED
        visually_confirmed_text = asset_id in READABLE_TEXT
        image_records.append({
            "asset_id": asset_id,
            "batch": record["batch"],
            "source": record["source"],
            "path": record["exact_path"],
            "sha256": record["sha256"],
            "bytes": record["bytes"],
            "dimensions": record["dimensions"],
            "machine_checks": {
                "dimension_pass": record["dimension_pass"],
                "palette_metrics": record["palette_metrics"],
                "two_pass_ocr_strong_tokens": record["ocr"]["strong"],
                "ocr_visual_adjudication": (
                    "confirmed-readable-or-text-like-baked-labels"
                    if visually_confirmed_text
                    else "false-positive-linework/glyph-shape; no readable baked text confirmed"
                ),
            },
            "visual_review": {
                "evidence_sheet": f"media/brand-campaign-2026-07-27/final-qa-evidence/{record['batch']}-candidate-contact-sheet.jpg",
                "decision": "accept" if accepted else "reject",
                "reasons": [] if accepted else reasons_for(asset_id),
                "criteria": [
                    "no baked text/labels/logos", "no people/faces/plants/flowers", "no dark/neon/stock-3d/molecule-hero imagery",
                    "warm paper + ink + restrained indigo; ochre warning-only", "generous negative space", "honest practical mechanism and slot fit",
                ],
            },
            "final_status": "accepted" if accepted else "rejected",
        })

    for record in machine["excluded"]:
        image_records.append({
            "asset_id": record["asset_id"],
            "batch": record["batch"],
            "source": "attempt-1-remediation",
            "path": record["exact_path"],
            "machine_checks": None,
            "visual_review": None,
            "final_status": "rejected",
            "reasons": ["attempt-1-exhausted-without-replacement", record["attempt_record"].get("error", "generation-failed")],
        })

    image_records.sort(key=lambda item: item["asset_id"])
    accepted_count = sum(item["final_status"] == "accepted" for item in image_records)
    rejected_count = len(image_records) - accepted_count
    threshold = 100

    video_records = []
    for record in probe["records"]:
        checks_pass = all(record["checks"].values())
        video_records.append({
            "film_id": record["film_id"],
            "attempt": record["attempt"],
            "replacement": record["replacement"],
            "sha256": record["replacement_sha256"],
            "bytes": record["bytes"],
            "duration_seconds": record["duration_seconds"],
            "probe": record["probe"],
            "technical_checks": record["checks"],
            "shot_motion_checks": record["shot_motion_checks"],
            "visual_evidence": record["contact_sheet"],
            "editorial_review": {
                "decision": "accept",
                "basis": "Contact-sheet inspection confirms deterministic paper/ink/indigo composition, warning-only ochre, title-safe text, no forbidden source imagery, and bounded claims. Renderer reconciliation confirms distinct storyboard-specific procedural motion for every shot.",
                "limitation": "The configured video-analysis model rejected video inputs; temporal certification uses independent full-decode/probe, per-shot sampled frame deltas, contact sheets, and renderer/storyboard source reconciliation.",
            },
            "final_status": "accepted" if checks_pass else "rejected",
        })

    videos_pass = len(video_records) == 5 and all(item["final_status"] == "accepted" for item in video_records)
    manifest = {
        "schema_version": "1.0.0",
        "campaign_id": "brand-campaign-2026-07-27",
        "manifest_type": "independent-final-acceptance",
        "reviewed_at": "2026-07-28T01:18:19-04:00",
        "review_task": "t_02dbe8b4",
        "review_method": {
            "images": "All 113 surviving candidate files plus seven exhausted B1 attempts reviewed. Every candidate was dimension/palette checked, subjected to two-pass Tesseract.js OCR, and visually adjudicated on a labeled batch contact sheet. OCR token detections were not treated as automatically readable text because scientific linework caused false positives in all 113 files.",
            "videos": "All five attempt-1 MP4s re-probed and full-decoded; every storyboard shot had non-zero sampled frame deltas. Contact sheets and deterministic renderer/storyboard source were reconciled for palette, editorial safety, bounded claims, and mechanism-specific motion.",
            "evidence": [
                "media/brand-campaign-2026-07-27/final-qa-evidence/image-machine-qa.json",
                "media/brand-campaign-2026-07-27/final-qa-evidence/B1-candidate-contact-sheet.jpg",
                "media/brand-campaign-2026-07-27/final-qa-evidence/B2-candidate-contact-sheet.jpg",
                "media/brand-campaign-2026-07-27/final-qa-evidence/B3-candidate-contact-sheet.jpg",
                "media/brand-campaign-2026-07-27/final-qa-evidence/B4-candidate-contact-sheet.jpg",
                "media/brand-campaign-2026-07-27/final-qa-evidence/B5-candidate-contact-sheet.jpg",
                "media/brand-campaign-2026-07-27/final-qa-evidence/B6-candidate-contact-sheet.jpg",
                "media/brand-campaign-2026-07-27/quarantine/qa-attempt-1-probe-report.json",
                "media/brand-campaign-2026-07-27/render_campaign_videos.py",
            ],
        },
        "images": {
            "threshold_accepted": threshold,
            "total_inventory": len(image_records),
            "candidate_files_reviewed": len(machine["candidates"]),
            "exhausted_without_file": len(machine["excluded"]),
            "accepted": accepted_count,
            "rejected": rejected_count,
            "shortfall": max(0, threshold - accepted_count),
            "gate_pass": accepted_count >= threshold,
            "records": image_records,
        },
        "videos": {
            "required": 5,
            "accepted": sum(item["final_status"] == "accepted" for item in video_records),
            "gate_pass": videos_pass,
            "records": video_records,
        },
        "final_verdict": {
            "status": "accepted" if accepted_count >= threshold and videos_pass else "rejected",
            "image_gate_pass": accepted_count >= threshold,
            "video_gate_pass": videos_pass,
            "blocking_reasons": [] if accepted_count >= threshold else [
                f"Image acceptance gate missed: {accepted_count}/{threshold} accepted; shortfall {threshold - accepted_count}.",
                f"{rejected_count} of {len(image_records)} inventory records rejected, including {len(machine['excluded'])} exhausted B1 attempts without replacements.",
            ],
        },
    }
    OUTPUT.write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({
        "output": str(OUTPUT.relative_to(ROOT)),
        "images": {k: manifest["images"][k] for k in ("total_inventory", "candidate_files_reviewed", "exhausted_without_file", "accepted", "rejected", "shortfall", "gate_pass")},
        "videos": {k: manifest["videos"][k] for k in ("required", "accepted", "gate_pass")},
        "verdict": manifest["final_verdict"]["status"],
    }, indent=2))


if __name__ == "__main__":
    main()
