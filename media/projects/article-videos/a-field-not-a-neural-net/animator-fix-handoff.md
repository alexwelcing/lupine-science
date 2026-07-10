# Animator fix handoff — A Field, Not a Neural Net

Date: 2026-07-10
Task: `t_f7f14fe2`
Status: ready for independent frame/director re-review

## P0/P1 fixes

- P0-02 / P1-02: replaced the four failing 1280×720 raster charts with native SVG evidence graphics whose intrinsic canvas is 1920×1080 and whose visible labels are at least 36 px.
- P0-03: generated 26-cue English WebVTT captions from the approved word-level transcript; validation confirms monotonic cues through 116.600 s against the 117.288 s master.
- P1-01: extended every scene 0.5 s beyond its handoff so the outgoing designed frame remains visible during each indigo wipe. Exact-boundary snapshots are no longer blank or wipe-only.
- P1-03: encoded a 1280×720 H.264/AAC web version at 5,205,681 bytes / 117.312 s = 2.662 MB/min, below the 3 MB/min gate.
- Director P0/P1 timing rejection: extended the composition/audio trim to 117.288 s and retimed worlds to approved word-cue starts at 15.70, 32.58, 47.46, 66.08, 83.66, 100.22, and 111.78 s. The final thesis now plays in full.

## Verification

- `lint`: 0 errors, 0 warnings
- `validate`: 0 errors, 0 warnings, 0 contrast failures
- strict `inspect` at chart and transition timestamps: 0 errors, 0 warnings
- targeted 12-frame snapshot set visually checked: all former chart and near-blank transition failures resolved
- review render: H.264/AAC, 1920×1080, 30 fps, 117.312 s
- web render: H.264/AAC, 1280×720, 30 fps, 117.312 s, 2.662 MB/min

## Artifacts

- Source: `index.html`
- Native charts: `assets/native/*.svg`
- Captions: `captions/a-field-not-a-neural-net.en.vtt`
- Review render: `renders/a-field-not-a-neural-net-review-v2.mp4`
- Web render: `renders/a-field-not-a-neural-net-web-v2-720p.mp4`
- Targeted snapshots: `snapshots-fixes/`
- Machine-readable checks: `evidence/fixes/`
