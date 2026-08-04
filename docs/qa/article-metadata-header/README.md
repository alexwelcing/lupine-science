# Article metadata header — design review

## Decision

Replace the six-row Type / Date / Scope / Description / Audience / Status form with an editorial masthead that reads like a publication, not a CMS preview.

The approved hierarchy is title-led and intentionally quiet:

- optional indigo mono kicker for document type;
- large Newsreader title;
- serif deck sourced from `Scope`;
- compact publication line with a real `<time>` value and restrained status lozenge;
- hero media.

`Audience` stays in source metadata for commissioning and positioning, but is absent from reader-facing HTML. `Description` continues to serve metadata, cards, search, and social previews rather than duplicating the deck on the page.

## Component map

| Source field | Reader-facing treatment | Other use |
|---|---|---|
| Type | Optional `.article-kicker` | Content classification |
| Date | `<time>` inside `.article-byline` | JSON-LD `datePublished` |
| Scope | `.article-deck` | Fallback description |
| Description | Not repeated in header | Search, social, JSON-LD, index card |
| Audience | Never rendered | Editorial planning only |
| Status | Normalized `.article-status` in byline | Index-card state |

## Visual rationale

The serif title and deck establish one uninterrupted editorial reading axis. Mono is reserved for the type and publication facts, preserving Lupine's distinction between narrative and data. Paper, ink, and indigo tokens come directly from the brand system; the status is neutral rather than a dashboard-style success badge. The hero begins after a single compact publication line, reducing the previous block's visual weight.

## Responsive and accessibility contract

- Desktop and mobile preserve the same content order.
- The byline is a semantic list labelled “Publication details”.
- Decorative punctuation is `aria-hidden`.
- Dates expose machine-readable ISO values and human-readable long dates.
- Missing Type, Scope, Date, or Status values omit only that element; no empty labels remain.
- The audience string is excluded from generated reader-facing HTML.

## Evidence

- `desktop.png` — 1440 × 900 implementation capture.
- `mobile.png` — 390 × 844 implementation capture.
- Source: `scripts/build-articles.mjs`.
- Styles: `public/articles/styles.css`.
- Regression coverage: `tests/article-metadata.test.mjs`.