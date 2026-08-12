import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { applyBaseline } from '../scripts/audio-release-gate.mjs';
import { certifyRelease } from '../scripts/validate-release-gates.mjs';

const sha = 'a'.repeat(40);
const url = 'https://github.com/alexwelcing/lupine-science/actions/runs/1';
const canonicalBaseline = JSON.parse(fs.readFileSync(new URL('./fixtures/audio-gate-baseline.json', import.meta.url), 'utf8'));
const canonicalCheckIds = [
  'audio-stream-present',
  'not-effectively-silent',
  'integrated-loudness-band',
  'mean-volume-floor',
  'true-peak-ceiling',
  'audio-video-duration-match',
  'narration-timeline-present',
  'no-dead-air-during-narration',
  'speech-rate-in-band',
];
const valid = {
  visual: { schemaVersion: 1, passed: true, summary: { total: 1, failed: 0 }, checks: [{ id: 'component', status: 'passed' }] },
  smoke: { schemaVersion: 1, outcome: 'pass', targets: [{ summary: { failed: 0 } }] },
  audio: { schemaVersion: 1, decision: 'pass', commitSha: sha, summary: { total: 1, passed: 1, failed: 0 }, files: [{ file: 'public/videos/film.mp4', verdict: 'pass', checks: canonicalCheckIds.map((id) => ({ id, status: 'pass' })) }] },
  commitSha: sha,
  ciRunUrl: url,
  visualArtifactUrl: `${url}#artifacts`,
  smokeArtifactUrl: `${url}#artifacts`,
  audioArtifactUrl: `${url}#artifacts`,
  audioExpectedFiles: ['public/videos/film.mp4'],
};

test('certification passes only with green visual and smoke artifacts', () => {
  const result = certifyRelease(valid);
  assert.equal(result.decision, 'pass');
  assert.deepEqual(result.failures, []);
  assert.equal(result.ownerSignoff.status, 'pending');
  assert.equal(result.productionApproval.status, 'pending');
});

test('a failing visual artifact rejects publication', () => {
  const result = certifyRelease({ ...valid, visual: { ...valid.visual, passed: false, summary: { total: 1, failed: 1 } } });
  assert.equal(result.decision, 'fail');
  assert.match(result.failures.join('\n'), /visual-check suite did not pass/);

  const contradictoryCheck = structuredClone(valid.visual);
  contradictoryCheck.checks[0].status = 'failed';
  const contradictoryResult = certifyRelease({ ...valid, visual: contradictoryCheck });
  assert.equal(contradictoryResult.decision, 'fail');
  assert.equal(contradictoryResult.checks.visual.failed, 1);

  const contradictoryTotal = structuredClone(valid.visual);
  contradictoryTotal.summary.total = 99;
  assert.equal(certifyRelease({ ...valid, visual: contradictoryTotal }).decision, 'fail');
});

test('a failing smoke artifact rejects publication', () => {
  const result = certifyRelease({ ...valid, smoke: { ...valid.smoke, outcome: 'content_failure' } });
  assert.equal(result.decision, 'fail');
  assert.match(result.failures.join('\n'), /smoke suite did not pass/);

  const failedTarget = structuredClone(valid.smoke);
  failedTarget.targets[0].summary.failed = 1;
  const failedTargetResult = certifyRelease({ ...valid, smoke: failedTarget });
  assert.equal(failedTargetResult.decision, 'fail');
  assert.equal(failedTargetResult.checks.smoke.failed, 1);

  const missingSummary = structuredClone(valid.smoke);
  delete missingSummary.targets[0].summary;
  assert.equal(certifyRelease({ ...valid, smoke: missingSummary }).decision, 'fail');
});

