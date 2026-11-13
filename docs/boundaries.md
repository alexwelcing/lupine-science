# Boundaries

`lupine.science` is the public front door for Lupine Science. It presents
results; it does not produce them.

## This repo owns

- the homepage, `/results/`, `/about/`, `/corrections/`, `/llms.txt`, the feed
  and the sitemap
- `data/company.json`, the single source for company facts, results and the
  claims list, and `data/corrections.json`, the corrections log
- article sources (`articles/*.md`) and their built pages
- films, booklets and evidence records published on the site
- deploy configuration (`wrangler.toml`, `public/_headers`, `public/_redirects`,
  nginx for the container image) and the static verifiers

## This repo links to

- lupine-rhizo for research code, data, preregistrations and the hypothesis
  ledger
- `library.lupine.science` for the Library reader
- `lupi.live` for the structure viewer

## This repo must not own

- claim adjudication: results come from the research record, not from copy
- experiment code, generated experiment evidence or Lean sources
- internal operations notes, host names, credentials or agent rosters
- investor material, including pitch or venture decks: decks are shared
  privately and are not part of this site (`/venture` redirects to `/about/`)

## Copy rules

Follow [messaging-canon.md](messaging-canon.md). In short: say what was tested
and in what scope, keep failures beside passes, quote numbers with their
qualifiers, and never imply peer review, acceptance or a venue that does not
exist. The static verifier and `tests/discovery-copy.test.mjs` catch common
regressions; read the page as well.
