# Proof-pack and download-card design specification

## Creative decision

Treat each proof pack as a compact scientific dossier, not a printout of the article. The hierarchy is deliberately editorial: claim first, evidence second, audit trail always visible. Paper, ink, indigo, and restrained ochre match the article system in `public/articles/styles.css`; Newsreader and IBM Plex Mono are served from `/public/fonts` and never fetched at runtime.

Implementation references:

- rendered template: `public/proof-pack-template/index.html`
- print styles: `public/proof-pack.css`
- content authoring scaffold: `articles/_templates/proof-pack.md`
- current production builder: `scripts/build-proofpack.mjs`

## Pack anatomy

1. **Cover** — wordmark, document type/version, title and deck, evidence status, figure/reference counts, publication date, document ID, author/institution, and canonical URL. Avoid decorative photography; the title and evidence status are the focal points.
2. **Executive summary** — one-paragraph synthesis, three to five findings, an explicit evidence verdict, and a boundary/uncertainty statement. Do not turn scenarios into forecasts.
3. **Key figures** — only decision-relevant charts. Preserve complete axes, labels, legends, and annotations. Every figure requires visible numbering, a descriptive caption, a source/provenance line, and meaningful alt text in the HTML source.
4. **Data tables** — one subject per table, explicit units in labels or cells, tabular numerals, and real `<caption>`, `<thead>`, `<th scope>`, and `<tbody>` semantics. Never encode meaning with color alone.
5. **Methodology note** — unit of analysis, evidence cutoff, transformations, exclusions, known limitations, and build/version record.
6. **Credits** — named author, institution, editorial reviewer, and data/figure provenance. Placeholder credits block release.
7. **Bibliography and audit trail** — ordered references with durable DOI/source links followed by dataset, code, archive, or ledger links where available.

## Page system

- Default output is US Letter (`8.5 × 11 in`) because `scripts/build-proofpack.mjs` currently requests Letter. Pages use a `0.72 in` horizontal live margin and approximately `0.7 in` vertical margin.
- The resulting `6.98 × 9.62 in` live area also fits within A4's `8.27 × 11.69 in` sheet at 100%, leaving at least 0.64 in horizontal and 1.03 in vertical total spare area. Do not place content, rules, or crop-sensitive art outside the live area.
- Page furniture is quiet: running label above, short title plus folio below. The cover has no folio. In the browser template the values are deterministic `data-*` attributes; a production pagination engine may replace them with counters only after snapshot tests are stable.
- Figures, tables, callouts, and credits avoid page breaks internally. Headings stay with following content; body copy uses three-line widows/orphans.
- Print backgrounds are intentional and must be generated with `printBackground: true`. All text remains legible in grayscale; borders and labels carry distinctions that color reinforces.

## Typography and Unicode release gate

- Use repository-local `Newsreader` for reading text and `IBM Plex Mono` for labels, numbers, metadata, and source lines. The repository-local `proof-unicode.ttf` (Noto Serif) is the only permitted fallback for glyphs absent from those subsets. `font-display: block` prevents a PDF being captured with fallback metrics.
- Production is offline and deterministic: no Google Fonts, CDN CSS, remote images, analytics, or post-load substitutions. Await `document.fonts.ready` before printing.
- Every released PDF must report all fonts as embedded and Unicode mapped via `pdffonts` (the existing `npm run pdf:check` checks both conditions).
- Every preview and production pack must contain and successfully round-trip this exact coverage string through `pdftotext`:

  `CO₂ · CH₄ · GtCO₂/year · en dash – · em dash — · “curly quotes” · α β γ Δ μ σ ∑ ∂ ≈ ≤ ≥ ± × · José García · Zoë Šimůnková · François L’Écuyer`

- If a subset font lacks any glyph, expand/rebuild the local subset in `scripts/build-fonts.mjs` or deliberately route it to `proof-unicode.ttf`; do not accept a system-font fallback. KaTeX remains local under `public/katex/fonts` for equation rendering.

## Accessibility

