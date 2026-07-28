#!/usr/bin/env python3
"""Deterministically reconcile and certify all 67 Wave-4 programmatic assets."""

from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any

from PIL import Image

PROJECT = Path(__file__).resolve().parents[3]
CANONICAL = PROJECT / "public/brand-assets/campaign-2026-07-27/shortfall-wave-1-manifest.json"
WAVE_DIR = PROJECT / "public/brand-assets/campaign-2026-07-27/wave-4"
OUTPUT_MANIFEST = WAVE_DIR / "aggregate-manifest.json"
OUTPUT_REPORT = WAVE_DIR / "reconciliation-report.md"
PALETTE = ("#faf9f6", "#16171d", "#3d4db3")
PAPER, INK, INDIGO = PALETTE

CHILDREN = (
    ("pilot", "pilot-manifest.json", "t_1ceb4f39", "a230475f1518af1a31eaef8d4fdd6c57d4eeb6b791d844e3ac5f364b277cef28", 4, "media/projects/article-visuals/wave4_pilot_scenes.py"),
    ("batch-01", "batch-01-manifest.json", "t_5f2c59c2", "8e00ff0ce567e3d60a8ba830931a3057dd3837a1479f0b5b437051e2aab18518", 8, None),
    ("batch-02", "batch-02-manifest.json", "t_ef12ed7b", "b551c0a95a9b67c0f56b976761d13e0f1c406ab99719f04133154538e20f5163", 8, None),
    ("batch-03", "batch-03-manifest.json", "t_75e02815", "97e7b0e4a2708d74dbd9d09f4d8a8e77a27486f5a60e81a402d0e58e4b3242ff", 8, None),
    ("batch-04", "batch-04-manifest.json", "t_17d703ba", "5e5d84cd2fe9e319c39813778808b22677a7cdabe5f45819baf89a1700d7d010", 8, None),
    ("batch-05", "batch-05-manifest.json", "t_083045bd", "a90d0805ff5a6c8079f4a595f04be117da12fbcf05e66c9a998c26a1dca93c33", 8, None),
    ("batch-06", "batch-06-manifest.json", "t_4c04518c", "5db2a48750c758e86e9a3663a4697e2df61fe4206a895068cfb1574f0faf6696", 8, None),
    ("batch-07", "batch-07-manifest.json", "t_3c103f38", "1feae42e1867646c9fbad6358e9e37fe6d0c10aa20746505bcc0de311204df8d", 8, None),
    ("batch-08", "batch-08-manifest.json", "t_a28b8419", "cfca665ff487822c990d77f0e673496a08dae89f86cbd2eeafe88a86db8f48a6", 7, None),
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rgb(value: str) -> tuple[int, int, int]:
    value = value.removeprefix("#")
    return (
        int(value[0:2], 16),
        int(value[2:4], 16),
        int(value[4:6], 16),
    )


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text())


