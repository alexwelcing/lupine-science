# Lupine Science venture deck — art direction and asset lock

Status: executable handoff for web-integrator  
Format: 13 slides, 16:9, source-locked  
Content authority: `media/projects/venture-deck/narrative-script.md`  
Evidence authority: `media/projects/venture-deck/evidence-manifest.json`  
Asset authority: `media/projects/venture-deck/asset-lock.json`

## 1. Creative decision

Treat the deck as a measured scientific instrument, not a startup mood board: warm paper, precise ink, sparse functional indigo, and physical line-art mechanisms that sit below the claim rather than illustrating it literally. The visual arc moves from opportunity and leakage (slides 1–3), through correction and proof (4–8), to market and operating record (9–10), then deliberately narrows into roadmap, risk, and owner-controlled ask (11–13).

No generative work is authorized. Every image is a mechanically and composition-approved deterministic Wave-4 PNG. All user-facing words, numbers, labels, legends, and footers must be live HTML/SVG text; never bake text into an image.

## 2. Non-negotiable brand law

### Palette

Use only these four solid colors:

- Paper / every slide background: `#faf9f6`
- Ink / all primary type, chart marks, rules: `#16171d`
- Indigo / functional route, selected datum, active gate only: `#3d4db3`
- Ochre / warnings and unresolved owner-decision fields only: `#8a5e1f`

Do not introduce white, black, gray, gradients, shadows, glows, color opacity, blend modes, or dark fields. Indigo is not decoration: one indigo state, route, datum, or proof boundary per composition. Ochre appears only on slide 12 and the unresolved fields on slide 13.

### Typography

Load only repository fonts:

```css
@font-face {
  font-family: "Newsreader";
  src: url("/fonts/newsreader-var.woff2") format("woff2");
  font-weight: 200 800;
  font-style: normal;
}
@font-face {
  font-family: "IBM Plex Mono";
  src: url("/fonts/plex-mono-400.woff2") format("woff2");
  font-weight: 400;
}
@font-face {
  font-family: "IBM Plex Mono";
  src: url("/fonts/plex-mono-600.woff2") format("woff2");
  font-weight: 600;
}
```

- Newsreader: headlines, body prose, large numerals, closing line.
- IBM Plex Mono: eyebrow, section label, axis/legend text, qualifications, source footer, slide number, `[OWNER DECISION]`.
- No all-caps Newsreader. Mono labels may use uppercase with `0.08em` tracking.
- No bold simulated by the browser; wait for both font files before capture/export.

### 1920 × 1080 coordinate contract

- Build each slide at a fixed `1920 × 1080`; scale the whole stage responsively without reflow.
- Outer safe area: `x=112–1808`, `y=72–1010`.
- Header/content area: `y=72–932`.
- Footer rule: `x=112–1808`, `y=960`, `2px` ink.
- Source footer: `x=112`, baseline zone `y=982–1010`; slide number right-aligned at `x=1808`.
- Default 12-column grid: `112px` outer margins, `24px` gutters, `121px` columns.
- Headline: Newsreader 68/70, weight 520, max 2 lines, max width 1180px.
- Large KPI: Newsreader 120/112, weight 600, tabular numerals if supported.
- Body: Newsreader 32/40, weight 390, max 4 lines in a 760–900px measure.
- Mono label/legend: 22/28, weight 600.
- Qualification: IBM Plex Mono 20/27.
- Source footer: IBM Plex Mono 20/25, weight 400.

### Persistent furniture

Every slide has:

1. Top-left mono eyebrow: `LUPINE SCIENCE / VENTURE` plus a two-digit slide number.
2. One headline zone anchored left; never center a stack vertically.
3. One visual/data zone with a second focal point.
4. Bottom source rule and exact source footer from the narrative.
5. Right footer slide count `NN / 13`.

Slides 1 and 13 may omit the top eyebrow only if the Lupine Science wordmark is present as live text. Do not add logos that are not already certified.

## 3. Content and evidence lock