- Source order must match reading order; use one `<main>`, page `<section>` landmarks, heading hierarchy, real lists/tables, and explicit `aria-labelledby` connections for sections and callouts.
- Decorative marks use empty alt text. Charts require concise alt text that communicates chart type, compared variables, and takeaway; the caption provides context and provenance.
- Minimum body size is 10.5 pt, notes 8.5 pt, metadata 6.8–7.5 pt. Indigo text is reserved for labels or large emphasis; body links use indigo-deep and remain underlined.
- HTML semantics improve source accessibility, but Chromium PDFs are not reliably tagged. A tagged-PDF remediation pass is required before claiming PDF/UA conformance; the existing PDF checker should continue warning when `Tagged: no`.
- URLs may wrap, but never overflow. Links in generated PDFs must point to public canonical URLs, not localhost.

## Article-page download card

Place the card after the article deck/byline and before the hero figure on desktop; on narrow screens keep it in the same source position. Do not bury the proof pack beside social controls.

### Visual specification

- Full article-column width; paper-deep background; 1 px rule border; 3 px indigo left rule; 6 px radius.
- Internal layout: `minmax(0, 1fr) auto`, 20–24 px gap, 18–20 px padding. Collapse to one column below 600 px.
- Left stack: mono eyebrow `EVIDENCE PROOF PACK`, serif title `Download the evidence behind this article`, one two-line description, then mono metadata such as `PDF · 5 pages · 1.8 MB · updated 2026-07-09`.
- Right action: native `<a download>` styled as a compact button, minimum 44 × 44 px target, indigo fill, paper text. Label `Download PDF`; optional arrow icon is decorative. Do not use a document thumbnail.
- Hover: deepen indigo; focus: 3 px outline with 3 px offset; active: no movement animation. Under reduced motion, transitions are removed.
- Mobile: button spans full card width; metadata wraps naturally. Card must still work at 320 px without horizontal scrolling.
- Print: replace the button with the canonical PDF URL in plain mono text or hide the card if the pack itself is being printed. Never print an inert button.

### Semantic contract

```text
aside.proof-download[aria-labelledby]
  div
    p.eyebrow
    h2#proof-download-title
    p.description
    p.metadata
  a.proof-download__action[href$=".pdf"][download]
```

The link's accessible name should include the article title when ambiguity is possible. Expose file type, page count, file size, and last-updated date as text—not only an icon or tooltip. File size and page count are build outputs and must not be guessed.

## Builder integration and release checklist

1. Populate the template from article metadata and explicit proof-pack front matter; do not infer evidence verdicts from prose.
2. Copy only selected figures and their original captions/alt text; resolve image URLs against the local static server.
3. Render with the existing local HTTP server and Chromium; wait for images and `document.fonts.ready`; fail on any network request outside `127.0.0.1`.
4. Add PDF metadata (title, author, subject, creation tool) and deterministic document/version identifiers. Avoid embedding wall-clock timestamps unless supplied by source metadata.
5. Run `npm run proofpack`, `npm run pdf:check`, `pdftotext -layout`, and a raster snapshot/visual check at 100% scale. Spot-check Letter and A4 print dialogs with scaling disabled.
6. Confirm no clipped figures/tables, blank pages, local link annotations, missing glyphs, placeholder credits, or unsupported claims.
7. Generate the download-card metadata from the final artifact and verify the href resolves with `application/pdf` and a stable filename.

## Generalized per-article pipeline

A proof pack is now produced per eligible article from a sibling manifest file:

- Author the content schema in `public/articles/<slug>/<slug>.proofpack.json`. It extends the manifest schema in `schemas/proof-pack.schema.json` (metadata, summary, figures, data tables, methodology, credits, bibliography, audit links).
- Run the builder:
  - `npm run proofpack` — legacy consolidated climate-series PDF (`public/proof-pack-climate-series.pdf`).
  - `npm run proofpack:all` — one PDF + JSON manifest per eligible article.
  - `npm run proofpack:slug -- <slug>` — one article only.
  - `npm run proofpack:validate -- <manifest.json>` — validate a manifest.
- Per-article outputs land in `public/proof-packs/<slug>.proofpack.pdf` with a sibling `<slug>.proofpack.json` manifest containing content-addressed input checksums and the output PDF checksum.
- The builder renders `public/proof-pack-template/index.html` populated from the manifest, serves `public/` locally, prints to Letter with Playwright, waits for fonts and images, normalizes PDF metadata/timestamps to the manifest date, and removes stale outputs on `--all`.
- Byte-identical reproducibility is not guaranteed across Chromium runs, so determinism is verified by semantic comparison: repeated builds produce identical `pdftotext -layout` output and identical input/output checksums in the manifest.
