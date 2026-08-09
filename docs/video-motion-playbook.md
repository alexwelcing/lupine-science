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

### One command, start to finish

```bash
node scripts/publish-article-motion-video.mjs --slug the-02-percent-synthesis-problem
```

That synthesizes the narration, verifies it, renders the video, writes the
poster, writes the caption track, and runs the audio release gate. The
hand-assembled sequence that used to live in this section is gone — see
"Why the manual sequence was removed" below.

### Narration scripts are inputs, captions are outputs

The narration script lives in `data/narration-scripts/<slug>.json` as an array
of paragraphs. Nothing in the pipeline writes to it.

It used to be read from `public/videos/<slug>.vtt` — which is also where the
caption step *writes*. That loop destroyed all ten narration scripts: every
`generate-motion-vtt.mjs` run replaced the prose with scene titles, and the next
publish run then narrated the titles. The prose survives only in git history:

```bash
node scripts/recover-narration-scripts.mjs            # all films
node scripts/recover-narration-scripts.mjs --check    # verify against 4641d96
```

### Choosing a TTS provider

```bash
LUPINE_TTS_PROVIDER=minimax  # default: MiniMax speech-2.8-hd
LUPINE_TTS_PROVIDER=fal      # FAL Orpheus; also --tts-provider on the CLI
```

Check what is usable right now, and see the numbers a track is judged on:

```bash
node scripts/dev/test-tts.mjs                    # default provider, short sample
node scripts/dev/test-tts.mjs --tts-provider fal
```

MiniMax is the default because the FAL account is locked
(`403 User is locked. Reason: Exhausted balance.`). The FAL path is kept working,
not deleted — set `LUPINE_TTS_PROVIDER=fal` once the balance is restored. Adding
a third provider means adding one object to `PROVIDERS` in
`scripts/lib/tts-provider.mjs`; nothing else changes.

Credentials, first match wins:

| Provider | Sources |
| --- | --- |
| `minimax` | `MINIMAX_API_KEY`, `.keys/minimax-key`, `~/.hermes/auth.json` (`minimax-oauth`) |
| `fal` | `FAL_KEY`, `.keys/fal-key` |

### Every track is verified, never trusted

Ten films published with 33-71% of their intended script and one carried ~25 s of
hallucinated speech, because nothing compared the returned audio against the text
that was sent. A short track is a perfectly valid audio file: it normalizes to
spec, muxes cleanly, and matches the video duration — because scene durations were
derived *from* it. Only duration-versus-word-count exposes it.

So `scripts/lib/verify-narration.mjs` measures every paragraph and the assembled
track, and refuses anything that:

- delivers **under 85%** of the duration its word count predicts at 145 wpm (truncation);
- runs longer than **1.9x expected + 4 s** (hallucinated padding);
- reads **more than 1.6x the film's median chunk rate** — a paragraph racing past
  the rest of the film means words were counted that were never spoken.

Failures print words, expected seconds, actual seconds, ratio and measured wpm, so
the log line alone is diagnosable. The ceiling is deliberately loose because
Lupine narration is dense with figures: "2.2 million" is one word and many
syllables, so real audio routinely exceeds a naive word-count prediction.

Per-film evidence is written to
`media/projects/article-videos/<slug>/narration.json`.

### Captions come from the verified narration

`build-articles.mjs` emits `<track ... default>`, so a VTT is **on screen
automatically**. Never write a transcript of audio you have not verified.

The publisher synthesizes one file per paragraph, so each paragraph's real
duration is known and cue boundaries are exact — no speech-to-text, no drift. Cue
text is the script that was spoken; cue times come from the audio that was
produced.

`scripts/generate-motion-vtt.mjs` writes scene *titles*, not narration, and is for
scratch manifests only. It now refuses to overwrite a narration transcript unless
forced.

### Why the manual sequence was removed

The old instructions said to normalize at `TP=-1.5`, mux, then generate a VTT from
scene titles. Two defects were baked in:

- **`TP=-1.5` fails the release gate.** The track is AAC-encoded twice (once on
  normalize, once on mux) and each lossy pass overshoots its target, landing
  -1.5..-0.8 dBTP against the gate's -1.0 dBTP ceiling. The publisher uses
  `TP=-2.0`, which clears with headroom at unchanged loudness.
- **Scene-title VTTs mislead viewers and blind the gate.** A film's worth of
  titles is 35-74 words against 270-320 words of script, so `speech-rate-in-band`
  divided real narration time by placeholder word counts and reported 43-98 wpm
  for narration actually running 118-149 wpm.

## Next steps for richer motion

1. **Scene-aware durations**: scene durations are currently uniform. The narration
   now exposes exact per-paragraph cue boundaries in
   `media/projects/article-videos/<slug>/narration.json`, so scenes could be cut
   to paragraph boundaries instead of divided evenly.
2. **Independent transcript audit**: cue text is the script that was *sent*, and
   the length checks confirm the audio is the right size to contain it. An ASR
   pass would confirm it is the right *words*. No ASR model is installed on the
   build host; `faster-whisper` would close this gap.
3. **Layered graphics**: add lightweight SVG overlays (progress bar, chapter titles) as additional inputs in the filter graph.
4. **Beat-synced cuts**: parse audio transients and align transition frames to them.
5. **Motion review gate**: extend `scripts/video-quality-reviewer.mjs` to sample motion renders for blank frames and unreadable text.
