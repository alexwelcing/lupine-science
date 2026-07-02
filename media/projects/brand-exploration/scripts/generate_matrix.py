#!/usr/bin/env python3
"""Generate the brand exploration image matrix from storyboard.yaml."""
import json
import pathlib
import subprocess
import sys
import yaml

PROJECT = pathlib.Path(__file__).resolve().parent.parent
STORYBOARD = PROJECT / "storyboard.yaml"
ASSETS = PROJECT / "assets" / "images"
CLIENT = pathlib.Path.home() / ".hermes" / "skills" / "lupine-media-director" / "scripts" / "minimax_client.py"


def run_image(prompt: str, aspect: str, output: pathlib.Path):
    cmd = [
        sys.executable,
        str(CLIENT),
        "image",
        "--prompt",
        prompt,
        "--aspect",
        aspect,
        "--output",
        str(output),
    ]
    subprocess.run(cmd, check=True)


def main():
    sb = yaml.safe_load(STORYBOARD.read_text())
    style = " ".join(sb["style_suffix"].split())
    scenes = []

    for motif in sb["motifs"]:
        for variant in sb["variants"]:
            prompt = (
                f"{motif['base']}; {variant['modifier']}; {style}"
            )
            filename = f"{motif['id']}_{variant['id']}.jpg"
            output = ASSETS / filename
            print(f"\n=== {motif['name']} / {variant['id']} ===")
            print(prompt[:200] + "…")
            run_image(prompt, variant["aspect"], output)
            scenes.append({
                "motif_id": motif["id"],
                "motif_name": motif["name"],
                "variant_id": variant["id"],
                "aspect": variant["aspect"],
                "filename": f"assets/images/{filename}",
                "prompt": prompt,
                "status": "generated",
            })

    sb["scenes"] = scenes
    STORYBOARD.write_text(yaml.safe_dump(sb, sort_keys=False))
    print(f"\nDone. Generated {len(scenes)} images.")


if __name__ == "__main__":
    main()
