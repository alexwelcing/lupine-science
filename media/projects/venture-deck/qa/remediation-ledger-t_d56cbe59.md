# VENTURE-1F remediation ledger

Task: `t_d56cbe59`  
Inputs: content audit `t_b3bd6408`; visual audit `t_d0ab2e45`  
Date: 2026-07-28

## Finding disposition

| Reviewer finding | Disposition | Exact fix or evidence-backed rejection | Verification |
|---|---:|---|---|
| Slide 3 declares `C-ACCURACY-02` but does not visibly render the accuracy-wall claim. | FIXED | Added visible bounded copy: “In the measured benchmark, rankings often survive even when hard-property magnitudes miss by tens of percent. Bounded to the measured benchmark domain.” The claim ID and source footer remain intact. | Present in `index.html`, integrated/standalone HTML, extracted PDF text, regenerated slide-03 PNG, and native visual inspection. Geometry/overflow/overlap validators pass. |
| Parent/card says `4.65`, while canonical Z1 evidence repeatedly supports `$14.65`. | REJECTED AS UNSUPPORTED DECK EDIT; REQUIREMENT AMENDMENT REQUIRED | No deck change to the value. Retained `$14.65 cloud-equivalent`, because `articles/z1-union-debrief.md` and the SHA-256-pinned manifest support it. Adding `4.65` would knowingly make the deck less accurate. | `npm run venture:validate` passes its `$14.65` presence and forbidden standalone `4.65` absence gates; PDF text scan passes; source hash lock passes. |
| Parent/card asks for a `100/100 certification chain`, while the earlier Wave-4 reconciliation alone did not claim campaign 100/100. | SUPERSEDED AND RESOLVED BY `t_f0bda334` | Closure gate `t_c2a1f8e3` independently reconciled 33 certified baseline stills + 67 independently certified Wave-4 replacements = `100/100 unique still slots`; five certified films remain outside the denominator. The deck uses only that precise scope. | Current `npm run venture:validate`, PDF text extraction, evidence-source hashes, and `qa/closure-builder-remediation-t_f0bda334.md` pass. |
| Slide 10 source footer cites Savings Stack lines 44–56, which do not contain 558→154. | FIXED | Changed the visible footer to Savings Stack lines 26–56. Mirrored the exact footer in all six claim-level `visible_source_footer_by_slide["10"]` entries, `slide_source_footers["10"]`, narrative script, standalone deck, public deck, and embedded manifest. | Standalone validator confirms exact footer/manifest parity; PDF text extraction finds “The Savings Stack,” lines 26–56; all source/build hashes pass. |
| Slide 10 relies on an editor-review Z1 source but omits its “not for citation” status. | FIXED | Added visible qualification “Z1 execution source: FOR EDITOR REVIEW — not for citation” and added the same status to the Z1 leg of the source footer. Updated `C-TRACTION-01` qualification in the manifest. | Visible in regenerated slide-10 PNG and PDF; native visual inspection confirms legibility; source footer remains within two lines after a scoped 18px/23px footer treatment. |
| Independent visual audit reported zero defects across all 13 HTML slides and 13 PDF pages. | ACCEPTED; REGRESSION-CHECKED | No speculative visual changes were made beyond the content-driven copy adjustments. | Rebuilt deck passes 1920×1080 safe-area, line-count, overflow, text/asset overlap, browser-console, network, 13-page 16:9, palette, and raster contact-sheet inspection. Slides 3 and 10 are intact. |

## Gate preservation

- `[OWNER DECISION]`: exactly three visible fields preserved.
- Honest-risk headline and all five Z1 limitations preserved.
- No fabricated commercial traction, financing, market-size, customer, revenue, valuation, or terms claims added.
- `$14.65` retained; unsupported standalone `4.65` remains absent; the only visible `100/100` phrase is the supported `100/100 unique still slots` claim.
- 11/11 source hashes, 13/13 locked asset hashes/dimensions, and 5/5 build-input + 3/3 build-output hashes pass.
- No asset, source article, deployment configuration, remote environment, or PR was changed for this remediation.

## Evidence

- Current validation report: `media/projects/venture-deck/validation-report.md`
- Original content audit: `media/projects/venture-deck/qa/independent-claim-audit-t_b3bd6408.md`
- Current HTML QA: `media/projects/venture-deck/qa/slide-01.png` … `slide-13.png`, `qa/contact-sheet.png`
- Independent PDF raster evidence: `/tmp/venture-1f-pdf-contact-sheet.png` (ephemeral run artifact)
- Full command log: `/tmp/venture-1f-validation.log` (ephemeral run artifact; note that an initial slide-10 three-line footer failure was remediated and the strict final rerun passed)
