# Five Materials — Flagged-frame re-review

Decision: **ACCEPT / all flagged frames clear the ≥7/10 gate**

Re-reviewed the corrected H.264 render `five-materials-v2-review-1080p.mp4` at the exact flagged timestamps. Evidence was extracted from the delivered MP4, not from the HTML preview.

| Timestamp | Score | Finding |
|---:|---:|---|
| 49.7s | **8/10** | The headline is now fully opaque and readable with stable focal hierarchy. The `≈50×` chart label is clean, with no collision or ghosting. |
| 86.6s | 7/10 | CTA is readable and no longer collides with card labels or borders. `SCALED` wraps below the sequence but remains legible. |
| 88.0s | 8/10 | Clean CTA hierarchy; no collision, clipping, or ghosting. |
| 89.6s | 8/10 | Clean CTA hierarchy; no collision, clipping, or ghosting. |
| 90.5s | 8/10 | Clean CTA hierarchy; no collision, clipping, or ghosting. |
| 92.2s | 8/10 | Clean outro frame; no collision, clipping, or ghosting. |

## Release-evidence verification

The live `evidence/validate.json` now reports `ok: true` with zero errors and zero warnings. The corrected MP4 decodes cleanly and contains H.264 video plus AAC audio at 1920×1080 and 30 fps.

## Verified delivery facts

- Review render: H.264 video + AAC audio, 1920×1080, 30 fps, 92.437333 s.
- SHA-256: `96081bc0f0f668d63f8bdde30ecb0f4e0440ea274b730373b53dc70ee48e0a12`.
- Exact-frame evidence: `five-materials-for-5-to-12-gtco2-year/reviews/five-materials-v2-rereview-evidence/`.
- Contact sheet: `five-materials-for-5-to-12-gtco2-year/reviews/five-materials-v2-rereview-evidence/flagged-contact-sheet.jpg`.

## Final disposition

All six previously flagged timestamps score 7/10 or better. The prior 49.7s opacity defect and the 86.6–92.2s CTA overlap defects are resolved, and the stale validation warnings have been cleared. No further remediation is required for this re-review gate.
