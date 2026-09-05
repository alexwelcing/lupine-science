#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function valueAfter(flag, argv) {
  const index = argv.indexOf(flag);
  if (index === -1 || !argv[index + 1]) throw new Error(`missing required ${flag}`);
  return argv[index + 1];
}

function readJson(file, label, { requireSchema = true } = {}) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${label} artifact is unreadable: ${error.message}`);
  }
  if (requireSchema && parsed.schemaVersion !== 1) throw new Error(`${label} artifact schemaVersion must be 1`);
  return parsed;
}

const AUDIO_CHECK_IDS = Object.freeze([
  'audio-stream-present',
  'not-effectively-silent',
  'integrated-loudness-band',
  'mean-volume-floor',
  'true-peak-ceiling',
  'audio-video-duration-match',
  'narration-timeline-present',
  'no-dead-air-during-narration',
  'speech-rate-in-band',
]);

function mediaFilesRecursively(directory, root = process.cwd()) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...mediaFilesRecursively(entryPath, root));
    if (entry.isFile() && /\.(mp4|mov|mkv|webm)$/i.test(entry.name)) {
      files.push(path.relative(root, entryPath).split(path.sep).join('/'));
    }
  }
  return files.sort();
}

export function certifyRelease({ visual, smoke, audio, audioExpectedFiles, commitSha, ciRunUrl, visualArtifactUrl, smokeArtifactUrl, audioArtifactUrl }) {
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
  const audioSummaryConsistent = audioFiles.length > 0
    && audio.summary?.total === audioFiles.length
    && audio.summary?.passed === cleanFiles.length
    && audio.summary?.failed === failedFiles.length;
  const actualAudioFiles = audioFiles.map((file) => file.file);
  const expectedAudioFiles = Array.isArray(audioExpectedFiles) ? [...audioExpectedFiles].sort() : [];
  const audioInventoryConsistent = expectedAudioFiles.length > 0
    && new Set(expectedAudioFiles).size === expectedAudioFiles.length
    && new Set(actualAudioFiles).size === actualAudioFiles.length
    && actualAudioFiles.length === expectedAudioFiles.length
    && [...actualAudioFiles].sort().every((file, index) => file === expectedAudioFiles[index]);
  const fileStateValid = (file) => {
    if (!Array.isArray(file.checks) || file.checks.length === 0) return false;
    if (!file.checks.every((check) => check.status === 'pass' || check.status === 'fail')) return false;
    const checkIds = file.checks.map((check) => check.id);
    if (new Set(checkIds).size !== AUDIO_CHECK_IDS.length
      || !AUDIO_CHECK_IDS.every((id) => checkIds.includes(id))) return false;
    return file.verdict === 'pass'
      && file.baselinedVerdict == null
      && file.checks.every((check) => check.status === 'pass' && check.baselined == null);
  };
  const blockingFiles = audioFiles.filter((file) => !fileStateValid(file)).length;
  const audioFilesValid = audioFiles.every(fileStateValid);
  const blockingCountConsistent = audio.blockingFiles == null
    ? failedFiles.length === 0
    : audio.blockingFiles === blockingFiles;
  if (audio.decision !== 'pass' || !audioSummaryConsistent || !audioInventoryConsistent || !audioFilesValid || !blockingCountConsistent || blockingFiles !== 0) {
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
    audioExpectedFiles: mediaFilesRecursively(path.resolve(valueAfter('--audio-directory', argv))),
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