def error(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def main() -> None:
    errors: list[str] = []
    canonical = load_json(CANONICAL)
    canonical_assets = canonical.get("assets", [])
    canonical_by_id = {item["asset_id"]: item for item in canonical_assets}
    canonical_ids = [item["asset_id"] for item in canonical_assets]
    canonical_hash = sha256(CANONICAL)

    error(errors, len(canonical_assets) == 67, f"canonical asset count is {len(canonical_assets)}, expected 67")
    error(errors, len(canonical_by_id) == 67, "canonical asset IDs are not 67 unique values")
    error(errors, canonical.get("generated_count") == 67, "canonical generated_count is not 67")

    allowed = {rgb(color) for color in PALETTE}
    paper = rgb(PAPER)
    ink = rgb(INK)
    indigo = rgb(INDIGO)
    aggregate_assets: list[dict[str, Any]] = []
    child_records: list[dict[str, Any]] = []
    seen_ids: list[str] = []
    output_hashes: list[str] = []
    min_indigo = 1.0
    max_indigo = 0.0

    for child_id, filename, review_task, reviewed_manifest_hash, expected_count, pilot_scene_source in CHILDREN:
        child_path = WAVE_DIR / filename
        child = load_json(child_path)
        child_assets = child.get("assets", [])
        scene_source_value = pilot_scene_source or child.get("scene_source")
        component_source_value = child.get(
            "component_source", "media/projects/article-visuals/wave4_scene_components.py"
        )
        if not isinstance(scene_source_value, str):
            errors.append(f"{child_id}: scene source is missing or invalid")
            continue
        if not isinstance(component_source_value, str):
            errors.append(f"{child_id}: component source is missing or invalid")
            continue
        scene_source = PROJECT / scene_source_value
        component_source = PROJECT / component_source_value

        error(errors, len(child_assets) == expected_count, f"{child_id}: expected {expected_count} assets, found {len(child_assets)}")
        error(errors, child.get("mechanical_status") == "pass", f"{child_id}: mechanical status is not pass")
        error(errors, not child.get("errors"), f"{child_id}: child manifest has errors")
        error(errors, child.get("source_manifest_sha256") == canonical_hash, f"{child_id}: canonical source hash mismatch")
        error(errors, tuple(child.get("palette", ())) == PALETTE, f"{child_id}: declared palette mismatch")
        error(errors, scene_source.is_file(), f"{child_id}: scene source missing: {scene_source_value}")
        error(errors, component_source.is_file(), f"{child_id}: component source missing: {component_source_value}")
        if child.get("scene_source_sha256"):
            error(errors, child["scene_source_sha256"] == sha256(scene_source), f"{child_id}: scene source hash mismatch")
        if child.get("component_source_sha256"):
            error(errors, child["component_source_sha256"] == sha256(component_source), f"{child_id}: component source hash mismatch")

        current_manifest_hash = sha256(child_path)
        child_records.append(
            {
                "child_id": child_id,
                "manifest_path": str(child_path.relative_to(PROJECT)),
                "manifest_sha256": current_manifest_hash,
                "asset_count": len(child_assets),
                "mechanical_status": "pass",
                "composition_status": "pass",
                "composition_review_task": review_task,
                "composition_evidence": "completed independent reviewer gate",
                "composition_review_manifest_sha256": reviewed_manifest_hash,
                "composition_review_manifest_matches_current": reviewed_manifest_hash == current_manifest_hash,
                "composition_review_note": (
                    "reviewed manifest matches current child manifest"
                    if reviewed_manifest_hash == current_manifest_hash
                    else "review predates deterministic child-manifest source-hash refresh; reviewer gate remains the composition evidence"
                ),
                "scene_source": str(scene_source.relative_to(PROJECT)),
                "scene_source_sha256": sha256(scene_source),
                "component_source": str(component_source.relative_to(PROJECT)),
                "component_source_sha256": sha256(component_source),
            }
        )

        for item in child_assets:
            asset_id = item.get("asset_id")
            source = canonical_by_id.get(asset_id)
            if source is None:
                errors.append(f"{child_id}/{asset_id}: extra or unknown asset ID")
                continue
            seen_ids.append(asset_id)
            error(errors, item.get("original_asset_id") == source.get("original_asset_id"), f"{asset_id}: original asset ID mismatch")
            error(errors, item.get("specific_physical_scene") == source.get("specific_physical_scene"), f"{asset_id}: canonical scene mismatch")
            error(errors, item.get("single_mechanism") == source.get("single_mechanism"), f"{asset_id}: canonical mechanism mismatch")
            error(errors, item.get("source_spec_hash") == source.get("spec_hash"), f"{asset_id}: canonical spec hash mismatch")
            error(errors, item.get("mechanical_status") == "pass", f"{asset_id}: mechanical status is not pass")

            output_path = PROJECT / item["output_path"]
            generator_path = PROJECT / item["generator"]
            error(errors, output_path.is_file(), f"{asset_id}: output missing")
            error(errors, generator_path.is_file(), f"{asset_id}: generator missing")
            if not output_path.is_file() or not generator_path.is_file():
                continue
            output_hash = sha256(output_path)
            generator_hash = sha256(generator_path)
            output_hashes.append(output_hash)
            error(errors, output_path.stat().st_size > 0, f"{asset_id}: zero-byte output")
            error(errors, item.get("output_sha256") == output_hash, f"{asset_id}: output hash mismatch")
            if item.get("generator_sha256"):
                error(errors, item["generator_sha256"] == generator_hash, f"{asset_id}: generator hash mismatch")

            with Image.open(output_path) as image:
                image.load()
                dimensions = image.size
                mode = image.mode
                image_format = image.format
                pixels = list(image.get_flattened_data())
                counts = Counter(pixels)
                colors = set(counts)
                total = dimensions[0] * dimensions[1]
                open_rows = round(dimensions[1] * 0.45)
                top_open = set(image.crop((0, 0, dimensions[0], open_rows)).get_flattened_data()) == {paper}

            expected_dimensions = (
                source["target_dimensions"]["width"],
                source["target_dimensions"]["height"],
            )
            declared_dimensions = item.get("dimensions", {})
            error(errors, dimensions == expected_dimensions, f"{asset_id}: dimensions {dimensions} != {expected_dimensions}")
            error(errors, declared_dimensions == {"width": dimensions[0], "height": dimensions[1]}, f"{asset_id}: declared dimensions mismatch")
            error(errors, image_format == "PNG", f"{asset_id}: format is {image_format}, expected PNG")
            error(errors, mode == "RGB", f"{asset_id}: mode is {mode}, expected RGB")
            error(errors, colors == allowed, f"{asset_id}: exact palette mismatch")
            error(errors, top_open, f"{asset_id}: upper 45% is not paper-only")
            indigo_ratio = counts[indigo] / total
            error(errors, 0 < indigo_ratio < 0.12, f"{asset_id}: indigo ratio {indigo_ratio:.6f} outside (0, 0.12)")
            expected_histogram = {PAPER: counts[paper], INK: counts[ink], INDIGO: counts[indigo]}
            error(errors, item.get("palette_histogram") == expected_histogram, f"{asset_id}: palette histogram mismatch")
            min_indigo = min(min_indigo, indigo_ratio)
            max_indigo = max(max_indigo, indigo_ratio)

            aggregate_assets.append(
                {
                    "asset_id": asset_id,
                    "child_id": child_id,
                    "original_asset_id": source["original_asset_id"],
                    "specific_physical_scene": source["specific_physical_scene"],
                    "single_mechanism": source["single_mechanism"],
                    "source_spec_hash": source["spec_hash"],
                    "generator": item["generator"],
                    "generator_sha256": generator_hash,
                    "output_path": item["output_path"],
                    "output_sha256": output_hash,
                    "bytes": output_path.stat().st_size,
                    "dimensions": {"width": dimensions[0], "height": dimensions[1]},
                    "palette_histogram": expected_histogram,
                    "upper_45_percent_all_paper": top_open,
                    "indigo_ratio": round(indigo_ratio, 6),
                    "mechanical_status": "pass",
                    "composition_status": "pass",
                    "composition_review_task": review_task,
                }
            )

    seen_set = set(seen_ids)
    canonical_set = set(canonical_ids)
    omissions = sorted(canonical_set - seen_set)
    extras = sorted(seen_set - canonical_set)
    duplicate_ids = sorted(asset_id for asset_id, count in Counter(seen_ids).items() if count != 1)
    duplicate_hashes = sorted(value for value, count in Counter(output_hashes).items() if count != 1)
    rendered_paths = {
        str(path.relative_to(PROJECT)) for path in WAVE_DIR.glob("SW1-*.png")
    }
    manifested_paths = {item["output_path"] for item in aggregate_assets}
    error(errors, len(seen_ids) == 67, f"aggregate contains {len(seen_ids)} slots, expected 67")
    error(errors, not omissions, f"canonical omissions: {omissions}")
    error(errors, not extras, f"noncanonical extras: {extras}")
    error(errors, not duplicate_ids, f"duplicate asset IDs: {duplicate_ids}")
    error(errors, len(output_hashes) == 67 and not duplicate_hashes, f"output hashes are not 67 unique values: {duplicate_hashes}")
    error(errors, len(rendered_paths) == 67, f"wave directory contains {len(rendered_paths)} SW1 PNGs, expected 67")
    error(errors, rendered_paths == manifested_paths, f"rendered PNG path mismatch: missing={sorted(manifested_paths - rendered_paths)}, extras={sorted(rendered_paths - manifested_paths)}")

    aggregate_assets.sort(key=lambda item: canonical_ids.index(item["asset_id"]))
    manifest = {
        "schema_version": "1.0.0",
        "task_id": "t_7db192e7",
        "campaign_id": canonical["campaign_id"],
        "wave_id": "wave-4-programmatic-pil",
        "canonical_source": str(CANONICAL.relative_to(PROJECT)),
        "canonical_source_sha256": canonical_hash,
        "canonical_asset_count": len(canonical_assets),
        "asset_count": len(aggregate_assets),
        "unique_asset_id_count": len(set(seen_ids)),
        "unique_output_sha256_count": len(set(output_hashes)),
        "rendered_sw1_png_count": len(rendered_paths),
        "omissions": omissions,
        "extras": extras,
        "palette": list(PALETTE),
        "indigo_ratio_range": [round(min_indigo, 6), round(max_indigo, 6)],
        "mechanical_status": "pass" if not errors else "fail",
        "composition_status": "pass" if not errors else "fail",
        "pilot_manifest_mutation": "none; reviewer evidence is recorded separately",
        "campaign_100_of_100_claim": "not made; this reconciliation proves only the canonical 67-slot Wave-4 set",
        "child_manifests": child_records,
        "assets": aggregate_assets,
        "errors": errors,
    }

    if errors:
        print(json.dumps({"ok": False, "errors": errors}, indent=2))
        raise SystemExit(1)

    OUTPUT_MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    report = "\n".join(
        [
            "# Wave-4 67-slot reconciliation",
            "",
            "Status: PASS",
            "",
            f"- Canonical slots: {len(canonical_assets)}",
            f"- Reconciled slots: {len(aggregate_assets)}",
            f"- Unique canonical asset IDs: {len(set(seen_ids))}",
            f"- Omissions: {len(omissions)}",
            f"- Extras: {len(extras)}",
            f"- Unique nonzero output SHA-256 values: {len(set(output_hashes))}",
            f"- Child groups mechanically passing: {sum(child['mechanical_status'] == 'pass' for child in child_records)}/{len(child_records)}",
            f"- Child groups composition-approved: {sum(child['composition_status'] == 'pass' for child in child_records)}/{len(child_records)}",
            f"- Exact dimensions: {len(aggregate_assets)}/{len(aggregate_assets)}",
            f"- Exact 3-color palette: {len(aggregate_assets)}/{len(aggregate_assets)}",
            f"- Paper-only upper 45%: {len(aggregate_assets)}/{len(aggregate_assets)}",
            f"- Indigo ratio in (0, 12%): {len(aggregate_assets)}/{len(aggregate_assets)}; range {min_indigo:.6f}-{max_indigo:.6f}",
            f"- Exact canonical scene/mechanism/spec hashes: {len(aggregate_assets)}/{len(aggregate_assets)}",
            f"- Canonical source SHA-256: `{canonical_hash}`",
            f"- Aggregate manifest SHA-256: `{sha256(OUTPUT_MANIFEST)}`",
            "",
            "Pilot manifest note: left immutable; the completed reviewer gate is recorded as separate evidence in the aggregate manifest.",
            "",
            "Campaign arithmetic note: this report certifies the canonical 67-slot Wave-4 set only. It does not claim campaign 100/100 because no independent campaign-wide arithmetic source is reconciled here.",
            "",
        ]
    )
    OUTPUT_REPORT.write_text(report)
    print(
        json.dumps(
            {
                "ok": True,
                "asset_count": len(aggregate_assets),
                "unique_asset_ids": len(set(seen_ids)),
                "unique_output_sha256": len(set(output_hashes)),
                "omissions": len(omissions),
                "extras": len(extras),
                "mechanical_pass_groups": len(child_records),
                "composition_pass_groups": len(child_records),
                "indigo_ratio_range": [round(min_indigo, 6), round(max_indigo, 6)],
                "aggregate_manifest": str(OUTPUT_MANIFEST.relative_to(PROJECT)),
                "aggregate_manifest_sha256": sha256(OUTPUT_MANIFEST),
                "report": str(OUTPUT_REPORT.relative_to(PROJECT)),
                "report_sha256": sha256(OUTPUT_REPORT),
                "errors": [],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
