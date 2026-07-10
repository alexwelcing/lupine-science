# Publication QA & Technical Improvement

Goal: bring `lupine.science` to flawless, publication-quality standards — the typography, layout, image treatment, and PDF output of a top-tier tech/science publication.

## Current concerns

- Article pages show formatting issues (image captions, spacing, responsive behavior, footnotes, share bar).
- The proof-pack PDF does not print some characters correctly (likely special glyphs: en/em dashes, subscripts, Greek letters, math symbols).

## Approach

1. Audit every article page and the CSS that drives it.
2. Fix layout and typography in `public/articles/styles.css` and `scripts/build-articles.mjs`.
3. Fix PDF generation so fonts and special characters render correctly.
4. Re-run build, verify, smoke, and PDF inspection.

## Quality bar

- Images and captions are visually integrated, not tacked on.
- Body copy has controlled measure (60–75 characters), generous leading, and clear hierarchy.
- Footnotes are easy to read and linkable.
- Share bar is elegant and unobtrusive.
- Mobile layout is uncompromised.
- PDF text is selectable, searchable, and all glyphs render correctly.
