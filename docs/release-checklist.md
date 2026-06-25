# Release Checklist

Use this before a public `lupine.science` deploy or domain cutover.

## Copy And Claims

- [ ] Public paper status says working draft in preparation.
- [ ] Page does not imply peer review, acceptance, publication, or submission.
- [ ] Scientific details link to Library or repository rather than being
      re-adjudicated here.
- [ ] Live metrics are either fetched live or removed.
- [ ] No private, investor, or gated copy is present.

## Links And Metadata

- [ ] Library links use the live Library domain, currently `https://library.lupine.science`.
- [ ] Viewer links use `https://lupi.live`.
- [ ] Repository links use the intended source repo.
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

- [ ] GitHub workflow includes all files that should trigger deploys.
- [ ] Workflow runs `npm run verify`.
- [ ] Pull requests and non-`main` branches create Cloudflare Pages previews.
- [ ] `main` deploys to the `lupine-science` Pages production branch.
- [ ] `lupine.science` is attached as a Pages custom domain.
- [ ] `/ops/report` receives non-blocking deploy telemetry.

## Live Verification

- [ ] `https://lupine.science/health` returns `ok`.
- [ ] `https://lupine.science/` contains `Evidence before claim`.
- [ ] Library, LUPI, repository, and theorem links open.
- [ ] MLIP status degrades gracefully if the API is unavailable.
- [ ] Search and social previews see current metadata.
