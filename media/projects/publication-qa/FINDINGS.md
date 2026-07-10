# Publication QA Audit — Lupine Science Articles & Proof-Pack PDF

**Date:** 2026-07-10  
**Scope:** 10 article pages in `public/articles/<slug>/index.html`, `public/articles/styles.css`, `scripts/build-articles.mjs`, `scripts/build-proofpack.mjs`, and `public/proof-pack-climate-series.pdf`.  
**Method:** Local static server on a free port; Playwright full-page screenshots at 1440×900 (desktop) and 390×844 (mobile); visual inspection + DOM/CSS audit + PDF text/image extraction.

---

## Executive Summary

The article pages share a clean typographic foundation, but a single Markdown-to-HTML pipeline bug is causing cascading layout problems: inline figures are emitted as `<p><img><em>caption</em></p>` instead of `<figure><figcaption>`. This means captions are not styled, images are not constrained to the column, and in several articles images appear **before the `<h1>` title**. The proof-pack PDF inherits the same overflow and also exposes unrendered LaTeX math in one article.

The top 5 issues are listed at the end of this report.

---

## 1. Global / Stylesheet Issues

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 1.1 | **Inline images are not constrained to the article column.** CSS only sets `width:100%` on `.article figure img`. Inline `<p><img>` elements keep their natural size (1280 px), breaking the 760 px column on desktop and overflowing the PDF page. | **Critical** | Measured: `article > p > img` = 1280 px wide inside a 716 px content box (`the-02-percent-synthesis-problem`). PDF pages 3, 31, 46, 60 show images/text cropped at the right margin. | Add a global image rule: `.article img { max-width: 100%; height: auto; display: block; }`. Preferably convert inline figures to `<figure>`/`<figcaption>` in the builder. |
| 1.2 | **Inline figure captions are not styled as captions.** They are plain `<em>` paragraphs, so they render in Newsreader italic instead of the mono `figcaption` style and lack top spacing/borders. | **Major** | Caption font computed as `Newsreader` (serif) for `article > p > em`; hero `figcaption` uses `IBM Plex Mono`. | Wrap inline images + captions in `<figure>`/`<figcaption>` in `build-articles.mjs`, or add explicit `.article p > em` caption styling if keeping the current markup. |
| 1.3 | **No responsive typography scale for very small viewports.** Body text drops to 16 px at ≤920 px but remains large relative to a 390 px viewport; the metadata block dominates the first screen. | **Minor** | Mobile screenshots: metadata block occupies ~60 % of the initial viewport before the title. | Add a tighter mobile type scale (e.g., 15 px body / tighter line-height) and shorten or collapse the metadata block on small screens. |
| 1.4 | **Print CSS removes header/footer/share bar but does not fix image overflow.** | **Minor** | `@media print` hides chrome but images still overflow when PDF is generated. | Add `img { max-width: 100% !important; }` inside `@media print`, or switch figures to `width:100%` for print. |

---

## 2. Per-Article Layout Issues

### 2.1 `/articles/the-02-percent-synthesis-problem/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.1.1 | Inline synthesis-funnel image overflows the text column. | Critical | Desktop screenshot; measured image width 1280 px vs. 716 px content box. | Apply global image max-width and/or convert to `<figure>`. |
| 2.1.2 | Image captions render as italic paragraphs (not mono captions). | Major | First caption: `<em>Of 380,000…</em>` below inline image. | Convert to `<figcaption>` in builder. |
| 2.1.3 | “Footnotes” heading is unstyled raw Markdown (`<h2>Footnotes</h2>`) and sits above an `<hr>` that visually duplicates the section border. | Minor | HTML line 127; CSS already adds `border-top` on `.footnotes`, so the `<hr class="footnotes-sep">` is redundant. | Remove the `<hr>` or style `.footnotes-sep { display: none; }`; consider suppressing the "Footnotes" heading via CSS. |
| 2.1.4 | Share bar appears after footnotes, which is an unusual reading order. | Minor | HTML line 156, after `<section class="footnotes">`. | Move share bar before footnotes, or place it at the top of the article as well. |

### 2.2 `/articles/a-field-not-a-neural-net/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.2.1 | **LaTeX math is not rendered.** `$$...$$` and inline `$...$` appear as raw source in both HTML and PDF. | **Critical** | HTML lines 94–95, 112; PDF page 17 shows raw `$$E^{\text{model}} - E^{\text{ref}} \approx \sum_i P(c_i).$$` and `$c$`. | Add a Markdown-it math plugin (e.g., `markdown-it-mathjax3` or KaTeX) to `build-articles.mjs`; ensure web fonts are loaded for PDF print. |
| 2.2.2 | Mixed smart/straight quotes: `“novel&quot; targets` renders as curly open + straight close. | Major | HTML line 87: `“novel&quot; targets`. | Fix source Markdown escaping or rely on `typographer: true` consistently; remove the `&quot;` entity. |
| 2.2.3 | Erroneous copyright symbol inside math: `$P©$` should be `P(c)`. | Major | HTML line 96; likely a source typo where `(c)` became `©`. | Correct the source Markdown to `$P(c)$`. |
| 2.2.4 | Inline images overflow column and captions are unstyled. | Critical | Same global inline-image issue (7 inline images in this article). | Same as 1.1 / 1.2. |

