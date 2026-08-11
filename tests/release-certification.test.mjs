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

test('baselined known-defect films certify; anything new fails closed', () => {
  // the audio gate is a ratchet (applyBaseline): defects known at adoption are
  // reported but not release-blocking. Certification must accept a decision:pass
  // artifact carrying baselined films — demanding failed === 0 here rejected
  // every release since the baseline was adopted.
  const baselined = structuredClone(valid.audio);
  baselined.summary = { total: 2, passed: 1, failed: 1 };
  baselined.blockingFiles = 0;
  baselined.files.push({
    file: 'public/videos/legacy-film.mp4',
    verdict: 'fail',
    baselinedVerdict: 'known-defect',
    checks: [
      { id: 'audio-stream-present', status: 'pass' },
      { id: 'true-peak-ceiling', status: 'fail', severity: 'clipping', baselined: true },
    ],
  });
  const accepted = certifyRelease({ ...valid, audio: baselined });
  assert.equal(accepted.decision, 'pass');
  assert.equal(accepted.checks.audio.baselinedKnownDefects, 1);
  assert.equal(accepted.checks.audio.blockingFiles, 0);

  // a NEW (non-baselined) failing check on a known-defect film still rejects
  const regressed = structuredClone(baselined);
  regressed.files[1].checks.push({ id: 'speech-rate-in-band', status: 'fail' });
  assert.equal(certifyRelease({ ...valid, audio: regressed }).decision, 'fail');

  // a film the baseline never blessed still rejects
  const unblessed = structuredClone(baselined);
  delete unblessed.files[1].baselinedVerdict;
  assert.equal(certifyRelease({ ...valid, audio: unblessed }).decision, 'fail');

  // and the gate's own decision remains authoritative
  const gateFail = structuredClone(baselined);
  gateFail.decision = 'fail';
  assert.equal(certifyRelease({ ...valid, audio: gateFail }).decision, 'fail');
});

test('missing artifact links or exact commit identity fail closed', () => {
  const result = certifyRelease({ ...valid, commitSha: 'main', smokeArtifactUrl: '' });
  assert.equal(result.decision, 'fail');
  assert.match(result.failures.join('\n'), /commit SHA is invalid/);
  assert.match(result.failures.join('\n'), /smoke artifact link is invalid/);
});
