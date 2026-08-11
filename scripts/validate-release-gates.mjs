#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function valueAfter(flag, argv) {
  const index = argv.indexOf(flag);
  if (index === -1 || !argv[index + 1]) throw new Error(`missing required ${flag}`);
  return argv[index + 1];
}

function readJson(file, label) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${label} artifact is unreadable: ${error.message}`);
  }
  if (parsed.schemaVersion !== 1) throw new Error(`${label} artifact schemaVersion must be 1`);
  return parsed;
}

export function certifyRelease({ visual, smoke, audio, commitSha, ciRunUrl, visualArtifactUrl, smokeArtifactUrl, audioArtifactUrl }) {
  const failures = [];
  if (visual.passed !== true || visual.summary?.failed !== 0 || !Array.isArray(visual.checks) || visual.checks.length === 0) {
    failures.push('visual-check suite did not pass');
  }
  if (smoke.outcome !== 'pass' || !Array.isArray(smoke.targets) || smoke.targets.length === 0) {
    failures.push('smoke suite did not pass');
  }
  const audioFiles = Array.isArray(audio.files) ? audio.files : [];
  const audioSummaryConsistent = audioFiles.length > 0
    && audio.summary?.total === audioFiles.length
    && (audio.summary?.passed ?? -1) + (audio.summary?.failed ?? -1) === audioFiles.length;
  // The audio gate is a ratchet, not a fence (see applyBaseline in
  // audio-release-gate.mjs): defects known at gate adoption are baselined —
  // reported, tracked, but not release-blocking — while any NEW defect fails
  // the gate. Certification must honor that contract, not re-derive a stricter
  // one: demanding failed === 0 here rejected every release since the baseline
  // was adopted, with no path to green except deleting the gate.
  const audioFilesAcceptable = audioFiles.every((file) => (
    Array.isArray(file.checks)
    && file.checks.length > 0
    && (
      (file.verdict === 'pass' && file.checks.every((check) => check.status === 'pass'))
      || (file.baselinedVerdict === 'known-defect'
        && file.checks.every((check) => check.status === 'pass' || check.baselined === true))
    )
  ));
  if (audio.decision !== 'pass' || !audioSummaryConsistent || !audioFilesAcceptable) {
    failures.push('audio suite did not pass');
  }
  if (audio.commitSha !== commitSha) failures.push('audio artifact commit SHA does not match release');
  if (!commitSha || !/^[0-9a-f]{40}$/i.test(commitSha)) failures.push('release commit SHA is invalid');
  for (const [label, url] of [['CI run', ciRunUrl], ['visual artifact', visualArtifactUrl], ['smoke artifact', smokeArtifactUrl], ['audio artifact', audioArtifactUrl]]) {
    if (!url || !/^https:\/\//.test(url)) failures.push(`${label} link is invalid`);
  }

  return {
    schemaVersion: 1,
    decision: failures.length === 0 ? 'pass' : 'fail',
    commitSha,
    checks: {
      visual: {
        passed: failures.includes('visual-check suite did not pass') === false,
        artifactUrl: visualArtifactUrl,
        total: visual.summary?.total ?? null,
        failed: visual.summary?.failed ?? null,
      },
      smoke: {
        passed: failures.includes('smoke suite did not pass') === false,
        artifactUrl: smokeArtifactUrl,
        targets: smoke.targets?.length ?? 0,
        failed: smoke.targets?.reduce((sum, target) => sum + (target.summary?.failed ?? 0), 0) ?? null,
      },
      audio: {
        passed: failures.includes('audio suite did not pass') === false && failures.includes('audio artifact commit SHA does not match release') === false,
        artifactUrl: audioArtifactUrl,
        files: audio.summary?.total ?? null,
        failed: audio.summary?.failed ?? null,
        baselinedKnownDefects: audioFiles.filter((file) => file.baselinedVerdict === 'known-defect').length,
        blockingFiles: audio.blockingFiles ?? null,
      },
    },
    failures,
    ciRunUrl,
    ownerSignoff: {
      requiredEnvironment: 'publication',
      requiredReviewer: 'alexwelcing',
      status: 'pending',
      evidence: 'GitHub deployment review record for the publication environment',
    },
    productionApproval: {
      requiredEnvironment: 'production',
      requiredReviewer: 'alexwelcing',
      status: 'pending',
      evidence: 'GitHub deployment review record for the production environment',
    },
  };
}

function main(argv = process.argv.slice(2)) {
  const visualPath = valueAfter('--visual', argv);
  const smokePath = valueAfter('--smoke', argv);
  const outputPath = valueAfter('--output', argv);
  const receipt = certifyRelease({
    visual: readJson(visualPath, 'visual'),
    smoke: readJson(smokePath, 'smoke'),
    audio: readJson(valueAfter('--audio', argv), 'audio'),
    commitSha: valueAfter('--sha', argv),
    ciRunUrl: valueAfter('--ci-run-url', argv),
    visualArtifactUrl: valueAfter('--visual-artifact-url', argv),
    smokeArtifactUrl: valueAfter('--smoke-artifact-url', argv),
    audioArtifactUrl: valueAfter('--audio-artifact-url', argv),
  });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
  if (receipt.decision !== 'pass') {
    console.error(`Release certification rejected: ${receipt.failures.join('; ')}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Release certification passed for ${receipt.commitSha}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
