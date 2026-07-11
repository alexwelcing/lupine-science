# Methane and Refrigerants — flagged-frame fix evidence

Decision: **PASS — ALL FLAGGED FRAMES ≥ 7/10**

Fix ticket: `t_6739e39a`
Prior review ticket: `t_cb9b51d5`
Date: 2026-07-10
Composition: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/index.html`
Evidence: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/snapshots/p1-fix-evidence/`

## Result

All four clipping groups identified in the prior review have been corrected in the persistent HyperFrames composition. Fresh 1920×1080 PNG evidence shows the complete Beat 1 summary, both complete Beat 2 cards, all four Beat 3 edge-environment cells, and all five Beat 5 filter chips. Informational type remains at or above the required 36 px floor.

The reviewer-provided timestamps 19.2–19.4 s, 55.9 s, and 94.5–94.7 s land after the overlapping scene transition has revealed the next scene. This package therefore includes those exact timestamps plus settled pre-transition evidence at 18.8 s, 32.8 s, 55.2 s, and 94.1 s so each corrected outgoing panel can be inspected directly.

## Verification

- `npm run check`: PASS
  - lint: 0 errors; 1 pre-existing duplicate-logo discovery warning
  - validate: 0 runtime errors; 0 contrast failures
  - strict inspect: 0 errors and 0 warnings across 15 samples
- Fresh evidence: 13 full-resolution PNGs and two contact sheets.
- Typography: explanatory labels and callouts remain ≥36 px; Beat 2 formulas are 52 px and arrows are 40 px.
- Palette: unchanged canonical Lupine palette.

## Fixed-frame table

| Prior issue | Fresh evidence | Status | Finding |
|---|---|---|---|
| P1-01 — Beat 1 lever summary clipped | `frame-00-at-18.8s.png`; exact transition samples at 19.2 and 19.4 s | **FIXED** | Complete `= 0.8°C NEAR-TERM LEVERAGE` row is visible inside the right panel with bottom padding. |
| P1-02 — Beat 2 card copy/footer clipped | `frame-01-at-19.2s.png`, `frame-02-at-19.4s.png`, `frame-03-at-32.8s.png`, `frame-04-at-33.2s.png` | **FIXED** | Both explanatory lines and both dashed `MATERIAL MISSING` footers are fully visible. Card copy remains 36 px. |
| P1-03 — fourth edge cell clipped | `frame-06-at-55.2s.png`, `frame-07-at-55.6s.png`; 55.9 s is the next scene | **FIXED** | All four cells fit within the panel; `PHASE BOUNDARIES` is fully visible. |
| P1-04 — lifetime filter clipped | `frame-09-at-94.1s.png`; exact transition samples at 94.5 and 94.7 s | **FIXED** | All five filter chips fit within the visualization; `ATMOS. LIFETIME` is fully visible with padding. |

## Source changes

- Beat 1: increased visualization height and tightened lever spacing.
- Beat 2: tightened panel padding and vertical rhythm; formulas set to 52 px, arrows to 40 px, explanatory/footer text retained at 36 px.
- Beat 3: changed edge cells to a two-column grid with safe horizontal insets.
- Beat 5: tightened five-chip stack spacing and padding while retaining 36 px labels.

## Re-review request

Reviewer re-scored the full-resolution PNGs in `snapshots/p1-fix-evidence/`. The visual fix gate is closed; no remaining frame issue requires director escalation.

## Final reviewer scoring

Strict criteria: no clipped or cut-off informational text, no destructive overlap, readable hierarchy, safe interior padding, and no broken transition state. Every supplied frame meets the 7/10 threshold.

| Frame | Score | Reviewer finding |
|---|---:|---|
| 18.8 s | 9/10 | Full `= 0.8°C NEAR-TERM LEVERAGE` summary is visible, readable, and safely padded. |
| 19.2 s | 8/10 | Beat 2 transition state is coherent; both cards and footers are complete. |
| 19.4 s | 8/10 | Both comparison cards remain fully readable with no clipping. |
| 32.8 s | 9/10 | Settled Beat 2 frame has complete explanatory copy and both complete `MATERIAL MISSING` footers. |
| 33.2 s | 8/10 | Outgoing cards remain complete during the handoff. |
| 33.5 s | 8/10 | Beat 3 transition state is clean and legible. |
| 55.2 s | 9/10 | All four edge cells fit; `PHASE BOUNDARIES` has safe padding. |
| 55.6 s | 8/10 | All four edge cells remain complete immediately before transition. |
| 55.9 s | 8/10 | Beat 4 entry is coherent; no residual clipped Beat 3 content. |
| 94.1 s | 9/10 | All five filter chips fit; `ATMOS. LIFETIME` is complete and padded. |
| 94.5 s | 8/10 | Beat 6 entry is clean and readable. |
| 94.7 s | 8/10 | Beat 6 settles without clipping or overlap. |
| 135.6 s | 9/10 | End card is centered, complete, and readable. |

Minimum score: **8/10**. Visual decision: **PASS**.

Fresh verification on 2026-07-10: `npm run check` passed with lint 0 errors (2 non-blocking warnings), validate 0 runtime errors and 0 contrast failures, and strict inspect 0 errors / 0 warnings across 15 samples.

## Task t_4f2e6272 verification

Decision: **PASS — all four clipping fixes remain resolved.**

Fresh task-specific evidence was generated with `npx hyperframes snapshot` at 18.8, 19.2, 19.4, 32.8, 33.2, 33.5, 55.2, 55.6, 55.9, 94.1, 94.5, and 94.7 seconds:

- PNG frames: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/snapshots/t_4f2e6272-p1-clipping/frame-00-at-18.8s.png` through `frame-11-at-94.7s.png`
- Contact sheet: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/snapshots/t_4f2e6272-p1-clipping/contact-sheet.png`

Visual inspection confirms the full Beat 1 `= 0.8°C NEAR-TERM LEVERAGE` row, both complete Beat 2 explanatory lines and `MATERIAL MISSING` boxes, all four Beat 3 cells including `PHASE BOUNDARIES`, and all five Beat 5 chips including `ATMOS. LIFETIME`. Exact boundary frames show clean incoming-scene transitions rather than clipped outgoing content.

Required command verification on 2026-07-10:

- `npm run lint`: PASS — 0 errors, 2 non-blocking warnings.
- `npm run validate`: PASS — 0 runtime errors, 0 contrast failures.
- `npm run inspect`: PASS — strict inspection reported 0 errors and 0 warnings across 15 samples.