test('a failing or SHA-mismatched audio artifact rejects publication', () => {
  const failed = certifyRelease({ ...valid, audio: { ...valid.audio, decision: 'fail', summary: { total: 1, passed: 0, failed: 1 } } });
  assert.equal(failed.decision, 'fail');
  assert.match(failed.failures.join('\n'), /audio suite did not pass/);

  const mismatched = certifyRelease({ ...valid, audio: { ...valid.audio, commitSha: 'b'.repeat(40) } });
  assert.equal(mismatched.decision, 'fail');
  assert.match(mismatched.failures.join('\n'), /audio artifact commit SHA does not match release/);
});

test('contradictory audio summaries and per-file failures reject publication', () => {
  const contradictory = certifyRelease({ ...valid, audio: { ...valid.audio, summary: { total: 2, passed: 2, failed: 0 } } });
  assert.equal(contradictory.decision, 'fail');
  assert.match(contradictory.failures.join('\n'), /audio suite did not pass/);

  const failedFile = structuredClone(valid.audio);
  failedFile.files[0].verdict = 'fail';
  failedFile.files[0].checks[0].status = 'fail';
  const failedFileResult = certifyRelease({ ...valid, audio: failedFile });
  assert.equal(failedFileResult.decision, 'fail');
  assert.equal(failedFileResult.checks.audio.blockingFiles, 1);

  const missingChecks = structuredClone(valid.audio);
  delete missingChecks.files[0].checks;
  const missingChecksResult = certifyRelease({ ...valid, audio: missingChecks });
  assert.equal(missingChecksResult.decision, 'fail');
  assert.equal(missingChecksResult.checks.audio.blockingFiles, 1);

  const unknownVerdict = structuredClone(valid.audio);
  unknownVerdict.files[0].verdict = 'unknown';
  const unknownVerdictResult = certifyRelease({ ...valid, audio: unknownVerdict });
  assert.equal(unknownVerdictResult.decision, 'fail');
  assert.equal(unknownVerdictResult.checks.audio.blockingFiles, 1);
});

test('an explicitly baselined known defect is non-blocking but remains reported', () => {
  const audio = structuredClone(valid.audio);
  audio.summary = { total: 1, passed: 0, failed: 1 };
  audio.files[0].verdict = 'fail';
  audio.files[0].baselinedVerdict = 'known-defect';
  audio.files[0].checks.find((check) => check.id === 'integrated-loudness-band').status = 'fail';
  audio.files[0].checks.find((check) => check.id === 'integrated-loudness-band').baselined = true;
  audio.blockingFiles = 0;
  const audioBaseline = {
    source: 'release/audio-gate/known-defects.json',
    adoptedAt: '2026-07-01',
    trackedBy: 'audio-remediation-board',
    films: { 'public/videos/film.mp4': ['integrated-loudness-band'] },
  };
  audio.baseline = { ...audioBaseline, filmsWithKnownDefects: 1 };
  delete audio.baseline.films;

  const result = certifyRelease({ ...valid, audio, audioBaseline });
  assert.equal(result.decision, 'pass');
  assert.equal(result.checks.audio.knownDefects, 1);
  assert.equal(result.checks.audio.blockingFiles, 0);
});

test('a remediated passing file may retain the producer baseline marker', () => {
  const baseline = {
    source: 'release/audio-gate/known-defects.json',
    adoptedAt: '2026-07-01',
    trackedBy: 'audio-remediation-board',
    films: { 'public/videos/film.mp4': ['integrated-loudness-band'] },
  };
  const audio = applyBaseline(structuredClone(valid.audio), baseline);
  assert.equal(audio.files[0].baselinedVerdict, 'known-defect');
  assert.equal(audio.blockingFiles, 0);

  const result = certifyRelease({ ...valid, audio, audioBaseline: baseline });
  assert.equal(result.decision, 'pass');
  assert.equal(result.checks.audio.knownDefects, 0);
  assert.equal(result.checks.audio.blockingFiles, 0);
});

