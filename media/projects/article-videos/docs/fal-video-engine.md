# FAL-Powered Article Video Engine

> A compositional, enrichment-first production pipeline for Lupine Science article videos.
> We own the scene manifest, brand rules, timing, and assembly. FAL supplies speech,
> image generation, and optional image-to-video motion as model enrichments.

---

## 1. Why a new engine

The previous workflow pushed too much invention through a single prescribed path:
script → storyboard → HyperFrames composition → render → review. When any asset was
wrong, the whole composition had to be reopened, retimed, and re-rendered. Review
frames came back unusable because reviewers were checking raw renders before the
underlying assets (voice, images, captions) were solid.

The new engine separates **asset production** from **assembly**. Each asset is
produced, versioned, reviewed, and locked before it enters the HyperFrames timeline.
FAL accelerates the asset layer; HyperFrames remains the deterministic assembler.

---

## 2. Pipeline overview

```
Article markdown + approved narration script
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  TTS enrichment │     │ Image enrichment│     │ Data / chart    │
│  (FAL ElevenLabs│     │ (FAL flux/dev)  │     │ renders (local) │
│   turbo-v2.5)   │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   audio/<slug>.wav        images/<scene>.png      charts/<scene>.svg
         │                       │                       │
         └───────────┬───────────┴───────────┬───────────┘
                     ▼                       ▼
         ┌─────────────────────┐   ┌─────────────────────┐
         │  Asset review gate  │   │  Brand compliance   │
         │  (reviewer, binary) │   │  check (automated)  │
         └──────────┬──────────┘   └──────────┬──────────┘
                    └───────────┬─────────────┘
                                ▼
                   ┌─────────────────────────┐
                   │  Scene manifest (YAML)  │
                   │  cues, assets, timing   │
                   └───────────┬─────────────┘
                               ▼
                   ┌─────────────────────────┐
                   │  HyperFrames assembly   │
                   │  deterministic render   │
                   └───────────┬─────────────┘
                               ▼
                   ┌─────────────────────────┐
                   │  Final review + publish │
                   └─────────────────────────┘
```

---

## 3. FAL model layer

| Purpose | Endpoint | Why |
|---|---|---|
| Narration TTS | `fal-ai/elevenlabs/tts/turbo-v2.5` | Fast, high-quality, deterministic with seed, direct MP3/WAV output. |
| Hero / key frames | `fal-ai/flux/dev` | Best quality/cost ratio for editorial illustrations at 16:9. |
| Premium hero frames | `fal-ai/flux-2-pro` or `fal-ai/flux-pro/v1.1-ultra` | Reserved for publication hero images where extra fidelity is worth the cost. |
| Subtle motion | `fal-ai/nano-banana-2/edit` or image-to-video | Optional; used sparingly to bring a locked still frame to life, not to generate whole scenes. |

Voice direction is now **soothing and clear technical robot**: calm, precise,
moderate pace, no vocal fry, no urgency. Default voice is `Jessica`; alternatives
are tested per article and locked in the manifest.

---

## 4. Asset manifest schema

Each video is driven by `manifest.yaml` in its episode directory:

```yaml
slug: a-field-not-a-neural-net
script: narration-script.md
voice:
  endpoint: fal-ai/elevenlabs/tts/turbo-v2.5
  voice: Jessica
  speed: 1.0
  seed: 42
scenes:
  - id: hook
    start: 0
    duration: 8
    narration: "What if the next battery cathode was a field, not a neural net?"
    visual:
      type: image
      endpoint: fal-ai/flux/dev
      prompt: >
        Minimal editorial illustration of an electric battery cathode material
        rendered as a soft continuous field, warm cream paper background #faf9f6,
        indigo accent lines #3d4db3, clean vector style, no text, 16:9
      size: landscape_16_9
      seed: 42
  - id: evidence-chart
    start: 45
    duration: 15
    narration: "The validation rate is point two percent."
    visual:
      type: chart
      source: ../../article-visuals/a-field-not-a-neural-net/synthesis-funnel.svg
```

`scripts/fal-enrich.mjs` reads the manifest, generates missing assets, and writes
`assets/<slug>/manifest.json` with local paths and checksums for the assembly step.

---

## 5. Tooling

### `scripts/fal-enrich.mjs`

```bash
# Generate all FAL assets for an episode
node scripts/fal-enrich.mjs --manifest a-field-not-a-neural-net/manifest.yaml

# Generate only TTS
node scripts/fal-enrich.mjs --manifest a-field-not-a-neural-net/manifest.yaml --only tts

# Generate only images
node scripts/fal-enrich.mjs --manifest a-field-not-a-neural-net/manifest.yaml --only images

# Dry run: print what would be generated
node scripts/fal-enrich.mjs --manifest a-field-not-a-neural-net/manifest.yaml --dry-run
```

The script:
1. Loads `FAL_KEY` from `process.env.FAL_KEY`.
2. Validates the manifest against `fal-enrich-manifest.schema.json`.
3. Downloads generated assets to `assets/<slug>/audio/` and `assets/<slug>/images/`.
4. Records SHA-256, request ID, and seed in `assets/<slug>/ledger.json`.
5. Never overwrites an existing asset unless `--force` is passed.

### `scripts/brand-check.mjs`

Validates that every generated image uses the approved palette and typography
constraints before it enters the composition. Runs locally without API calls.

---

## 6. Review gates

1. **Asset gate** — reviewer checks the locked TTS audio and every image/chart in
   isolation. No open P0/P1 on assets before assembly.
2. **Composition gate** — HyperFrames lint/validate/inspect passes; snapshots match
   approved baselines.
3. **Render gate** — final 1080p render passes ffprobe, caption sync, and size budget.
4. **Director gate** — director watches the exact final render and approves against its
   SHA-256.

---

## 7. Non-goals

- **Do not generate whole videos with FAL video models.** FAL is an enrichment layer,
  not a replacement for editorial composition.
- **Do not use FAL for final assembly.** HyperFrames + FFmpeg remain the deterministic
  render path.
- **Do not skip the asset gate.** A bad asset entering the composition is still a
  blocker.

---

## 8. Getting started

1. Confirm the FAL MCP server is wired in Hermes (`hermes mcp list` shows `fal-ai`).
2. Ensure `FAL_KEY` is exported in your shell or in `~/.hermes/profiles/<profile>/.env`.
3. Create an episode manifest from `templates/episode-manifest.yaml`.
4. Run `node scripts/fal-enrich.mjs --manifest <slug>/manifest.yaml --dry-run`.
5. Review the dry-run output, then run without `--dry-run` to lock assets.

---

## 9. Changelog

- 2026-07-13 — Engine design and `fal-enrich.mjs` scaffold created; FAL MCP server
  wired in Hermes; ElevenLabs `turbo-v2.5` and `flux/dev` verified end-to-end.
