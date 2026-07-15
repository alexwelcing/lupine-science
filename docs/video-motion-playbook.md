# Article Motion-Video Playbook

Turn static article decks into deterministic, publication-quality motion videos using ffmpeg. No AI video generation—just programmable camera moves, crossfades, and typography over the images we already ship.

## Why this approach

- **Reviewable**: every pan, zoom, and cut is declared in a JSON manifest and reproducible from source.
- **Fast**: renders are pure ffmpeg; a 10-scene, 60-second video completes in under a minute on a laptop.
- **Brand-safe**: overlays use Lupine fonts and palette; no synthetic faces, no hallucinated text, no unlicensed music.
- **Swappable audio**: the same visual track can be remuxed with a new voiceover as soon as the audio asset is ready.

## Manifest format

Each article has a manifest in `data/video-motion/<slug>.json`:

```json
{
  "version": "2026-07-14",
  "slug": "the-02-percent-synthesis-problem",
  "title": "The 0.2% Synthesis Problem",
  "description": "Motion-enhanced article video built from deck-level visuals.",
  "scenes": [
    {
      "image": "public/articles/.../images/...jpg",
      "duration": 6,
      "effect": "slow-zoom-in",
      "text": ["380,000 computationally stable structures", "736 independently synthesized — 0.2% validation"]
    }
  ]
}
```

Field reference:

| Field | Required | Description |
|-------|----------|-------------|
| `image` | yes | Path relative to repo root; must exist. |
| `duration` | yes | Scene length in seconds. |
| `effect` | no | One of the Ken Burns presets (default `slow-zoom-in`). |
| `text` | no | Array of lines rendered as a bottom-center caption. |
| `textColor` | no | Caption color (default `#faf9f6`). |
| `fontSize` | no | Caption size in px (default `36`). |
| `boxColor` | no | Caption background in ffmpeg `0xRRGGBB@alpha` form (default `0x161d1d@0.45`). |

## Ken Burns presets

Defined in `scripts/lib/motion-effects.mjs`:

- `slow-zoom-in`
- `slow-zoom-out`
- `pan-right`
- `pan-left`
- `pan-up`
- `pan-down`
- `drift`

To add a preset, add an entry to the `KENBURNS` object with `start` and `end` `{x, y, z}` values.

## Generating manifests

The generator scans `articles/*.md`, extracts embedded images, and writes manifests for every article that has at least one image:

```bash
npm run video:motion:generate
```

Existing manifests are preserved. To regenerate a manifest, delete it or pass `--force`:

```bash
npm run video:motion:generate -- --force
```

## Rendering one video

```bash
SLUG=the-02-percent-synthesis-problem npm run video:motion:render
```

This writes to `media/projects/video-motion/renders/<slug>-motion.mp4`. If a matching audio file exists at `public/videos/<slug>.mp4`, it is muxed in and trimmed to the visual length.

To render with a specific audio file or output path:

```bash
node scripts/build-article-motion-video.mjs \
  --slug the-02-percent-synthesis-problem \
  --audio public/videos/the-02-percent-synthesis-problem.mp4 \
  --out media/projects/video-motion/renders/...mp4
```

## Rendering all videos

```bash
npm run video:motion:build:all
```

Skipped if the render already exists; pass `--force` to rebuild.

## Verification

```bash
npm run video:motion:verify
```

Checks that every manifest is valid JSON, every scene points to an existing image, durations are positive, and effects are known. This is also part of `npm run verify`.

## Prototype

The first motion video is the 0.2% synthesis problem article:

```bash
npm run video:motion:prototype
```

Output: `media/projects/video-motion/renders/the-02-percent-synthesis-problem-motion.mp4`.

## CI integration

- `npm run verify` now includes `video:motion:verify`, so a missing image or broken manifest fails CI.
- Do not commit rendered MP4s to the repo; they live under `media/projects/video-motion/renders/` and can be regenerated on demand.
- Keep manifests in `data/video-motion/` under version control; they are the source of truth.

## Voiceover pipeline

To replace the old narrated summary with a professional deep-calm voice:

```bash
FAL_KEY=... node scripts/generate-article-voiceover.mjs --slug the-02-percent-synthesis-problem --voice dan
```

This downloads the Orpheus TTS WAV, converts it to a normalized AAC track in
`media/projects/voice-tracks/`, and prints the duration. Use that duration to
set scene durations in the manifest so the motion cut matches the narration.

For a tighter loudness target, normalize the generated track before muxing:

```bash
ffmpeg -i media/projects/voice-tracks/<slug>-voice-dan.m4a \
  -af "loudnorm=I=-16:TP=-1.5:LRA=7" \
  -c:a aac -ar 44100 -ac 1 -b:a 128k \
  media/projects/voice-tracks/<slug>-voice-dan-norm.m4a
```

Then render the final public video:

```bash
node scripts/build-article-motion-video.mjs \
  --slug the-02-percent-synthesis-problem \
  --audio media/projects/voice-tracks/<slug>-voice-dan-norm.m4a \
  --out public/videos/<slug>.mp4
```

Finally regenerate the poster and VTT:

```bash
node scripts/generate-motion-vtt.mjs --slug the-02-percent-synthesis-problem
ffmpeg -ss 00:00:10 -i public/videos/<slug>.mp4 -update 1 -frames:v 1 -q:v 2 public/videos/<slug>-poster.jpg
```

## Next steps for richer motion

1. **Scene-aware durations**: read the narration VTT and set `duration` per scene to match cue boundaries.
2. **Layered graphics**: add lightweight SVG overlays (progress bar, chapter titles) as additional inputs in the filter graph.
3. **Beat-synced cuts**: parse audio transients and align transition frames to them.
4. **Motion review gate**: extend `scripts/video-quality-reviewer.mjs` to sample motion renders for blank frames and unreadable text.
