# Release Checklist

Use this before a public `lupine.science` deploy or domain cutover.

## Copy And Claims

- [ ] Public paper status says working draft in preparation.
- [ ] Page does not imply peer review, acceptance, publication, or submission.
- [ ] Scientific details link to Library or repository rather than being
      re-adjudicated here.
- [ ] Live metrics are either fetched live or removed.
- [ ] No private, investor, or gated copy is present.
- [ ] No deck is published: decks are shared privately, and `/venture` still
      answers 301 to `/about/`.

## Links And Metadata

- [ ] Library links use the live Library domain, currently `https://library.lupine.science`.
- [ ] Viewer links use `https://lupi.live`.
- [ ] Repository links use the intended source repo.
- [ ] Every GitHub `blob/main` or `tree/main` link on the built site resolves
      on that repository's `main`. Some disclosures live only behind such a
      link: /about/ points to the AI and data statement in lupine-rhizo (the
      operating rules, how far each reaches, and where data goes). Merge
      lupine-rhizo first, or in the same release, and do not deploy until this
      returns 200:
      `curl -sfI https://github.com/alexwelcing/lupine-rhizo/blob/main/docs/ai-and-data.md`
      To check every such link at once:
      `grep -rhoE 'https://github\.com/alexwelcing/[a-z0-9-]+/(blob|tree)/main/[^"#)<> ]+' public | sort -u | while read -r u; do curl -sfI -o /dev/null "$u" || echo "missing: $u"; done`
- [ ] `robots.txt`, `sitemap.xml`, and `llms.txt` match the public domain.
- [ ] Open Graph image renders.

## Local Verification

```bash
npm run verify
python -m http.server 8080 -d public
```

- [ ] Static verifier passes.
- [ ] Home page loads locally.
- [ ] Public metadata files are reachable locally.
- [ ] Mobile viewport has no obvious overlap or unreadable text.

## Deploy Verification

- [ ] The pull request's `Build site` job is green and its preview URL looks right.
- [ ] After merge, the `Deploy` job on `main` finished and `/health` answered `ok`.
- [ ] If the change touched films, audio or images, the Media review reports are
      clean (or their findings are understood).

## Live Verification

- [ ] `https://lupine.science/health` returns `ok`.
- [ ] `https://lupine.science/` contains `Evidence before claim`.
- [ ] Library, LUPI, repository, and theorem links open.
- [ ] MLIP status degrades gracefully if the API is unavailable.
- [ ] Search and social previews see current metadata.
