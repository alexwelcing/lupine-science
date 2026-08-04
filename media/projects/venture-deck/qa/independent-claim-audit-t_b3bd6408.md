# VENTURE-1D independent slide-by-slide claim audit

Task: `t_b3bd6408`  
Deck audited: `media/projects/venture-deck/index.html`, `public/venture/deck.html`, and `media/projects/venture-deck/lupine-science-venture-deck.pdf`  
Evidence audited: `media/projects/venture-deck/evidence-manifest.json` and all SHA-256-pinned repository sources  
Audit date: 2026-07-28  
Deck edits: none

## Verdict

**FAIL — remediation required.** Ten slides pass their visible-claim/source checks; slides 3, 6, and 10 fail. Slide 8 is source-correct but fails the literal parent-card lock because the card requires a `100/100 certification chain` that the repository verifier expressly refuses to certify. The two parent/source contradictions (`4.65` versus `$14.65`, and `100/100`) must be resolved at the requirement level; inserting the card strings into the deck would make the deck less accurate.

### Blocking findings

1. **Slide 3 omits the accuracy-wall claim it declares.** Its `data-claim-id` includes `C-ACCURACY-02`, but the visible slide only states the benchmark dimensions. It never visibly says that hard-property magnitudes miss by tens of percent while rankings can survive. This also leaves the parent’s “universal MLIPs are fast but drift on hard materials” problem statement incomplete.
2. **Slide 6 conflicts with the literal parent card.** The slide says `$14.65 cloud-equivalent`; parent task `t_2c7a1366` and this audit card say `4.65`. Canonical source `articles/z1-union-debrief.md:6,34-35,77-79` repeatedly supports **$14.65**, so the deck is source-correct and the card appears wrong. The parent requirement must be amended or explicitly waived; do not change the slide to `4.65` without new canonical evidence.
3. **Slide 8 cannot satisfy the parent’s `100/100` instruction from current evidence.** The deck correctly uses qualitative hash-locked/provenance-hashed language. `public/brand-assets/campaign-2026-07-27/wave-4/reconciliation-report.md:23` explicitly says it “does not claim campaign 100/100.” The requirement must be amended or a separate, independently reconciled campaign-wide source must be supplied; do not add `100/100` from the current record.
4. **Slide 10’s visible source footer does not directly cover its `558→154` claim.** It cites “The Savings Stack,” lines 44–56, while the actual 558/154, 72.4%, 3.62×, and 139.5→154 record is at `articles/the-savings-stack.md:26-32`. Change that footer range to include lines 26–32 (for example, 26–56) and mirror the correction in the evidence manifest.
5. **Slide 10 cites an editor-review source without preserving its full status.** The composite claim relies on `articles/z1-union-debrief.md`, whose line 7 says `FOR EDITOR REVIEW ... not for citation`. Slide 10 says only “not ... peer-reviewed.” Preserve the editor-review/not-for-citation status or replace this leg with a cleared canonical receipt.

## Slide-by-slide PASS/FAIL table

