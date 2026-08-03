import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../.github/workflows/deploy.yml', import.meta.url);

async function workflow() {
  return readFile(workflowUrl, 'utf8');
}

test('production deploy accepts only a green main push and uses protected environment approval', async () => {
  const source = await workflow();

  assert.match(source, /deploy-production:[\s\S]*github\.event\.workflow_run\.conclusion == 'success'/);
  assert.match(source, /deploy-production:[\s\S]*github\.event\.workflow_run\.event == 'push'/);
  assert.match(source, /deploy-production:[\s\S]*github\.event\.workflow_run\.head_branch == 'main'/);
  assert.match(source, /deploy-production:[\s\S]*environment:\n\s+name: production/);
  assert.doesNotMatch(source, /workflow_dispatch/);
});

test('production deploy uses the exact artifact created by the approved CI run', async () => {
  const source = await workflow();

  assert.match(source, /name: Download exact artifact from successful CI run/);
  assert.match(source, /name: lupine-science-public-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /run-id: \$\{\{ github\.event\.workflow_run\.id \}\}/);
  assert.match(source, /test "\$\(git rev-parse HEAD\)" = "\$APPROVED_SHA"/);
});

test('production deploy records a durable receipt and invokes live verification', async () => {
  const source = await workflow();

  assert.match(source, /name: Record production deployment receipt/);
  assert.match(source, /production-deployment-receipt-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /retention-days: 90/);
  assert.match(source, /name: Smoke test production deployment URL/);
  assert.match(source, /name: Smoke test custom domain/);
  assert.match(source, /SMOKE_REPORT_PATH: \$\{\{ runner\.temp \}\}\/smoke-deployment-url\.json/);
  assert.match(source, /SMOKE_REPORT_PATH: \$\{\{ runner\.temp \}\}\/smoke-custom-domain\.json/);
  assert.match(source, /path:[\s\S]*smoke-deployment-url\.json[\s\S]*smoke-custom-domain\.json/);
  assert.match(source, /name: Security headers are live/);
});

test('release certification consumes both required CI artifacts and fails closed', async () => {
  const source = await workflow();

  assert.match(source, /release-certification:[\s\S]*name: publication-visual-gate-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /release-certification:[\s\S]*name: publication-smoke-gate-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /release-certification:[\s\S]*node scripts\/validate-release-gates\.mjs/);
  assert.match(source, /release-certification:[\s\S]*if-no-files-found: error/);
});

test('publication and production require separate protected owner approvals', async () => {
  const source = await workflow();

  assert.match(source, /publication-signoff:[\s\S]*environment:\n\s+name: publication/);
  assert.match(source, /deploy-production:\n\s+needs: \[lighthouse, release-certification, publication-signoff\]/);
  assert.match(source, /deploy-production:[\s\S]*environment:\n\s+name: production/);
  assert.match(source, /publication-owner-signoff-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /production_approval_record/);
});