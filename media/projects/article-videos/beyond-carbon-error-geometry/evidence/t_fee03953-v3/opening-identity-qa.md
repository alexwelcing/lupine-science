# Opening identity QA — t_fee03953 v3

Status: **ANIMATOR PASS — independent Fable review required**

## Candidate identity

- Master: `renders/beyond-carbon-error-geometry-v3-review-1080p.mp4`
- Master SHA-256: `2e42e2d7498233d61ac89e1a166680215f872f3881f9a8a951fe57ec75d23bf4`
- Source: `compositions/logo-sting.html`
- Evidence: `evidence/t_fee03953-v3/`
- Manifest: 101 full-resolution frames; 12 contact sheets

## Change

The opening lockup now keeps the canonical Lupine mark and wordmark visible from frame zero while also showing the series label, episode marker, proof-status line, proof-first readout, and frame readout. Their settle motion is transform-led, so no opening sample depends on a fade from blank or an identity-only mark.

## Exact decoded opening review

| Timestamp | Frame | Animator score | Finding |
|---:|---:|---:|---|
| 00:00:00.000 | F0000 | 10/10 | Lupine mark and wordmark, `LUPINE SCIENCE · ARTICLE VIDEO`, `FIELD NOTE / 01`, `ERROR GEOMETRY · OPEN`, `PROOF FIRST · ONE CLAIM PER BEAT`, and the frame readout are visible, unclipped, and balanced. No blank, mark-only, or identity-only defect. |
| 00:00:00.100 | F0003 | 10/10 | Same complete lockup remains visible and stable. No blank sample, low-opacity focal, collision, clipping, or hierarchy defect. |
| 00:00:00.500 | F0015 | 10/10 | Opening continuity preserved while the wash and trace build. |
| 00:00:01.000 | F0030 | 10/10 | Complete branded lockup; trace/corner motion does not obscure copy. |
| 00:00:02.000 | F0060 | 10/10 | Complete branded lockup; transition toward article content remains intentional. |

Exact MP4 decodes are `decoded-frames/frame-000-f0000-at-00-00-00-000.jpg` through `frame-004-f0060-at-00-00-02-000.jpg`; `contact-sheets/contact-sheet-01.jpg` brackets the opening through the first article frames.

## Objective gates

- HyperFrames lint: 0 errors, 0 warnings.
- HyperFrames validate: 0 errors, 0 warnings, 0 contrast failures.
- HyperFrames strict inspect includes 0, 0.1, 0.5, 1.0, 2.0, and all four prior transition defects: 0 issues.
- Computed typography: 18 requested selectors, 0 failures.
- Full MP4 decode: exit 0.
- Video: H.264, 1920×1080, 30 fps, 3,360 frames, 112.000 s.
- VTT: byte-identical to `transcript/captions.vtt`; CSpell found 0 issues.
- Required exact timestamps present in the manifest: 0.000, 0.100, 61.612, 74.991, 93.935, and 106.920 seconds.

## Reviewer boundary

This self-QA does not satisfy the independent gate. Fable must inspect and score every manifest row, with explicit scores for F0000 and F0003, before this task can close.