| Slide | Result | Visible claim / chart and label audit | Canonical source | Discrepancy |
|---:|:---:|---|---|---|
| 1 | PASS | “Five material classes could unlock 5–12 GtCO₂/year”; body names cobalt-free cathodes, halide solid electrolytes, DAC sorbents, ammonia catalysts, and lead-free perovskites. | `articles/five-materials-for-5-to-12-gtco2-year.md:2-16` | No factual discrepancy. Wording is contingent (“could” / “if ... first”), not achieved abatement. Footer exactly matches manifest. |
| 2 | PASS | “380,000 ... 736 ... reported 0.2% validation rate”; chart repeats 380,000, 736, and 0.2%; visible qualification says it is not a universal synthesizability probability. | `articles/the-02-percent-synthesis-problem.md:7-16`; Merchant et al., Nature 624 (2023), DOI `10.1038/s41586-023-06735-9` | Arithmetic checks: 736/380,000 = 0.193684%, rounded to 0.2%. Footer and qualification are correct. |
| 3 | **FAIL** | Visible labels “21 materials,” “up to 9 properties,” “228 reference values” are correct. However, `data-claim-id` also declares `C-ACCURACY-02`, while no visible text states the claimed hard-property drift/ranking-versus-magnitude result. | Dimensions: `articles/the-order-is-right-the-size-is-wrong.md:3-7`; drift and ranking/magnitude: lines 11-18 and 41-63. | Missing visible claim and missing parent problem statement. Add a bounded visible sentence such as the source-locked narrative’s “rankings often survive even when magnitudes miss by tens of percent,” or remove the claim ID only if the parent requirement is also changed. Footer range itself covers the omitted claim. |
| 4 | PASS | “Measured physical error field ... beside the live MLIP ... additive energy term with analytic forces. No fine-tuning. No retraining.” Route labels accurately show existing MLIP → measured error field → corrected energy + analytic forces. | `articles/investing-in-the-trust-layer.md:51-63`; `articles/the-order-is-right-the-size-is-wrong.md:67-81` | No contradiction. Together with slide 5’s Lean gate, this satisfies runtime correction during simulation without retraining/fine-tuning. |
| 5 | PASS | “Measured correction, bounded claim, or abstention”; visible body says the first correction made alloy predictions worse and the resulting Lean law blocks wrong-direction correction. | `articles/the-correction-that-hurt-and-the-theorem-that-stopped-it.md:19-35,49-55` | Accurate compression. Manifest’s exact 9.1%→16.9% detail is source-backed at line 21 but not shown numerically; the less-specific visible claim remains true. Footer is correct. |
| 6 | **FAIL (card/source conflict)** | “129/129 anchors,” zero evaluation failures, 61.0 wall-hours, **$14.65**; “42 published Li-ion electrolyte chemistries,” 30 frozen test + 12 disjoint training, 4 foundation MLIPs; two exact-extrema models and two 6.8 meV deficits. | `articles/z1-union-debrief.md:17-35`; `articles/the-materials-we-test-against.md:1-17,23-66` | Every visible number is repository-supported, and the footer preserves `FOR EDITOR REVIEW; not peer-reviewed`. But the parent/audit lock says `4.65`; strict card comparison fails. Canonical evidence says `$14.65`. Resolve the card, not the slide. |
| 7 | PASS | 29 analyzable paths; 558→154; 72.4% fewer; 3.62×; naive 139.5→558; union 139.5→154; about 10%; no new DFT. Bar width 154/558 = 27.6%, matching the rendered chart. Label explicitly says recomputed record ≠ executed campaign record. | `articles/the-savings-stack.md:26-32`; executed 430→129 record at `articles/z1-union-debrief.md:32-35` | Arithmetic checks: (558−154)/558 = 72.4014%; 558/154 = 3.6234×; 154/139.5−1 = 10.3943%. No conflation and footer is correct. |
| 8 | **FAIL against literal card; PASS against sources** | “Physical-law theorems are non-rival”; partners contribute verified laws without proprietary chemistry disclosure; evidence chain uses provenance hashes and machine-checked Lean theorems; failures remain recorded. Route labels: reference anchor → provenance hash → Lean theorem → licensed gate. | `articles/the-savings-stack.md:38-46`; `articles/the-order-is-right-the-size-is-wrong.md:88-120`; verifier caveat at `.../wave-4/reconciliation-report.md:23` | The theorem-commons and hash-locked evidence claims are correct. Parent requires `100/100 certification chain`, but the canonical verifier explicitly withholds that claim. Requirement-level contradiction blocks literal acceptance. |
| 9 | PASS | Categorical market position: model generation → Lupine trust layer → laboratory validation; first wedge is teams already running MLIP simulation; complements rather than replaces adjacent tools. | `articles/the-trust-layer.md:64-78`; `articles/investing-in-the-trust-layer.md:23-43` | No TAM, market-size, revenue, customer, contract, funding, partner-status, or traction number is invented. Footer is correct. |
| 10 | **FAIL** | “Frozen public panel,” four-model guidance, completed 129-anchor execution record, reproducible 558→154 analysis, all “inspectable now”; qualification denies commercial revenue and peer-reviewed validation. | Panel: `articles/the-materials-we-test-against.md:40-66`; execution: `articles/z1-union-debrief.md:17-35,75-82`; savings number: `articles/the-savings-stack.md:26-32` and reproduction pack at 44-56. | Footer cites Savings Stack 44-56, which does not state 558→154; include 26-32. Footer also omits the Z1 source’s `FOR EDITOR REVIEW — ... not for citation` status. Manifest’s `C-TRACTION-01` evidence range (30-56) is broader than the visible footer and does cover the number. |
| 11 | PASS | Ordered ladder: statics → elastic response → surfaces → defects → transition states → interfaces → abstention-only domains; runtime instrumentation, explicit gates, sparse DFT where laws cannot act, abstention when unsupported. | `articles/an-order-of-effort.md:19-55` | Correct staged roadmap, with no dates, delivery schedule, or fabricated milestone. Footer is correct. |
| 12 | PASS | Exact headline: “One 30-path panel. One chemistry family. Not peer-reviewed.” Additional risks: one engine/functional, short paths, seven deferred large paths, two guidance misses, no GPAW↔VASP equivalence claim. | `articles/the-savings-stack.md:38-42`; `articles/z1-union-debrief.md:47-57` | Exact mandatory risk disclosures are present and source-backed. Footer ranges are correct. |
| 13 | PASS | Three unresolved fields: `[OWNER DECISION] Round size`, `[OWNER DECISION] Instrument / terms`, `[OWNER DECISION] Runway and allocation`; categorical use-of-funds only. | Owner-controlled ask; no external factual source required. | No amount, valuation, dilution, percentage, hiring count, customer, revenue, or terms fabricated. Empty source footer is intentional and accessibly labeled. |

