# WCAG 2.1 AA accessibility audit

Audit date: 2026-07-10  
Scope: all 21 public HTML routes generated under `public/`.

## Methods and coverage limits

- Automated: axe-core 4.12.1 WCAG 2.0/2.1 A+AA rules and Lighthouse 13.4.0 accessibility category in headless Google Chrome, once per route.
- Scripted interaction: tab-order/focus-style capture (up to 40 stops), semantic inventory, 320 CSS-pixel reflow probe (the WCAG 1.4.10 equivalent of a 1280px viewport at 400%), `prefers-reduced-motion: reduce`, images, media, landmarks, headings, skip links, and form controls on every route.
- Manual: Google Chrome on Ubuntu, keyboard only, front page at a 921×1035 browser window. Twelve sequential focus stops and the equation disclosure were exercised without a pointer. Equation controls showed 2px indigo outlines, navigation controls showed 1px indigo outlines, and links used browser outlines. The browser accessibility tree exposed the equation as a named group, each interactive term as a named button, the evidence as a named region, and the page landmarks. The skip link scrolled to `#evidence`, but focus returned to the document body instead of moving to the target region.
- Not exercised: Firefox, Safari, Edge, mobile assistive technology, or a screen-reader speech client (Orca/NVDA/JAWS/VoiceOver). This report therefore makes no claim about spoken output or those combinations. There are no public form fields, so form error behavior is not applicable.
- Raw route evidence: `docs/reviews/accessibility/automated-results.json`.

## Executive result

This build is not yet supportable as WCAG 2.1 AA. Axe found three violations across two routes; Lighthouse accessibility scores range from 92–100. The highest-risk defects are reflow failures, a user-controlled video without captions, and missing bypass links on three routes. Automated success is not treated as conformance.

## Prioritized remediation

### P0 — address before an AA claim

1. **Reflow / horizontal scrolling (WCAG 1.4.10).** `/articles/from-fantasy-frameworks-to-makeable-materials/` reaches 1170px at a 320px viewport because long literal URLs and an ASCII/code block do not wrap. `/articles/a-field-not-a-neural-net/` exposes wide MathML. `/videos/` reaches 342px because 320px cards begin after a 22px page inset. Add `overflow-wrap:anywhere` to prose links, keep preformatted/math regions locally scrollable with an accessible label, and make video cards use the available content width.
2. **Captions/transcript for user-controlled video (WCAG 1.2.2).** `/articles/why-lupine-science/` has a video with controls and no `<track>`. Add synchronized captions and a nearby transcript. The other detected looping muted hero videos convey the same description in their `aria-label`/`figcaption`; retain them as non-audio decoration.

### P1 — serious barriers / structural consistency

3. **Missing or incomplete bypass behavior (WCAG 2.4.1).** `/brand-assets/`, `/proof-pack-template/`, and `/videos/` have no skip link. On the front page, activating “Skip to the evidence” scrolls correctly but leaves focus on `<body>`; make the target programmatically focusable and move focus there. Add a first-focusable “Skip to content” link targeting the main landmark on the three routes without one.
4. **Insufficient status-label contrast (WCAG 1.4.3).** `/articles/a-smooth-environment-resolved-error-field/` fails axe `color-contrast` on `.status`; adjust foreground/background to at least 4.5:1 at its rendered text size.
5. **Visible labels versus accessible names (WCAG 2.5.3).** Lighthouse flags `label-content-name-mismatch` across templates. The Lupine logo link is visibly “Lupine Science accelerating materials discovery” but is named only “Lupine Science”. Include the visible wording in the accessible name or hide the tagline from the visual label relationship after validating the intended announcement.
6. **Malformed list semantics in the proof-pack preview (WCAG 1.3.1).** `/proof-pack-template/` fails axe `list` on two nodes because list containers contain non-`<li>` children. Restructure those children as list items or replace the list semantics with an appropriate grouping element.

