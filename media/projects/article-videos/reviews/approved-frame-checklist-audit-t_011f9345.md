# Approved article-video frame audit — t_011f9345

Date: 2026-07-12  
Reviewer: visual-tester  
Checklist: pinned Single-Frame Rejection Gate, task `t_29dd9f56`

## Scope and decision rule

The board currently records three final article-video masters as explicitly **APPROVED FOR WEB** by a completed director final-render task. Those three masters are the complete audit population. Storyboard-only approvals, frame-gate-only passes without final director sign-off, rejected finals, and training fixtures are excluded.

The new gate is binary: one defect in one sampled 1920×1080 encoded frame causes rejection. Tested defect classes are unreadable/clipped/crowded typography, rendered contrast below WCAG AA, focal-element occlusion, visible encode/render artifacts, illegible data labels, brand-mark violations, and off-model grading.

Verdict vocabulary:

- **KEEP** — existing decoded-frame evidence and final review show no new-gate defect.
- **REVISE** — no immediate-rejection defect, but a non-blocking improvement is advisable.
- **REJECT** — at least one immediate-rejection defect is present. Return for correction.

## Results

| Approved master | Board approval | Verdict | New-gate result |
|---|---|---|---|
| Five Materials That Could Unlock 5–12 GtCO₂/Year | `t_3a1ee586` | **REJECT** | Decoded 1080p samples at 48.0s and 75.0–84.0s show divider/transition lines crossing and clipping substantive copy. This fails unreadable typography/data-label and focal-occlusion criteria. |
| Investing in the Trust Layer | `t_5e895005` | **KEEP** | Final director pass includes a 29-frame decoded sweep and exact re-check of all 16 formerly flagged timestamps. Funnel, pipeline, three-bay chart, proof/flywheel, transitions, captions, grade, and end card pass with no remaining timestamped defect. |
| Water and Air: Correcting the Molecules We Drink and Breathe | `t_52ea4e99` | **KEEP** | Corrected frame re-review scores all seven formerly flagged frames ≥7/10; full 2-second sweep reports no clipping, collision, unsafe crop, or overlap; contrast/strict inspection pass; palette and brand treatment pass. |

Totals: **3 approved masters audited · 1 reject · 0 revise · 2 keep**.

## Per-asset evidence

### 1. Five Materials That Could Unlock 5–12 GtCO₂/Year — REJECT

Master: `five-materials-for-5-to-12-gtco2-year/renders/five-materials-v1-review-1080p.mp4`  
SHA-256: `4114e616bd65ed7019a74f63b557b8856222a93a5b69e644e932328a2b33ab5d`  
Probe: H.264, 1920×1080, 30 fps, 92.437333s.

Failures:

- `00:48.000 · focal occlusion / unreadable typography · lower evidence copy · horizontal transition/divider line cuts through meaningful copy · keep wipe/rule outside all glyph boxes and resample boundary frames`
- `01:15.000 · unreadable typography / data labels · RAW MODEL / MEASURED FIELD / correction formula block · horizontal divider crosses and clips the lower formula lines · reflow block and rule with positive clearance`
- `01:20.000 · unreadable typography / data labels · same correction formula block · formula remains clipped by divider; lower evidence sentence is crowded against the rule · reflow without shrinking type`
- `01:24.000 · unreadable typography / data labels · same correction formula block · clipping persists in a settled late-scene frame · correct the full scene state, not one timestamp`

No obvious off-model grade, brand-mark distortion, or severe compression corruption was observed in these four samples; those passes do not override the single-frame failures.

Fresh evidence: `t_011f9345/evidence/five-materials/contact-sheet.jpg`. The prior typography review `t_19e16f00` independently reported the same 75–84s clipping/collision class and transition occlusion.

Follow-up: `t_f88b8de7` — **P0 — Five Materials: clear single-frame rejection defects in approved master** (animator). Re-review must use the new encoded master and exact 48.0/75.0/80.0/84.0s frames plus all cue and transition boundaries.

### 2. Investing in the Trust Layer — KEEP

Master: `investing-in-the-trust-layer/renders/investing-in-the-trust-layer-final-1080p.mp4`  
SHA-256: `dda4b5d53f5efeaaa71d6a4c29cae8add8edf1d1550632c2f6312292e202eeb9`  
Probe: H.264, 1920×1080, 30 fps, 117.034667s.

Evidence basis:

- Final director review: `reviews/investing-in-the-trust-layer-director-final-approval.md`.
- Complete full-screen playback plus 29 decoded frames.
- Exact prior-defect checks at 13.9, 15.2, 18.8, 21.9, 32.1, 33.2, 44.7, 48.3, 49.4, 53.8, 64.6, 69.3, 84.9, 86.2, 98.0, and 104.2s all pass.
- Report explicitly clears prior text collisions, label overflow, scene-transition superposition, chart clipping, flywheel/gate overlap, captions, and end-card hold.

No follow-up ticket filed.

### 3. Water and Air: Correcting the Molecules We Drink and Breathe — KEEP

Master: `water-and-air-correcting-the-molecules-we-drink-and-breathe/renders/water-and-air-correcting-the-molecules-we-drink-and-breathe-final-1080p.mp4`  
SHA-256: `f0a55edbd17d6f630e64a67d711d343b41b09346909cc3fda840e3cccba9db90`  
Probe: H.264, 1920×1080, 30 fps, 106.026667s.

Evidence basis:

- Frame report: `reviews/water-and-air-correcting-the-molecules-we-drink-and-breathe-frame-review.md`.
- Final director report: `reviews/water-and-air-correcting-the-molecules-we-drink-and-breathe-final-director-review.md`.
- Seven corrected risk frames score 7–8/10; CSS audit finds zero text declarations below 36 px across the main composition and sub-compositions.
- Full 2-second sweep reports no blank frame, clipping, unsafe crop, text collision, or persistent overlap.
- Validation reports zero contrast failures; strict inspection reports zero issues; palette, mark, and scientific illustration treatment pass.

The recorded -20.66 LUFS level is a non-blocking audio consistency note and is outside this single-frame visual gate. No follow-up ticket filed.

## Release recommendation

Remove the current Five Materials master from the approved-frame set until `t_f88b8de7` is fixed and independently re-reviewed. Keep Investing in the Trust Layer and Water and Air in the approved set. There are no revise-only assets under the binary rejection rule.
