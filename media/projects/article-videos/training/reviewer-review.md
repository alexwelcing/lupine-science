# Independent reviewer calibration result

- Profile: `reviewer` (Claude Fable 5)
- Session: `20260710_134527_e606be`
- Input: blind packet + `reel/contact-sheet.png`
- Answer key was excluded.

| Frame | Decision | Severity | Failed binary tests | Exact rejection / evidence-request language |
|---|---|---:|---|---|
| 01 | PASS | — | None visible | — |
| 02 | PASS | — | None visible | — |
| 03 | PASS | — | None visible | — |
| 04 | REJECT | P1 | Static-slide scene; clear focal point/readable hierarchy; on-brand scientific evidence structure | **REJECT frame 04 under the static-slide and hierarchy criteria:** the centered “Key Findings” heading and three generic bullets form a sparse presentation slide rather than a designed Lupine motion frame. Rebuild it around one dominant claim and a claim-specific evidence object, with scientific structure and evidence chrome. |
| 05 | REJECT | P0 | Body text ≥48 px; no overlapping text; critical content inside outer 5% title-safe margin; readable hierarchy | **REJECT frame 05 under typography and title safety:** the headline and callout visibly overlap, the identified 28 px body copy is below the 48 px floor, and the critical red label sits outside the title-safe area. Recompose the frame, rewrite or shorten the body at ≥48 px, separate the headline and callout, and move all critical content inside x 96–1824 / y 54–1026. |
| 06 | REJECT | P1 | Locked Lupine palette; warm-paper ground; scientific-not-decorative illustration; no generic AI/science imagery | **REJECT frame 06 under palette, frame-ground, and mechanism criteria:** the dark neon ground, cyan/magenta treatment, and generic network-node graphic violate the locked palette, warm-paper identity, and claim-specific mechanism requirement. Rebuild it with paper, ink, indigo, at most one approved semantic accent, and geometry that directly explains the mechanism. |
| 07 | REJECT | P0 | Labels, axes, and data callouts ≥36 px | **REJECT frame 07 under the published data-label floor:** the values and S1–S6 axis labels render below 36 px at 1080p. Raise every axis label and data callout to ≥36 px and reflow the chart so the larger labels remain clear and title-safe. |
| 08 | HOLD | P1 evidence gap | No still-provable failure; unproved: intentional entrance, causal reveal, transition continuity, narration support, and beat timing | **HOLD frame 08 pending motion evidence:** this still cannot prove the intentional entrance, causal line draw, transition continuity, narration alignment, or beat timing. Supply timeline/keyframe inspection and 1080p playback covering the scene entrance, reveal, hold, and handoff. |

Observations: PASS applies only to still-provable criteria; numeric floors are hard gates; legibility failures are P0; brand/mechanism failures are P1; unobservable temporal criteria require evidence rather than inference.