test('audio certification rejects incomplete or unbaselined failures', () => {
  const unbaselined = structuredClone(valid.audio);
  unbaselined.summary = { total: 1, passed: 0, failed: 1 };
  unbaselined.files[0].verdict = 'fail';
  unbaselined.files[0].baselinedVerdict = 'fail';
  unbaselined.files[0].checks[0].status = 'fail';
  unbaselined.blockingFiles = 1;
  assert.equal(certifyRelease({ ...valid, audio: unbaselined }).decision, 'fail');

  const falseKnownDefect = structuredClone(unbaselined);
  falseKnownDefect.files[0].baselinedVerdict = 'known-defect';
  falseKnownDefect.blockingFiles = 0;
  const falseKnownDefectResult = certifyRelease({ ...valid, audio: falseKnownDefect });
  assert.equal(falseKnownDefectResult.decision, 'fail');
  assert.equal(falseKnownDefectResult.checks.audio.blockingFiles, 1);

  const unknownFailedCheck = structuredClone(falseKnownDefect);
  unknownFailedCheck.files[0].checks[0].status = 'skipped';
  const unknownFailedCheckResult = certifyRelease({ ...valid, audio: unknownFailedCheck });
  assert.equal(unknownFailedCheckResult.decision, 'fail');
  assert.equal(unknownFailedCheckResult.checks.audio.blockingFiles, 1);

  const contradictoryBlockingCount = structuredClone(falseKnownDefect);
  contradictoryBlockingCount.files[0].checks[0].baselined = true;
  contradictoryBlockingCount.blockingFiles = 1;
  assert.equal(certifyRelease({ ...valid, audio: contradictoryBlockingCount }).decision, 'fail');

  const undersizedBaseline = structuredClone(falseKnownDefect);
  undersizedBaseline.files[0].checks[0].baselined = true;
  undersizedBaseline.audio = undefined;
  undersizedBaseline.baseline = {
    source: 'release/audio-gate/known-defects.json',
    filmsWithKnownDefects: 0,
  };
  assert.equal(certifyRelease({ ...valid, audio: undersizedBaseline }).decision, 'fail');

  const unknownCheckStatus = structuredClone(undersizedBaseline);
  unknownCheckStatus.baseline.filmsWithKnownDefects = 1;
  unknownCheckStatus.files[0].checks.push({ id: 'unknown', status: 'skipped' });
  assert.equal(certifyRelease({ ...valid, audio: unknownCheckStatus }).decision, 'fail');

  const unknownBaselineSource = structuredClone(falseKnownDefect);
  unknownBaselineSource.files[0].checks[0].baselined = true;
  unknownBaselineSource.baseline = {
    source: 'unknown',
    adoptedAt: '2026-07-01',
    filmsWithKnownDefects: 1,
    trackedBy: 'audio-remediation-board',
  };
  assert.equal(certifyRelease({ ...valid, audio: unknownBaselineSource }).decision, 'fail');

  const placeholderBaselineSource = structuredClone(unknownBaselineSource);
  placeholderBaselineSource.baseline.source = 'n/a';
  assert.equal(certifyRelease({ ...valid, audio: placeholderBaselineSource }).decision, 'fail');

  for (const missingField of ['adoptedAt', 'trackedBy']) {
    const incompleteProvenance = structuredClone(unknownBaselineSource);
    incompleteProvenance.baseline.source = 'release/audio-gate/known-defects.json';
    delete incompleteProvenance.baseline[missingField];
    assert.equal(certifyRelease({ ...valid, audio: incompleteProvenance }).decision, 'fail');
  }

  for (const invalidDate of ['0000-01-01', '2026-02-31', '2026-13-01', 'not-a-date']) {
    const invalidProvenanceDate = structuredClone(unknownBaselineSource);
    invalidProvenanceDate.baseline.source = 'release/audio-gate/known-defects.json';
    invalidProvenanceDate.baseline.adoptedAt = invalidDate;
    assert.equal(certifyRelease({ ...valid, audio: invalidProvenanceDate }).decision, 'fail');
  }

  for (const placeholderTracker of ['', 'unknown', 'n/a']) {
    const invalidTracker = structuredClone(unknownBaselineSource);
    invalidTracker.baseline.source = 'release/audio-gate/known-defects.json';
    invalidTracker.baseline.trackedBy = placeholderTracker;
    assert.equal(certifyRelease({ ...valid, audio: invalidTracker }).decision, 'fail');
  }
});

