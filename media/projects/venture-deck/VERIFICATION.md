# Venture deck end-to-end verification

> Historical VENTURE-1C verification record. For the current VENTURE-1G-R2 state, use `validation-report.md` and `qa/closure-builder-remediation-t_f0bda334.md`; hashes, builder behavior, and validator output below intentionally document the earlier build and are superseded.

Task: `t_49543c64`  
Repository actually containing the sibling outputs: `/home/alex/Dev/lupine/lupine-science`  
Requested workspace path `/home/alex/Dev/lupine-science` was empty.  
Date: 2026-07-28  
Deployment: not performed  
PR: not opened

## Overall result

**PASS AFTER REMEDIATION (2026-07-28).** The two original downstream findings were reproduced and fixed:

1. The sibling deterministic build and validation wrappers now pass with 13 slides, 13 PDF pages, zero external requests, and zero overflow issues.
2. Slide 1 now has a 32 px body/image gutter; the full word “laboratory” is visible at native 1920×1080 resolution. The primary validator now checks actual rendered text-glyph occlusion against later/higher deck assets across all 13 slides, in addition to overflow and safe-area geometry.

The original failing command output remains below as historical evidence of the red state before remediation.

## Remediation verification

```text
$ node media/projects/venture-deck/build-deck.mjs
rendered 13 slides to media/projects/venture-deck/lupine-science-venture-deck.pdf (13 pages)

$ node media/projects/venture-deck/validate-deck.mjs
validated 13 slides, 13 PDF pages, 0 external requests, 0 overflow issues

$ node --test tests/venture-deck-tooling.test.mjs
# tests 8
# pass 8
# fail 0

$ npm run venture:validate
[pass] 1920×1080 geometry, safe-area, line-count, overflow, and text/asset overlap gates pass
venture deck validation passed.

$ node scripts/build-headers.mjs && node scripts/check-static.mjs && npm run lint && npm test
public/_headers written with 4 inline-script hash(es)
lupine.science static verification passed.
lint passed.
# tests 80
# pass 80
# fail 0

$ pdfinfo media/projects/venture-deck/lupine-science-venture-deck.pdf
Pages:           13
Page size:       960 x 540 pts

$ consecutive npm run venture:build SHA-256 check
HTML: 0850760a7f99a7f8ea2c6e2062488d9113b76c00976a137d0f705dc164c5c3c4 (identical twice)
PDF:  02dcea8613d03afbb77168ed57adacfcc570732adb14015378bb2fddbb426ecc (identical twice)
project/public PDF byte parity: true
```

## Check matrix

| Check | Result | Exact result |
|---|---:|---|
| Slide count is 12–14 | PASS | 13 slides |
| Expected PDF exists | PASS | `media/projects/venture-deck/lupine-science-venture-deck.pdf` |
| PDF page count equals slide count | PASS | 13 pages = 13 slides |
| PDF is 16:9 | PASS | 960 × 540 pt |
| Sibling deterministic build wrapper | PASS | 13 slides rendered to a 13-page PDF |
| Sibling deterministic validation wrapper | PASS | 13 slides, 13 pages, 0 external requests, 0 overflow issues |
| Primary deterministic build | PASS | Exit 0; 13-page PDF, 403,698 bytes |
| Primary validation | PASS | Exit 0; all emitted gates pass |
| No content overflow/overlap on any slide | PASS | Glyph-level occlusion gate passes all 13 slides; native slide-1 review confirms full text |
| Zero external runtime dependencies | PASS | 17 requests observed, 0 external; CSS/JS inline |
| Numeric claims have visible source footers | PASS | 12 non-empty source footers; detected numeric-claim slides 1, 2, 3, 6, 7, 10, 12 all cited; worded quantitative claim on slide 5 also visibly cited |
| Ask slide contains `[OWNER DECISION]` | PASS | Slide 13 visibly contains exactly 3 fields |
| Risk slide present | PASS | Slide 12 headline: “One 30-path panel. One chemistry family. Not peer-reviewed.” |
| `/venture/` decision | PASS — implemented | `public/venture/index.html`, `deck.html`, PDF, evidence manifest, asset lock, and build manifest exist |
| Tooling fixture tests | PASS | 8 passed, 0 failed, including occlusion and empty-box regression cases |

## Exact commands and exact outputs

### 1. Original pre-remediation sibling deterministic build wrapper (historical RED)

```text
$ node media/projects/venture-deck/build-deck.mjs
Error: overflow detected on slide 1: div.eyebrow (428x32 > 428x28); slide 1: span.slide-no (84x28 > 84x25)
    at assertBrowserChecks (file:///home/alex/Dev/lupine/lupine-science/scripts/venture-deck-tools.mjs:140:11)
    at renderDeckPdf (file:///home/alex/Dev/lupine/lupine-science/scripts/venture-deck-tools.mjs:181:5)
    at async file:///home/alex/Dev/lupine/lupine-science/media/projects/venture-deck/build-deck.mjs:34:18
[exit] 1
```

Result: **FAIL**.

