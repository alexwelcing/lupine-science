# Beyond Carbon: flagged-frame re-review

## Decision: FRAME GATE PASS

The corrected 1080p render resolves every frame-level P0/P1 item from the initial review. All 11 targeted remediation samples score at least 7/10; the lowest score is 7/10 at intentional entrance/transition states. No frame issue remains to return to animation.

## Review record

- Task: `t_efdfa879`
- Prior review: `reviews/beyond-carbon-error-geometry-frame-review.md`
- Corrected render: `beyond-carbon-error-geometry/renders/beyond-carbon-error-geometry-final-1080p.mp4`
- Targeted evidence: `beyond-carbon-error-geometry/snapshots-p0p1-t_9797d2bf/`
- Render SHA-256: `a3ab691178946a803198d09ea7a5c3116bae91968ed25871810f8b6d27df94b4`
- Reviewer/date: `reviewer` / 2026-07-12
- Samples checked: 11
- Samples below 7/10: 0
- Lowest score: 7/10

## Targeted scores

| Time | Evidence | Score | Result |
|---:|---|---:|---|
| 00:00.000 | `frame-00-at-0.0s.png` | 7/10 | PASS — canonical mark and Lupine Science wordmark are visible immediately; centered identity has intentional negative space. |
| 00:00.100 | `frame-01-at-0.1s.png` | 7/10 | PASS — opening identity remains visible and unclipped. |
| 00:03.720 | `frame-02-at-3.7s.png` | 8/10 | PASS — complete field-note identity frame; hierarchy, safe margins, and contrast are clear. |
| 00:05.000 | `frame-03-at-5.0s.png` | 8/10 | PASS — labels are legible, the diagram has a clear focal point, and no text is truncated. |
| 00:20.000 | `frame-04-at-20.0s.png` | 8/10 | PASS — 36 px environment labels and 48 px narrative copy are readable with clean reflow. |
| 01:01.612 | `frame-05-at-61.6s.png` | 7/10 | PASS — the incoming measured-field scene fills the frame; title, deck, axes, and lower-third retain hierarchy while the chart intentionally begins its reveal. |
| 01:14.991 | `frame-06-at-75.0s.png` | 8/10 | PASS — measured-field evidence remains complete through the handoff; no half-empty wipe or clipping. |
| 01:33.935 | `frame-07-at-93.9s.png` | 7/10 | PASS — the platform-thesis scene is complete at the transition boundary; muted pre-reveal marks are intentional and the primary text remains dominant. |
| 01:46.920 | `frame-08-at-106.9s.png` | 8/10 | PASS — canonical outro is already present, centered, and readable; no mark-only dead frame. |
| 01:48.600 | `frame-09-at-108.6s.png` | 8/10 | PASS — CTA, destination, and proof label form a balanced end card with safe margins. |
| 01:50.000 | `frame-10-at-110.0s.png` | 8/10 | PASS — final identity hold remains complete and stable. |

## Issue-group closure

- **P0 typography — CLOSED.** Effective review-floor overrides set labels/callouts to at least 36 px and narrative/CTA copy to at least 48 px. The old smaller base declarations remain earlier in the stylesheet but are overridden by the final review-floor rule. HyperFrames validation reports zero contrast failures.
- **P0 opening identity — CLOSED.** Mark and wordmark are visible at both 0.000 s and 0.100 s.
- **P1 transition focal hierarchy — CLOSED.** Samples at 61.612 s, 74.991 s, 93.935 s, and 106.920 s retain complete designed frames.
- **Scene-05 callout collision — CLOSED.** `CN 12 · ZERO ERROR` has a paper backing and no longer collides with the axis label.

## Verification

- `npm run check`: PASS — lint 0 errors / 0 warnings; validate 0 errors / 0 warnings / 0 contrast failures; strict inspect 0 issues.
- Full A/V decode: PASS — `ffmpeg -v error ... -f null -` returned no errors.
- Render format: H.264 + AAC, 1920×1080, 30 fps, 112.021333 s.
- Render size: 14,974,020 bytes (about 8.02 MB/min), so the separate ≤3 MB/min web-delivery gate is not met by this 1080p master.

## Director escalation: non-frame release blockers

The frame-remediation task is complete, but release must not be interpreted as director-approved. The current source records still say **REVISIONS REQUESTED**:

1. `director-review-t_c9bcb824.md` — narration is not approved; stale `77` theorem audio, insufficiently bounded validation claims, and closing cadence remain unresolved.
2. `director-review-storyboard-t_dec6a5eb.md` — storyboard is not approved until revised narration/audio/transcript/timings are synchronized.
3. The 1080p master is above the framework's web-encode budget; a separate web encode is still required.
4. Final director sign-off on the revised 1080p film is not recorded.

**Handoff:** advance the corrected frames past reviewer QA, but keep the film blocked at the director/source-approval and delivery gates above.