- Import or transcribe headline, body, ask, close, and source-footer strings exactly from `narrative-script.md`. The art spec never authorizes rewriting.
- Claim tags remain implementation metadata (`data-claim-id`) and are not rendered.
- Do not add chart values, tick values, dates, TAM, revenue, customers, partners, valuation, round size, runway, allocation percentages, hiring counts, or milestones.
- Preserve exactly `$14.65 per 129 anchors`; never derive or substitute another cost basis.
- Display the closure result only as `100/100 unique still slots`, supported by closure gate `t_c2a1f8e3`: 33 certified baseline stills + 67 independently certified Wave-4 replacements. Keep the five certified films explicitly outside the 100-still denominator. Never imply 100/100 models, campaigns, films, or generic certification.
- The only approved public savings economics are `72.4% fewer DFT evaluations`. Do not derive, round, extrapolate, annualize, or substitute another economic quantity.
- Slide 12 is mandatory and must say exactly: `One 30-path panel. One chemistry family. Not peer-reviewed.`
- Slide 13 financing fields remain visibly unresolved `[OWNER DECISION]` slots.

## 4. Image treatment

All locked assets are already restricted to paper, ink, and indigo and contain no people or baked text. Render with:

```css
.deck-asset {
  object-fit: contain;
  object-position: center bottom;
  image-rendering: auto;
  background: #faf9f6;
  filter: none;
}
```

Never recolor, mask with a gradient, add a shadow, place on a dark panel, or crop away the single indigo mechanism. Prefer `contain`; any specified crop is a viewport crop only and must preserve the entire physical mechanism. Keep the upper whitespace when it carries headline space. Decorative reuse is prohibited: one locked asset per slide, one slide per asset.

## 5. Slide-by-slide direction

### 01 — Five materials. A climate-scale trust problem.

- **Narrative copy:** render slide 1 headline and body verbatim; headline carries `data-claim-id="C-CLIMATE-01"`.
- **Layout:** editorial cover. Headline at `x=112, y=124, w=1140`; emphasize only `5–12 GtCO₂/year` in indigo. Body at `x=112, y=330, w=930`. Asset spans `x=930, y=392, w=878, h=500` and may overlap the body column only after its last line.
- **Visual role:** a sequence of increasingly specialized test bays stands for the five material-class opportunity and the verification burden without privileging a single class.
- **Locked asset:** `SW1-B6-A02-01`, specialized test-bay sequence.
- **Chart/form:** none. Do not create five icons or allocate new values per material.
- **Footer:** exact slide 1 source footer.

### 02 — The pipeline leaks before matter is made.

- **Narrative copy:** render slide 2 headline and body verbatim; `data-claim-id="C-SYNTHESIS-01"`.
- **Layout:** data-left / mechanism-right. At `x=112, y=280`, set `380,000` at 116px, a thin ink rule/arrow, then `736` at 116px. Under it place `reported 0.2% validation rate` at 28px mono. Asset at `x=960, y=280, w=848, h=600`.
- **Chart/form:** one proportional funnel/rail only if it remains schematic. Do not draw a 0.2%-wide mark that disappears; numerals carry the quantitative truth. No synthesizability wording.
- **Locked asset:** `SW1-B1-A02-01`, laboratory apparatus with one finished pellet.
- **Qualification:** visible 20px mono line above footer: `Validation-rate indicator; not a universal synthesizability probability.`
- **Footer:** exact slide 2 source footer, including DOI.

### 03 — The accuracy wall.

- **Narrative copy:** render slide 3 headline and body verbatim; attach both `C-ACCURACY-01` and `C-ACCURACY-02` as metadata.
- **Layout:** headline across top. Left data block at `x=112, y=330, w=650`: three aligned measures `21 materials`, `up to 9 properties`, `228 reference values`, each on its own row. Asset at `x=790, y=280, w=1018, h=620`.
- **Chart/form:** paired ordinal rows / dumbbell logic. Use indigo only to connect matching rank positions; ink shows unequal magnitudes. No invented axes or percentages.
- **Locked asset:** `SW1-B5-A02-02`, rank-agreement pedestal rows.
- **Qualification:** `Bounded to the measured benchmark domain.` above footer.
- **Footer:** exact slide 3 source footer.

### 04 — Correct the simulation at runtime.

