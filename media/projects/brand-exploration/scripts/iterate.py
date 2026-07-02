#!/usr/bin/env python3
"""Run multiple generation passes with progressively stricter style suffixes."""
import json
import pathlib
import shutil
import subprocess
import sys

PROJECT = pathlib.Path(__file__).resolve().parent.parent
STORYBOARD = PROJECT / "storyboard.yaml"
SCRIPTS = PROJECT / "scripts"
RENDERS = PROJECT / "renders"

VERSIONS = [
    {
        "version": "v3",
        "style_suffix": (
            "editorial scientific minimalism, solid flat warm off-white #faf9f6 background, "
            "no gradients, no sky, no fog, no bokeh, no atmosphere, no shadows, "
            "only crisp indigo #3d4db3 vector lines and dots, screen-print aesthetic, "
            "strict two-color palette, no cyan no teal no purple no orange no gold no green, "
            "generous negative space, calm and premium, no text, no people, no flowers, no neon, "
            "no glowing circuits, not photographic, not 3D render, like a figure in a physics monograph"
        ),
    },
    {
        "version": "v4",
        "style_suffix": (
            "minimalist line-art diagram, solid flat warm off-white #faf9f6 background, "
            "single continuous indigo #3d4db3 ribbon, geometric atomic lattice, blueprint precision, "
            "no gradients, no blur, no bokeh, no atmospheric effects, no shading, "
            "two colors only, no cyan no teal no purple no orange no gold no green, "
            "generous negative space, no text, no people, no flowers, no neon, no 3D render"
        ),
    },
    {
        "version": "v5",
        "style_suffix": (
            "risograph print, halftone indigo #3d4db3 on warm off-white #faf9f6 paper, "
            "high contrast, flat color fields, no gradients, no photographic detail, "
            "bold graphic shapes, two colors only, no cyan no teal no purple no orange no gold no green, "
            "generous negative space, no text, no people, no flowers, no neon, no 3D render, "
            "scientific illustration, physics monograph figure"
        ),
    },
]


def run(cmd):
    subprocess.run(cmd, cwd=PROJECT, check=True)


def main():
    all_scenes = []
    for cfg in VERSIONS:
        version = cfg["version"]
        print(f"\n\n========== {version} ==========\n")

        # Update storyboard
        import yaml
        sb = yaml.safe_load(STORYBOARD.read_text())
        sb["version"] = version
        sb["style_suffix"] = cfg["style_suffix"]
        STORYBOARD.write_text(yaml.safe_dump(sb, sort_keys=False))

        # Generate
        run([sys.executable, str(SCRIPTS / "generate_matrix.py")])

        # Build gallery
        run([sys.executable, str(SCRIPTS / "build_gallery.py")])

        # Snapshot version-specific gallery
        shutil.copy(RENDERS / "gallery.html", RENDERS / f"gallery_{version}.html")

        # Collect scenes
        sb = yaml.safe_load(STORYBOARD.read_text())
        for scene in sb.get("scenes", []):
            scene["version"] = version
            all_scenes.append(scene)

    # Build combined gallery
    combined_html = (RENDERS / "gallery.html").read_text()
    js = "const SCENES = " + json.dumps(all_scenes, indent=2) + ";\n"
    combined_html = combined_html.replace("const SCENES = [];", js.strip())
    # Add version filter buttons
    filter_html = '<button data-filter="all">All</button>' + "".join(
        f'<button data-filter="{cfg["version"]}">{cfg["version"]}</button>' for cfg in VERSIONS
    )
    combined_html = combined_html.replace(
        '<button class="active" data-filter="all">All</button>',
        filter_html,
    )
    (RENDERS / "gallery_all.html").write_text(combined_html)
    print(f"\n\nCombined gallery written to {RENDERS / 'gallery_all.html'}")


if __name__ == "__main__":
    main()
