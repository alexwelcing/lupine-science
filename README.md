# lupine.science

Static public front door for Lupine Science.

This repo owns the small public entry page at `lupine.science`: the first
impression, canonical links, public metadata, nginx container, and deploy
workflow. It should stay intentionally small. The research corpus currently
lives at `library.lupine.science`, the molecular viewer lives in `lupi.live`, and the
science/control-plane repo owns claims, proofs, experiments, and evidence.

## Boundary

Owns:

- `public/index.html`
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`
- Open Graph image and static visual assets
- `Dockerfile`, `nginx.conf`, `.github/workflows/deploy.yml`
- a tiny static verifier in `scripts/check-static.mjs`

Does not own:

- article content or status labels
- papers, proof ledgers, Lean code, MLIP experiments, or distillation policy
- LUPI viewer code
- Library reader UI

## Local Smoke

Use Git Bash for Node commands on Windows.

```bash
npm run verify
python -m http.server 8080 -d public
```

Open `http://localhost:8080`.

Container smoke:

```bash
docker build -t lupine-science .
docker run --rm -p 8080:8080 lupine-science
curl -fsS http://localhost:8080/health
```

## Public Posture

Public paper status on this page must stay minimal:

- working draft in preparation
- no peer review
- no acceptance
- no journal or venue assignment

Do not add counters, submission claims, or scientific verdicts here. Link to the
Library and repository for current claim labels and evidence.

## Canonical Surfaces

- Library: `https://library.lupine.science`
- LUPI viewer: `https://lupi.live`
- Repository: `https://github.com/alexwelcing/lupine`
- MLIP progress API:
  `https://glim-think-v1.aw-ab5.workers.dev/research/mlip-discovery/progress`

The intended Library migration target remains `library.lupine.site`, but public
links should stay on `library.lupine.science` until that DNS/TLS cutover is live.

## Docs

- [LUPINE.md](LUPINE.md): how this repo fits the Lupine constellation
- [docs/extraction-packet.md](docs/extraction-packet.md): original split plan
- [docs/boundaries.md](docs/boundaries.md): ownership rules
- [docs/operations.md](docs/operations.md): local, deploy, and live checks
- [docs/release-checklist.md](docs/release-checklist.md): public release gate