- **Narrative copy:** render slide 4 headline and body verbatim; `data-claim-id="C-PRODUCT-01"`.
- **Layout:** mechanism-first split. Headline at top left. Asset `x=112, y=300, w=1010, h=600`. A right rail at `x=1210, y=350, w=598` contains three live-text steps: `existing MLIP` → `measured error field` → `corrected energy + analytic forces`.
- **Functional accent:** only the additive error-field segment and the route leaving it are indigo.
- **Locked asset:** `SW1-B5-A01-02`, interface probe correction band.
- **Required lockout:** set `NO FINE-TUNING / NO RETRAINING` as a 22px mono line; do not turn it into an unqualified universal-transfer claim.
- **Footer:** exact slide 4 source footer.

### 05 — Certified inference: correct, bound, or abstain.

- **Narrative copy:** render slide 5 headline and body verbatim; attach `C-PRODUCT-02` and `C-HONESTY-01`.
- **Layout:** three-route decision architecture. At `y=300`, three unequal columns: `MEASURED CORRECTION`, `BOUNDED CLAIM`, `ABSTAIN`. The first two use ink outlines; the active licensed route may use one indigo rule. `ABSTAIN` stays ink here—ochre is reserved for the dedicated warning slide and unresolved ask.
- **Asset:** place at `x=770, y=310, w=1038, h=590`; keep the stop bays and continuing route visible. Text labels sit outside the PNG as live DOM.
- **Locked asset:** `SW1-B4-A04-04`, evidence-gate routing bench.
- **Honesty proof:** a 20px mono note above footer must retain that the first correction made predictions worse and the Lean law blocks wrong-direction correction. Do not promote `9.1%` or `16.9%` unless copied verbatim from the locked narrative; the narrative currently does not show them.
- **Footer:** exact slide 5 source footer.

### 06 — Proof today: one completed Z1 execution campaign.

- **Narrative copy:** render slide 6 headline and body verbatim; claim metadata `C-Z1-EXEC-01`, `C-Z1-PANEL-01`, `C-Z1-MODELS-01`, `C-Z1-SPLIT-01`.
- **Layout:** one KPI cell across `x=112–1808, y=280–460`: `$14.65 per 129 anchors`. Do not split the reviewed phrase into partial numeric labels. Below, asset occupies `x=112, y=500, w=1050, h=400`; panel description occupies `x=1220, y=520, w=588`.
- **Chart/form:** KPI strip plus shared-anchor apparatus; no progress rings.
- **Locked asset:** `SW1-B6-A01-01`, shared-reference diffusion rigs.
- **Qualification:** if the two/two model split is shown, render the complete sentence from the speaker note including `6.8 meV undercoverage deficit`; never show only the successful half. Keep `FOR EDITOR REVIEW; not peer-reviewed` in the source/qualification zone.
- **Footer:** exact slide 6 source footer.

### 07 — Economics: the expensive oracle becomes shared infrastructure.

- **Narrative copy:** render slide 7 headline and body verbatim; claim metadata `C-ECON-01`.
- **Layout:** headline top. Central result at `x=112, y=320, w=820` with `72.4% fewer DFT evaluations` in live type. Do not split or shorten the reviewed phrase. Asset at `x=990, y=300, w=818, h=590`.
- **Chart/form:** one bounded result block. Do not infer or visualize any denominator, multiplier, secondary percentage, or comparison quantity.
- **Locked asset:** `SW1-B6-A01-02`, union route shared stations.
- **Mandatory qualification rail:** boxed with ink, never ochre: `EVIDENCE-LOCKED CLAIM · NO EXTRAPOLATION`.
- **Footer:** exact slide 7 source footer.

### 08 — Moat: a theorem commons with a hash-locked evidence chain.