### 2. Original pre-remediation sibling deterministic validation wrapper (historical RED)

```text
$ node media/projects/venture-deck/validate-deck.mjs
Error: overflow detected on slide 1: div.eyebrow (428x32 > 428x28); slide 1: span.slide-no (84x28 > 84x25)
    at assertBrowserChecks (file:///home/alex/Dev/lupine/lupine-science/scripts/venture-deck-tools.mjs:140:11)
    at validateDeckArtifacts (file:///home/alex/Dev/lupine/lupine-science/scripts/venture-deck-tools.mjs:217:5)
    at async file:///home/alex/Dev/lupine/lupine-science/media/projects/venture-deck/validate-deck.mjs:33:18
[exit] 1
```

Result: **FAIL**.

### 3. Sibling tooling fixture tests

```text
$ node --test tests/venture-deck-tooling.test.mjs
TAP version 13
# Subtest: venture deck render tooling
    # Subtest: renders and validates a 12-slide 16:9 deck without network access
    ok 1 - renders and validates a 12-slide 16:9 deck without network access
    # Subtest: rejects a deck outside the 12-14 slide range before writing a PDF
    ok 2 - rejects a deck outside the 12-14 slide range before writing a PDF
    # Subtest: fails when any slide content overflows
    ok 3 - fails when any slide content overflows
    # Subtest: fails on attempted external runtime requests
    ok 4 - fails on attempted external runtime requests
    # Subtest: fails validation when the PDF page count differs from the slide count
    ok 5 - fails validation when the PDF page count differs from the slide count
    # Subtest: provides build and validate CLIs that operate on explicit fixture paths
    ok 6 - provides build and validate CLIs that operate on explicit fixture paths
    1..6
ok 1 - venture deck render tooling
1..1
# tests 6
# suites 1
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
[exit] 0
```

Result: **PASS** (6 passed, 0 failed). Timing lines are omitted because they are nondeterministic; all semantic TAP result lines above are copied from the run.

### 4. Primary deterministic build

```text
$ npm run venture:build

> lupine-science@0.1.0 venture:build
> node scripts/build-venture-deck.mjs

venture HTML: public/venture/deck.html
venture PDF: media/projects/venture-deck/lupine-science-venture-deck.pdf (13 pages, 403698 bytes)
venture surface: public/venture/index.html
build manifest: media/projects/venture-deck/build-manifest.json
[exit] 0
```

Result: **PASS**.

### 5. Primary validator

```text
$ npm run venture:validate

> lupine-science@0.1.0 venture:validate
> node scripts/validate-venture-deck.mjs

[pass] exactly 13 sequential slides
[pass] all deck CSS/JS is inline
[pass] no remote runtime URLs
[pass] authored palette restricted to #faf9f6, #16171d, #3d4db3, #8a5e1f
[pass] deck contains no gradients, shadows, or opacity colors
[pass] evidence manifest carried through byte-equivalent JSON data
[pass] all rendered claim IDs resolve in evidence manifest
[pass] three owner-controlled financing fields preserved
[pass] mandatory risk headline is exact
[superseded] earlier validator required 100/100 absence; current validator permits exactly `100/100 unique still slots` and rejects every unscoped 100/100 claim
[pass] source-backed $14.65 is present
[pass] one unique locked Wave-4 asset per slide
[pass] all 13 locked asset hashes and dimensions match
[pass] /venture/ links HTML, PDF, and evidence manifest
[pass] PDF exists with 13 pages
[pass] all PDF pages are 16:9 (960×540pt)
[pass] repository Newsreader and IBM Plex Mono fonts loaded
[pass] browser console is clean
[pass] runtime network requests are local-only
[pass] 1920×1080 geometry, safe-area, line-count, and overflow gates pass
[pass] 13 QA screenshots and contact sheet rendered
venture deck validation passed.
[exit] 0
```

Result: **PASS**, with the visual false negative on slide 1 documented separately below.

### 6. Independent Playwright runtime/source/overlap audit

The temporary script `/tmp/venture-deck-verification/audit.mjs` served `public/` on loopback, loaded `/venture/deck.html` in Chromium at 1920×1080, recorded every request, checked source-footer visibility, and measured slide-1 body/image bounds.

```text
$ node /tmp/venture-deck-verification/audit.mjs
slides=13
requests_total=17
external_requests=0
nonempty_source_footers=12
empty_source_footer_slides=13
numeric_slide=1 source_visible=true source="Lupine Science, “Five Materials That Could Unlock 5–12 GtCO₂/Year,” lines 2–16."
numeric_slide=2 source_visible=true source="Lupine Science, “The 0.2% Synthesis Problem,” lines 7–16; Merchant et al., Nature 624 (2023), DOI 10.1038/s41586-023-06735-9."
numeric_slide=3 source_visible=true source="Lupine Science, “The Order Is Right, the Size Is Wrong,” lines 5–18 and 41–63."
numeric_slide=6 source_visible=true source="Lupine Science, “The Union Verdict,” lines 17–35 (FOR EDITOR REVIEW; not peer-reviewed); “The Z1 Barrier Panel,” lines 1–17 and 23–66."
numeric_slide=7 source_visible=true source="Lupine Science, “The Savings Stack,” lines 26–40; “The Union Verdict,” lines 32–35."
numeric_slide=10 source_visible=true source="Lupine Science, “The Z1 Barrier Panel,” lines 40–66; “The Union Verdict,” lines 17–35 and 75–82; “The Savings Stack,” lines 44–56."
numeric_slide=12 source_visible=true source="Lupine Science, “The Savings Stack,” lines 38–42; “The Union Verdict,” lines 47–57."
slide_1_body_image_overlap={"width":32,"height":150,"area":4800}
slide_1_body_scroll={"clientWidth":850,"scrollWidth":850,"clientHeight":210,"scrollHeight":210}
```

