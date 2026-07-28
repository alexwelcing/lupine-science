#!/usr/bin/env python3
"""Render and mechanically certify the four deterministic Wave-4 pilots."""

from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

from wave4_pilot_scenes import OUTPUT_DIR, SPECS, render
from wave4_scene_components import INDIGO, INK, PALETTE, PAPER

PROJECT = Path(__file__).resolve().parents[3]
SOURCE_MANIFEST = (
    PROJECT / "public/brand-assets/campaign-2026-07-27/shortfall-wave-1-manifest.json"
)
OUTPUT_MANIFEST = OUTPUT_DIR / "pilot-manifest.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.removeprefix("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16))


def main() -> None:
    source = json.loads(SOURCE_MANIFEST.read_text())
    source_by_id = {item["asset_id"]: item for item in source["assets"]}
    allowed = {rgb(color) for color in PALETTE}
    paper = rgb(PAPER)
    ink = rgb(INK)
    indigo = rgb(INDIGO)
    assets = []
    errors = []

    for asset_id, spec in SPECS.items():
        source_item = source_by_id.get(asset_id)
        if source_item is None:
            errors.append(f"{asset_id}: missing from approved source manifest")
            continue
        if spec["scene"] != source_item["specific_physical_scene"]:
            errors.append(f"{asset_id}: scene text diverges from approved source")
        if spec["mechanism"] != source_item["single_mechanism"]:
            errors.append(f"{asset_id}: mechanism text diverges from approved source")

        path = render(asset_id)
        with Image.open(path) as image:
            image.load()
            dimensions = image.size
            pixels = list(image.get_flattened_data())
            counts = Counter(pixels)
            colors = set(counts)
            total = dimensions[0] * dimensions[1]
            paper_ratio = counts[paper] / total
            indigo_ratio = counts[indigo] / total
            ink_ratio = counts[ink] / total
            open_rows = round(dimensions[1] * 0.45)
            top_band = image.crop((0, 0, dimensions[0], open_rows))
            top_open = set(list(top_band.get_flattened_data())) == {paper}
            nonpaper = Image.new("1", dimensions)
            nonpaper.putdata([0 if pixel == paper else 1 for pixel in pixels])
            subject_bbox = nonpaper.getbbox()

        expected_dimensions = tuple(spec["dimensions"])
        if dimensions != expected_dimensions:
            errors.append(f"{asset_id}: {dimensions} != {expected_dimensions}")
        if not colors.issubset(allowed):
            errors.append(f"{asset_id}: off-palette pixels {sorted(colors - allowed)}")
        if colors != allowed:
            errors.append(f"{asset_id}: expected all three palette colors, found {sorted(colors)}")
        if paper_ratio < 0.45:
            errors.append(f"{asset_id}: paper ratio {paper_ratio:.6f} below 0.45")
        if not top_open:
            errors.append(f"{asset_id}: upper 45% is not completely open paper")
        if indigo_ratio > 0.12:
            errors.append(f"{asset_id}: indigo ratio {indigo_ratio:.6f} above 0.12")

        assets.append(
            {
                "asset_id": asset_id,
                "original_asset_id": source_item["original_asset_id"],
                "archetype": spec["archetype"],
                "specific_physical_scene": spec["scene"],
                "single_mechanism": spec["mechanism"],
                "source_spec_hash": source_item["spec_hash"],
                "generator": str(
                    Path("media/projects/article-visuals")
                    / f"generate_wave4_{asset_id.lower().replace('-', '_')}.py"
                ),
                "output_path": str(path.relative_to(PROJECT)),
                "output_sha256": sha256(path),
                "bytes": path.stat().st_size,
                "format": "PNG",
                "mode": "RGB",
                "dimensions": {"width": dimensions[0], "height": dimensions[1]},
                "palette_histogram": {
                    PAPER: counts[paper],
                    INK: counts[ink],
                    INDIGO: counts[indigo],
                },
                "paper_ratio": round(paper_ratio, 6),
                "ink_ratio": round(ink_ratio, 6),
                "indigo_ratio": round(indigo_ratio, 6),
                "upper_45_percent_all_paper": top_open,
                "nonpaper_bbox": list(subject_bbox) if subject_bbox else None,
                "glyph_risk_control": "PIL primitives only; no font import, text drawing, labels, or symbols",
                "mechanical_status": "pass",
                "composition_status": "pending-independent-review",
            }
        )

    # Reproducibility law for certified evidence: a verifier rerun must not
    # mutate the manifest. generated_at is preserved from the existing
    # manifest; only a first-ever run stamps the current time.
    generated_at = datetime.now(timezone.utc).isoformat()
    if OUTPUT_MANIFEST.exists():
        try:
            prior = json.loads(OUTPUT_MANIFEST.read_text())
            if isinstance(prior.get("generated_at"), str) and prior["generated_at"]:
                generated_at = prior["generated_at"]
        except (json.JSONDecodeError, OSError):
            pass

    manifest = {
        "schema_version": "1.0.0",
        "task_id": "t_7180c733",
        "campaign_id": source["campaign_id"],
        "wave_id": "wave-4-programmatic-pilot",
        "generated_at": generated_at,
        "source_manifest": str(SOURCE_MANIFEST.relative_to(PROJECT)),
        "source_manifest_sha256": sha256(SOURCE_MANIFEST),
        "palette": list(PALETTE),
        "pilot_count": len(assets),
        "mechanical_status": "pass" if not errors else "fail",
        "composition_status": "pending-independent-review",
        "errors": errors,
        "assets": assets,
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({
        "ok": not errors,
        "pilot_count": len(assets),
        "manifest": str(OUTPUT_MANIFEST),
        "manifest_sha256": sha256(OUTPUT_MANIFEST),
        "assets": [
            {
                "asset_id": item["asset_id"],
                "dimensions": item["dimensions"],
                "paper_ratio": item["paper_ratio"],
                "indigo_ratio": item["indigo_ratio"],
                "sha256": item["output_sha256"],
            }
            for item in assets
        ],
        "errors": errors,
    }, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
