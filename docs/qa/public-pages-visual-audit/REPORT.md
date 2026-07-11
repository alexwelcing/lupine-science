# Public pages editorial visual-quality audit

Date: 2026-07-10  
Task: `t_ab32bc35`  
Target: verified local production build served from `public/` at `http://localhost:8080` with Cloudflare `_headers` enforced.  
Build verification: `npm run build` passed immediately before capture.

## Executive result

**FAIL — not publication-ready.** All 60 page/viewport combinations returned HTTP 200, but only the homepage passed editorial visual QA. Nineteen of 20 public HTML pages have at least one reproducible defect. The dominant problems are missing image assets, a CSP rule that blocks the site-owned share module on every article, a nearly empty brand-assets library, and severe horizontal overflow in one article.

Severity counts: P0 0; P1 4; P2 2; P3 0.

## Scope and inventory

Inventory source: every `public/**/index.html` (20 HTML pages). The sitemap also exposes a PDF; PDF rendering is outside this page-visual audit and is covered by the sibling PDF QA stream. `/videos/` and `/brand-assets/` are public HTML pages even though they are currently absent from the sitemap, so they are included.

## Viewport matrix

| Profile | CSS viewport | Input | Coverage |
|---|---:|---|---|
| Desktop | 1440×900 | mouse | all 20 pages, full-page screenshot |
| Tablet | 834×1194 | touch | all 20 pages, full-page screenshot |
| Mobile | 390×844 | mobile + touch | all 20 pages, full-page screenshot |

Reduced motion was forced for deterministic captures. Automated checks collected HTTP status, console/page errors, failed requests, broken `<img>` elements, document overflow, H1s, and page dimensions. Raw machine evidence is in `results.json`; a mobile overview is in `mobile-contact-sheet.jpg`.

## Prioritized findings

### P1 — Brand Assets is overwhelmingly blank because image URLs are missing

- Reproduce: open `/brand-assets/` at any audited viewport and scroll.
- Observed: only the first few cards render; most cards are uniform empty beige placeholders. 180 broken images on desktop, 186 on tablet, and 194 on mobile.
- Examples: `/brand-assets/assets/images/v10/field-gradient_wide_v10.jpg`, `/brand-assets/assets/images/shape-of-wrongness_square.jpg`.
- Impact: the public brand library is effectively unusable and visibly unfinished.
- Evidence: `screenshots/mobile--brand-assets.png`, `screenshots/desktop--brand-assets.png`.
- Action: publish the referenced image set or remove unavailable variants/cards; add a build-time asset existence check.

### P1 — Editorial images are missing across the index and nine published articles

- Reproduce: open `/articles/`, then affected articles listed in the page matrix.
- Observed: broken `<img>` requests for thumbnails/heroes and 7–9 body figures per affected article. The index has up to 12 broken images depending on responsive source selection.
- Examples: `/articles/the-order-is-right-the-size-is-wrong/thumb.jpg`; `/articles/a-field-not-a-neural-net/images/a-field-not-a-neural-net-03-field-anchors-spline.jpg`.
- Impact: major editorial evidence and visual pacing disappear; broken alt text/placeholders surface in places such as the Videos card.
- Evidence: affected page screenshots plus exact URL arrays in `results.json`.
- Action: make article build fail when generated HTML references absent local assets; restore/generate the files before publication.

### P1 — Site CSP blocks the first-party article share module

- Reproduce: open any article with DevTools console; inspect the share controls.
- Observed: 51 console errors plus 51 failed requests across 17 page/viewport combinations: `/components/share/share.mjs` violates `script-src` and is blocked.
- Impact: article sharing behavior is nonfunctional; every article emits production-policy errors.
- Evidence: `results.json` (`issues[].message`).
- Action: permit the first-party external module via an appropriate CSP source (normally `'self'`) or bundle/hash it consistently; add CSP-enabled browser coverage for share interactions.

### P1 — “From Fantasy Frameworks…” has severe horizontal overflow

- Reproduce: open `/articles/from-fantasy-frameworks-to-makeable-materials/` and horizontally scroll, especially at 390px.
- Observed: document exceeds viewport by 70px desktop, 373px tablet, and 780px mobile. Long reference anchors reach ~1167px right on a 390px viewport; a code block also exceeds its container. The full-page mobile capture visibly leaves content in a narrow left column with off-canvas material.
- Evidence: `screenshots/mobile--article-from-fantasy-frameworks-to-makeable-materials.png`; overflow element coordinates in `results.json`.
- Action: apply safe wrapping (`overflow-wrap:anywhere`) to long citation links and constrain/pre-wrap code blocks.

### P2 — Videos page has broken brand mark and first poster

- Reproduce: open `/videos/` at 390px (also present in desktop/tablet captures).
- Observed: broken-image icon in the masthead and exposed alt text in the first video poster: “Cement, Concrete, and the Weight of the Built World”.
- Missing poster: `/videos/cement-concrete-and-the-weight-of-the-built-world-poster.jpg`.
- Evidence: `screenshots/mobile--videos.png`.
- Action: restore poster and masthead asset/reference; verify all poster URLs during build.

