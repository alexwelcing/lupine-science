# Review handoff — Beyond Carbon: Error Geometry v2

Status: **ready for independent Fable/director review; not approved**

## Exact review package

- Source root: `media/projects/article-videos/beyond-carbon-error-geometry/`
- Review master: `renders/beyond-carbon-error-geometry-v2-review-1080p.mp4`
- Synchronized captions: `renders/beyond-carbon-error-geometry-v2-review-1080p.vtt`
- Master SHA-256: `ccf781aff8f3dcc9f74b9eaf61c4cd0b72ca3ad18f30f116c9344fa65b2f7ef6`
- Evidence root: `evidence/t_1c21b85a-v2/`
- Review manifest: `evidence/t_1c21b85a-v2/manifest.tsv`
- Animator report: `evidence/t_1c21b85a-v2/animator-visual-qa.md`
- Animator scorecard: `evidence/t_1c21b85a-v2/animator-self-scorecard.csv`

The versioned VTT is byte-identical to `transcript/captions.vtt`. Package hashes and the `cmp` result are in `review-package.sha256.txt`.

## What changed for this pass

1. Restored the previously reviewed composition package from Git commit `1ff1ae3` into the current main worktree.
2. Raised visible 1080p labels/data callouts to at least 36 px and body/CTA copy to at least 48 px.
3. Added a browser-computed typography inventory across the requested selectors and the actual outro sub-composition.
4. Replaced overlaying vertical wipes with clean scene handoffs after the first v2 render revealed rule/text crossings at mandated transition frames.
5. Suppressed the section lower-third banners that obscured graph labels during transition states.
6. Made the outro substantive from its first frame and cut the outgoing article scene at the outro boundary.
7. Corrected caption spellings/notation (`PFAS`, `2.8 Gt`) and produced a versioned synchronized WebVTT.
8. Re-rendered and regenerated all evidence from the final source and final master.

## Objective completion evidence

- HyperFrames lint: PASS — 0 errors, 0 warnings.
- HyperFrames validate: PASS — 0 errors, 0 warnings, 0 contrast failures.
- HyperFrames strict inspect: PASS — 0 issues.
- Computed typography: PASS — 18 selectors, 0 failures.
- CSpell captions: PASS — 0 issues.
- Full ffmpeg decode: PASS — exit 0.
- Master metadata: H.264, 1920×1080, yuv420p, 30 fps, 112.000 s; AAC stereo 48 kHz.
- Decoded review coverage: 98 frames, 11 contact sheets, mandatory opening, five-second cadence, narration cue starts, transition brackets, exact defect timestamps, final hold.
- Animator visual review: PASS on all 98 manifest rows; no animator-scored frame below 7/10.

## Required independent reviewer action

Fable/director must:

1. verify the master hash before review;
2. independently score every row in `manifest.tsv` rather than copying the animator scorecard;
3. inspect the full-resolution frames and contact sheets, including exact timestamps 0.000, 0.100, 61.612, 74.991, 93.935, and 106.920 seconds;
4. enforce zero tolerance for clipping, overlaps, wipes/rules crossing text, focal competition, blank states, and accidental low-opacity focal content;
5. record PASS/FAIL and route any failing frame back through the same evidence loop.

This package is deliberately handed off in a blocked state. Only independent reviewer/director approval may close the task.
