#!/usr/bin/env python3
import os
import pathlib
import subprocess
import yaml

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
# Path to the local MiniMax client script; it lives outside this repository.
SKILL_CLIENT = pathlib.Path(os.environ["LUPINE_MINIMAX_CLIENT"])

with (ROOT / "storyboard.yaml").open() as f:
    sb = yaml.safe_load(f)

# images
for scene in sb["scenes"]:
    out = ASSETS / "images" / f"scene{scene['id']}.jpg"
    if out.exists():
        print(f"cached {out}")
        continue
    prompt = scene["visual_prompt"].replace("\n", " ").strip()
    subprocess.run([
        "python3", str(SKILL_CLIENT), "image",
        "--prompt", prompt,
        "--output", str(out),
        "--aspect", "16:9",
    ], check=True)

# narration
for scene in sb["scenes"]:
    narr = scene["narration_file"]
    text = scene["copy"]
    out = ASSETS / "narration" / narr
    if out.exists():
        print(f"cached {out}")
        continue
    subprocess.run([
        "python3", str(SKILL_CLIENT), "tts",
        "--text", text,
        "--output", str(out),
    ], check=True)

# music
music = sb["assets"]["music"][0]
music_out = ASSETS / "music" / music["file"]
if not music_out.exists():
    subprocess.run([
        "python3", str(SKILL_CLIENT), "music",
        "--prompt", music["prompt"].replace("\n", " ").strip(),
        "--output", str(music_out),
    ], check=True)
else:
    print(f"cached {music_out}")

print("done")
