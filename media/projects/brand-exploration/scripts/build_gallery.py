#!/usr/bin/env python3
"""Build gallery data from the storyboard scene list."""
import json
import pathlib
import yaml

PROJECT = pathlib.Path(__file__).resolve().parent.parent
STORYBOARD = PROJECT / "storyboard.yaml"
GALLERY = PROJECT / "renders" / "gallery.html"


def main():
    sb = yaml.safe_load(STORYBOARD.read_text())
    scenes = sb.get("scenes", [])
    if not scenes:
        print("No scenes found in storyboard.")
        return

    js = "const SCENES = " + json.dumps(scenes, indent=2) + ";\n"
    html = GALLERY.read_text()
    html = html.replace("const SCENES = [];", js.strip())
    GALLERY.write_text(html)
    print(f"Wrote {len(scenes)} scenes to {GALLERY}")


if __name__ == "__main__":
    main()
