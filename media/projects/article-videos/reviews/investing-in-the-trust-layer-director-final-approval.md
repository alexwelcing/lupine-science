# Investing in the Trust Layer — director final-render review

Decision: **APPROVED FOR WEB**

Review date: 2026-07-11  
Kanban ticket: `t_5e895005`  
Reviewed render: `investing-in-the-trust-layer/renders/investing-in-the-trust-layer-final-1080p.mp4`  
Captions: `investing-in-the-trust-layer/captions/investing-in-the-trust-layer.vtt`

## Review method

- Watched the complete 117.035-second render full-screen with its audio track.
- Reviewed a 29-frame render-decoded contact sheet spanning the full film and all previously flagged timestamps.
- Re-checked 13.9, 15.2, 18.8, 21.9, 32.1, 33.2, 44.7, 48.3, 49.4, 53.8, 64.6, 69.3, 84.9, 86.2, 98.0, and 104.2 seconds.
- Verified the final file with `ffprobe` and measured audio loudness.

## Approval findings

- **Picture:** PASS. The former transition composites have been replaced by clean occluding handoffs. No sampled transition shows two readable scenes competing at once.
- **Funnel, 13.9–21.9s:** PASS. The `380,000 / 736` hierarchy is clean; false-positive and false-negative labels occupy separate zones and no longer intersect the counter.
- **Pipeline, 32.1–44.7s:** PASS. Stage labels remain inside their boxes and the system has a single readable focal hierarchy.
- **Three pillars, 48.3–69.3s:** PASS. All three bays remain contained and readable at full size; no chart or label clipping is visible.
- **Proof and flywheel, 84.9–104.2s:** PASS. `PROOF`/`SCREEN` labels and gate boxes are spatially separated; the verified-boundary graphic remains legible.
- **Final thesis/end card, 104.2–117.0s:** PASS. The thesis resolves cleanly into a branded Lupine Science card. Narration ends at 114.540s, leaving approximately 2.495 seconds before file end for the untouched end-card hold.
- **Audio:** PASS. Narration is present throughout the intended program and the mix is release-safe at -16.07 LUFS integrated, -4.45 dBTP, with 1.90 LU LRA. No clipping condition is indicated.
- **Captions:** PASS for delivery presence and timeline fit. WebVTT runs from 0.000s through 114.540s and remains within the 117.035s program.
- **Technical:** PASS. 1920×1080, 30 fps, progressive H.264/AVC High, yuv420p, BT.709; AAC-LC stereo at 48 kHz; duration 117.035s.

## Previously flagged timestamp disposition

| Timestamp(s) | Result | Director note |
|---:|---|---|
| 13.9s | PASS | Wipe/handoff is clean; no full-scene collision. |
| 15.2, 18.8, 21.9s | PASS | Funnel labels and large count no longer overlap. |
| 32.1s | PASS | Incoming pipeline does not collide with readable funnel content. |
| 33.2s | PASS | Pipeline stage labels are contained. |
| 44.7s | PASS | Pipeline-to-pillars handoff is clean. |
| 48.3, 49.4, 53.8, 64.6s | PASS | Three-bay layout is contained and legible at full size. |
| 69.3s | PASS | Pillars-to-proof transition is clean. |
| 84.9s | PASS | Proof-to-moat transition is clean. |
| 86.2, 98.0s | PASS | Wheel labels and gate boxes do not collide. |
| 104.2s | PASS | Moat-to-thesis handoff is clean. |

## Final disposition

**APPROVED FOR WEB.** The final render clears the prior P0/P1 visual concerns and the audiovisual/technical release gate. No timestamped rejection notes remain.