### P2 — robustness and usability hardening

7. **Skip-link focus consistency.** Scripted traversal did not capture the skip link as the first stop on many article loads, while it did on two routes. Manually retest after a fresh navigation and ensure no startup script moves focus; give skip links an explicit, high-contrast `:focus-visible` treatment.
8. **Focus design.** Native one-pixel `outline:auto` is the only indicator on many links. It was visible in the tested Chrome window, but a consistent two-pixel, offset `:focus-visible` style would be more robust against textured backgrounds.
9. **Reduced motion.** No animation remained actively running when reduced motion was emulated, but 10–200 elements per route retained transitions longer than 100ms. Audit the decorative transition set and explicitly disable non-essential transitions under `prefers-reduced-motion: reduce` rather than relying on animation state at one instant.
10. **False-positive reflow probes from off-screen skip technique.** Four routes measured only 356–390px because `.skip { left:-9999px }` participates in document overflow. Replace it with a clipped transform/clip-path pattern so the document itself stays at viewport width. This also removes noisy regression results.

## What passed in the exercised coverage

- Every route has exactly one `h1`, a non-empty English `lang`, and no automated heading-level gap.
- Every image has an `alt` attribute; axe found no missing-alt failures. Decorative versus informative accuracy still requires editorial review of each description.
- Article routes expose header/navigation/main/footer landmarks and skip links; the front page exposes a main landmark and a skip link.
- No public form controls were found.
- The tested front-page keyboard disclosure had a clear indigo focus ring and operated from the keyboard.
- Reduced-motion emulation reported zero running animations on every route.

## Route-by-route evidence summary

| Route | Lighthouse a11y | axe violations | Notable manual/scripted evidence |
|---|---:|---|---|
| `/` | 100 | none | — |
| `/articles/` | 100 | none | — |
| `/articles/a-field-not-a-neural-net/` | 100 | none | 320px scroll 356px |
| `/articles/a-smooth-environment-resolved-error-field/` | 96 | color-contrast | — |
| `/articles/beyond-carbon-the-error-geometry-of-environmental-materials/` | 100 | none | — |
| `/articles/cement-concrete-and-the-weight-of-the-built-world/` | 100 | none | 320px scroll 390px |
| `/articles/critical-minerals-pfas-and-the-remediation-imperative/` | 100 | none | — |
| `/articles/five-materials-for-5-to-12-gtco2-year/` | 100 | none | — |
| `/articles/from-fantasy-frameworks-to-makeable-materials/` | 100 | none | 320px scroll 1170px; 1 video(s) |
| `/articles/from-predicted-crystal-to-commercial-cell/` | 100 | none | 320px scroll 356px |
| `/articles/investing-in-the-trust-layer/` | 100 | none | 320px scroll 359px |
| `/articles/methane-and-refrigerants-cutting-the-non-co2-climate-forcers/` | 100 | none | — |
| `/articles/the-02-percent-synthesis-problem/` | 100 | none | 320px scroll 356px |
| `/articles/the-order-is-right-the-size-is-wrong/` | 100 | none | — |
| `/articles/the-trust-layer/` | 100 | none | — |
| `/articles/water-and-air-correcting-the-molecules-we-drink-and-breathe/` | 100 | none | — |
| `/articles/why-lupi/` | 100 | none | 1 video(s) |
| `/articles/why-lupine-science/` | 100 | none | 2 video(s) |
| `/brand-assets/` | 100 | none | no skip link |
| `/proof-pack-template/` | 92 | color-contrast; list (2 nodes) | no skip link |
| `/videos/` | 100 | none | no skip link; 320px scroll 342px |

## Reproduction

```sh
npm install
npm run a11y:audit
```

The audit starts an isolated static server and Chrome instances, audits every `public/**/index.html`, and overwrites the JSON evidence file. A nonzero axe count is evidence, not currently a failing process exit; remediation work should convert selected known findings into regression assertions once fixed.