### 2.3 `/articles/beyond-carbon-the-error-geometry-of-environmental-materials/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.3.1 | **First inline image appears before the `<h1>` title.** The article opens with metadata → image → title → hero, which buries the headline. | **Major** | HTML lines 78–86; desktop screenshot shows "One Geometry, Seven Planetary Boundaries" above the title. | Re-order Markdown source so the first heading precedes any figure, or make the builder insert the hero immediately after `<h1>` and place inline figures only below the first paragraph. |
| 2.3.2 | Hero is preceded by an unrelated inline image, creating a double-image cluster at the top. | Major | Same as above: inline image then hero figure. | Re-order source or enforce hero placement immediately after `<h1>`. |
| 2.3.3 | Inline images overflow and captions unstyled. | Critical | 10 inline images; desktop screenshot shows multiple wide figures. | Same as 1.1 / 1.2. |

### 2.4 `/articles/five-materials-for-5-to-12-gtco2-year/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.4.1 | Inline images overflow column and captions unstyled. | Critical | 10 inline images. | Same as 1.1 / 1.2. |
| 2.4.2 | Title contains `5–12 GtCO₂/Year`; verify subscript renders in PDF. | Minor | PDF page 29 shows correct `CO₂` subscript; no glyph issue. | — |

### 2.5 `/articles/from-predicted-crystal-to-commercial-cell/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.5.1 | Inline images overflow column and captions unstyled. | Critical | 10 inline images; PDF page 46 shows image heading cropped. | Same as 1.1 / 1.2. |
| 2.5.2 | Footnotes have many repeated backref links (up to 23 per article); no visual separator between multiple `↩︎` links. | Minor | `from-predicted-crystal-to-commercial-cell` has 23 backrefs; they run together in the footnote line. | Add `margin-left` or `padding` between `.footnote-backref` links, or group them with commas. |

### 2.6 `/articles/investing-in-the-trust-layer/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.6.1 | Inline image appears before `<h1>` title. | Major | Same pattern as beyond-carbon. | Re-order source or fix builder placement. |
| 2.6.2 | Inline images overflow and captions unstyled. | Critical | Same global issue. | Same as 1.1 / 1.2. |

### 2.7 `/articles/water-and-air-correcting-the-molecules-we-drink-and-breathe/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.7.1 | Inline image appears before `<h1>` title. | Major | Desktop screenshot: "The Human Scale of Water and Air Failure" above the title. | Re-order source or fix builder placement. |
| 2.7.2 | Inline images overflow and captions unstyled. | Critical | Same global issue. | Same as 1.1 / 1.2. |

### 2.8 `/articles/methane-and-refrigerants-cutting-the-non-co2-climate-forcers/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.8.1 | Inline image appears before `<h1>` title. | Major | Same pattern. | Re-order source or fix builder placement. |
| 2.8.2 | Inline images overflow and captions unstyled. | Critical | Same global issue. | Same as 1.1 / 1.2. |

### 2.9 `/articles/critical-minerals-pfas-and-the-remediation-imperative/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.9.1 | Inline images overflow and captions unstyled. | Critical | Same global issue. | Same as 1.1 / 1.2. |

### 2.10 `/articles/cement-concrete-and-the-weight-of-the-built-world/`

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 2.10.1 | Inline image appears before `<h1>` title. | Major | Same pattern. | Re-order source or fix builder placement. |
| 2.10.2 | Inline images overflow and captions unstyled. | Critical | Same global issue. | Same as 1.1 / 1.2. |

---

## 3. Component-Specific Issues

### 3.1 Share Bar

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 3.1.1 | Share bar is placed after footnotes, so a reader who copies the URL must scroll past citations. | Minor | HTML structure in all 10 articles. | Move `.share-bar` before `.footnotes` in `build-articles.mjs`. |
| 3.1.2 | Mobile tap targets are small and closely packed; labels rely on text only (X, LinkedIn, Copy link). | Minor | Mobile screenshot: buttons are ~12 px font inside small pill shapes. | Increase padding to at least 44×44 px touch target and consider icon+label layout for small screens. |

