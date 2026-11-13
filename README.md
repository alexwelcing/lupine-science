# lupine.science

Lupine Science measures where machine-learned models of atoms go wrong, against
published references and pass/fail gates set in advance, and publishes every
verdict, failures included.

This repository builds the public website at <https://lupine.science> (the
homepage, `/results/`, `/about/`, `/corrections/`, the articles, `llms.txt`,
the feed and the sitemap) and deploys it to Cloudflare Pages from `public/`.
Edit the sources, not the generated pages: `data/company.json`,
`data/corrections.json`, `articles/*.md`, and `public/index.html` outside its
`<!-- discovery:* -->` regions.

## Local commands

```bash
npm ci
npm run build     # regenerate pages, llms.txt, feed, sitemap and headers
npm run lint
npm run verify    # static checks, article images, motion manifests, perf budget
npm test
npm run dev       # preview at http://localhost:8080/
```

## Links

- Research code, data and the hypothesis ledger:
  <https://github.com/alexwelcing/lupine-rhizo>
- Library: <https://library.lupine.science>
- LUPI, the browser structure viewer: <https://lupi.live>
- Earlier monorepo history: <https://github.com/alexwelcing/lupine>

Research partners, model builders, press and investors: alex@lupinesci.com.

You can reuse our code (MIT) and our first-party text and data (CC BY 4.0)
with attribution and no share-alike obligations. See `NOTICE.md`.

## More

- [docs/site-structure.md](docs/site-structure.md): what each source builds, and the public posture
- [docs/messaging-canon.md](docs/messaging-canon.md): claims, voice, status labels, word budgets
- [docs/operations.md](docs/operations.md): CI, deploy, container smoke and live checks
- [docs/release-checklist.md](docs/release-checklist.md): public release gate
- [docs/brand-book.md](docs/brand-book.md): visual system
- [docs/boundaries.md](docs/boundaries.md): what this repo owns; [LUPINE.md](LUPINE.md): the other repos
