# P0/P1 frame remediation — t_9797d2bf

## Result

All frame-level P0/P1 groups from `reviews/beyond-carbon-error-geometry-frame-review.md` are addressed in the current composition and refreshed render:

- P0 typography: visible labels/callouts use the 36 px review floor; narrative/CTA copy uses the 48 px floor.
- P0 opening identity: the canonical Lupine mark and wordmark are visible at both 0.000 s and 0.100 s.
- P1 transitions: cue samples at 61.612 s, 74.991 s, 93.935 s, and 106.920 s retain a complete designed frame and focal hierarchy.
- The scene-05 `CN 12 · ZERO ERROR` callout was separated from the chart axis label and given a paper backing to remove the remaining collision.

## Verification

- `npm run check`: PASS — lint 0 errors / 0 warnings; validate 0 errors / 0 warnings / 0 contrast failures; strict inspect 0 issues.
- Targeted snapshot smoke test: 11 samples at 0, 0.1, 3.72, 5, 20, 61.612, 74.991, 93.935, 106.92, 108.6, and 110 seconds.
- Full high-quality render: PASS.
- Full A/V decode via `ffmpeg -v error -i <render> -f null -`: PASS with no decode errors.
- Render probe: H.264 + AAC, 1920×1080, 30 fps, 112.021333 s, 14,974,020 bytes.
- SHA-256: `a3ab691178946a803198d09ea7a5c3116bae91968ed25871810f8b6d27df94b4`.

## Artifacts

- Composition: `index.html`
- Final render: `renders/beyond-carbon-error-geometry-final-1080p.mp4`
- Targeted snapshots: `snapshots-p0p1-t_9797d2bf/`
- Render probe: `evidence/p0p1-render-probe-t_9797d2bf.json`
- Render checksum: `evidence/p0p1-render-sha256-t_9797d2bf.txt`
