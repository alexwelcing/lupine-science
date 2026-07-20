# Production deployment automation

**Owner decision (2026-07-20, standing): production deploys are fully automated —
no human approval gates, ever.**

## What changed

The GitHub `production` environment previously carried a `required_reviewers`
protection rule (reviewer: alexwelcing). Every production deploy stalled waiting
for manual approval — including one run stuck 34+ hours — silently starving the
live site of merged work.

Per the owner's standing decision above, the environment was deleted and
recreated via the API on 2026-07-20 with exactly one protection rule:

- `branch_policy`: deployments allowed from `main` only.

There is intentionally **no** `required_reviewers` rule. Do not re-add one
without an explicit, dated owner decision reversing this document.

## Consequences for `docs/operations.md`

Step 5 of the deploy path in `docs/operations.md` ("wait for approval on the
protected GitHub `production` environment") no longer exists. The deploy path
is: CI green on `main` → workflow_run deploy job → Cloudflare Pages → live
smoke. All other steps (artifact verification, deployment receipt, smoke tests,
ops notification) are unchanged.

## Approving a stuck deployment manually (should not be needed anymore)

If an approval-gated run is ever stuck again (e.g., a rule was re-added
externally), the owner authorized approval via API:

```bash
gh api repos/:owner/:repo/actions/runs/<run_id>/pending_deployments
gh api -X POST repos/:owner/:repo/actions/runs/<run_id>/pending_deployments \
  -f state=approved -F "environment_ids[]=<environment_id>" -F comment="..."
```
