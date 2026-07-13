# Five Materials — v3 animator evidence

Generated: 2026-07-13
Branch: `article-videos/t_b001d1d3`

## Review master

- Source: `index.html`
- Captions: `captions/five-materials.en.vtt`
- MP4: `renders/five-materials-v3-review-1080p.mp4`
- SHA-256: `c07824bf7c33b3c033152d3a7f85a4cabf34d447a7dc389514fa9fd3e98784f5`
- Video: H.264, 1920×1080, 30 fps, 2772 frames
- Audio: AAC, 48 kHz, stereo
- Container duration: 92.437333 s
- Full decode: PASS (`evidence/render-v3-full-decode.txt`)

## Automated gates

Pinned CLI: `hyperframes@0.7.48`

- `evidence/lint-v3.json` — PASS, 0 errors, 0 warnings
- `evidence/validate-v3.json` — PASS, 0 errors, 0 warnings, 0 contrast failures
- `evidence/inspect-v3.json` — strict PASS, 0 errors, 0 warnings, 0 issues
- `evidence/render-v3.txt` — high-quality 1080p render log
- `evidence/render-v3-sha256.txt` — review-master hash
- `evidence/render-v3-ffprobe.json` — stream/container metadata

## Decoded-frame review package

- Manifest: `review-frames-v3/manifest.tsv` and `review-frames-v3/manifest.json`
- Full-resolution decoded samples: `review-frames-v3/frame-*.jpg` — 66 unique JPEG frames
- Contact sheets: `contact-sheets-v3/contact-sheet-01.jpg` through `contact-sheet-06.jpg`
- Animator scorecard: `evidence/self-scorecard-v3.md`
- Per-frame binary scorecard: `evidence/animator-self-scorecard-v3.tsv` — 66/66 PASS, minimum 9/10
- Caption spelling/timing evidence: `evidence/caption-qa-v3.md`
- Independent-review brief: `evidence/independent-review-handoff-v3.md`
- Reproducible extractor: `scripts/build-v3-review-evidence.py`

Manifest integrity: PASS. All 66 rows have unique filenames, monotonic timestamps, existing decoded JPEGs, frame numbers, sampling reasons, and the exact source-master SHA above.

## Critical closure observations

- 0.000 / 0.100s: substantive composed title card; not blank.
- 47.700 / 48.000 / 48.300s: no text obstruction.
- 49.400 / 49.700 / 50.000s: incoming shared-failure headline is fully opaque and legible.
- 74.700 / 75.000 / 75.300s, 79.700 / 80.000 / 80.300s, and 83.700 / 84.000 / 84.300s: formula, body copy, and caption rule remain separated.
- 90.376 through 92.366s: outro and final hold are complete, stable, branded, and fully opaque.

Animator self-QA found no final decoded frame below 7/10.

## Repository verification

After `npm ci` restored lockfile dependencies:

- `npm run test`: PASS, 74/74
- `npm run lint`: PASS
- `npm run typecheck`: PASS (no TypeScript files; skipped by project script)
- `npm run build`: PASS

## Review status

Animator evidence gate: PASS.
Independent reviewer gate: REQUIRED. No director/reviewer approval is claimed by this handoff.