## Evidence-manifest audit

| Check | Result | Evidence / discrepancy |
|---|:---:|---|
| Source hash lock | PASS | All 11 manifest source SHA-256 values match the current on-disk files byte-for-byte. |
| Asset hash lock | PASS | All 13 selected assets match the manifest SHA-256 values and slide assignments. |
| Embedded manifest | PASS | JSON embedded in `public/venture/deck.html` is semantically byte-equivalent after JSON parsing to `media/projects/venture-deck/evidence-manifest.json`. |
| Build-manifest integrity | PASS | All five input hashes and all three output hashes match current files, including HTML `0850760a...` and PDF `02dcea86...`. |
| PDF/HTML claim parity | PASS | `pdftotext -layout` confirms all authored visible claims, labels, qualifications, and source footers in the 13-page PDF match the HTML; slide 13 alone has an intentionally empty source line. |
| Claim-ID rendering | **FAIL** | Slide 3 declares `C-ACCURACY-02` but does not visibly render its drift/ranking-magnitude claim. |
| Footer-to-evidence ranges | **FAIL** | Slide 10 visible footer says Savings Stack lines 44-56, while its 558→154 number is at lines 26-32. Manifest evidence uses 30-56, so manifest and visible footer disagree. |
| Card/source discrepancy handling | **FAIL pending owner/card resolution** | `D-COST` and `D-100-CHAIN` accurately document the two contradictions but unilaterally override literal parent locks. The source-driven decisions are scientifically defensible; acceptance still requires the parent lock to be amended/waived. |
| Forbidden invented commercial claims | PASS | No market-size, revenue, customer, funding amount, signed-partner, commercial traction, valuation, or terms number appears. |
| Owner ask | PASS | Exactly three visible `[OWNER DECISION]` rows; all financing values unresolved. |
| Risk disclosure | PASS | Exact mandatory headline plus all five Z1 limitations are visible. |

## Required remediation

1. Restore a visible, bounded accuracy-wall sentence on slide 3 and keep `C-ACCURACY-02`; the parent explicitly requires the drift problem.
2. Amend or obtain owner waiver for the parent’s `4.65` lock. Current canonical value is `$14.65`; do not knowingly introduce `4.65` into the deck.
3. Amend or obtain owner waiver for the parent’s `100/100 certification chain` lock, or supply a new independent campaign-wide reconciliation. Current Wave-4 evidence explicitly does not support it.
4. Correct slide 10’s visible Savings Stack line range to include lines 26-32 and mirror that exact footer in every `visible_source_footer_by_slide`/`slide_source_footers` manifest entry.
5. Add the `FOR EDITOR REVIEW — not for citation` qualification to slide 10’s Z1 citation, or cite a cleared receipt carrying the same execution facts.
6. Rebuild HTML/PDF/manifests and rerun this audit after remediation.

## Mechanical audit record

- 13 PDF pages extracted with `pdftotext -layout`; all authored text compared to HTML.
- 11/11 source hashes: PASS.
- 13/13 certified asset hashes: PASS.
- 5/5 build inputs and 3/3 build outputs match `build-manifest.json`.
- No deck, source, manifest, validator, or PDF file was edited by this audit.
