import assert from 'node:assert/strict';
import test from 'node:test';

import { certifyRelease } from '../scripts/validate-release-gates.mjs';

const sha = 'a'.repeat(40);
const url = 'https://github.com/alexwelcing/lupine-science/actions/runs/1';
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

test('every per-file audio failure blocks certification regardless of path or check ID', () => {
  for (const [file, failedCheckId] of [
    ['public/videos/film.mp4', 'integrated-loudness-band'],
    ['public/videos/arbitrary/new-film.webm', 'future-audio-check'],
  ]) {
    const audio = structuredClone(valid.audio);
    audio.decision = 'pass';
    audio.summary = { total: 1, passed: 0, failed: 1 };
    audio.files[0] = {
      file,
      verdict: 'fail',
      baselinedVerdict: 'known-defect',
      checks: canonicalCheckIds.map((id) => ({ id, status: 'pass' })),
    };
    const failedCheck = audio.files[0].checks.find((check) => check.id === failedCheckId);
    if (failedCheck) {
      failedCheck.status = 'fail';
      failedCheck.baselined = true;
    } else {
      audio.files[0].checks.push({ id: failedCheckId, status: 'fail', baselined: true });
    }
    audio.blockingFiles = 0;
    audio.baseline = {
      source: 'tests/fixtures/audio-gate-baseline.json',
      adoptedAt: '2026-08-03',
      trackedBy: 'retired-migration-ratchet',
      filmsWithKnownDefects: 1,
    };
    const audioBaseline = {
      source: audio.baseline.source,
      adoptedAt: audio.baseline.adoptedAt,
      trackedBy: audio.baseline.trackedBy,
      films: { [file]: [failedCheckId] },
    };

    const result = certifyRelease({ ...valid, audio, audioBaseline, audioExpectedFiles: [file] });
    assert.equal(result.decision, 'fail', `${file} / ${failedCheckId} must block`);
    assert.equal(result.checks.audio.blockingFiles, 1);
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
  assert.equal(certifyRelease({ ...valid, audio }).decision, 'fail');
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

test('audio certification rejects a forged residual known-defect marker on a clean file', () => {
  const audio = structuredClone(valid.audio);
  audio.files[0].baselinedVerdict = 'known-defect';
  assert.equal(certifyRelease({ ...valid, audio }).decision, 'fail');
});
