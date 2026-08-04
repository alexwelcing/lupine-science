# VENTURE-1G-R2 closure and builder remediation QA

Task: `t_f0bda334`  
Date: 2026-07-28  
Status: implementation complete; independent code review required

## Closure-scope result

PASS. Slide 8 now visibly states exactly **100/100 unique still slots** and cites closure gate `t_c2a1f8e3`. The evidence rail and manifest preserve the certified arithmetic:

- 33 certified baseline stills
- 67 independently certified Wave-4 replacements
- 100/100 unique still slots
- five certified films explicitly excluded from the 100-still denominator

The deck, narrative, art direction, evidence manifest, embedded/public manifests, PDF text, and validator do not imply 100/100 models, campaigns, films, or generic certification. `D-100-CHAIN` is no longer a stale exclusion; it now records the supported, precisely scoped closure decision.

## Builder result

PASS. `npm run venture:build` and `node scripts/build-venture-deck.mjs` are the canonical final builder. The historical default `node media/projects/venture-deck/build-deck.mjs` is deprecated and delegates to the canonical builder when called without explicit fixture paths. Its explicit `--html`/`--pdf` mode remains fixture-only.

Regression coverage executes all three supported final entry points and checks:

- project/public PDF byte parity
- identical PDF hash after every entry point
- project/public build-manifest equality
- every manifest input/output hash against the current file
- canonical `build` identity in the manifest
- a content-addressed `public_pdf` manifest entry matching the project PDF
- rejection of partial fixture arguments before they can overwrite the canonical PDF

Independent pre-merge review initially requested changes because partial fixture arguments could target the canonical PDF and the manifest did not content-address the public PDF separately. Both findings were reproduced with failing regression tests, fixed, and reverified. The prior final-gate manifest is retained only as a labeled historical pre-remediation snapshot; it does not represent the current artifact state.

## Verification evidence

- RED closure regression: failed because the exact scoped claim was absent.
- GREEN closure regression: passed after integrating the claim and scope boundary.
- RED builder regression: failed because the compatibility default overwrote only the project PDF with a divergent byte stream.
- GREEN builder regression: passed after default-wrapper delegation, paired fixture-argument enforcement, and public-PDF manifest locking.
- `npm run venture:build`: PASS; 13-page PDF, 414,318 bytes.
- `npm run venture:validate`: PASS; closure arithmetic/hash/scope, 1920×1080 geometry, responsive viewports, text/asset occlusion, runtime isolation, and 13 QA screenshots.
- `node media/projects/venture-deck/build-standalone.mjs`: PASS; 377,436 bytes.
- `node media/projects/venture-deck/validate-standalone.mjs`: PASS.
- `npm test`: PASS, 87/87.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS (project script reports no TypeScript files and skips).
- `npm run build`: PASS.
- `npm run verify`: PASS.
- PDF text extraction: exact closure claim, 33 + 67 arithmetic, gate citation, and five-film exclusion all present.
- Native slide-08 inspection: closure rail and citation are legible, unclipped, and compositionally separated from the chain labels.

## Artifact hashes

- standalone HTML: `a6d3faefaa5dfd159ea6f1cf80741e97f06670843303309c24774bf7050f623f`
- public deck HTML: `00420814760132d0e706d102a4f77a11e2356e7b7eed01feb14baecf9c063d13`
- project/public PDF: `9b2074556f758f0bdbf4e23a36706c119d0fea71f143d01f06407b3ac3322efa`
- project/public build manifest: `52187170a09aa205e0aa84d93a142867797204353279e35a32313215803dd53c`
- evidence manifest: `31ae280842a5d41134de937166dab2cd74a7b3564ba09ca56b09e3029fd12d00`
- slide 08 QA PNG: `ecf774ef497d271ef9fee4f962315d3282ab1a1d6d8794c7fa00deaee598c9ad`
- contact sheet: `6d0ae2402537e6bc57ed4d41e0c50293087fa7bc014edd88a84dd7da07a4ae21`
