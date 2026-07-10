# Deployment Rollback & Incident Response Runbook

> Scope: `lupine.science` static site on Cloudflare Pages.
> Primary owner: `software-engineer` / on-call engineer.
> Escalation: `devops` / person who merged the last deploy.
> Last validated: 2026-07-10

## 1. When to roll back

Roll back the production deployment when **any** of the following are observed after a deploy:

- `https://lupine.science/health` does not return `ok`.
- The homepage no longer contains `Evidence before claim`.
- Security headers (CSP, HSTS) are missing on the custom domain.
- Lighthouse or smoke tests fail repeatedly on the deployment URL.
- User reports a broken page, missing article, or broken canonical link.
- `/ops/report` shows a deploy failure and the site behavior changed.
- Any content is published that violates the public-paper posture (claims peer review, acceptance, etc.).

Roll back **before** debugging the root cause if the site is publicly wrong or unavailable.

## 2. Owner handoffs

| Step | Owner | Action |
|------|-------|--------|
| Detect | Anyone (monitoring, CI, or manual) | Open the incident in the current chat/channel; do not DM. |
| Verify | software-engineer | Confirm the symptom, identify the bad deployment, and decide rollback. |
| Execute rollback | software-engineer | Run the commands in section 5 and announce start/end. |
| Validate | software-engineer | Run the smoke tests in section 6 and confirm `lupine.science` itself is good. |
| Root-cause follow-up | devops + the commit author | Fix in a new branch, add a regression test or checklist item, and re-deploy through normal CI. |

Communication:
- State: "Rolling back `lupine.science` to deployment `<id>` because `<reason>`".
- State: "Rollback complete, smoke tests `<pass/fail>`".
- Update the incident thread when root cause is found and a fix is in review.

## 3. Identify the current deployed artifact

Cloudflare Pages does not expose the commit hash in HTTP headers by default, so use one of these methods.

### 3.1 Find the current production deployment via wrangler

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be set.

```bash
npx wrangler@latest pages deployment list --project-name lupine-science
```

Look for the deployment marked `Active` / `Production` and note its `Deployment ID` and `Branch`.

### 3.2 Cross-check against GitHub

- Open the latest successful `Lupine Science CI / Cloudflare Pages` workflow run on `main`.
- The workflow passes `--commit-hash` to wrangler; compare the listed commit to `git log`.

### 3.3 Identify the current commit from the running container (local only)

```bash
# build the current tree
docker build -t lupine-science .
# compare to public/ content; the git HEAD is the artifact source for static builds
git rev-parse HEAD
```

Production artifact is the `public/` directory uploaded by the deploy workflow, produced from the checked-out commit.

## 4. Find the rollback target

Choose a deployment that passed smoke tests and is known good.

1. List deployments:
   ```bash
   npx wrangler@latest pages deployment list --project-name lupine-science
   ```
2. Pick the most recent older deployment from `main` that is not the current production one.
3. Verify it with the deployment URL shown in the list before promoting it.

## 5. Execute rollback

> This rolls production back to an existing Cloudflare Pages deployment. It does **not** rebuild or push code.

Cloudflare Pages does not expose a `wrangler pages deployment promote` command. Use either the dashboard or the Pages API.

### 5.1 Roll back via the Cloudflare dashboard

1. Open the Cloudflare dashboard → `lupine-science` Pages project → **Deployments**.
2. In **All deployments**, find the target deployment (not a preview deployment).
3. Open the three-dot actions menu and select **Rollback to this deployment**.
4. Confirm; production switches instantly.

### 5.2 Roll back via the Pages API

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

```bash
export CLOUDFLARE_API_TOKEN="<token>"
export CLOUDFLARE_ACCOUNT_ID="<account-id>"

DEPLOYMENT_ID="<deployment-id-from-section-4>"

curl -fsS -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/lupine-science/deployments/$DEPLOYMENT_ID/rollback" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

A successful rollback returns the deployment object with `id` and `aliases` set to the production alias (`lupine.science`).

## 6. Smoke tests after rollback

Run the same checks the production deploy workflow runs. All must pass before declaring the incident resolved.

### 6.1 Health and custom domain checks

```bash
# health endpoint
curl -fsS https://lupine.science/health
# expected: ok

# security headers on the custom domain
curl -sI https://lupine.science/ | grep -iE "content-security-policy|strict-transport-security"

# homepage content
curl -fsS https://lupine.science/ | grep "Evidence before claim"
```

### 6.2 Full automated smoke suite

```bash
npm run smoke
```

This tests 16 production URLs (homepage, articles, brand, videos) for HTTP 200 and expected content, with retries.

Example output of a passing run:

```text
Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
https://lupine.science/ ... ok
https://lupine.science/articles/ ... ok
https://lupine.science/brand-assets/ ... ok
https://lupine.science/articles/the-02-percent-synthesis-problem/ ... ok
https://lupine.science/articles/a-field-not-a-neural-net/ ... ok
https://lupine.science/articles/five-materials-for-5-to-12-gtco2-year/ ... ok
https://lupine.science/articles/from-predicted-crystal-to-commercial-cell/ ... ok
https://lupine.science/articles/investing-in-the-trust-layer/ ... ok
https://lupine.science/articles/beyond-carbon-the-error-geometry-of-environmental-materials/ ... ok
https://lupine.science/articles/water-and-air-correcting-the-molecules-we-drink-and-breathe/ ... ok
https://lupine.science/articles/methane-and-refrigerants-cutting-the-non-co2-climate-forcers/ ... ok
https://lupine.science/articles/critical-minerals-pfas-and-the-remediation-imperative/ ... ok
https://lupine.science/articles/cement-concrete-and-the-weight-of-the-built-world/ ... ok
https://lupine.science/articles/from-predicted-crystal-to-commercial-cell/ ... ok
https://lupine.science/articles/investing-in-the-trust-layer/ ... ok
https://lupine.science/videos/ ... ok