- **Narrative copy:** render slide 8 headline, body, and certified still-closure rail verbatim; attach `C-MOAT-01`, `C-MOAT-02`, `C-STILL-CLOSURE-01`.
- **Layout:** chain architecture from left to right across lower two-thirds: `reference anchor` → `provenance hash` → `Lean theorem` → `licensed gate`. All are live labels. The physical chain asset fills `x=450, y=300, w=1358, h=600`; body occupies `x=112, y=330, w=550` on paper whitespace. The closure rail occupies `x=112, y=640, w=590, h=232` with a live `t_c2a1f8e3` citation.
- **Chart/form:** immutable provenance chain, not a network cloud. Use indigo for the single verified route only.
- **Locked asset:** `SW1-B4-A04-02`, calibration traceability chain.
- **Scope lock:** use only `100/100 unique still slots`; show 33 + 67 arithmetic and state that five certified films are excluded from the denominator. No blockchain imagery, padlock icon, or proprietary-chemistry disclosure claim beyond the narrative.
- **Footer:** exact slide 8 source footer.

### 09 — Market: correction-as-acceleration for the discovery stack.

- **Narrative copy:** render slide 9 headline and body verbatim; `data-claim-id="C-MARKET-01"`.
- **Layout:** categorical value-chain rail: `model generation` → `Lupine trust layer` → `laboratory validation`. The center stage is outlined in indigo; both neighbors remain ink. Body sits below at `x=112, y=680, w=900`.
- **Asset:** `x=690, y=300, w=1118, h=560`; asset acts as the measured-result-to-pilot physical bridge.
- **Locked asset:** `SW1-B3-A01-04`, calibrated holder / filtration skid.
- **Chart/form:** ecosystem rail only. No market-size circle, logo cloud, target-customer logos, named partner marks, or signed-status implication.
- **Footer:** exact slide 9 source footer.

### 10 — Traction: the public record is already operating.

- **Narrative copy:** render slide 10 headline and body verbatim; claim metadata `C-TRACTION-01` plus its resolved evidence tags.
- **Layout:** evidence-led ledger. Left column lists four live-text record rows: `frozen public panel`, `guided-model evidence`, `completed execution record`, `reproducible savings analysis`. Right asset at `x=900, y=280, w=908, h=610`.
- **Chart/form:** four-row audit ledger with ink rules; indigo marks only `inspectable now` status. Optional QR codes must point only to verified public routes from `evidence-manifest.json`, must be generated at build time, and must have a live-text route directly beneath.
- **Locked asset:** `SW1-B4-A01-03`, sealed evidence table.
- **Qualification:** visible line: `Completed evidence infrastructure — not commercial revenue or peer-reviewed validation.`
- **Footer:** exact slide 10 source footer.

### 11 — Roadmap: climb from proven corrections to harder boundaries.

- **Narrative copy:** render slide 11 headline and body verbatim; attach `C-ROADMAP-01`, `C-ROADMAP-02`.
- **Layout:** diagonal effort ladder across `x=112–1808, y=330–760`; seven live-text stages in exact order: `statics`, `elastic response`, `surfaces`, `defects`, `transition states`, `interfaces`, `abstention-only domains`. Asset sits behind/under the labels at `x=540, y=285, w=1268, h=620` but never behind body text.
- **Chart/form:** ordinal stair/effort ladder with no dates, durations, milestone markers, completion percentages, or quarter labels. Indigo marks only the proven starting lane; all later stages are ink outlines.
- **Locked asset:** `SW1-B6-A02-04`, phased evidence test hall.
- **Footer:** exact slide 11 source footer.

### 12 — What is not proven yet.

- **Narrative copy:** render slide 12 headline and body verbatim; attach `C-RISK-01`, `C-RISK-02`.
- **Layout:** mandatory risk register. Place the exact three-part headline at `x=112, y=220, w=1050`, 76/78 Newsreader. Underline it with one `4px` ochre rule. Place six limits as live-text rows at `x=112, y=470, w=970`; asset at `x=1100, y=340, w=708, h=520`.
- **Chart/form:** no confidence gauge and no reassuring green. Ochre may mark warning bullets and the headline rule; all explanatory text remains ink.
- **Locked asset:** `SW1-B5-A04-04`, magnetic specimen abstention tray.
- **Exact limits:** one engine and functional; short paths make sparsity easier; seven large paths deferred; two models recorded guidance misses; no GPAW↔VASP equivalence claim; plus the mandatory three-part headline.
- **Do not soften:** preserve `Not peer-reviewed.` exactly.
- **Footer:** exact slide 12 source footer.

### 13 — The ask: fund the makeability layer.

