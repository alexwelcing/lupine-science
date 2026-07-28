#!/usr/bin/env python3
"""Render and mechanically certify deterministic Wave-4 batch 04 assets."""

from __future__ import annotations

import ast
import hashlib
import json
from collections import Counter
from pathlib import Path

from PIL import Image

from wave4_batch_04_scenes import OUTPUT_DIR, RENDERERS, SPECS, render
from wave4_scene_components import INDIGO, INK, PALETTE, PAPER

PROJECT = Path(__file__).resolve().parents[3]
SOURCE_MANIFEST = PROJECT / "public/brand-assets/campaign-2026-07-27/shortfall-wave-1-manifest.json"
OUTPUT_MANIFEST = OUTPUT_DIR / "batch-04-manifest.json"
SCENE_SOURCE = Path(__file__).with_name("wave4_batch_04_scenes.py")
COMPONENT_SOURCE = Path(__file__).with_name("wave4_scene_components.py")
EXPECTED_IDS = (
    "SW1-B3-A02-02",
    "SW1-B3-A02-03",
    "SW1-B3-A02-04",
    "SW1-B3-A03-02",
    "SW1-B3-A03-03",
    "SW1-B3-A03-04",
    "SW1-B3-A04-03",
    "SW1-B3-A04-04",
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.removeprefix("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16))


def functional_path_counts(tree: ast.Module) -> dict[str, int]:
    """Count SceneCanvas.path calls in each renderer without executing source text."""
    counts: dict[str, int] = {}
    renderer_names = {renderer.__name__ for renderer in RENDERERS.values()}
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name in renderer_names:
            counts[node.name] = sum(
                1
                for child in ast.walk(node)
                if isinstance(child, ast.Call)
                and isinstance(child.func, ast.Attribute)
                and child.func.attr == "path"
            )
    return counts


def forbidden_source_operations(tree: ast.Module) -> list[str]:
    """Reject rendering APIs beyond the accepted Wave-4 PIL component surface."""
    errors: list[str] = []
    forbidden_calls = {
        "text",
        "multiline_text",
        "regular_polygon",
        "pieslice",
        "arc",
    }
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            module = node.module if isinstance(node, ast.ImportFrom) else None
            names = [alias.name for alias in node.names]
            if module and module.startswith("PIL"):
                errors.append(f"scene source imports PIL directly: {module}")
            if any(name == "ImageFont" or name.startswith("matplotlib") for name in names):
                errors.append(f"scene source imports forbidden renderer/font: {names}")
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr in forbidden_calls
        ):
            errors.append(f"scene source calls forbidden operation: {node.func.attr}")
    return errors


def main() -> None:
    source = json.loads(SOURCE_MANIFEST.read_text())
    source_by_id = {item["asset_id"]: item for item in source["assets"]}
    allowed = {rgb(color) for color in PALETTE}
    paper, ink, indigo = rgb(PAPER), rgb(INK), rgb(INDIGO)
    assets: list[dict[str, object]] = []
    errors: list[str] = []
    tree = ast.parse(SCENE_SOURCE.read_text())
    path_counts = functional_path_counts(tree)
    errors.extend(forbidden_source_operations(tree))

    if tuple(SPECS) != EXPECTED_IDS:
        errors.append(f"batch slot order/set mismatch: {tuple(SPECS)!r}")
    if set(RENDERERS) != set(EXPECTED_IDS):
        errors.append(f"renderer slot set mismatch: {sorted(RENDERERS)!r}")

    for asset_id, spec in SPECS.items():
        source_item = source_by_id.get(asset_id)
        if source_item is None:
            errors.append(f"{asset_id}: missing from approved source manifest")
            continue
        if spec["scene"] != source_item["specific_physical_scene"]:
            errors.append(f"{asset_id}: scene text diverges from approved source")
        if spec["mechanism"] != source_item["single_mechanism"]:
            errors.append(f"{asset_id}: mechanism text diverges from approved source")

        renderer_name = RENDERERS[asset_id].__name__
        if path_counts.get(renderer_name) != 1:
            errors.append(
                f"{asset_id}: expected exactly one functional path, "
                f"found {path_counts.get(renderer_name, 0)}"
            )

        generator = PROJECT / "media/projects/article-visuals" / f"generate_wave4_{asset_id.lower().replace('-', '_')}.py"
        if not generator.is_file():
            errors.append(f"{asset_id}: missing per-slot generator {generator}")

        path = render(asset_id)
        with Image.open(path) as image:
            image.load()
            dimensions = image.size
            pixels = list(image.get_flattened_data())
            counts = Counter(pixels)
            colors = set(counts)
            total = dimensions[0] * dimensions[1]
            paper_ratio = counts[paper] / total
            ink_ratio = counts[ink] / total
            indigo_ratio = counts[indigo] / total
            open_rows = round(dimensions[1] * 0.45)
            top_band = image.crop((0, 0, dimensions[0], open_rows))
            top_open = set(top_band.get_flattened_data()) == {paper}
            nonpaper = Image.new("1", dimensions)
            nonpaper.putdata([0 if pixel == paper else 1 for pixel in pixels])
            subject_bbox = nonpaper.getbbox()

        expected_dimensions = tuple(spec["dimensions"])
        if dimensions != expected_dimensions:
            errors.append(f"{asset_id}: {dimensions} != {expected_dimensions}")
        if colors != allowed:
            errors.append(f"{asset_id}: expected exact three-color palette, found {sorted(colors)}")
        if not top_open:
            errors.append(f"{asset_id}: upper 45% is not completely paper-only")
        if not 0 < indigo_ratio < 0.12:
            errors.append(f"{asset_id}: indigo ratio {indigo_ratio:.6f} outside (0, 0.12)")

        assets.append(
            {
                "asset_id": asset_id,
                "original_asset_id": source_item["original_asset_id"],
                "archetype": spec["archetype"],
                "specific_physical_scene": spec["scene"],
                "single_mechanism": spec["mechanism"],
                "source_spec_hash": source_item["spec_hash"],
                "generator": str(generator.relative_to(PROJECT)),
                "generator_sha256": sha256(generator),
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
                "functional_path_count": path_counts.get(renderer_name, 0),
                "glyph_risk_control": (
                    "accepted PIL primitives only; no font import, text drawing, labels, glyphs, "
                    "arrows, chart marks, or generative API"
                ),
                "mechanical_status": "pass",
                "composition_status": "pending-independent-review",
            }
        )

    manifest = {
        "schema_version": "1.0.0",
        "task_id": "t_af9fbc29",
        "campaign_id": source["campaign_id"],
        "wave_id": "wave-4-programmatic-pil",
        "batch_id": "batch-04",
        "source_manifest": str(SOURCE_MANIFEST.relative_to(PROJECT)),
        "source_manifest_sha256": sha256(SOURCE_MANIFEST),
        "scene_source": str(SCENE_SOURCE.relative_to(PROJECT)),
        "scene_source_sha256": sha256(SCENE_SOURCE),
        "component_source": str(COMPONENT_SOURCE.relative_to(PROJECT)),
        "component_source_sha256": sha256(COMPONENT_SOURCE),
        "palette": list(PALETTE),
        "asset_count": len(assets),
        "mechanical_status": "pass" if not errors else "fail",
        "composition_status": "pending-independent-review",
        "errors": errors,
        "assets": assets,
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    summary = {
        "ok": not errors,
        "asset_count": len(assets),
        "manifest": str(OUTPUT_MANIFEST),
        "manifest_sha256": sha256(OUTPUT_MANIFEST),
        "assets": [
            {
                "asset_id": item["asset_id"],
                "dimensions": item["dimensions"],
                "paper_ratio": item["paper_ratio"],
                "ink_ratio": item["ink_ratio"],
                "indigo_ratio": item["indigo_ratio"],
                "upper_45_percent_all_paper": item["upper_45_percent_all_paper"],
                "sha256": item["output_sha256"],
            }
            for item in assets
        ],
        "errors": errors,
    }
    print(json.dumps(summary, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
