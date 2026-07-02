#!/usr/bin/env python3
"""Build gallery data from existing brand-exploration assets."""
import json
import pathlib
import re
import yaml

PROJECT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = PROJECT / "assets" / "images"
GALLERY = PROJECT / "renders" / "gallery.html"
STORYBOARD = PROJECT / "storyboard.yaml"

# Manual mapping from filename → motif, variant, aspect, prompt.
MAPPING = {
    "cover-shape-of-wrongness.jpg": {
        "motif_id": "shape-of-wrongness",
        "motif_name": "Shape of wrongness",
        "variant_id": "wide",
        "aspect": "16:9",
        "prompt": "faint scattered directional error vectors across a warm paper field gracefully collapsing and aligning onto a single luminous indigo ribbon — a low-dimensional manifold emerging from chaos",
    },
    "hyper-ribbon.jpg": {
        "motif_id": "shape-of-wrongness",
        "motif_name": "Shape of wrongness",
        "variant_id": "dense",
        "aspect": "16:9",
        "prompt": "the hyper-ribbon: a single elegant low-dimensional luminous indigo ribbon sheet folded in space with faint error points converging onto its surface",
    },
    "slide01-cover-shape-of-wrongness-101.jpg": {
        "motif_id": "shape-of-wrongness",
        "motif_name": "Shape of wrongness",
        "variant_id": "square",
        "aspect": "16:9",
        "prompt": "many faint thin indigo directional line segments at varied angles scattered across the periphery aligning onto one smooth luminous indigo ribbon curve",
    },
    "slide01-cover-shape-of-wrongness-202.jpg": {
        "motif_id": "shape-of-wrongness",
        "motif_name": "Shape of wrongness",
        "variant_id": "quiet",
        "aspect": "16:9",
        "prompt": "an elegant abstract scientific figure: many faint directional line segments aligning onto a single smooth luminous indigo ribbon curve; structure emerging from a scattered field",
    },
    "bits-to-atoms.jpg": {
        "motif_id": "bits-to-atoms",
        "motif_name": "Bits to atoms",
        "variant_id": "wide",
        "aspect": "16:9",
        "prompt": "the crossing from the digital to the physical: a field of tiny pixels dissolving on the left and re-forming into a precise crystalline atomic lattice on the right",
    },
    "slide02-bits-to-atoms-101.jpg": {
        "motif_id": "bits-to-atoms",
        "motif_name": "Bits to atoms",
        "variant_id": "square",
        "aspect": "16:9",
        "prompt": "a field of tiny digital glyphs and pixels on the left dissolving and re-forming into a precise crystalline atomic lattice on the right",
    },
    "slide02-bits-to-atoms-202.jpg": {
        "motif_id": "bits-to-atoms",
        "motif_name": "Bits to atoms",
        "variant_id": "quiet",
        "aspect": "16:9",
        "prompt": "the crossing from the digital to the physical; left: pixels and glyphs dissolving, right: crystalline atomic lattice, indigo light",
    },
    "bridge.jpg": {
        "motif_id": "the-bridge",
        "motif_name": "The bridge",
        "variant_id": "wide",
        "aspect": "16:9",
        "prompt": "atoms to bits to atoms: a single luminous indigo arc bridging a crystalline lattice to a field of digital glyphs and back to a lattice",
    },
    "slide06-bridge-101.jpg": {
        "motif_id": "the-bridge",
        "motif_name": "The bridge",
        "variant_id": "square",
        "aspect": "16:9",
        "prompt": "a single luminous indigo arc bridging a crystalline lattice to a field of digital glyphs and back to a lattice",
    },
    "slide06-bridge-202.jpg": {
        "motif_id": "the-bridge",
        "motif_name": "The bridge",
        "variant_id": "quiet",
        "aspect": "16:9",
        "prompt": "atoms to bits to atoms rendered as a luminous indigo bridge across warm paper",
    },
    "slide07-calibration-grid-101.jpg": {
        "motif_id": "calibration-grid",
        "motif_name": "Calibration grid",
        "variant_id": "square",
        "aspect": "16:9",
        "prompt": "a clean indigo grid gently overlaying and aligning a field of scattered points onto a smooth manifold",
    },
    "slide07-calibration-grid-202.jpg": {
        "motif_id": "calibration-grid",
        "motif_name": "Calibration grid",
        "variant_id": "quiet",
        "aspect": "16:9",
        "prompt": "correction made visible: a clean indigo grid overlaying scattered points and aligning them onto a smooth manifold",
    },
    "slide08-flywheel-101.jpg": {
        "motif_id": "compounding-flywheel",
        "motif_name": "Compounding flywheel",
        "variant_id": "square",
        "aspect": "16:9",
        "prompt": "an edge that compounds: a crystal lattice growing outward in self-reinforcing spiral geometry, each layer larger",
    },
    "slide08-flywheel-202.jpg": {
        "motif_id": "compounding-flywheel",
        "motif_name": "Compounding flywheel",
        "variant_id": "dense",
        "aspect": "16:9",
        "prompt": "a crystalline indigo lattice growing outward in an elegant self-reinforcing spiral, each ring larger than the last",
    },
    "vision-replicator-arc.jpg": {
        "motif_id": "vision-replicator-arc",
        "motif_name": "Vision / replicator arc",
        "variant_id": "wide",
        "aspect": "16:9",
        "prompt": "matter coalescing out of faint indigo light along a sweeping horizon arc; expansive, cinematic, restrained",
    },
    "slide10-vision-replicator-arc-101.jpg": {
        "motif_id": "vision-replicator-arc",
        "motif_name": "Vision / replicator arc",
        "variant_id": "square",
        "aspect": "16:9",
        "prompt": "matter coalescing out of faint indigo light along a sweeping horizon arc",
    },
    "slide10-vision-replicator-arc-202.jpg": {
        "motif_id": "vision-replicator-arc",
        "motif_name": "Vision / replicator arc",
        "variant_id": "quiet",
        "aspect": "16:9",
        "prompt": "faint indigo particles and light along a sweeping horizon arc assembling into ordered crystalline structure",
    },
}


def main():
    scenes = []
    for path in sorted(ASSETS.iterdir()):
        if path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        info = MAPPING.get(path.name, {
            "motif_id": "unknown",
            "motif_name": "Unknown",
            "variant_id": "asset",
            "aspect": "16:9",
            "prompt": "",
        })
        scenes.append({
            "filename": f"assets/images/{path.name}",
            **info,
        })

    js = "const SCENES = " + json.dumps(scenes, indent=2) + ";\n"
    html = GALLERY.read_text()
    html = html.replace("const SCENES = [];", js.strip())
    GALLERY.write_text(html)

    sb = yaml.safe_load(STORYBOARD.read_text())
    sb["scenes"] = scenes
    sb["note"] = "Initial batch built from existing brand assets; MiniMax token limit reached during live generation."
    STORYBOARD.write_text(yaml.safe_dump(sb, sort_keys=False))

    print(f"Wrote {len(scenes)} scenes to {GALLERY} and {STORYBOARD}")


if __name__ == "__main__":
    main()
