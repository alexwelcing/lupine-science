#!/usr/bin/env python3
"""Compose the LUPI launch video from storyboard assets."""
import pathlib
import subprocess
import yaml

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
RENDERS = ROOT / "renders"
RENDERS.mkdir(parents=True, exist_ok=True)
OUT = RENDERS / "v01_final.mp4"

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONTSM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
if not pathlib.Path(FONT).exists():
    FONT = "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"
if not pathlib.Path(FONTSM).exists():
    FONTSM = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

with (ROOT / "storyboard.yaml").open() as f:
    sb = yaml.safe_load(f)

SCENES = sb["scenes"]
FPS = sb["fps"]
W, H = sb["resolution"]
OVERLAP = sb["transition"]["duration"]
TOTAL = sb["duration"]
SCENE_DUR = (TOTAL + (len(SCENES) - 1) * OVERLAP) / len(SCENES)


def duration(path: pathlib.Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        text=True,
    )
    return float(out.strip())


def build_video():
    inputs = []
    filters = []
    labels = []

    for i, scene in enumerate(SCENES):
        img = ASSETS / "images" / f"scene{scene['id']}.jpg"
        label = f"s{i}"
        labels.append(label)
        inputs += ["-loop", "1", "-t", str(SCENE_DUR), "-i", str(img)]

        # Ken Burns: subtle centered zooms.  This FFmpeg build only accepts
        # constant x/y offsets in zoompan, so we keep motion centered.
        kb = ["zoom-in", "zoom-out", "slow-zoom", "zoom-in", "zoom-out", "slow-zoom"][i % 6]
        d_frames = int(SCENE_DUR * FPS) + 30
        base = f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2"
        if kb == "zoom-in":
            zoom = "z='min(zoom+0.0015,1.12)'"
        elif kb == "zoom-out":
            zoom = "z='if(lte(zoom,1.0),1.12,max(zoom-0.0015,1.0))'"
        else:
            zoom = "z='1.08'"
        expr = f"{base},zoompan={zoom}:d={d_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},trim=duration={SCENE_DUR}"

        # Text overlay: title + copy
        title = scene["title"].replace("'", "'\\''")
        copy = scene["copy"].replace("'", "'\\''")
        drawtext_title = f"drawtext=fontfile={FONT}:text='{title}':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=(h*0.35)-text_h/2:shadowx=2:shadowy=2:shadowcolor=black@0.6"
        drawtext_copy = f"drawtext=fontfile={FONTSM}:text='{copy}':fontcolor=0xd0d4e0:fontsize=28:x=(w-text_w)/2:y=(h*0.35)+50:shadowx=1:shadowy=1:shadowcolor=black@0.5"

        filters.append(f"[{i}:v]{expr},{drawtext_title},{drawtext_copy},format=yuv420p[{label}]")

    # Crossfade chain; offset accumulates because each step merges the growing chain with the next scene.
    chain = f"[{labels[0]}]"
    for i in range(1, len(SCENES)):
        out_label = f"tmp{i}" if i < len(SCENES) - 1 else "vout"
        offset = i * (SCENE_DUR - OVERLAP)
        filters.append(f"{chain}[{labels[i]}]xfade=transition=fade:duration={OVERLAP}:offset={offset}[{out_label}]")
        chain = f"[{out_label}]"

    return inputs, filters


def build_audio(base_idx: int):
    music = ASSETS / "music" / "music.mp3"
    inputs = ["-i", str(music)]
    music_idx = base_idx
    filters = [f"[{music_idx}:a]atrim=0:{TOTAL},asetpts=PTS-STARTPTS,volume=0.14[music]"]
    narr_labels = []
    for i, scene in enumerate(SCENES):
        narr = ASSETS / "narration" / scene["narration_file"]
        idx = base_idx + 1 + i
        inputs += ["-i", str(narr)]
        start_ms = int(scene["narration_start"] * 1000)
        label = f"narr{i}"
        filters.append(f"[{idx}:a]adelay=delays={start_ms}|{start_ms}:all=1,volume=1.25[{label}]")
        narr_labels.append(label)

    mix = "[music]" + "".join(f"[{l}]" for l in narr_labels)
    filters.append(f"{mix}amix=inputs={len(SCENES)+1}:duration=first:dropout_transition=0[aout]")
    return inputs, filters


def main():
    v_inputs, v_filters = build_video()
    a_inputs, a_filters = build_audio(len(SCENES))

    # Video inputs are first (0..n-1), then music (n), then narration (n+1..)
    all_inputs = v_inputs + a_inputs
    all_filters = v_filters + a_filters

    cmd = [
        "ffmpeg", "-y",
        *all_inputs,
        "-filter_complex", ";".join(all_filters),
        "-map", "[vout]",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", str(TOTAL),
        str(OUT),
    ]
    subprocess.run(cmd, check=True)
    print(f"Wrote {OUT}")
    print(f"Duration: {duration(OUT):.2f}s")


if __name__ == "__main__":
    main()