Result: **PASS** for external-request and source-footer checks; **FAIL** for slide-1 overlap. Slide 13 is the intentional owner-controlled ask and has an empty citation element with the accessible label “No source citation for this owner-controlled ask.”

### 7. PDF structure

```text
$ pdfinfo media/projects/venture-deck/lupine-science-venture-deck.pdf
Title:           Lupine Science Venture Deck
Subject:         Source-locked venture presentation
Author:          Lupine Science
Creator:         scripts/build-venture-deck.mjs
Producer:        scripts/build-venture-deck.mjs
CreationDate:    Mon Jul 27 20:00:00 2026 EDT
ModDate:         Mon Jul 27 20:00:00 2026 EDT
Custom Metadata: no
Metadata Stream: no
Tagged:          no
UserProperties:  no
Suspects:        no
Form:            none
JavaScript:      no
Pages:           13
Encrypted:       no
Page size:       960 x 540 pts
Page rot:        0
File size:       403698 bytes
Optimized:       no
PDF version:     1.7
```

Result: **PASS** — 13 PDF pages equal 13 slides.

```text
$ sha256sum media/projects/venture-deck/lupine-science-venture-deck.pdf public/venture/lupine-science-venture-deck.pdf
df07fa8db91c14ab25636d9d9c84405e19d902a3c8f1412b2ffd711defe0ff91  media/projects/venture-deck/lupine-science-venture-deck.pdf
df07fa8db91c14ab25636d9d9c84405e19d902a3c8f1412b2ffd711defe0ff91  public/venture/lupine-science-venture-deck.pdf
```

Result: **PASS** — project and public PDFs are byte-identical.

### 8. Screenshot and `/venture/` artifact inventory

```text
$ printf 'screenshot_count='; printf '%s\n' media/projects/venture-deck/qa/slide-*.png | wc -l; identify -format '%f:%wx%h\n' media/projects/venture-deck/qa/slide-*.png; test -f media/projects/venture-deck/qa/contact-sheet.png && echo 'contact_sheet_exists=true' || echo 'contact_sheet_exists=false'; test -f public/venture/index.html && echo 'public/venture/index.html=true' || echo 'public/venture/index.html=false'; test -f public/venture/deck.html && echo 'public/venture/deck.html=true' || echo 'public/venture/deck.html=false'; test -f public/venture/lupine-science-venture-deck.pdf && echo 'public/venture/lupine-science-venture-deck.pdf=true' || echo 'public/venture/lupine-science-venture-deck.pdf=false'
screenshot_count=13
slide-01.png:1920x1080
slide-02.png:1920x1080
slide-03.png:1920x1080
slide-04.png:1920x1080
slide-05.png:1920x1080
slide-06.png:1920x1080
slide-07.png:1920x1080
slide-08.png:1920x1080
slide-09.png:1920x1080
slide-10.png:1920x1080
slide-11.png:1920x1080
slide-12.png:1920x1080
slide-13.png:1920x1080
contact_sheet_exists=true
public/venture/index.html=true
public/venture/deck.html=true
public/venture/lupine-science-venture-deck.pdf=true
```

Result: **PASS** for artifact inventory and implemented `/venture/` surface.

## Native-resolution visual inspection

Inspected `qa/contact-sheet.png` and every `qa/slide-01.png` through `qa/slide-13.png` at the generated 1920×1080 resolution.

- Slide 1: **FAIL** — body text and image boxes overlap by 32×150 px. The white image region masks the final characters of “laboratory,” visibly rendering “laborato”. Footer is visible and readable.
- Slides 2–12: **PASS** — no clipping, missing assets, unintended text/image overlap, footer collision, or unsafe edge placement observed. Every slide has a visible source footer. Slide 12 is clearly the risk slide.
- Slide 13: **PASS** — exactly three visible `[OWNER DECISION]` rows; no clipping or overlap. Its blank source line is intentional for the owner-controlled ask.

Evidence paths:

- `/home/alex/Dev/lupine/lupine-science/media/projects/venture-deck/qa/contact-sheet.png`
- `/home/alex/Dev/lupine/lupine-science/media/projects/venture-deck/qa/slide-01.png` … `slide-13.png`
- `/home/alex/Dev/lupine/lupine-science/media/projects/venture-deck/lupine-science-venture-deck.pdf`
