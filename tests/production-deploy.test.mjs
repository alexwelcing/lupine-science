import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../.github/workflows/deploy.yml', import.meta.url);
const ciWorkflowUrl = new URL('../.github/workflows/ci.yml', import.meta.url);

async function workflow() {
  return readFile(workflowUrl, 'utf8');
}

async function ciWorkflow() {
  return readFile(ciWorkflowUrl, 'utf8');
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
  const ciSource = await ciWorkflow();

  assert.match(ciSource, /name: lupine-science-public-\$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
  assert.doesNotMatch(ciSource, /name: lupine-science-public-\$\{\{ github\.sha \}\}/);
  assert.match(source, /name: Download exact artifact from successful CI run/);
  assert.match(source, /name: lupine-science-public-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /run-id: \$\{\{ github\.event\.workflow_run\.id \}\}/);
  assert.match(source, /test "\$\(git rev-parse HEAD\)" = "\$APPROVED_SHA"/);
});

test('production deploy records a durable receipt and invokes live verification', async () => {
  const source = await workflow();
  const deployIndex = source.indexOf('- name: Deploy production to Cloudflare Pages');
  const receiptIndex = source.indexOf('- name: Record production deployment receipt');
  const rollbackVerificationIndex = source.indexOf('- name: Prove previous deployment remains restorable');

  assert.match(source, /name: Record production deployment receipt/);
  assert.ok(deployIndex < receiptIndex && receiptIndex < rollbackVerificationIndex);
  assert.match(source, /production-deployment-receipt-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /retention-days: 90/);
  assert.match(source, /name: Smoke test production deployment URL/);
  assert.match(source, /name: Smoke test custom domain/);
  assert.match(source, /SMOKE_REPORT_PATH: \$\{\{ runner\.temp \}\}\/smoke-deployment-url\.json/);
  assert.match(source, /SMOKE_REPORT_PATH: \$\{\{ runner\.temp \}\}\/smoke-custom-domain\.json/);
  assert.match(source, /path:[\s\S]*smoke-deployment-url\.json[\s\S]*smoke-custom-domain\.json/);
  assert.match(source, /name: Security headers are live/);
});

test('production deploy captures and verifies an exact rollback target', async () => {
  const source = await workflow();

  assert.match(source, /name: Capture previous production deployment/);
  assert.match(source, /pages\/projects\/\$CF_PAGES_PROJECT"/);
  assert.doesNotMatch(source, /deployments\?env=production/);
  assert.match(source, /--capture-output "\$RUNNER_TEMP\/rollback-target-capture\.json"/);
  assert.match(source, /--account-id "\$CLOUDFLARE_ACCOUNT_ID"/);
  assert.match(source, /--project-name "\$CF_PAGES_PROJECT"/);
  assert.match(source, /name: Prove previous deployment remains restorable/);
  assert.match(source, /node scripts\/build-rollback-evidence\.mjs/);
  assert.match(source, /name: Retain rollback evidence\n\s+if: always\(\)/);
  assert.match(source, /path: \|\n\s+\$\{\{ runner\.temp \}\}\/rollback-target-capture\.json\n\s+\$\{\{ runner\.temp \}\}\/rollback-evidence\.json/);
  assert.match(source, /rollback-evidence-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /retention-days: 90/);
});

// Both tests survive the rebase: the rollback-target test is this branch's addition,
// and the certification test is main's. Kept main's "all required" wording rather than
// this branch's "both required" — the shared body below asserts THREE gates (visual,
// smoke and the newer audio one), so "both" was already stale when it was written.
test('release certification consumes all required CI artifacts and fails closed', async () => {
  const source = await workflow();
  const ciSource = await ciWorkflow();

  assert.match(ciSource, /publication-audio-checks:[\s\S]*node scripts\/audio-release-gate\.mjs/);
  assert.match(ciSource, /publication-audio-checks:[\s\S]*name: publication-audio-gate-\$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
  assert.match(ciSource, /publication-audio-checks:[\s\S]*if-no-files-found: error/);
  assert.match(source, /release-certification:[\s\S]*name: publication-visual-gate-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /release-certification:[\s\S]*name: publication-smoke-gate-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /release-certification:[\s\S]*name: publication-audio-gate-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /release-certification:[\s\S]*node scripts\/validate-release-gates\.mjs/);
  assert.match(source, /release-certification:[\s\S]*--audio gate-inputs\/audio\/audio-gate\.json/);
  assert.match(source, /release-certification:[\s\S]*--audio-baseline tests\/fixtures\/audio-gate-baseline\.json/);
  assert.match(source, /release-certification:[\s\S]*--audio-directory public\/videos/);
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

test('production live smoke installs the PDF extractor before verification', async () => {
  const source = await workflow();

  assert.match(
    source,
    /deploy-production:[\s\S]*name: Install PDF smoke dependencies[\s\S]*sudo apt-get install -y poppler-utils[\s\S]*name: Smoke test production deployment URL/,
  );
});

test('preview deploy runs the machine-readable smoke gate without deployment credentials', async () => {
  const source = await workflow();

  assert.match(source, /branches: \['\*\*'\]/);
  assert.match(source, /deploy-preview:[\s\S]*outputs:\n\s+url: \$\{\{ steps\.deploy\.outputs\.url \}\}/);
  assert.match(source, /preview-smoke:\n\s+needs: deploy-preview/);
  assert.match(source, /preview-smoke:[\s\S]*permissions:\n\s+contents: read/);
  assert.match(source, /name: Checkout exact preview revision[\s\S]*ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /preview-smoke:[\s\S]*name: Install PDF smoke dependencies[\s\S]*sudo apt-get install -y poppler-utils/);
  assert.match(source, /SMOKE_PREVIEW_BASE_URL: \$\{\{ needs\.deploy-preview\.outputs\.url \}\}/);
  assert.match(source, /SMOKE_REPORT_PATH: \$\{\{ runner\.temp \}\}\/live-smoke-preview\.json/);
  assert.match(source, /name: live-smoke-preview-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /retention-days: 90/);
});

test('CI avoids same-SHA branch-push and pull-request duplicate runs', async () => {
  const source = await ciWorkflow();

  assert.match(source, /push:\n\s+branches: \[main\]\n\s+pull_request:/);
});

test('preview deployment excludes fork and bot pull requests', async () => {
  const source = await workflow();

  assert.match(source, /deploy-preview:[\s\S]*github\.event\.workflow_run\.head_repository\.full_name == github\.repository/);
  assert.match(source, /deploy-preview:[\s\S]*github\.event\.workflow_run\.actor\.type != 'Bot'/);
});