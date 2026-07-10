# Operations

`lupine.science` is a static site deployed to Cloudflare Pages. The nginx
container remains available for local/container smoke tests, but production and
branch previews are served by Pages.

## CI: watch, don't paste

CI results are part of the system, not something to copy out of the Actions
tab by hand.

- **After any push:** `npm run ci` — finds the newest run for your branch,
  polls it to completion, and prints a per-job breakdown with the exact
  failed steps (and, with `GITHUB_TOKEN` set, the tail of each failing
  job's log). Exit code mirrors the run, so it can gate follow-up commands.
  One-shot status without waiting: `npm run ci -- --once`; other branches:
  `npm run ci -- --branch main`; a specific commit: `npm run ci -- --sha <sha>`.
- **On failure, read the run summary first.** Both gate jobs write a
  first-line diagnosis to the GitHub run summary page: the verify job shows
  rebuild drift (`git diff --stat`) and the verifier's `[error]`/`[over]`
  lines; the Lighthouse job shows the failed assertions JSON. The summary
  is designed to make the fix obvious without opening step logs.
- **Determinism contract:** CI rebuilds everything (`npm run build`) and
  fails if the committed output differs. If the summary shows drift, the
  fix is always the same: `npm run build` locally and commit the result.
  Anything that would make a rebuild non-reproducible (timestamps, clock
  dates, randomness) belongs in source metadata, not in build steps.

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

Workflow:

```text
.github/workflows/deploy.yml
```

Required secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Store both as GitHub Actions secrets (repository secrets or secrets scoped to
the `preview` and `production` environments). Never place their values in
`wrangler.toml`, workflow YAML, checked-in `.env` files, comments, or logs. The
Cloudflare token needs only the Pages permission required to deploy the
`lupine-science` project in the configured account. The Pages project must
already exist; `wrangler.toml` declares `public/` as its build output.

Deploy path:

1. receive a successful `CI` `workflow_run` for a push to `main`
2. set up Node 22
3. download the exact `lupine-science-public-<commit>` artifact from that CI run
4. verify its commit, branch, and required entry points
5. wait for approval on the protected GitHub `production` environment
6. authenticate to Cloudflare and deploy the approved artifact
7. record a 90-day `production-deployment-receipt-<commit>` artifact containing
   the source CI run, source artifact, commit, deployment URL, and timestamp
8. smoke-test the Pages deployment URL and the `lupine.science` custom domain
9. upload production live-verification logs as a GitHub Actions artifact
10. notify the team via `glim-think` `/ops/report` with pass/fail status,
   log excerpts, the workflow URL, and the rollback command shape

Preview deploys run for pull requests after the `CI` workflow completes
successfully. Production deploys run only from a
successful `CI` `workflow_run` for a `main` push; there is no manual production
deploy path that bypasses CI.
Preview deploys publish the Cloudflare Pages URL back to the pull request using
a sticky `<!-- lupine-science-preview -->` comment and to the Actions check
summary. The job resolves the PR by commit SHA when `workflow_run` does not
include PR metadata, which also covers fork PRs. It includes the preview URL,
PR number, and kanban task id in the non-blocking `/ops/report` payload.

The preview job does not check out or execute PR code. It downloads the
`public/` artifact from the exact successful `CI` run, validates expected entry
points, and passes that artifact directly to Wrangler. This keeps Cloudflare
credentials and the write-capable GitHub token away from untrusted PR scripts.

Production deploys emit a live-verification notification whether the checks pass
or fail. The notification is also written to the GitHub Actions run summary and
includes:

- the deployment URL and workflow URL
- the `production-live-verification-<run_id>` artifact name
- tails of the Wrangler deploy, deployment-URL smoke, custom-domain smoke, and
  security-header logs when those steps reached execution
- the Cloudflare Pages rollback API command with placeholders for the target
  deployment id and credentials

### Production approval gate

The `deploy-production` job targets the GitHub Actions `production` environment.
That environment requires an explicit approval before Cloudflare receives the
production deploy command.

Configure the environment in GitHub → repository **Settings** → **Environments**
→ `production` with:

- required reviewer: `alexwelcing`
- deployment branches: protected branches only, or an explicit `main` rule
- environment secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- optional notification secret: `SLACK_DEPLOY_WEBHOOK_URL`

The workflow itself also rejects every source except a successful push CI run
whose `head_branch` is exactly `main`; environment branch policy is defense in
depth. Repository branch protection for `main` should require the CI jobs before
merge so only reviewed, green commits can reach this gate.

Current production approver:

- `alexwelcing` — repository owner/maintainer

To audit or update the gate, open GitHub → repository **Settings** →
**Environments** → `production`. The protection rules must keep required
reviewers enabled, and any additional approver should be a repository maintainer
who is authorized to release `lupine.science` publicly.

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