### P2 — Brand Assets requests a blocked external font

- Reproduce: open `/brand-assets/` with the local production CSP.
- Observed: Google Fonts stylesheet is blocked by `style-src 'self' 'unsafe-inline'`, producing console and request failures at all viewports; the page falls back to local/system typography.
- Evidence: `results.json`; `screenshots/mobile--brand-assets.png`.
- Action: remove the external request and use the site’s self-hosted font assets, or deliberately align CSP and privacy policy.

## Page-by-page result

| Public page | Result | Reason | Evidence (desktop / tablet / mobile) |
|---|---|---|---|
| `/` | PASS | No material defect observed | `screenshots/desktop--home.png`<br>`screenshots/tablet--home.png`<br>`screenshots/mobile--home.png` |
| `/articles/` | FAIL | Share module blocked by CSP; Broken images (up to 12) | `screenshots/desktop--articles-index.png`<br>`screenshots/tablet--articles-index.png`<br>`screenshots/mobile--articles-index.png` |
| `/videos/` | FAIL | Broken images (up to 1) | `screenshots/desktop--videos.png`<br>`screenshots/tablet--videos.png`<br>`screenshots/mobile--videos.png` |
| `/brand-assets/` | FAIL | Broken images (up to 194); External font blocked by CSP | `screenshots/desktop--brand-assets.png`<br>`screenshots/tablet--brand-assets.png`<br>`screenshots/mobile--brand-assets.png` |
| `/articles/a-field-not-a-neural-net/` | FAIL | Share module blocked by CSP; Broken images (up to 9) | `screenshots/desktop--article-a-field-not-a-neural-net.png`<br>`screenshots/tablet--article-a-field-not-a-neural-net.png`<br>`screenshots/mobile--article-a-field-not-a-neural-net.png` |
| `/articles/a-smooth-environment-resolved-error-field/` | FAIL | Share module blocked by CSP | `screenshots/desktop--article-a-smooth-environment-resolved-error-field.png`<br>`screenshots/tablet--article-a-smooth-environment-resolved-error-field.png`<br>`screenshots/mobile--article-a-smooth-environment-resolved-error-field.png` |
| `/articles/beyond-carbon-the-error-geometry-of-environmental-materials/` | FAIL | Share module blocked by CSP; Broken images (up to 8) | `screenshots/desktop--article-beyond-carbon-the-error-geometry-of-environmental-materials.png`<br>`screenshots/tablet--article-beyond-carbon-the-error-geometry-of-environmental-materials.png`<br>`screenshots/mobile--article-beyond-carbon-the-error-geometry-of-environmental-materials.png` |
| `/articles/cement-concrete-and-the-weight-of-the-built-world/` | FAIL | Share module blocked by CSP; Broken images (up to 8) | `screenshots/desktop--article-cement-concrete-and-the-weight-of-the-built-world.png`<br>`screenshots/tablet--article-cement-concrete-and-the-weight-of-the-built-world.png`<br>`screenshots/mobile--article-cement-concrete-and-the-weight-of-the-built-world.png` |
| `/articles/critical-minerals-pfas-and-the-remediation-imperative/` | FAIL | Share module blocked by CSP; Broken images (up to 9) | `screenshots/desktop--article-critical-minerals-pfas-and-the-remediation-imperative.png`<br>`screenshots/tablet--article-critical-minerals-pfas-and-the-remediation-imperative.png`<br>`screenshots/mobile--article-critical-minerals-pfas-and-the-remediation-imperative.png` |
| `/articles/five-materials-for-5-to-12-gtco2-year/` | FAIL | Share module blocked by CSP; Broken images (up to 8) | `screenshots/desktop--article-five-materials-for-5-to-12-gtco2-year.png`<br>`screenshots/tablet--article-five-materials-for-5-to-12-gtco2-year.png`<br>`screenshots/mobile--article-five-materials-for-5-to-12-gtco2-year.png` |
| `/articles/from-fantasy-frameworks-to-makeable-materials/` | FAIL | Share module blocked by CSP; Horizontal overflow (+780px) | `screenshots/desktop--article-from-fantasy-frameworks-to-makeable-materials.png`<br>`screenshots/tablet--article-from-fantasy-frameworks-to-makeable-materials.png`<br>`screenshots/mobile--article-from-fantasy-frameworks-to-makeable-materials.png` |
| `/articles/from-predicted-crystal-to-commercial-cell/` | FAIL | Share module blocked by CSP; Broken images (up to 9) | `screenshots/desktop--article-from-predicted-crystal-to-commercial-cell.png`<br>`screenshots/tablet--article-from-predicted-crystal-to-commercial-cell.png`<br>`screenshots/mobile--article-from-predicted-crystal-to-commercial-cell.png` |
| `/articles/investing-in-the-trust-layer/` | FAIL | Share module blocked by CSP; Broken images (up to 8) | `screenshots/desktop--article-investing-in-the-trust-layer.png`<br>`screenshots/tablet--article-investing-in-the-trust-layer.png`<br>`screenshots/mobile--article-investing-in-the-trust-layer.png` |
| `/articles/methane-and-refrigerants-cutting-the-non-co2-climate-forcers/` | FAIL | Share module blocked by CSP; Broken images (up to 8) | `screenshots/desktop--article-methane-and-refrigerants-cutting-the-non-co2-climate-forcers.png`<br>`screenshots/tablet--article-methane-and-refrigerants-cutting-the-non-co2-climate-forcers.png`<br>`screenshots/mobile--article-methane-and-refrigerants-cutting-the-non-co2-climate-forcers.png` |
| `/articles/the-02-percent-synthesis-problem/` | FAIL | Share module blocked by CSP; Broken images (up to 8) | `screenshots/desktop--article-the-02-percent-synthesis-problem.png`<br>`screenshots/tablet--article-the-02-percent-synthesis-problem.png`<br>`screenshots/mobile--article-the-02-percent-synthesis-problem.png` |
| `/articles/the-order-is-right-the-size-is-wrong/` | FAIL | Share module blocked by CSP | `screenshots/desktop--article-the-order-is-right-the-size-is-wrong.png`<br>`screenshots/tablet--article-the-order-is-right-the-size-is-wrong.png`<br>`screenshots/mobile--article-the-order-is-right-the-size-is-wrong.png` |
| `/articles/the-trust-layer/` | FAIL | Share module blocked by CSP | `screenshots/desktop--article-the-trust-layer.png`<br>`screenshots/tablet--article-the-trust-layer.png`<br>`screenshots/mobile--article-the-trust-layer.png` |
| `/articles/water-and-air-correcting-the-molecules-we-drink-and-breathe/` | FAIL | Share module blocked by CSP; Broken images (up to 9) | `screenshots/desktop--article-water-and-air-correcting-the-molecules-we-drink-and-breathe.png`<br>`screenshots/tablet--article-water-and-air-correcting-the-molecules-we-drink-and-breathe.png`<br>`screenshots/mobile--article-water-and-air-correcting-the-molecules-we-drink-and-breathe.png` |
| `/articles/why-lupi/` | FAIL | Share module blocked by CSP | `screenshots/desktop--article-why-lupi.png`<br>`screenshots/tablet--article-why-lupi.png`<br>`screenshots/mobile--article-why-lupi.png` |
| `/articles/why-lupine-science/` | FAIL | Share module blocked by CSP | `screenshots/desktop--article-why-lupine-science.png`<br>`screenshots/tablet--article-why-lupine-science.png`<br>`screenshots/mobile--article-why-lupine-science.png` |

