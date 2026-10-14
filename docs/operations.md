# Operations

`lupine.science` is a static site deployed to Cloudflare Pages. The nginx
container remains available for local/container smoke tests, but production and
branch previews are served by Pages.

## CI

One workflow, `.github/workflows/ci.yml`, a few minutes end to end:

1. **Build site**: `npm ci`, `npm run build`, `npm run lint`, `npm run verify`
   (static checks and the perf budget), then upload `public/` as the `site`
   artifact.
2. **Deploy**: ships that exact artifact to Cloudflare Pages. Pull requests from
   this repository get a preview URL (in the run summary and the PR's
   deployments); a push to `main` deploys production, purges the
   `lupine.science` cache, and checks `/health`. Fork and bot pull requests
   never reach deploy credentials, and the deploy job never runs repository
   code.

Film, narration-audio and image-text review is `.github/workflows/media-review.yml`.
It runs only when a pull request touches media, and it never blocks merging or
deploying. Run it on demand from the Actions tab.

`npm run ci` polls the newest run for your branch and prints a per-job
breakdown (`--once`, `--branch main`, `--sha <sha>`). Unit tests are not part of
CI; run `npm test` locally when it helps.

## Local Checks

Use Git Bash for Node commands on Windows.

```bash
npm run verify
npm run dev        # serves public/ with the production _headers/CSP applied
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

Deploys are the `Deploy` job in `.github/workflows/ci.yml` (see CI above).

Required secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Store both as GitHub Actions secrets (repository secrets, or secrets scoped to
the `preview` and `production` environments). Never place their values in
`wrangler.toml`, workflow YAML, checked-in `.env` files, comments, or logs. The
Cloudflare token needs only the Pages permission required to deploy the
`lupine-science` project. The `production` environment allows deployments from
`main` only; there is no approval gate.

`public/_worker.js` (scoped by `public/_routes.json` to `/venture/*`) puts the
venture deck behind a password: the `VENTURE_DECK_PASSWORD` environment variable
on the Pages project, or a placeholder until one is set.

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

Use the Cloudflare Pages deployments list to identify the target deployment, then roll back
production to a previous known-good deployment rather than editing the public page in a panic.

You can roll back from the Cloudflare dashboard (Deployments → three-dot menu on the target
deployment → **Rollback to this deployment**) or via the Pages API:

```bash
export CLOUDFLARE_API_TOKEN="<token>"
export CLOUDFLARE_ACCOUNT_ID="<account-id>"
DEPLOYMENT_ID="<deployment-id>"

curl -fsS -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/lupine-science/deployments/$DEPLOYMENT_ID/rollback" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

After rollback, verify `https://lupine.science/` itself, not only the `*.pages.dev` deployment URL.
