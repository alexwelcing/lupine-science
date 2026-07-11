# Investing in the Trust Layer — flagged-frame re-review

Decision: **ESCALATE / REJECT — flagged frames remain below 7/10**

Re-review ticket: `t_2d477875`  
Prior flag review: `reviews/investing-in-the-trust-layer-visual-flags.md`  
Evidence reviewed: `investing-in-the-trust-layer/snapshots/`, `titles-qa/snapshots/`, and corrected `transition-final/` snapshots  
Review date: 2026-07-10

## Result

The corrected transition snapshots materially improve the wipe handoffs, but the package does not clear the re-review gate. Settled funnel frames still contain overlapping text, pipeline labels overflow their boxes, flywheel labels overlap gate boxes, the strict automated check fails, the storyboard remains director-rejected, and no corrected MP4 or synchronized WebVTT was delivered. At least one flagged frame therefore remains below 7/10.

## Exact flagged-frame scores

| Timestamp(s) | Score | Result |
|---:|---:|---|
| 13.9s | **5/10** | FAIL — the corrected wipe prevents full-scene superposition, but both visible halves retain crowded/overlapping funnel and outgoing-machine text. |
| 15.2s, 18.8s, 21.9s | **5/10** | FAIL — `FALSE POSITIVE / LAB WEEKS LOST` visibly intersects the large red `736`; the funnel’s competing labels and counter do not have clean readable zones. |
| 32.1s | **7/10** | PASS — the corrected vertical wipe gives outgoing and incoming scenes distinct halves without the former transparent full-frame collision. |
| 33.2s | **5/10** | FAIL — fresh strict inspect reports `GENERATE` overflowing its 164 px stage box by 13 px and `SYNTHESIZE` by 56 px, with both also reported occluded. |
| 44.7s | **7/10** | PASS — the corrected wipe separates the pipeline and three-pillar systems into distinct halves. |
| 48.3s, 49.4s, 53.8s, 64.6s | **7/10** | PASS, marginal — source typography is now 36 px and the settled three-bay layout is no longer clipped, though its dense secondary copy remains the legibility floor. |
| 69.3s | **7/10** | PASS — corrected wipe isolates the three-pillar and proof systems; no full-frame readable collision remains. |
| 84.9s | **7/10** | PASS — corrected wipe isolates outgoing proof and incoming moat systems. |
| 86.2s, 98.0s | **5/10** | FAIL — fresh strict inspect reports the rotating `PROOF` and `SCREEN` wheel labels overlapping `.gate` boxes from 86–101s. The settled system has competing labels around the circle and gates. |
| 104.2s | **7/10** | PASS — corrected wipe isolates the moat and investment-thesis systems. |

Lowest score: **5/10**. Gate requirement: every flagged frame **≥7/10**.

## Verification

Fresh `npm run check` in `investing-in-the-trust-layer/` exits **1**:

- lint: 0 errors, 1 duplicate-media warning;
- validate: 0 errors, 0 warnings, 0 contrast failures;
- strict inspect: **4 errors and 2 warnings**;
- pipeline: `GENERATE` and `SYNTHESIZE` overflow/occlusion at 34–40s;
- flywheel: `PROOF` and `SCREEN` overlap gate boxes at 86–101s.

The source now declares the previously sub-floor informational classes at 36 px (`.stage`, `.bay h3`, `.bay p`, `.verified`, `.wheel-label`, `.gate`), so the numeric typography-floor remediation is substantially complete. The remaining failures are layout/readability failures caused by fitting those labels into insufficient zones.

## Release blockers escalated to director

1. **P0 — storyboard gate remains rejected.** `director-storyboard-review.md` still says `REJECT — RECONFORM TIMING AND RESUBMIT`; no replacement approval is recorded.
2. **P0 — no corrected review render/captions.** No matching MP4 or WebVTT exists, so this review could only assess browser snapshots, not render-decoded audiovisual evidence.
3. **P1 — funnel collision remains.** Separate `736` and the false-positive label into nonoverlapping zones.
4. **P1 — pipeline overflow remains.** Widen/reflow stage boxes while retaining the 36 px floor.
5. **P1 — flywheel/gate overlap remains.** Reposition or phase wheel labels and gates so `PROOF` and `SCREEN` never collide.
6. **P1 — automated release check fails.** Rerun until strict inspect has zero review-relevant issues.

## Disposition

Do not close the visual-fix gate. The animator should correct the three remaining layout systems, deliver a versioned 1920×1080 30 fps H.264 MP4 plus synchronized WebVTT, and provide exact-frame evidence from that MP4. Director must also approve the reconformed storyboard. Re-review can close only when every flagged render-decoded frame scores at least 7/10 and `npm run check` passes.
