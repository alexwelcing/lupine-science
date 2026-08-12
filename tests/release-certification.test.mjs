import assert from 'node:assert/strict';
import test from 'node:test';

import { certifyRelease } from '../scripts/validate-release-gates.mjs';

const sha = 'a'.repeat(40);
const url = 'https://github.com/alexwelcing/lupine-science/actions/runs/1';
const valid = {
  visual: { schemaVersion: 1, passed: true, summary: { total: 3, failed: 0 }, checks: [{ id: 'component', status: 'passed' }] },
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
  const result = certifyRelease({ ...valid, visual: { ...valid.visual, passed: false, summary: { total: 3, failed: 1 } } });
  assert.equal(result.decision, 'fail');
  assert.match(result.failures.join('\n'), /visual-check suite did not pass/);
});

test('a failing smoke artifact rejects publication', () => {
  const result = certifyRelease({ ...valid, smoke: { ...valid.smoke, outcome: 'content_failure' } });
  assert.equal(result.decision, 'fail');
  assert.match(result.failures.join('\n'), /smoke suite did not pass/);
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
  assert.equal(certifyRelease({ ...valid, audio: failedFile }).decision, 'fail');

  const missingChecks = structuredClone(valid.audio);
  delete missingChecks.files[0].checks;
  assert.equal(certifyRelease({ ...valid, audio: missingChecks }).decision, 'fail');
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
  assert.equal(certifyRelease({ ...valid, audio: falseKnownDefect }).decision, 'fail');

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
