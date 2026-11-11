# lupine.science

Lupine Science measures where machine-learned models of atoms go wrong, against
published references and pass/fail gates set in advance, and publishes every
verdict, failures included.

This repository is the source for the public website at
<https://lupine.science>, deployed to Cloudflare Pages from `public/`.

## What is here

- `data/company.json`: company facts, the "Where it has been tested" table and
  the list of what we can and cannot claim. It feeds `/about/`, `/llms.txt`,
  `/feed.xml` and the generated regions of the homepage through
  `scripts/lib/discovery.mjs`. Edit the data, not the generated output.
- `articles/*.md`: articles, built into `public/articles/` by
  `scripts/build-articles.mjs`.
- `public/index.html`: the homepage, hand-written outside its
  `<!-- discovery:* -->` regions.
- `public/corrections/`: the corrections log of public claims we have retired,
  with dates and reasons.
- `public/venture/`: the venture deck, behind a password wall
  (`public/_worker.js`) that fails closed when no password is configured.

## Build and check

```bash
npm ci
npm run build     # regenerates articles, /about/, llms.txt, feed, sitemap, headers
npm run lint
npm run verify    # static checks, article images, motion manifests, perf budget
npm test
npm run dev       # local preview
```

Container smoke:

```bash
docker build -t lupine-science .
docker run --rm -p 8080:8080 lupine-science
curl -fsS http://localhost:8080/health
```

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
- When a public claim is retired, add it to `/corrections/` with the date and
  the reason.

The full rules, including status labels and retired wording, are in
[docs/messaging-canon.md](docs/messaging-canon.md).

## Related surfaces

- Research code, data and the hypothesis ledger:
  <https://github.com/alexwelcing/lupine-rhizo>
- Library: <https://library.lupine.science>
- LUPI, the browser structure viewer: <https://lupi.live>
- Earlier monorepo history: <https://github.com/alexwelcing/lupine>

## Contact

Research partners, model builders, press and investors: alex@lupinesci.com.

## Licences

You can reuse our code (MIT) and our first-party text and data (CC BY 4.0)
with attribution and no share-alike obligations. See `LICENSE`,
`LICENSE-CONTENT.md`, `LICENSE-DATA.md` and `NOTICE.md`; third-party material
keeps its own terms.

## Docs

- [docs/messaging-canon.md](docs/messaging-canon.md): mission, claims, voice
  and status labels
- [docs/brand-book.md](docs/brand-book.md): visual system
- [docs/content-design-system.md](docs/content-design-system.md): article
  types and templates
- [docs/operations.md](docs/operations.md): local, deploy and live checks
- [docs/release-checklist.md](docs/release-checklist.md): public release gate
- [docs/boundaries.md](docs/boundaries.md): what this repo owns
- [LUPINE.md](LUPINE.md): how this repo fits with the other Lupine repositories
