# Water and Air: Correcting the Molecules We Drink and Breathe — frame review

## Decision: PASS (re-review)

The original review rejected the composition for systemic sub-36 px typography and generic water/air application diagrams. Independent re-review of the corrected evidence now closes both findings: all seven flagged frames score at least 7/10, the CSS audit finds no declared text size below 36 px in the main composition or either sub-composition, and the water/air frames now communicate distinct mechanism-led diagrams with a dominant causal pathway.

## Review record

- Article/video: `water-and-air-correcting-the-molecules-we-drink-and-breathe`
- Review task: `t_e32b464a`
- Composition: `../water-and-air-correcting-the-molecules-we-drink-and-breathe/index.html`
- Evidence: `../water-and-air-correcting-the-molecules-we-drink-and-breathe/review-frames/t_e32b464a/`
- Sampling reviewed: 21 programmed checkpoints plus 23 animation-development checkpoints and transition/outro samples
- HyperFrames: `npm run check` passed; lint, validate, and strict inspect report 0 issues
- Reviewer/date: `reviewer` / 2026-07-12
- P0/P1: 1 / 1
- Decision: `REJECT`

## P0-01 — Systemic text below the 36 px release floor

- Severity: P0
- Affected frames: 17.0s, 32.0s, 53.0s, 68.0s, 84.0s, 97.0s, 102.8s; the same selectors persist across their full scenes
- Criterion: no text below 36 px at 1920×1080
- Score: 4/10
- Evidence: source audit finds `.stat span` 30 px, `.specimen` 32 px, `.site` 34 px, `.candidate` 30 px, `.device` 29 px, `.device b` 32 px, `.particle` 24 px, `.stage` 28 px, `.proofstat small` 29 px, `.instrument span` 34 px, and `.boundary` 30 px. The contact sheets visibly confirm that explanatory labels, citations, proof qualifiers, particle labels, and outro/footer text become the smallest and least readable elements.
- Required fix: raise every label/callout/footer to at least 36 px; keep body copy at least 48 px; reflow cards and proof annotations rather than scaling text down; inspect sub-compositions too so their footer/meta text obeys the same floor.
- Acceptance: computed-style audit has zero visible text nodes below 36 px at representative and transition frames; full-resolution re-review scores every flagged frame ≥7/10.
- Attachments: `p0-typography-17.0s.png`, `p0-typography-32.0s.png`, `p0-typography-84.0s.png`, `p0-typography-97.0s.png`, `p0-typography-102.8s.png`.

## P1-01 — Water and air application diagrams are generic and lack a mechanism-led focal point

- Severity: P1
- Affected frames: 43.5–58.8s and 59.5–73.8s; representative attachments at 53.0s and 68.0s
- Criterion: scientific-not-decorative imagery; each frame has a clear focal point
- Score: 5/10
- Evidence: desalination, atmospheric-water hydrolysis, Li/Mg separation, cold-start NOx, soot oxidation, and VOC oxidation are all rendered as the same three outlined rectangular cards with tiny token circles and nearly identical barrier marks. The route line and cards carry equal visual weight, so no actual pore, reaction pathway, catalyst surface, selectivity event, or downstream consequence becomes the focal point. The visual system is on-brand in color, but the illustration vocabulary is generic and does not distinguish the mechanisms named by the narration.
- Required fix: give each application one mechanism-specific scientific specimen (pore-selectivity geometry, hydrolysis barrier/path, Li/Mg transport path, cold-start catalytic surface, soot-filter oxidation site, VOC reaction path); animate the causal event and pollutant/ion outcome; use scale/contrast/motion to establish one primary focal point at a time instead of presenting three equivalent cards.
- Acceptance: a silent-frame reviewer can identify the mechanism and intended insight without relying on the header; each scene has one dominant focal point and no stock/repeated-card treatment; corrected samples score ≥7/10.
- Attachments: `p1-generic-water-53.0s.png`, `p1-generic-air-68.0s.png`.

## Pass observations

- Palette passes: warm paper, indigo, amber, sage, slate, and rose match the specified Lupine tokens; no off-brand colors were observed.
- Fonts pass at the family level: Newsreader and IBM Plex Mono are embedded and used consistently.
- Safe margins and clipping pass in sampled settled frames; no overlap or truncation was observed.
- Opening and outro retain a clear Lupine identity and focal mark.
- Technical composition checks pass with zero HyperFrames errors or warnings.

