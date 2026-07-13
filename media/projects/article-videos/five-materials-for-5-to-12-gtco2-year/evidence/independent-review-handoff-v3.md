# Five Materials v3 independent-review handoff

Status: ready for independent director/reviewer evaluation. This document does not claim approval.

## Master

- File: `renders/five-materials-v3-review-1080p.mp4`
- SHA-256: `c07824bf7c33b3c033152d3a7f85a4cabf34d447a7dc389514fa9fd3e98784f5`
- Decode: PASS (`evidence/render-v3-full-decode.txt`)
- Metadata: H.264, 1920×1080, 30 fps, 2772 frames, 92.437333 s; AAC stereo, 48 kHz (`evidence/render-v3-ffprobe.json`)

## Automated gates

Pinned CLI: `hyperframes@0.7.48`

- `evidence/lint-v3.json`: 0 errors, 0 warnings
- `evidence/validate-v3.json`: 0 errors, 0 warnings; 0 contrast failures
- `evidence/inspect-v3.json`: strict mode, 0 errors, 0 warnings

## Decoded-master visual evidence

- `review-frames-v3/manifest.tsv`
- `review-frames-v3/manifest.json`
- `review-frames-v3/frame-*.jpg` — 66 unique MP4-decoded frames
- `contact-sheets-v3/contact-sheet-01.jpg` through `contact-sheet-06.jpg`

The manifest records timestamp, 30 fps frame number, source-master SHA, sampling reason, and filename. Sampling includes five-second cadence, every VTT cue boundary, ±0.2s transition brackets, exact-risk defect timestamps, opening samples, and final-hold samples.

## Supporting evidence

- `evidence/render-v3-sha256.txt`
- `evidence/render-v3-ffprobe.json`
- `evidence/render-v3-full-decode.txt`
- `evidence/render-v3.txt`
- `evidence/review-frame-extraction-v3.txt`
- `evidence/caption-qa-v3.md`
- `evidence/self-scorecard-v3.md`
- `evidence/animator-self-scorecard-v3.tsv` (one binary-criteria row per decoded frame; minimum self-score 9/10)
- `evidence/v3-source-snapshots/` (source-level supplemental snapshots; not a substitute for decoded evidence)
- `scripts/build-v3-review-evidence.py` (deterministic decoded-frame extractor)

## Required reviewer decision

Review the MP4 and decoded sheets against the P0 directive, especially 0.000/0.100, 47.700/48.000/48.300, 49.400/49.700/50.000, 74.700/75.000/75.300, 79.700/80.000/80.300, 83.700/84.000/84.300, and 90.376–92.366s. Record explicit APPROVED or CHANGES REQUIRED. Animator self-QA found no final decoded frame below 7/10, but only the independent reviewer can close the approval gate.