All 16 checks passed.
```

### 6.3 Manual spot checks

- Open `https://lupine.science/` in a browser: hero loads, no mixed-content warnings.
- Library link points to `https://library.lupine.science`.
- LUPI link points to `https://lupi.live`.
- Repository link points to `https://github.com/alexwelcing/lupine`.
- MLIP status either loads or degrades gracefully.

## 7. Dry-run validation (documented output)

A live rollback requires Cloudflare API credentials. Without them, you can still dry-run the command shape and validate the smoke tests against the current production site.

### 7.1 Dry-run command shape

Without API credentials, you can still validate the command shape and the endpoint.

**List deployments with Wrangler (will fail at auth):**

```bash
npx wrangler@latest pages deployment list --project-name lupine-science
```

Current dry-run output (no credentials):

```text
⛅️ wrangler 4.110.0
────────────────────

✘ [ERROR] In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN environment variable for wrangler to work. Please go to https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ for instructions on how to create an api token, and assign its value to CLOUDFLARE_API_TOKEN.
```

**API rollback endpoint check (will fail with placeholder IDs):**

```bash
curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/pages/projects/lupine-science/deployments/DEPLOYMENT_ID/rollback" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Current dry-run output:

```text
{"result":null,"success":false,"errors":[{"code":7003,"message":"Could not route to /client/v4/accounts/ACCOUNT_ID/pages/projects/lupine-science/deployments/DEPLOYMENT_ID/rollback, perhaps your object identifier is invalid?"}]}
```

This confirms the endpoint exists and the path is valid; replace `ACCOUNT_ID` and `DEPLOYMENT_ID` with real values to execute.

### 7.2 Validate smoke tests against the live site (real output)

Run:

```bash
npm run smoke
```

Current live result (captured 2026-07-10):

```text
Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
https://lupine.science/ ... ok
https://lupine.science/articles/ ... ok
https://lupine.science/brand-assets/ ... ok
https://lupine.science/articles/the-02-percent-synthesis-problem/ ... ok
https://lupine.science/articles/a-field-not-a-neural-net/ ... ok
https://lupine.science/articles/five-materials-for-5-to-12-gtco2-year/ ... ok
https://lupine.science/articles/from-predicted-crystal-to-commercial-cell/ ... ok
https://lupine.science/articles/investing-in-the-trust-layer/ ... ok
https://lupine.science/articles/beyond-carbon-the-error-geometry-of-environmental-materials/ ... ok
https://lupine.science/articles/water-and-air-correcting-the-molecules-we-drink-and-breathe/ ... ok
https://lupine.science/articles/methane-and-refrigerants-cutting-the-non-co2-climate-forcers/ ... ok
https://lupine.science/articles/critical-minerals-pfas-and-the-remediation-imperative/ ... ok
https://lupine.science/articles/cement-concrete-and-the-weight-of-the-built-world/ ... ok
https://lupine.science/articles/from-predicted-crystal-to-commercial-cell/ ... ok
https://lupine.science/articles/investing-in-the-trust-layer/ ... ok
https://lupine.science/videos/ ... ok

All 16 checks passed.
```

Health and headers are also verified live:

```bash
$ curl -fsS https://lupine.science/health
ok

$ curl -sI https://lupine.science/ | grep -iE "content-security-policy|strict-transport-security"
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'none'; script-src 'sha256-...'; ...
```

To practice the wrangler commands without affecting production, create a branch preview deploy from a test branch in a non-production repository or use Cloudflare's Pages dashboard in read-only mode to inspect deployment IDs.

## 8. Incident response checklist

- [ ] Symptom confirmed by at least two signals (CI failure, monitoring alert, user report, manual check).
- [ ] Current production deployment ID and commit identified.
- [ ] Rollback target deployment chosen and verified.
- [ ] Incident announced to the team with reason and target deployment ID.
- [ ] Rollback command executed.
- [ ] Custom domain `https://lupine.science/health` returns `ok`.
- [ ] Security headers present on `https://lupine.science/`.
- [ ] `npm run smoke` passes all 16 checks.
- [ ] Manual spot checks in section 6.3 completed.
- [ ] Incident declared resolved.
- [ ] Follow-up ticket created for root-cause fix and prevention.

## 9. Common pitfalls

- **Do not push a revert commit to `main` as the first move.** Cloudflare Pages deploys take time; promoting an existing known-good deployment is faster.
- **Verify the custom domain, not just the `*.pages.dev` URL.** Cloudflare can cut over the deployment URL before the custom domain.
- **Wrangler and the Pages API require `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.** If unset, the command fails with a non-interactive auth error.
- **A rollback does not delete the bad deployment.** After rollback, the bad deployment can still be inspected for debugging.
- **Static content is cached by Cloudflare.** If smoke tests still fail after a successful rollback, purge cache or wait for edge propagation; check `cf-cache-status` in response headers.
- **The site is intentionally static.** If the symptom is a missing article, the cause is usually a build-time or content problem, not a runtime server issue.

## 10. Reference

- Deploy workflow: `.github/workflows/deploy.yml`
- Smoke test script: `scripts/smoke-live.mjs`
- Operations guide: `docs/operations.md`
- Release checklist: `docs/release-checklist.md`
- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Wrangler CLI docs: https://developers.cloudflare.com/workers/wrangler/
