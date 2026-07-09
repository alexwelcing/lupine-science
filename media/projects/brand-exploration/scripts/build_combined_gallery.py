#!/usr/bin/env python3
"""Build a combined gallery across v1–v5 from the asset directories."""
import json
import pathlib
import re

PROJECT = pathlib.Path(__file__).resolve().parent.parent
RENDERS = PROJECT / "renders"
GALLERY_TEMPLATE = RENDERS / "gallery.html"
OUT = RENDERS / "gallery_all.html"

MOTIF_NAMES = {
    "shape-of-wrongness": "Shape of wrongness",
    "bits-to-atoms": "Bits to atoms",
    "upstream-cascade": "Upstream cascade",
    "error-vector-alignment": "Error-vector alignment",
    "calibration-grid": "Calibration grid",
    "particle-ribbon": "Particle ribbon",
    "ink-wash": "Ink wash",
    "moire-circles": "Moiré circles",
    "constellation-threads": "Constellation threads",
    "shadow-geometry": "Shadow geometry",
    "stroke-dissolution": "Stroke dissolution",
    "folded-light": "Folded light",
    "scale-shards": "Scale shards",
    "orbit-mark": "Orbit mark",
    "lattice-node": "Lattice node",
    "proof-check": "Proof check",
    "error-tick": "Error tick",
    "molecule-glyph": "Molecule glyph",
    "bond-angle": "Bond angle",
    "calibration-cross": "Calibration cross",
    "trust-shield": "Trust shield",
    "field-line": "Field line",
    "manifold-curve": "Manifold curve",
    "atomic-ring": "Atomic ring",
    "coordinate-axis": "Coordinate axis",
    "hex-cell": "Hex cell",
    "wave-packet": "Wave packet",
    "convergence-star": "Convergence star",
    "divergence-burst": "Divergence burst",
}


def parse_filename(name: str):
    # shape-of-wrongness_wide_v3.jpg or shape-of-wrongness_wide.jpg (v1)
    m = re.match(r"(.+)_(wide|square|dense|quiet|circle)(?:_(v\d+))?\.jpg", name)
    if not m:
        return None
    motif_id, variant_id, version = m.groups()
    version = version or "v1"
    return {
        "motif_id": motif_id,
        "motif_name": MOTIF_NAMES.get(motif_id, motif_id),
        "variant_id": variant_id,
        "version": version,
        "aspect": "1:1" if variant_id == "square" else "16:9",
        "filename": f"assets/images/{version + '/' if version != 'v1' else ''}{name}",
        "prompt": f"{MOTIF_NAMES.get(motif_id, motif_id)} / {variant_id} / {version}",
        "status": "generated",
    }


def main():
    scenes = []
    assets = PROJECT / "assets" / "images"
    # v1 files are directly in assets/images
    for path in sorted(assets.glob("*.jpg")):
        info = parse_filename(path.name)
        if info:
            scenes.append(info)
    # v2–v5 in subdirs
    for subdir in sorted(assets.glob("v*")):
        for path in sorted(subdir.glob("*.jpg")):
            info = parse_filename(path.name)
            if info:
                scenes.append(info)

    html = GALLERY_TEMPLATE.read_text()
    js = "const SCENES = " + json.dumps(scenes, indent=2) + ";\n"
    html = html.replace("const SCENES = [];", js.strip())

    # Replace filter buttons with version buttons
    versions = sorted(set(s["version"] for s in scenes))
    filter_html = '<button class="active" data-filter="all">All</button>'
    for v in versions:
        filter_html += f'<button data-filter="{v}">{v}</button>'
    html = html.replace(
        '<button class="active" data-filter="all">All</button>',
        filter_html,
    )

    # Update title/lede
    html = html.replace(
        "<h1>Creative direction <em>exploration.</em></h1>",
        "<h1>Creative direction <em>evolution.</em></h1>",
    )
    html = html.replace(
        "A controlled matrix of MiniMax-generated stills across three motifs and four variants.",
        "All generations (v1–v9) side by side: research motifs, abstract textures, and standalone iconography. Compare how the prompt tightening changed palette, geometry, and readability.",
    )

    OUT.write_text(html)
    print(f"Wrote {len(scenes)} scenes to {OUT}")


if __name__ == "__main__":
    main()
