# Publication evidence — t_f7a3a2fc

Candidate: `../../../renders/water-and-air-correcting-the-molecules-we-drink-and-breathe-candidate-v3-1080p.mp4`
Captions: `../../../captions.vtt`

## Package contents

- `frame-manifest.csv`: 47 decoded 1920×1080 samples, including all seven director-required exact timestamps and all scene boundaries with bracketing frames.
- `decoded/`: full-resolution frames decoded from the candidate MP4, not browser snapshots.
- `contact-sheet-1.jpg` through `contact-sheet-4.jpg`: labeled review sheets for all 47 frames.
- `exact/decoded-53.0s.png` and `exact/decoded-68.0s.png`: focal-mechanism proof frames decoded from the candidate.
- `checks/`: raw HyperFrames lint, validate, strict-inspect JSON and the complete `npm run check` log.
- `metadata/`: candidate ffprobe JSON, SHA-256, and artifact hashes.
- `captions-validation.txt`, `captions-aspell-raw.txt`, and `captions-spellcheck.md`: WebVTT timing and spelling evidence.
- `scorecard.csv`: reviewer worksheet covering every decoded frame. Previously reviewed exact samples carry their formal scores; all other rows remain explicitly pending independent review.

## Verified gates

- Candidate: H.264 1920×1080 at 30 fps, AAC stereo 48 kHz, 106.026667 seconds.
- Full-stream decode: exit 0, no ffmpeg errors.
- HyperFrames lint: 0 errors, 0 warnings, no findings.
- HyperFrames validate: 0 errors, 0 warnings, 0 contrast failures.
- HyperFrames strict inspect: 0 errors, 0 warnings, 0 issues across 21 programmed timestamps.
- `npm run check`: exit 0.
- WebVTT: 14 monotonic, non-overlapping cues ending at 105.940 seconds; no unapproved spelling finding.
- Exact silent-frame smoke: 53.0s shows dominant Li⁺ passage / Mg²⁺ rejection; 68.0s shows dominant CH₂O → Pt* → CO₂ + H₂O conversion. Both score 8/10 in the animator smoke check, with no clipping, overlap, or illegible mechanism text. Independent reviewer authority remains required.
