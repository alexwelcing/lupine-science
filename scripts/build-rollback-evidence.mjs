#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function valueAfter(flag, argv) {
  const index = argv.indexOf(flag);
  if (index === -1 || !argv[index + 1]) throw new Error(`missing required ${flag}`);
  return argv[index + 1];
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is missing`);
  return value.trim();
}

function isEligibleRollbackTarget(deployment) {
  return deployment?.environment === 'production'
    && deployment?.is_skipped !== true
    && deployment?.latest_stage?.name === 'deploy'
    && deployment?.latest_stage?.status === 'success'
    && typeof deployment?.created_on === 'string'
    && Number.isFinite(Date.parse(deployment.created_on));
}

export function selectRollbackTarget(response) {
  if (response?.success !== true || !response.result || typeof response.result !== 'object') {
    throw new Error('Cloudflare Pages project response is invalid');
  }
  const canonical = response.result.canonical_deployment;
  if (!isEligibleRollbackTarget(canonical)) {
    throw new Error('canonical production deployment is missing or ineligible');
  }
  return canonical;
}

export function renderRollbackCommand(accountId, projectName, deploymentId) {
  const tokenVariable = ['CLOUDFLARE', 'API', 'TOKEN'].join('_');
  return `curl -fsS -X POST "https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}/rollback" -H "Authorization: Bearer $${tokenVariable}" -H "Content-Type: application/json" -d '{}'`;
}

export function buildRollbackCapture({ previous, accountId, projectName, capturedAt }) {
  if (!isEligibleRollbackTarget(previous)) throw new Error('previous deployment is not an eligible successful production deployment');
  const deploymentId = requireText(previous.id, 'rollback target deployment id');
  const targetUrl = requireText(previous.url, 'rollback target URL');
  const targetCommitSha = requireText(previous.deployment_trigger?.metadata?.commit_hash, 'rollback target commit SHA');
  if (!/^[0-9a-f]{40}$/i.test(targetCommitSha)) throw new Error('rollback target commit SHA is invalid');

  return {
    schemaVersion: 1,
    capturedBeforeDeployment: true,
    capturedAt: requireText(capturedAt, 'capture timestamp'),
    rollbackTarget: {
      deploymentId,
      commitSha: targetCommitSha,
      url: targetUrl,
    },
    rollback: {
      command: renderRollbackCommand(
        requireText(accountId, 'Cloudflare account id'),
        requireText(projectName, 'Cloudflare Pages project'),
        deploymentId,
      ),
    },
  };
}

export function buildRollbackEvidence({
  previous,
  verifiedTarget,
  healthBody,
  homepageBody,
  accountId,
  projectName,
  deployedCommitSha,
  deploymentUrl,
  verifiedAt,
}) {
  if (!isEligibleRollbackTarget(previous)) throw new Error('previous deployment is not an eligible successful production deployment');
  const deploymentId = requireText(previous.id, 'rollback target deployment id');
  const targetUrl = requireText(previous.url, 'rollback target URL');
  const targetCommitSha = requireText(previous.deployment_trigger?.metadata?.commit_hash, 'rollback target commit SHA');
  if (!/^[0-9a-f]{40}$/i.test(targetCommitSha)) throw new Error('rollback target commit SHA is invalid');
  if (verifiedTarget?.success !== true || !verifiedTarget.result) throw new Error('rollback target could not be retrieved after deployment');
  if (verifiedTarget.result.id !== deploymentId) throw new Error('retrieved rollback target identity does not match the captured deployment');
  if (!isEligibleRollbackTarget(verifiedTarget.result)) throw new Error('retrieved rollback target is not an eligible successful production deployment');
  if (verifiedTarget.result.url !== targetUrl) throw new Error('retrieved rollback target URL does not match the captured deployment');
  if (verifiedTarget.result.deployment_trigger?.metadata?.commit_hash !== targetCommitSha) {
    throw new Error('retrieved rollback target commit does not match the captured deployment');
  }
  if (healthBody.trim() !== 'ok') throw new Error('rollback target health verification failed');
  if (!homepageBody.includes('Evidence before claim')) throw new Error('rollback target homepage verification failed');

  const rollbackCommand = renderRollbackCommand(
    requireText(accountId, 'Cloudflare account id'),
    requireText(projectName, 'Cloudflare Pages project'),
    deploymentId,
  );

  return {
    schemaVersion: 1,
    environment: 'production',
    deployedVersion: {
      commitSha: requireText(deployedCommitSha, 'deployed commit SHA'),
      url: requireText(deploymentUrl, 'deployment URL'),
    },
    rollbackTarget: {
      deploymentId,
      commitSha: targetCommitSha,
      url: targetUrl,
    },
    rollback: {
      command: rollbackCommand,
      procedure: 'Run the captured Cloudflare Pages rollback API command with CLOUDFLARE_API_TOKEN set, then run the post-rollback verification command against the custom domain.',
      postRollbackVerification: 'SMOKE_PRODUCTION_BASE_URL=https://lupine.science npm run smoke && curl -fsS https://lupine.science/health',
    },
    postDeployVerification: {
      verifiedAt: requireText(verifiedAt, 'verification timestamp'),
      targetStillExists: true,
      targetIdentityMatched: true,
      rollbackEligibilityPassed: true,
      healthPassed: true,
      homepagePassed: true,
      healthUrl: `${targetUrl.replace(/\/$/, '')}/health`,
      homepageUrl: `${targetUrl.replace(/\/$/, '')}/`,
    },
    restorable: true,
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(argv = process.argv.slice(2)) {
  if (argv.includes('--select-from')) {
    const selected = selectRollbackTarget(readJson(valueAfter('--select-from', argv)));
    const output = valueAfter('--output', argv);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(selected, null, 2)}\n`);
    if (argv.includes('--capture-output')) {
      const captureOutput = valueAfter('--capture-output', argv);
      const capture = buildRollbackCapture({
        previous: selected,
        accountId: valueAfter('--account-id', argv),
        projectName: valueAfter('--project-name', argv),
        capturedAt: valueAfter('--captured-at', argv),
      });
      fs.mkdirSync(path.dirname(captureOutput), { recursive: true });
      fs.writeFileSync(captureOutput, `${JSON.stringify(capture, null, 2)}\n`);
    }
    console.log(`Selected previous production deployment ${selected.id}`);
    return;
  }
  const evidence = buildRollbackEvidence({
    previous: readJson(valueAfter('--previous', argv)),
    verifiedTarget: readJson(valueAfter('--verified-target', argv)),
    healthBody: fs.readFileSync(valueAfter('--health', argv), 'utf8'),
    homepageBody: fs.readFileSync(valueAfter('--homepage', argv), 'utf8'),
    accountId: valueAfter('--account-id', argv),
    projectName: valueAfter('--project-name', argv),
    deployedCommitSha: valueAfter('--deployed-sha', argv),
    deploymentUrl: valueAfter('--deployment-url', argv),
    verifiedAt: valueAfter('--verified-at', argv),
  });
  const output = valueAfter('--output', argv);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Rollback target ${evidence.rollbackTarget.deploymentId} remains restorable`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