test('missing artifact links or exact commit identity fail closed', () => {
  const result = certifyRelease({ ...valid, commitSha: 'main', smokeArtifactUrl: '' });
  assert.equal(result.decision, 'fail');
  assert.match(result.failures.join('\n'), /commit SHA is invalid/);
  assert.match(result.failures.join('\n'), /smoke artifact link is invalid/);
});

test('audio certification rejects an incomplete canonical check inventory', () => {
  const audio = structuredClone(valid.audio);
  audio.files[0].checks = canonicalCheckIds.slice(0, -1).map((id) => ({ id, status: 'pass' }));
  assert.equal(certifyRelease({ ...valid, audio, audioBaseline: canonicalBaseline }).decision, 'fail');
});

test('audio certification rejects an artifact that omits a release media file', () => {
  assert.equal(certifyRelease(valid).decision, 'pass');
  const { audioExpectedFiles: omittedInventory, ...withoutInventory } = valid;
  assert.equal(certifyRelease(withoutInventory).decision, 'fail');
  assert.equal(certifyRelease({
    ...valid,
    audioExpectedFiles: ['public/videos/film.mp4', 'public/videos/omitted.mp4'],
  }).decision, 'fail');
});

test('audio certification derives known-defect authorization from the reviewed baseline', () => {
  const [file, allowedIds] = Object.entries(canonicalBaseline.films)[0];
  const audio = structuredClone(valid.audio);
  audio.summary = { total: 1, passed: 0, failed: 1 };
  audio.files[0] = {
    file,
    verdict: 'fail',
    baselinedVerdict: 'known-defect',
    checks: canonicalCheckIds.map((id) => ({
      id,
      status: id === allowedIds[0] ? 'fail' : 'pass',
      ...(id === allowedIds[0] ? { baselined: true } : {}),
    })),
  };
  audio.blockingFiles = 0;
  audio.baseline = {
    source: canonicalBaseline.source,
    adoptedAt: canonicalBaseline.adoptedAt,
    filmsWithKnownDefects: Object.keys(canonicalBaseline.films).length,
    trackedBy: canonicalBaseline.trackedBy,
  };
  assert.equal(certifyRelease({ ...valid, audio, audioBaseline: canonicalBaseline, audioExpectedFiles: [file] }).decision, 'pass');

  const forged = structuredClone(audio);
  forged.files[0].file = 'public/videos/forged.mp4';
  assert.equal(certifyRelease({ ...valid, audio: forged, audioBaseline: canonicalBaseline }).decision, 'fail');

  const forgedCheck = structuredClone(audio);
  const failed = forgedCheck.files[0].checks.find((check) => check.status === 'fail');
  failed.id = 'mean-volume-floor';
  assert.equal(certifyRelease({ ...valid, audio: forgedCheck, audioBaseline: canonicalBaseline }).decision, 'fail');

  const alteredMetadata = structuredClone(audio);
  alteredMetadata.baseline.source = 'totally-made-up.json';
  assert.equal(certifyRelease({ ...valid, audio: alteredMetadata, audioBaseline: canonicalBaseline }).decision, 'fail');
});

test('audio certification rejects a forged residual known-defect marker on a clean file', () => {
  const audio = structuredClone(valid.audio);
  audio.files[0].baselinedVerdict = 'known-defect';
  assert.equal(certifyRelease({ ...valid, audio, audioBaseline: canonicalBaseline }).decision, 'fail');
});
