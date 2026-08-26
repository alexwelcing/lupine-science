import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildRollbackCapture,
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

test('pre-deploy capture retains the exact target and an executable rollback command', () => {
  const capture = buildRollbackCapture({
    previous,
    accountId: 'account-123',
    projectName: 'lupine-science',
    capturedAt: '2026-08-03T11:30:00Z',
  });

  assert.equal(capture.schemaVersion, 1);
  assert.equal(capture.capturedBeforeDeployment, true);
  assert.equal(capture.rollbackTarget.deploymentId, previous.id);
  assert.equal(capture.rollbackTarget.commitSha, 'b'.repeat(40));
  assert.equal(capture.rollbackTarget.url, previous.url);
  assert.equal(capture.rollback.command, renderRollbackCommand('account-123', 'lupine-science', previous.id));
  assert.match(capture.rollback.command, /deployment-previous-123\/rollback/);
});

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
  const accountVariable = ['CLOUDFLARE', 'ACCOUNT', 'ID'].join('_');
  const tokenVariable = ['CLOUDFLARE', 'API', 'TOKEN'].join('_');

  assert.match(command, new RegExp(`/deployments/${previous.id}/rollback`));
  assert.match(command, new RegExp(`accounts/\\$${accountVariable}`));
  assert.match(command, new RegExp(`Bearer \\$${tokenVariable}`));
  assert.doesNotMatch(command, /account-123/);
  assert.doesNotMatch(command, /<deployment-id>|DEPLOYMENT_ID/);
  assert.equal(evidence.rollbackTarget.commitSha.length, 40);
});

test('rollback target selection uses the active canonical deployment after a prior rollback', () => {
  const selected = selectRollbackTarget({
    success: true,
    result: {
      canonical_deployment: { ...previous, id: 'active-rollback-target', created_on: '2026-08-01T11:00:00Z' },
      latest_deployment: { ...previous, id: 'newer-superseded-bad-deployment', created_on: '2026-08-05T11:00:00Z' },
    },
  });

  assert.equal(selected.id, 'active-rollback-target');
});

test('rollback target selection fails closed without a canonical production deployment', () => {
  assert.throws(
    () => selectRollbackTarget({ success: true, result: { latest_deployment: previous } }),
    /canonical production deployment is missing or ineligible/,
  );
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
