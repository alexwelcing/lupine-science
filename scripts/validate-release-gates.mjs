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
  const visualChecks = Array.isArray(visual.checks) ? visual.checks : [];
  const visualFailed = visualChecks.filter((check) => check.status === 'failed').length;
  const visualStatusesValid = visualChecks.length > 0
    && visualChecks.every((check) => check.status === 'passed' || check.status === 'failed');
  const visualValid = visualStatusesValid
    && visual.summary?.total === visualChecks.length
    && visual.summary?.failed === visualFailed;
  if (visual.passed !== true || !visualValid || visualFailed !== 0) {
    failures.push('visual-check suite did not pass');
  }
  const smokeTargets = Array.isArray(smoke.targets) ? smoke.targets : [];
  const smokeTargetsValid = smokeTargets.length > 0
    && smokeTargets.every((target) => Number.isInteger(target.summary?.failed) && target.summary.failed >= 0);
  const smokeFailed = smokeTargetsValid
    ? smokeTargets.reduce((sum, target) => sum + target.summary.failed, 0)
    : null;
  if (smoke.outcome !== 'pass' || !smokeTargetsValid || smokeFailed !== 0) {
    failures.push('smoke suite did not pass');
  }
  const audioFiles = Array.isArray(audio.files) ? audio.files : [];
  const cleanFiles = audioFiles.filter((file) => file.verdict === 'pass');
  const failedFiles = audioFiles.filter((file) => file.verdict === 'fail');
  const adoptedAt = audio.baseline?.adoptedAt;
  const adoptedAtTimestamp = typeof adoptedAt === 'string'
    ? Date.parse(`${adoptedAt}T00:00:00Z`)
    : Number.NaN;
  const tracker = typeof audio.baseline?.trackedBy === 'string'
    ? audio.baseline.trackedBy.trim()
    : '';
  const audioSummaryConsistent = audioFiles.length > 0
    && audio.summary?.total === audioFiles.length
    && audio.summary?.passed === cleanFiles.length
    && audio.summary?.failed === failedFiles.length;
  const hasDeclaredBaseline = audio.baseline
    && typeof audio.baseline.source === 'string'
    && audio.baseline.source.trim().length > 0
    && !['unknown', 'n/a'].includes(audio.baseline.source.trim().toLowerCase())
    && typeof adoptedAt === 'string'
    && /^[1-9]\d{3}-\d{2}-\d{2}$/.test(adoptedAt)
    && Number.isFinite(adoptedAtTimestamp)
    && new Date(adoptedAtTimestamp).toISOString().slice(0, 10) === adoptedAt
    && tracker.length > 0
    && !['unknown', 'n/a'].includes(tracker.toLowerCase())
    && Number.isInteger(audio.baseline.filmsWithKnownDefects)
    && audio.baseline.filmsWithKnownDefects > 0;
  const fileStateValid = (file) => {
    if (!Array.isArray(file.checks) || file.checks.length === 0) return false;
    if (!file.checks.every((check) => check.status === 'pass' || check.status === 'fail')) return false;
    if (file.verdict === 'pass') {
      return (file.baselinedVerdict == null || file.baselinedVerdict === 'known-defect')
        && file.checks.every((check) => check.status === 'pass');
    }
    if (file.verdict !== 'fail' || file.baselinedVerdict !== 'known-defect' || !hasDeclaredBaseline) return false;
    const failingChecks = file.checks.filter((check) => check.status === 'fail');
    return failingChecks.length > 0 && failingChecks.every((check) => check.baselined === true);
  };
  const validCleanFile = (file) => file.verdict === 'pass' && fileStateValid(file);
  const validKnownDefect = (file) => file.verdict === 'fail' && fileStateValid(file);
  const blockingFiles = audioFiles.filter((file) => !validCleanFile(file) && !validKnownDefect(file)).length;
  const knownDefects = failedFiles.filter(validKnownDefect).length;
  const baselineCountConsistent = knownDefects === 0
    || (hasDeclaredBaseline && audio.baseline.filmsWithKnownDefects >= knownDefects);
  const audioFilesValid = audioFiles.every(fileStateValid);
  const blockingCountConsistent = audio.blockingFiles == null
    ? failedFiles.length === 0
    : audio.blockingFiles === blockingFiles;
  if (audio.decision !== 'pass' || !audioSummaryConsistent || !audioFilesValid || !baselineCountConsistent || !blockingCountConsistent || blockingFiles !== 0) {
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
        failed: visualStatusesValid ? visualFailed : null,
      },
      smoke: {
        passed: failures.includes('smoke suite did not pass') === false,
        artifactUrl: smokeArtifactUrl,
        targets: smokeTargets.length,
        failed: smokeFailed,
      },
      audio: {
        passed: failures.includes('audio suite did not pass') === false && failures.includes('audio artifact commit SHA does not match release') === false,
        artifactUrl: audioArtifactUrl,
        files: audio.summary?.total ?? null,
        failed: audio.summary?.failed ?? null,
        knownDefects,
        blockingFiles,
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
