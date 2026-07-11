# The 0.2% Synthesis Problem — Flagged-frame re-review

Status: **ESCALATED — 7/7 flagged frames remain below 7/10**  
Task: `t_33e64f64`  
Reviewer/date: `reviewer` / 2026-07-10  
Composition: `the-02-percent-synthesis-problem/index.html`

## Decision

**REJECT / ESCALATE TO DIRECTOR.** The new root composition and 1080p snapshots resolve the earlier “no composition” prerequisite, but none of the seven frames flagged by strict HyperFrames inspection clears the required 7/10 minimum. The exact check command exits 1 with seven layout errors. No MP4 render, timed caption file, or director final-render sign-off is present, so the release gate also remains closed independently of the frame scores.

Evidence contact sheet: `reviews/evidence/the-02-percent-synthesis-problem-rereview/flagged-contact-sheet.png`

## Flagged-frame results

Scores use the hard-gate minimum rule: a reproducible overflow or occlusion caps the frame below 7/10 even when the overall art direction is strong.

| Timestamp | Snapshot | Score | Result | Re-review evidence / required fix |
|---:|---|---:|---|---|
| 12.0s | `frame-01-at-12.0s.png` | 5.5/10 | FAIL | `SYNTHESIZABILITY … COMPETING PHASE / DECOMPOSITION` overflows its world container by 71.66 px and crowds the lower rule. Expand/reposition the container or fit/wrap the label, then re-inspect. |
| 28.0s | `frame-02-at-28.0s.png` | 5/10 | FAIL | Gate 01 explanatory copy (`Target phase versus competing phase`) is occluded by the animated candidate dot. Give copy an independent zone or correct stacking/trajectory. |
| 37.0s | `frame-03-at-37.0s.png` | 5/10 | FAIL | Gate 03 explanatory copy (`Vacancy · disorder · stacking fault`) is occluded by the candidate dot. Correct stacking or route the dot outside the text zone. |
| 46.0s | `frame-04-at-46.0s.png` | 5/10 | FAIL | Gate 04 explanatory copy (`Weeks of lab time + $000s`) is occluded by the candidate dot. Correct stacking or route the dot outside the text zone. |
| 56.0s | `frame-05-at-56.0s.png` | 5/10 | FAIL | `REACTION COORDINATE →` overflows the chart by 51 px. The nearby amber `100 meV` annotation also triggers a 1.98:1 large-text contrast warning (3:1 required). Reposition the axis label and use a compliant amber treatment. |
| 68.0s | `frame-06-at-68.0s.png` | 5/10 | FAIL | `Bigger generator` is occluded by the strike treatment; `SUPPORTED ↑ · FLAGGED BEFORE FURNACE` overflows its mechanism box by 74.89 px. Separate the strike from readable text and contain the status label. |
| 76.0s | `frame-07-at-76.0s.png` | 5/10 | FAIL | Same two deterministic defects as 68.0s remain: occluded `Bigger generator` and 74.89 px overflow of the sage status label. |

Lowest flagged-frame score: **5/10**  
Flagged frames passing ≥7/10: **0/7**  
Open issues represented: **P1 7 frame failures** (five distinct defect classes across seven timestamps)

## Technical verification

Command run from `the-02-percent-synthesis-problem/`:

`npm run check`

Result: **FAIL (exit 1)**

- Lint: 0 errors, 2 warnings (`duplicate_media_discovery_risk`, dense root timeline).
- Validate: 0 errors, 14 GSAP target warnings, 1 WCAG contrast warning (`100 meV`, 1.98:1).
- Strict inspect: **7 errors** across the seven flagged timestamps (overflow/occlusion listed above).
- Snapshot dimensions: all reviewed PNGs are **1920×1080**.
- Draft/final MP4: **missing**.
- WebVTT/SRT cue source: **missing**.
- Director final-render sign-off: **missing**.

## Director escalation

Please keep the composition blocked. Request a corrected snapshot set and passing strict inspection for 12, 28, 37, 46, 56, 68, and 76 seconds, followed by the required 1080p/30 fps H.264 render and timed WebVTT. Re-review these seven timestamps first, then sample the full render for regressions before final sign-off.