- **Narrative copy:** render slide 13 headline, three ask fields, use-of-funds frame, close, and speaker-note restrictions verbatim. No claim IDs are required.
- **Layout:** headline `x=112, y=135, w=1120`. Ask panel `x=112, y=320, w=760, h=350`; three 72px-high rows with an ochre 3px outline and exact live label `[OWNER DECISION]`. Use-of-funds list at `x=1000, y=320, w=808`. Asset spans bottom `x=760, y=650, w=1048, h=270`, preserving the inspection gate. Close at `x=112, y=820, w=650`, Newsreader 42/48.
- **Chart/form:** unresolved term sheet + three-part allocation frame with no amounts, percentages, dates, or headcount placeholders. Do not use `$—`, `TBD months`, or fake ranges.
- **Locked asset:** `SW1-B4-A04-01`, gated pilot pipeline.
- **Owner-decision slots:** `Round size`; `Instrument / terms`; `Runway and allocation` exactly. Ochre means unresolved, not danger.
- **Footer:** the locked script contains no evidence citation for slide 13. Keep the footer rule and slide number, but leave the source-text slot empty; do not invent a citation or status sentence.

## 6. Overflow and readability gates

The integrator must fail the build rather than silently shrink, clip, or rewrite.

1. **No clipping:** every text box must satisfy `scrollWidth <= clientWidth` and `scrollHeight <= clientHeight` at 1920×1080.
2. **No auto-fit below floors:** headline ≥58px; body ≥28px; mono labels ≥20px; source footer ≥20px. If content does not fit, use the specified qualification rail or reduce decorative/asset area—never change copy.
3. **Line limits:** headline ≤2 lines except slide 12 exact three-part risk line may use 3; body ≤5 lines; source footer ≤2 lines; each KPI label ≤2 lines.
4. **Readable measure:** prose line length 42–72 characters; never span body prose across the full canvas.
5. **Safe area:** no live text outside `x=112–1808` or `y=72–1010`; no critical image mechanism within 48px of the stage edge.
6. **Contrast:** all live text is ink on paper. Indigo and ochre may not carry body text. Do not use opacity to create secondary text.
7. **Asset integrity:** natural dimensions and SHA-256 must match `asset-lock.json`; no alternate, fallback, retry, Wave-3, shortfall-wave, or generated asset.
8. **Source persistence:** source footer is visible in slideshow, exported PNG, and PDF; never hide it in speaker notes or hover UI.
9. **Data fidelity:** every rendered numeric token must exist verbatim in `narrative-script.md`; exception: slide furniture `NN / 13`.
10. **Capture gate:** wait for `document.fonts.ready` and all images `complete && naturalWidth > 0` before screenshot/PDF.

Recommended automated checks:

```js
expect(stage.getBoundingClientRect()).toMatchObject({ width: 1920, height: 1080 });
expect(document.fonts.check('68px "Newsreader"')).toBe(true);
expect(document.fonts.check('20px "IBM Plex Mono"')).toBe(true);
for (const el of document.querySelectorAll('[data-fit]')) {
  expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth);
  expect(el.scrollHeight).toBeLessThanOrEqual(el.clientHeight);
}
for (const img of document.images) {
  expect(img.complete && img.naturalWidth > 0).toBe(true);
}
```

## 7. Delivery acceptance checklist

- [ ] Exactly 13 slides in narrative order.
- [ ] All narrative strings and source footers are verbatim.
- [ ] Only the four allowed colors occur in authored CSS/SVG; ochre only on slides 12–13.
- [ ] Only Newsreader and IBM Plex Mono are used.
- [ ] All 13 asset paths and SHA-256 values pass the lock file.
- [ ] No people, stock 3D, neon, dark fields, gradients, shadows, or baked text.
- [ ] Public economics are limited to `72.4% fewer DFT evaluations` and `$14.65 per 129 anchors`.
- [ ] The only visible `100/100` phrase is `100/100 unique still slots`, with five films outside the denominator.
- [ ] Slide 12 risk language is exact and visually unavoidable.
- [ ] Slide 13 retains all three `[OWNER DECISION]` fields with no inserted financing values.
- [ ] Overflow, font-load, image-load, and 1920×1080 capture checks pass.