## Console and network summary

- HTTP: 60/60 navigations returned 200.
- First-party share module: 51 CSP console errors + 51 failed requests.
- Google Fonts: 3 CSP console errors + 3 failed requests.
- Generic 404 console messages: 4 (correlated with missing local image assets in page metrics).
- `hero.mp4`: three aborted requests on “Why Lupine Science”; this appears to be browser media cancellation rather than a confirmed 404, but should be rechecked after the asset/CSP fixes.
- No page exceptions were recorded.

## Evidence manifest

- `results.json` — structured result for all 60 combinations, including exact issue messages, broken URLs, overflow elements, dimensions, and screenshot paths.
- `screenshots/` — 60 full-page PNGs, named `<viewport>--<page>.png`.
- `mobile-contact-sheet.jpg` — all 20 mobile captures for rapid editorial comparison.

## Acceptance checklist

- Complete public HTML page inventory: yes (20/20).
- Representative desktop/tablet/mobile matrix: yes (60 captures).
- Evidence paths: yes.
- Pass/fail per page: yes.
- Reproducible prioritized P0–P3 findings: yes.
- Console errors and responsive overflow checked: yes.

## Release-blocker verification — 2026-07-10

Re-audited the same 20-page desktop/tablet/mobile matrix (60 browser runs) against the local production server after the P1 fixes. The targeted release blockers now pass in all 60 runs:

- **Missing assets:** 0 non-empty broken image URLs. The static verifier now rejects root-relative `src`, `srcset`, `poster`, or file `href` references that do not exist under `public/`. The unpublished Cement video card was removed because neither its MP4 nor poster ships.
- **Brand library:** all 200 card images resolve after lazy-load scrolling, at all three viewports. Google Fonts requests were removed in favor of the existing self-hosted Newsreader and IBM Plex Mono files.
- **Mobile overflow:** `/articles/from-fantasy-frameworks-to-makeable-materials/` now reports `scrollWidth === clientWidth` at 1440px, 834px, and 390px. Long citation links wrap and code blocks are constrained/pre-wrapped.
- **First-party sharing under CSP:** no `share.mjs` CSP errors occurred. Article pages rendered five primary share actions; the dedicated CSP/idempotency regression work remains tracked by `t_0193024b` and review task `t_5d721e10`.

Verification commands: `npm run build` passed; `npm run test` passed (75/75); `npm run lint` passed; `node scripts/check-static.mjs` passed; targeted browser audit passed (0/60 failures for missing assets, overflow, external font CSP, or first-party share CSP). `npm run verify` reached and passed static verification, then remained non-zero only for the separately tracked pre-existing video/font performance budgets (four videos over 3 MiB, `/videos/` cold transfer, and aggregate fonts).
