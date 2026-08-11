# scripts/lib

Shared utilities consumed by builders in `scripts/`.

## Convention

- One file per concern, named after what it does (e.g. `head-meta.mjs`, not `headMeta.mjs`).
- ESM, named exports only. Builders import via `from './lib/whatever.mjs'`.
- Pure: no shared mutable state. Each builder owns its own DB/file/process lifecycle.
- Fail-closed: helpers throw or return a sentinel rather than swallow errors. Builders wrap calls and exit non-zero on throw.
- Skip-mode aware: helpers that read external sources accept the same `LUPINE_*` env vars the project standardizes on (currently `LUPINE_FORCE_ATLAS_WIKI=1` for strict mode) and respect a "use the committed fallback" path.

## Current modules

- `article-markdown.mjs` — markdown rendering with footnote + katex plugins (consumed by `build-articles.mjs`).
- `audio-normalize.mjs` — LUFS normalization helpers.
- `head-meta.mjs` — `<title>` / `og:title` / `twitter:title` from one source. Closes the title-consistency defect class.
- `brand-header.mjs` — site header SVG mark and nav. Closes brand-mark duplication across atlas builders.
- `live-smoke-suite.mjs` — publication smoke gate (consumed by `scripts/smoke-live.mjs`).
- `motion-effects.mjs` — motion manifest helpers.
- `proof-pack-metadata.mjs` — proof-pack JSON read/write helpers.
- `synthesize-narration.mjs` — narration synthesis glue.
- `text-quality.mjs` — text QA helpers.
- `tts-provider.mjs` — TTS provider wrappers.
- `verify-narration.mjs` — narration verification.

## Adding a module

1. Pick a verb-noun name that reads as a utility, not a step in a pipeline (`head-meta.mjs`, not `emit-title-tags.mjs`).
2. Export named functions; default exports discouraged.
3. No cross-module state.
4. Add a one-paragraph header comment explaining what the module owns and what it does NOT own.
