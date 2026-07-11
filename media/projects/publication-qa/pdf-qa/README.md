# PDF Output QA Report

**Date:** 2026-07-10  
**Artifact:** `public/proof-pack-climate-series.pdf`  
**Generator:** `scripts/build-proofpack.mjs` (`npm run proofpack`)

## Scope and export-path inventory

Repository search found one PDF generation path: `scripts/build-proofpack.mjs`. It starts a local server, prints a cover and the rendered HTML article for each of five climate-series articles with Chromium/Playwright, and merges the ten intermediate PDFs with `pdf-lib`. The shipped output is `public/proof-pack-climate-series.pdf`; no other PDF builder or article-to-PDF export path was found.

The production articles provide the representative test content: long multi-page prose, h1/h2/h3 headings, 31 placed figures, footnotes and links, smart punctuation, CO₂/subscripts, superscripts, Greek and mathematical symbols, and KaTeX display/inline equations.

## Generated artifact

A real production build completed successfully:

- 71 US Letter pages (`612 x 792 pt`), PDF 1.7
- 4,368,230 bytes (4.17 MiB) in the final reproducibility build
- 31 placed figures detected across article pages
- 158 link annotations (6 URI links and 152 named links)
- Contact sheet: `media/projects/publication-qa/pdf-qa/contact-sheet.jpg`
- Equation sample: `media/projects/publication-qa/pdf-qa/page-17-math.png`
- Scientific-symbol/layout sample: `media/projects/publication-qa/pdf-qa/page-21-symbols.png`
- Machine-readable audit: `media/projects/publication-qa/pdf-qa/report.json`

## Verified results

### Fonts and Unicode

`pdffonts` reported 85 font-resource rows. Every row is embedded, subset, and has a Unicode map. Resources include Newsreader, IBM Plex Mono, KaTeX, Noto Sans/Math, DejaVu Sans Mono, and Liberation Serif fallbacks.

`pdftotext -layout` extraction contained all baseline markers: `CO₂`, em/en dashes, curly quotes/apostrophe, `×`, `≈`, `γ`, and `∑`. Counts from the generated artifact included 27 `CO₂`, 92 em dashes, 65 en dashes, 67 opening and 67 closing curly double quotes, 76 curly apostrophes, 8 multiplication signs, 4 approximately-equal signs, 5 gamma characters, and 3 summation signs. No Unicode replacement character (`U+FFFD`), raw `$$`, or raw `\text{model}` was extracted.

High-resolution visual samples showed no tofu/missing-glyph boxes. KaTeX renders rather than leaking source syntax.

### Margins, figures, clipping, and pagination

Programmatic PyMuPDF block inspection found no text block within 18 pt (0.25 in) of a physical page edge. Excluding cover pages, page-number-only pages, and footer page numbers, minimum observed text margins were:

- left: 73.5 pt (1.021 in)
- right: 72.4 pt (1.006 in)
- top: 57.1 pt (0.793 in)
- bottom: 62.1 pt (0.862 in)

Placed figures had minimum left/right margins of 74.25/73.5 pt. Representative visual inspection found no clipped or cropped figures or body text. No heading was detected within the bottom 100 pt of a page. Print CSS currently sets `orphans: 3`, `widows: 3`, avoids breaks inside figures/callouts, and avoids breaks after h2/h3 headings.

## Prioritized issues

### P0 — all interactive PDF links are broken or non-portable

- All 6 URI annotations target the ephemeral build server at `http://127.0.0.1:<port>/`, including five cover-logo links and the article video link. They stop working as soon as the builder closes its server.
- All 152 footnote/back-reference annotations point at named destinations (`fn1`, etc.), but the merged PDF has no `/Dests` or `/Names` destination catalog. The annotations therefore cannot resolve after the `pdf-lib` merge.

Recommended fix: canonicalize same-origin links to `https://lupine.science/...` before printing. Preserve/rebuild named destinations when merging, or remove internal link annotations if the merge tool cannot retain their targets. Add strict link validation after merge.

### P1 — display/inline math collides with prose on PDF page 21

The force equation and the following sentence overlap visibly on PDF page 21 (article-local page 8). Superscript/subscript placement in the preceding `10^-4 J/m²` expression is also awkward. This is not a missing-glyph issue; it is KaTeX line-box/print-layout collision.

Recommended fix: add print-specific vertical spacing/line-height around `.katex-display` and prevent equation blocks from colliding with adjacent paragraphs. Keep `media/projects/publication-qa/pdf-qa/page-21-symbols.png` as the regression reference.

### P1 — two blank article pages

Pages 12 and 58 contain only a page number. They occur immediately before the next article cover, indicating trailing print-flow whitespace rather than intentional section blanks.

Recommended fix: remove print-only trailing `.article-shell`/container padding or other overflow responsible for the extra page, then assert that no page is blank except explicitly declared section blanks.

### P2 — Newsreader is emitted as Type 3

All fonts are embedded and text remains extractable, but Newsreader regular/italic resources are emitted as Type 3. Type 3 output can vary across older printer/RIP pipelines and deserves physical-printer or alternate-renderer spot checks.

Recommended fix: compare Chrome/Poppler/Acrobat print output. If inconsistent, use a static print font or investigate the variable-font subset path.

### P2 — accessibility, metadata, and delivery optimization

`pdfinfo` reports `Tagged: no` and `Optimized: no`. The merged document has generic `pdf-lib` Creator/Producer values but no publication title/author/subject metadata. These do not affect glyph rendering, but they reduce accessibility, discoverability, and progressive web loading.

## Automated QA added

- `scripts/check-pdf.mjs`: validates page size/count, font embedding and Unicode maps, required/forbidden extracted text, sparse pages, Type 3 resources, localhost URIs, and unresolved named destinations.
- `tests/fixtures/pdf-qa-expectations.json`: production baseline for article titles and Unicode/scientific markers.
- `tests/pdf-qa.test.mjs`: unit coverage for Poppler parsers, sparse-page detection, and annotation/destination inspection.
- `npm run pdf:check`: non-strict baseline check. Use `--strict` to turn current warnings into failures after the P0/P1 issues are fixed.

## Exact verification commands

```sh
npm run proofpack
npm run pdf:check -- --report media/projects/publication-qa/pdf-qa/report.json
npm run pdf:check -- --strict

pdfinfo public/proof-pack-climate-series.pdf
pdffonts public/proof-pack-climate-series.pdf
pdftotext -layout public/proof-pack-climate-series.pdf /tmp/proofpack.txt
pdfinfo -url public/proof-pack-climate-series.pdf
pdfinfo -dests public/proof-pack-climate-series.pdf

pdftoppm -f 17 -singlefile -png -r 150 \
  public/proof-pack-climate-series.pdf /tmp/proofpack-page-17
pdftoppm -f 21 -singlefile -png -r 150 \
  public/proof-pack-climate-series.pdf /tmp/proofpack-page-21

node --test tests/pdf-qa.test.mjs
npm run test
npm run lint
npm run typecheck
npm run build
```

`npm run pdf:check -- --strict` is expected to fail until the documented warnings are resolved; the normal baseline check passes while reporting them.
