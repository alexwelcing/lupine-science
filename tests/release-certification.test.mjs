import assert from 'node:assert/strict';
import test from 'node:test';

import { applyBaseline } from '../scripts/audio-release-gate.mjs';
import { certifyRelease } from '../scripts/validate-release-gates.mjs';

const sha = 'a'.repeat(40);
const url = 'https://github.com/alexwelcing/lupine-science/actions/runs/1';
const valid = {
  visual: { schemaVersion: 1, passed: true, summary: { total: 1, failed: 0 }, checks: [{ id: 'component', status: 'passed' }] },
  smoke: { schemaVersion: 1, outcome: 'pass', targets: [{ summary: { failed: 0 } }] },
  audio: { schemaVersion: 1, decision: 'pass', commitSha: sha, summary: { total: 1, passed: 1, failed: 0 }, files: [{ file: 'public/videos/film.mp4', verdict: 'pass', checks: [{ id: 'audio-stream-present', status: 'pass' }] }] },
  commitSha: sha,
  ciRunUrl: url,
  visualArtifactUrl: `${url}#artifacts`,
  smokeArtifactUrl: `${url}#artifacts`,
  audioArtifactUrl: `${url}#artifacts`,
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
  audio.files[0].checks[0] = { id: 'integrated-loudness', status: 'fail', baselined: true };
  audio.blockingFiles = 0;
  audio.baseline = {
    source: 'release/audio-gate/known-defects.json',
    adoptedAt: '2026-07-01',
    filmsWithKnownDefects: 1,
    trackedBy: 'audio-remediation-board',
  };

  const result = certifyRelease({ ...valid, audio });
  assert.equal(result.decision, 'pass');
  assert.equal(result.checks.audio.knownDefects, 1);
  assert.equal(result.checks.audio.blockingFiles, 0);
});

test('a remediated passing file may retain the producer baseline marker', () => {
  const baseline = {
    source: 'release/audio-gate/known-defects.json',
    adoptedAt: '2026-07-01',
    trackedBy: 'audio-remediation-board',
    films: { 'public/videos/film.mp4': ['integrated-loudness'] },
  };
  const audio = applyBaseline(structuredClone(valid.audio), baseline);
  assert.equal(audio.files[0].baselinedVerdict, 'known-defect');
  assert.equal(audio.blockingFiles, 0);

  const result = certifyRelease({ ...valid, audio });
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
