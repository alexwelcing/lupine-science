import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../.github/workflows/deploy.yml', import.meta.url);

async function workflow() {
  return readFile(workflowUrl, 'utf8');
}

test('production live verification always writes a pass/fail GitHub summary', async () => {
  const source = await workflow();

  assert.match(source, /name: Notify team of live verification result\n\s+if: always\(\)/);
  assert.match(source, /Live verification passed/);
  assert.match(source, /Live verification failed/);
  assert.match(source, /GITHUB_STEP_SUMMARY/);
});

test('production success summary identifies the live URL, commit, and log artifact', async () => {
  const source = await workflow();

  assert.match(source, /Live URL:/);
  assert.match(source, /Commit:/);
  assert.match(source, /Artifact:/);
});

test('production failure summary identifies failing category and URL', async () => {
  const source = await workflow();

  assert.match(source, /Failure category:/);
  assert.match(source, /Failing URL:/);
  assert.match(source, /SMOKE_FAILURES_FILE/);
});

test('Slack notification is conditional and uses only the repository secret', async () => {
  const source = await workflow();

  assert.match(source, /SLACK_DEPLOY_WEBHOOK_URL: \$\{\{ secrets\.SLACK_DEPLOY_WEBHOOK_URL \}\}/);
  assert.match(source, /if \[ -n "\$SLACK_DEPLOY_WEBHOOK_URL" \]/);
  assert.doesNotMatch(source, /hooks\.slack\.com\/services\//);
});

test('every release gate decision creates an assigned GitHub notification and retains its record', async () => {
  const source = await workflow();

  assert.match(source, /name: Build release gate notification\n\s+if: always\(\)/);
  assert.match(source, /node scripts\/build-release-notification\.mjs/);
  assert.match(source, /name: Send loud release gate notification\n\s+if: always\(\)/);
  assert.match(source, /repos\/\$GITHUB_REPOSITORY\/issues/);
  assert.match(source, /assignees: \["alexwelcing"\]/);
  assert.match(source, /name: Retain release decision and notification/);
  assert.match(source, /release-gate-records-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(source, /retention-days: 90/);
});

test('failed source CI or Lighthouse still enters a fail-closed release notification path', async () => {
  const source = await workflow();

  assert.match(
    source,
    /release-certification:[\s\S]*if: \|\n\s+always\(\) &&\n\s+github\.event\.workflow_run\.event == 'push' &&\n\s+github\.event\.workflow_run\.head_branch == 'main'\n/,
  );
  assert.match(source, /name: Fail closed on unsuccessful release prerequisite\n\s+if: github\.event\.workflow_run\.conclusion != 'success' \|\| needs\.lighthouse\.result != 'success'/);
  assert.match(source, /Source CI concluded: \$source_result[\s\S]*Lighthouse concluded: \$lighthouse_result[\s\S]*release-certification\.json/);
});

test('production live verification creates an assigned GitHub notification and retains it', async () => {
  const source = await workflow();
  const notifyStart = source.indexOf('      - name: Notify team of live verification result');
  const notifyEnd = source.indexOf('      - name: Retain live verification notification', notifyStart);
  const notifyStep = source.slice(notifyStart, notifyEnd);

  assert.match(notifyStep, /rollback-evidence\.json[\s\S]*rollback-target-capture\.json[\s\S]*\.rollback\.command/);
  assert.match(source, /Notify team of live verification result[\s\S]*GH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(source, /Notify team of live verification result[\s\S]*repos\/\$GITHUB_REPOSITORY\/issues/);
  assert.match(source, /Artifact: \$RUN_URL#artifacts/);
  assert.match(source, /name: Retain live verification notification/);
  assert.match(source, /production-live-notification-\$\{\{ github\.run_id \}\}/);
  assert.match(source, /production-live-verification-\$\{\{ github\.run_id \}\}[\s\S]*retention-days: 90/);
});
