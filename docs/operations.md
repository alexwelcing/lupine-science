# Operations

`lupine.science` is a static site deployed to Cloudflare Pages. The nginx
container remains available for local/container smoke tests, but production and
branch previews are served by Pages.

## Local Checks

Use Git Bash for Node commands on Windows.

```bash
npm run verify
python -m http.server 8080 -d public
```

Open:

- `http://localhost:8080/`
- `http://localhost:8080/robots.txt`
- `http://localhost:8080/sitemap.xml`
- `http://localhost:8080/llms.txt`

Container check:

```bash
docker build -t lupine-science .
docker run --rm -p 8080:8080 lupine-science
curl -fsS http://localhost:8080/health
```

## Static Verifier

`npm run verify` checks:

- required public files exist
- canonical links point to the live Library domain (`library.lupine.science`),
  `lupi.live`, and the repo
- the homepage keeps conservative public paper status
- nginx exposes `GET /health -> ok`

The verifier is intentionally narrow. It does not replace reading the public
page before deploy.

## Deploy

Workflow:

```text
.github/workflows/deploy.yml
```

Required secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Deploy path:

1. check out repo
2. set up Node 22
3. run `npm run verify`
4. authenticate to Cloudflare
5. deploy `public/` to the `lupine-science` Pages project
6. smoke-test `/health` and homepage copy
7. on production deploys, smoke-test the `lupine.science` custom domain
8. report status to `glim-think` `/ops/report`

Preview deploys run for pull requests and non-`main` branch pushes. Production
deploys run for `main` pushes and manual `workflow_dispatch` runs.

## Live Checks

Keep these truths separate:

- GitHub Actions workflow result
- Cloudflare Pages deployment URL
- Cloudflare Pages production alias and custom domain routing
- public domain content
- `glim-think` deploy report

Manual smoke:

```bash
curl -fsS https://lupine.science/health
curl -fsS https://lupine.science/robots.txt
curl -fsS https://lupine.science/sitemap.xml
curl -fsS https://lupine.science/llms.txt
```

Then open the site and verify:

- hero loads
- Library link opens `library.lupine.science`
- LUPI link opens `lupi.live`
- repository link opens the source repo
- live MLIP status either loads or degrades gracefully

## Rollback

Use the Cloudflare Pages deployments list to roll back production to a previous
known-good deployment rather than editing the public page in a panic:

```bash
wrangler pages deployment list --project-name lupine-science
wrangler pages deployment promote DEPLOYMENT_ID --project-name lupine-science
```

After rollback, verify `https://lupine.science/` itself, not only Cloud Run.
