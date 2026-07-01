#!/usr/bin/env python3
"""Generate all carousel images for the day-in-the-life project."""
import pathlib
import subprocess
import sys
import yaml

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ROOT / "assets" / "images"
RENDERS = ROOT / "renders"
SKILL_CLIENT = pathlib.Path.home() / ".hermes/skills/lupine-media-director/scripts/minimax_client.py"

with (ROOT / "storyboard.yaml").open() as f:
    sb = yaml.safe_load(f)

for scene in sb["scenes"]:
    out = ASSETS / f"carousel_{scene['id']}_{scene['title'].split('—')[0].strip().lower().replace(' ', '_').replace(',', '')}.jpg"
    if out.exists():
        print(f"cached {out}")
        continue
    prompt = scene["visual_prompt"].replace("\n", " ").strip()
    print(f"Generating scene {scene['id']}: {scene['title']}")
    subprocess.run([
        "python3", str(SKILL_CLIENT), "image",
        "--prompt", prompt,
        "--output", str(out),
        "--aspect", "1:1",
    ], check=True)

print("All images generated.")
