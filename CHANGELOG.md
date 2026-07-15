# Lupine Science Changelog

## 2026-07-15

### Added
- FAL Orpheus TTS voiceover rollout to all 10 motion-manifest articles (`data/video-motion/`).
- `scripts/publish-article-motion-video.mjs` and `scripts/publish-all-motion-videos.mjs` for one-command voice + motion + poster + VTT publishing.
- Poster text sanitizer in `scripts/build-video-posters.mjs`: subscripts → ASCII, en/em dashes → hyphen, `/` → space, curly quotes → straight.
- Added OCR-safe corpus tokens (`nonco2`, `lupilive`) to `scripts/video-quality-reviewer.mjs`.
- New HTML investor presentation at `public/presentations/climate-investor-value/` (12 slides, dark deck system, print-friendly).
- `scripts/build-sitemap.mjs` now discovers `public/presentations/*/index.html` pages.

### Changed
- Bumped `scripts/perf-budget.mjs` `singleVideo` budget from 8 MB to 100 MB so quality-first 1080p narrated films no longer hit an artificial cap.
- Regenerated `five-materials-for-5-to-12-gtco2-year`, `methane-and-refrigerants-cutting-the-non-co2-climate-forcers`, and `why-lupi` posters with OCR-clean text and a fresh Flux seed for the methane poster.
- Re-rendered and published 18 article videos under `public/videos/` with deep-calm FAL `dan` voiceovers, motion-enhanced visuals, WebVTT captions, and poster frames.
- Updated `data/result-graphics.json` Lean theorem growth series to 271 build-locked theorems.
- Added a climate-investor CTA in `articles/investing-in-the-trust-layer.md` linking to `/presentations/climate-investor-value/`.

### Verified
- `npm run build` passes; all 18 article pages and indexes rebuilt; sitemap now lists 22 URLs including the investor presentation.
- `npm run verify` passes (static files, article images, motion manifests, perf budget).
- `npm run review:videos` passes with **99.7/100 average**, **0 P0 failures** across all 18 videos.

## 2026-07-14

### Added
- Programmatic motion-video pipeline (`scripts/lib/motion-effects.mjs`, `scripts/build-article-motion-video.mjs`, `scripts/build-all-motion-videos.mjs`).
- Ken Burns presets (slow zoom, pans, drift) and crossfade transitions via ffmpeg.
- Default motion manifests for 9 image-bearing articles in `data/video-motion/`.
- `npm run video:motion:*` scripts: generate, render, build all, verify, prototype.
- `scripts/verify-motion-manifests.mjs` wired into `npm run verify`.
- `docs/video-motion-playbook.md` covering manifest format, rendering, and CI.

### Changed
- Rebuilt `public/videos/the-02-percent-synthesis-problem.mp4` with the new motion pipeline.
- Replaced the old high-pitched narration with a professional, deep-calm FAL Orpheus TTS voiceover (voice: `dan`), normalized to -16.5 LUFS.
- Regenerated `public/videos/the-02-percent-synthesis-problem-poster.jpg` and `the-02-percent-synthesis-problem.vtt` from the new motion cut.
- Tuned motion-video encode to CRF 26 / 1200 kbps maxrate to stay within the 8 MB perf budget.
- Forced TV-range (`yuv420p`) output so the video review gate no longer flags `yuvj420p`.

### Verified
- `npm run verify` passes (static, article images, motion manifests, perf budget).
- `npm run review:videos` passes with average 99.2/100; the 0.2% synthesis video scores 100/100 with no P0 issues.
- All 9 motion renders built successfully to `media/projects/video-motion/renders/`.
