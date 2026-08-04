# Venture deck closure and canonical-build validation report

Task: `t_f0bda334`  
Repository: `/home/alex/Dev/lupine/lupine-science`  
Date: 2026-07-28  
Deployment: not performed  
PR: not opened

## Result

**PASS — implementation complete; independent code review required.** The deck now renders the director-supported closure claim exactly as `100/100 unique still slots`, with visible closure-gate citation and the five certified films explicitly outside the denominator. The historical alternate default builder now delegates to the canonical builder, and every supported final build entry point produces the same PDF bytes and consistent project/public build manifests.

## Closure evidence and scope

- Closure gate: `t_c2a1f8e3` — independent PASS.
- Baseline: 33 certified stills from `media/brand-campaign-2026-07-27/final-acceptance-manifest.json`.
- Wave 4: 67 independently certified replacements from `public/brand-assets/campaign-2026-07-27/wave-4/aggregate-manifest.json`.
- Exact result: 33 + 67 = `100/100 unique still slots`.
- Boundary: five certified films are separate and do not enter the 100-still denominator.
- Prohibited implications remain absent: no 100/100 models, campaigns, films, certification chain, or generic certification claim.

## Regenerated deliverables

- `media/projects/venture-deck/deck.html` — 377,436-byte self-contained deck, SHA-256 `a6d3faefaa5dfd159ea6f1cf80741e97f06670843303309c24774bf7050f623f`.
- `public/venture/deck.html` — integrated deck, SHA-256 `00420814760132d0e706d102a4f77a11e2356e7b7eed01feb14baecf9c063d13`.
- `media/projects/venture-deck/lupine-science-venture-deck.pdf` — 13 pages, 960×540 pt, 414,318 bytes, SHA-256 `9b2074556f758f0bdbf4e23a36706c119d0fea71f143d01f06407b3ac3322efa`.
- `public/venture/lupine-science-venture-deck.pdf` — byte-identical to project PDF.
- `media/projects/venture-deck/build-manifest.json` and public copy — identical, SHA-256 `52187170a09aa205e0aa84d93a142867797204353279e35a32313215803dd53c`; both project and public PDF paths are independently content-addressed.
- `media/projects/venture-deck/evidence-manifest.json` and generated/embedded/public copies — SHA-256 `31ae280842a5d41134de937166dab2cd74a7b3564ba09ca56b09e3029fd12d00` at source.
- `media/projects/venture-deck/qa/slide-01.png` through `slide-13.png` — regenerated at 1920×1080.
- `media/projects/venture-deck/qa/contact-sheet.png` — SHA-256 `6d0ae2402537e6bc57ed4d41e0c50293087fa7bc014edd88a84dd7da07a4ae21`.

## Commands and observed results

| Command / check | Result |
|---|---|
| `npm run venture:build` | PASS — regenerated public HTML, project/public PDF, landing, evidence/asset copies, and project/public build manifests |
| `npm run venture:validate` | PASS — precise closure scope/arithmetic/hash checks plus static, risk, owner, asset, browser, geometry, overlap, responsive, and screenshot gates |
| `node media/projects/venture-deck/build-standalone.mjs` | PASS — 13 slides, 377,436-byte self-contained HTML |
| `node media/projects/venture-deck/validate-standalone.mjs` | PASS — embedded fonts/assets/evidence, four-color palette, 13 slides, no network requests, no overflow |
| `node --test tests/venture-deck-tooling.test.mjs` | PASS — 15/15 venture tooling tests, including partial fixture-argument rejection |
| `npm test` | PASS — 87/87 |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS — project script reports no TypeScript files and skips |
| `npm run build` | PASS |
| `npm run verify` | PASS — static files, article images, motion manifests, and performance budgets |
| all supported final build entry points | PASS — package script, direct canonical script, and deprecated compatibility default produce one byte-identical PDF and intact manifests |
| PDF text extraction | PASS — exact still-slot claim, 33 + 67 arithmetic, `t_c2a1f8e3`, and five-film exclusion round-trip |
| native slide-08 inspection | PASS — closure rail and citation are legible, unclipped, and free of awkward overlap |

## Preserved gates

- Exactly three `[OWNER DECISION]` fields remain on slide 13.
- Exact risk headline remains: “One 30-path panel. One chemistry family. Not peer-reviewed.”
- Source-backed `$14.65 cloud-equivalent` remains on slide 6; standalone `4.65` remains absent.
- The only visible `100/100` phrase is `100/100 unique still slots`.
- All 13 Wave-4 deck asset hashes and dimensions remain locked.
- No deployment, commit, push, or PR was performed.
