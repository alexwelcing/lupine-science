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
