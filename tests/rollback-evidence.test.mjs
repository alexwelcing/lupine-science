import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildRollbackEvidence,
  renderRollbackCommand,
  selectRollbackTarget,
} from '../scripts/build-rollback-evidence.mjs';

const previous = {
  id: 'deployment-previous-123',
  url: 'https://deployment-previous-123.lupine-science.pages.dev',
  environment: 'production',
  created_on: '2026-08-03T11:00:00Z',
  is_skipped: false,
  latest_stage: { name: 'deploy', status: 'success' },
  deployment_trigger: { metadata: { commit_hash: 'b'.repeat(40) } },
};

const verifiedTarget = {
  success: true,
  result: previous,
};

const input = {
  previous,
  verifiedTarget,
  healthBody: 'ok\n',
  homepageBody: '<html><body>Evidence before claim.</body></html>',
  accountId: 'account-123',
  projectName: 'lupine-science',
  deployedCommitSha: 'c'.repeat(40),
  deploymentUrl: 'https://deployment-current.pages.dev',
  verifiedAt: '2026-08-03T12:00:00Z',
};

test('rollback evidence identifies the exact prior version and executable procedure', () => {
  const evidence = buildRollbackEvidence(input);

  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.rollbackTarget.deploymentId, previous.id);
  assert.equal(evidence.rollbackTarget.commitSha, 'b'.repeat(40));
  assert.equal(evidence.rollbackTarget.url, previous.url);
  assert.equal(evidence.restorable, true);
  assert.equal(evidence.postDeployVerification.targetStillExists, true);
  assert.equal(evidence.postDeployVerification.healthPassed, true);
  assert.equal(evidence.postDeployVerification.homepagePassed, true);
  assert.equal(evidence.postDeployVerification.rollbackEligibilityPassed, true);
  assert.equal(evidence.rollback.command, renderRollbackCommand('account-123', 'lupine-science', previous.id));
  assert.match(evidence.rollback.command, /deployment-previous-123\/rollback/);
  assert.match(evidence.rollback.postRollbackVerification, /npm run smoke/);
  assert.match(evidence.rollback.postRollbackVerification, /https:\/\/lupine\.science/);
});

test('mock rollback can select the captured target without guessing an identifier', () => {
  const evidence = buildRollbackEvidence(input);
  const command = evidence.rollback.command;

  assert.match(command, new RegExp(`/deployments/${previous.id}/rollback`));
  assert.doesNotMatch(command, /<deployment-id>|DEPLOYMENT_ID/);
  assert.equal(evidence.rollbackTarget.commitSha.length, 40);
});

test('rollback target selection is deterministic even when the API response is unordered', () => {
  const selected = selectRollbackTarget({
    success: true,
    result: [
      { ...previous, id: 'older', created_on: '2026-08-01T11:00:00Z' },
      { ...previous, id: 'preview', environment: 'preview', created_on: '2026-08-04T11:00:00Z' },
      { ...previous, id: 'newest', created_on: '2026-08-03T11:00:00Z' },
      { ...previous, id: 'failed', created_on: '2026-08-05T11:00:00Z', latest_stage: { name: 'deploy', status: 'failure' } },
    ],
  });

  assert.equal(selected.id, 'newest');
});

test('rollback evidence fails closed when the prior target is no longer retrievable', () => {
  assert.throws(
    () => buildRollbackEvidence({ ...input, verifiedTarget: { success: false, result: null } }),
    /rollback target could not be retrieved/,
  );
});

test('rollback evidence fails closed when the prior target no longer passes health verification', () => {
  assert.throws(
    () => buildRollbackEvidence({ ...input, healthBody: 'not ok' }),
    /rollback target health verification failed/,
  );
});

test('rollback evidence fails closed when Cloudflare no longer reports the target as deploy-successful production', () => {
  assert.throws(
    () => buildRollbackEvidence({
      ...input,
      verifiedTarget: {
        success: true,
        result: { ...previous, latest_stage: { name: 'deploy', status: 'failure' } },
      },
    }),
    /not an eligible successful production deployment/,
  );
});
