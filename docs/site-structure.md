# Site structure

What each source in this repository builds, and the posture every public page
keeps. Moved here from the README on 2026-11-13, when the site was cut to one
question per page.

## One page, one question

| Page            | Question                         | Built from                                                            |
| --------------- | -------------------------------- | --------------------------------------------------------------------- |
| `/`             | What is this, and is it real?    | `public/index.html` (hand-written) plus its generated regions          |
| `/results/`     | What held and what did not?      | `data/company.json` `tested`, `resultNotes`, `cannotClaim`, `lean`    |
| `/about/`       | Who, how, and how to get in touch | `data/company.json` facts, `howWeWork`, `faq`                        |
| `/corrections/` | What did you retract?            | `data/corrections.json`                                               |
| `/articles/`    | What can I read?                 | `articles/*.md` (`> **Featured:** N` pins up to five under Start here) |

`scripts/lib/discovery.mjs` renders `/results/`, `/about/`, `/corrections/`,
`/llms.txt`, `/feed.xml` and the homepage regions
`<!-- discovery:jsonld -->`, `<!-- discovery:found -->` (three scoped
highlights, `data/company.json` `highlights`) and `<!-- discovery:next -->`
(the next public appearance). `scripts/lib/brand-header.mjs` renders the header
nav (Home · Results · Articles · About · Library · LUPI) and the footer
(`<!-- discovery:footer -->` on the homepage) for every generated page.
`scripts/build-articles.mjs` runs both. The word budgets for each page are in
[messaging-canon.md](messaging-canon.md) §9 and are enforced by
`tests/front-door-structure.test.mjs`.

Other sources:

- `articles/*.md`: articles, built into `public/articles/` by
  `scripts/build-articles.mjs`. Archived pieces keep their URL behind a dated
  banner and are left out of every index.
- Decks are shared privately and are not part of this site. `/venture`
  redirects to `/about/` (`public/_redirects`, `nginx.conf`).

## Public posture

- No Lupine paper has been peer-reviewed or accepted yet. Say so plainly.
- Quote a number only with the scope and qualifiers its evidence file attaches
  to it, and keep failures beside passes.
- Counts of theorems, commits or articles are not evidence and do not appear
  as headlines. Lean 4 checks the arithmetic and stated inequalities behind
  published numbers; it does not check the physics, the reference data or the
  pipeline.
- No funding statements. Investors appear only in the contact line.
- Correction is a research question here, not a product: it has held only in
  narrow, stated cases.
- When a public claim is retired, add it to `data/corrections.json` with the
  date and the reason. Move detail between pages freely; never drop a
  disclosed failure, abstention or qualifier.

## Licence files

`LICENSE` (code, MIT), `LICENSE-CONTENT.md` and `LICENSE-DATA.md` (first-party
text and data, CC BY 4.0) and `NOTICE.md`. Third-party material keeps its own
terms.

## Container smoke

See [operations.md](operations.md) ("Local Checks").
