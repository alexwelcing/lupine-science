# Notice

This repository is the source for the public website of Lupine Science at
https://lupine.science. Earlier development history is in
https://github.com/alexwelcing/lupine.

## Licences

- Code, configuration and build scripts: MIT (`LICENSE`).
- First-party prose, figures and films: CC BY 4.0 (`LICENSE-CONTENT.md`).
- First-party data and manifests: CC BY 4.0 (`LICENSE-DATA.md`).
- Third-party material keeps its own terms (below).

You can reuse our code (MIT) and our first-party text and data (CC BY 4.0)
with attribution and no share-alike obligations.

Relicensed 2026-11-11 by the copyright holder: code MIT (was
AGPL-3.0-or-later where applicable); first-party prose and data CC BY 4.0 (was
CC BY-SA 4.0 / ODbL).

## Third-party assets

- Fonts, self-hosted in `public/fonts/`, all under the SIL Open Font License
  1.1:
  - Newsreader (Production Type), glyph subsets built by
    `scripts/build-fonts.mjs`;
  - IBM Plex Mono (IBM), glyph subsets built by `scripts/build-fonts.mjs`;
  - Noto Serif (Google), `proof-unicode.ttf`, used in generated PDFs;
  - Noto Sans Math (Google), `proof-math.ttf`, used in generated PDFs.
- Crystal structure data: `public/data/mof5_structure.json` is derived from
  Crystallography Open Database entry 1516287 (public domain); structure
  first reported in Li, Eddaoudi, O'Keeffe & Yaghi, Nature 402, 276 (1999).
- KaTeX (MIT), copied from `node_modules/katex` into `public/katex/` at build
  time.
- Cited papers, datasets and reference values keep their original notices and
  licences; each article credits its sources.