## Release gate

Do not advance this composition to final render or director sign-off. Fix P0-01 and P1-01, regenerate representative snapshots at the timestamps above, and re-run the flagged-frame review. Release requires all visible text ≥36 px, body copy ≥48 px, mechanism-specific water/air visuals, and every flagged frame scoring at least 7/10.

## P0 remediation — t_f681f989

- Raised all 11 flagged selectors to the 36 px release floor and reflowed the affected stat cards, ranking labels, device cards, particles, proof pipeline, instrumentation, and boundary annotation.
- Audited `index.html`, `compositions/logo-sting.html`, and `compositions/outro.html`: static CSS audit reports zero declared font sizes below 36 px; body copy remains 48 px or larger.
- `npm run check` passes with lint 0 errors / 0 warnings, validate 0 errors / 0 warnings, and strict inspect 0 issues across 21 timestamps.
- Corrected 1920×1080 samples: `../water-and-air-correcting-the-molecules-we-drink-and-breathe/review-frames/t_f681f989/` at 17.0s, 32.0s, 53.0s, 68.0s, 84.0s, 97.0s, and 102.8s.
- Animator visual smoke review: 17.0s 8/10, 32.0s 8/10, 53.0s 8/10, 68.0s 8/10, 84.0s 8/10, 97.0s 8/10, 102.8s 9/10. No clipping, overlap, or illegible label was observed. Formal reviewer re-score remains required before changing the release decision.

## P1 remediation — t_f7a3a2fc

- Replaced the repeated three-card water/air layouts with six mechanism-specific scientific specimens: membrane pore selectivity, hydrolysis energy/path, Li⁺/Mg²⁺ transport, cold-start catalytic surface, soot-filter oxidation, and a Pt*-mediated VOC reaction path.
- Added seek-safe causal motion for pore passage, reaction-path tracing, selective transport, surface activation, soot oxidation, and VOC pathway progression. At the requested proof times, earlier mechanisms recede while the current mechanism gains an amber focus ring and full contrast.
- `npm run check` passes: lint 0 errors / 0 warnings, validate 0 errors / 0 warnings with 0 contrast failures, and strict inspect 0 issues across all 21 timestamps.
- Corrected 1920×1080 samples: `../water-and-air-correcting-the-molecules-we-drink-and-breathe/review-frames/t_f7a3a2fc/frame-00-at-53.0s.png` and `frame-01-at-68.0s.png`; contact sheet is in the same directory.
- Animator silent-frame smoke review: 53.0s 8/10 and 68.0s 8/10. The six mechanisms are distinguishable without relying on the scene header, Li/Mg transport and VOC conversion are the dominant focal points at the respective proof times, and no clipping or text overlap was observed. Formal reviewer re-score remains required before changing the release decision.

## Formal flagged-frame re-review — t_e2da8ebb

- Decision: **PASS**. P0-01 and P1-01 are closed; no remaining frame-level issue requires director escalation.
- Independent scores: 17.0s **8/10**, 32.0s **8/10**, 53.0s **7/10**, 68.0s **7/10**, 84.0s **8/10**, 97.0s **8/10**, 102.8s **8/10**. Minimum score: **7/10**.
- 53.0s passes narrowly but clearly: Li⁺/Mg²⁺ transport is the dominant specimen, passage versus rejection is legible, and the pore-selectivity and hydrolysis specimens remain distinguishable as secondary context without repeated stock cards.
- 68.0s passes narrowly but clearly: the CH₂O → Pt* → CO₂ + H₂O reaction path is the dominant focal mechanism, with cold-start activation and soot oxidation remaining identifiable as subdued secondary specimens.
- No corrected frame shows clipping, overlap, off-brand color, or unreadable primary text. The restrained secondary-state opacity at 53.0s and 68.0s is acceptable because it preserves hierarchy while the active mechanism remains readable.
- Source audit: `index.html` has 6 font-size declarations, minimum 36 px; `compositions/logo-sting.html` has 5, minimum 36 px; `compositions/outro.html` has 3, minimum 36 px. No declaration is below 36 px.
- Technical verification: `npm run check` exits 0; validation reports 0 contrast failures and strict inspection reports 0 issues across 21 timestamps.
- Evidence: `../water-and-air-correcting-the-molecules-we-drink-and-breathe/snapshots-p0-p1-t_9d9f7c40/` and the ticket-specific evidence directories listed above.