### 3.2 Footnotes

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 3.2.1 | `.footnote-backref` links have no spacing/separator when a note is cited multiple times. | Minor | beyond-carbon line 140: eight `↩︎` links in a row. | Add `.footnote-backref { margin-left: 0.3em; }` or join with commas. |
| 3.2.2 | The "Footnotes" `<h2>` is redundant with the `<section class="footnotes">` top border. | Minor | Every article with footnotes. | Hide `<hr class="footnotes-sep">` and style the heading as a small-caps label, or suppress both. |

### 3.3 Header / Navigation

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 3.3.1 | Site tagline "accelerating materials discovery" wraps awkwardly on mobile, leaving a large gap below the mark. | Minor | Mobile screenshot: "discovery" sits alone on a second line. | Allow the mark text to wrap as a unit or hide the tagline on narrow screens. |
| 3.3.2 | Nav links are close together on mobile; while not overlapping, they could use more separation. | Minor | Mobile screenshot: Home / Articles / Library / LUPI with ~16 px gaps. | Increase `.site-nav { gap }` on mobile or use a more generous min tap target. |

### 3.4 Metadata Block

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 3.4.1 | The full metadata block is shown to all readers and is very long on mobile, pushing the title below the fold. | Major | Mobile screenshot: title begins ~60 % down the first screen. | Collapse to a compact byline on mobile (Date · Status · Audience) with an expand control, or move it after the lead. |

---

## 4. PDF Notes

`public/proof-pack-climate-series.pdf` was regenerated during this audit (6.79 MB, 69 pages). Visual inspection of representative pages and text extraction (`pdftotext`) revealed:

| # | Issue | Severity | Evidence | Suggested Fix |
|---|-------|----------|----------|---------------|
| 4.1 | **Inline images overflow the printable area and are cropped.** Page headings inside wide images are cut off. | **Critical** | PDF pages 3, 31, 46, 60: e.g., "The 0.2% Synthesis F[unnel]", "Why Promising Candidates Fail in the Sy[nthesis]", "Six Handoffs, Six Places for a Predicti[on]". | Fix image max-width in print CSS (see 1.1). |
| 4.2 | **LaTeX math renders as raw source.** | **Critical** | PDF page 17 (a-field-not-a-neural-net): `$$E^{\text{model}} - E^{\text{ref}} \approx \sum_i P(c_i).$$`; `$c$` appears inline. | Add math rendering to the build pipeline and embed fonts for PDF output. |
| 4.3 | Copyright symbol inside math renders literally as `$P©$`. | Major | Source/HTML line 96 of a-field-not-a-neural-net; PDF inherits this. | Fix source typo to `$P(c)$`. |
| 4.4 | En dash, em dash, smart quotes, apostrophes, and CO₂ subscript render correctly. | — | Text extraction shows `CO₂` (28×), `—`, `–`, `“`, `”`, `’`, `×`, `≈`, `γ`. | No action. |
| 4.5 | No page numbers or running headers in the PDF body. | Minor | 69 pages without pagination. | Add `@page { @bottom-center { content: counter(page); } }` or equivalent via Paged.js/Prince if desired. |
| 4.6 | PDF is not tagged/accessible. | Minor | `pdfinfo` reports `Tagged: no`. | Add PDF tags if the toolchain supports it; for Playwright-generated PDFs this may require additional tooling. |

---

## 5. Top 5 Most Important Issues

1. **Inline images overflow the article column and PDF printable area** (Critical). Affects all 10 articles and the proof pack. Fix: add `img { max-width: 100%; height: auto; }` and convert inline figures to `<figure>`.
2. **LaTeX math is emitted as raw source** (Critical). Affects `/articles/a-field-not-a-neural-net/` and the proof pack. Fix: add a math plugin to the Markdown builder.
3. **Inline figures use `<em>` captions instead of `<figcaption>`** (Major). Affects all 10 articles; breaks caption styling and accessibility. Fix: wrap images + captions in `<figure>` in the builder.
4. **Images appear before the `<h1>` title in 5 articles** (Major). Affects beyond-carbon, investing-in-the-trust-layer, water-and-air, methane-and-refrigerants, cement-concrete. Fix: reorder source or enforce hero placement right after `<h1>`.
5. **Metadata block dominates the mobile first screen** (Major). Pushes the title below the fold. Fix: collapse metadata on small viewports or move it after the lead paragraph.

---

## Deliverables

- Screenshots: `/home/alex/Dev/lupine/lupine-science/media/projects/publication-qa/screenshots/`
- PDF page extracts: `/home/alex/Dev/lupine/lupine-science/media/projects/publication-qa/pdf-pages/`
- This report: `/home/alex/Dev/lupine/lupine-science/media/projects/publication-qa/FINDINGS.md`

No fixes were applied; no commits or pushes were made.
