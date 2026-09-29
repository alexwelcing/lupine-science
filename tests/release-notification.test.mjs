import assert from 'node:assert/strict';
import test from 'node:test';

import { buildReleaseNotification } from '../scripts/build-release-notification.mjs';

const baseReceipt = {
  schemaVersion: 1,
  decision: 'pass',
  commitSha: 'a'.repeat(40),
  checks: {
    visual: { passed: true, artifactUrl: 'https://github.example/ci#artifacts' },
    smoke: { passed: true, artifactUrl: 'https://github.example/ci#artifacts' },
    audio: { passed: true, artifactUrl: 'https://github.example/audio#artifacts' },
  },
  failures: [],
  ciRunUrl: 'https://github.example/ci',
};

const context = {
  releaseName: `lupine-science@${'a'.repeat(12)}`,
  gateRunUrl: 'https://github.example/gate',
  recordsArtifactUrl: 'https://github.example/gate#artifacts',
};

test('failed release notification is loud and names failures and retained artifacts', () => {
  const notification = buildReleaseNotification({
    receipt: {
      ...baseReceipt,
      decision: 'fail',
      failures: ['visual-check suite did not pass', 'smoke suite did not pass'],
    },
    ...context,
  });

  assert.equal(notification.schemaVersion, 1);
  assert.equal(notification.decision, 'fail');
  assert.match(notification.title, /^🚨 RELEASE GATE FAIL:/);
  assert.match(notification.markdown, /visual-check suite did not pass/);
  assert.match(notification.markdown, /smoke suite did not pass/);
  assert.match(notification.markdown, /https:\/\/github\.example\/ci#artifacts/);
  assert.match(notification.markdown, /https:\/\/github\.example\/gate#artifacts/);
});

test('passing release notification still names the release, decision, and artifacts', () => {
  const notification = buildReleaseNotification({ receipt: baseReceipt, ...context });

  assert.equal(notification.decision, 'pass');
  assert.match(notification.title, /^✅ RELEASE GATE PASS:/);
  assert.match(notification.title, /lupine-science@aaaaaaaaaaaa/);
  assert.match(notification.markdown, /Failing checks: none/);
  assert.match(notification.markdown, /Release-certification records/);
  assert.match(notification.markdown, /production deployment may proceed automatically/);
  assert.doesNotMatch(notification.markdown, /approval/);
  assert.equal(notification.artifactLinks['Audio checks'], 'https://github.example/audio#artifacts');
});

test('missing certification receipt becomes an explicit failing decision', () => {
  const notification = buildReleaseNotification({
    receipt: null,
    sourceArtifactsUrl: 'https://github.example/source#artifacts',
    ...context,
  });

  assert.equal(notification.decision, 'fail');
  assert.match(notification.markdown, /release certification receipt was not produced/);
  assert.equal(notification.artifactLinks['Audio checks'], 'https://github.example/source#artifacts');
});
