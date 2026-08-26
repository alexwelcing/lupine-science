import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractPath = path.join(
  ROOT,
  'media/brand-campaign-2026-07-27/audio-publication-disposition.json',
);

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

test('campaign audio publication disposition is exact and hash-bound', () => {
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  assert.equal(contract.decision, 'quarantine-proposed');
  assert.equal(contract.publicationState, 'needs-verification');
  assert.equal(contract.scope, 'public/videos/campaign-2026-07-27/*.mp4');
  assert.equal(contract.deliveryAction.performedByThisTask, false);
  assert.equal(contract.records.length, 10);

  const expectedFiles = [
    '01-z1-union-verdict-qa-attempt-1.mp4',
    '01-z1-union-verdict.mp4',
    '02-savings-stack-qa-attempt-1.mp4',
    '02-savings-stack.mp4',
    '03-trust-layer-qa-attempt-1.mp4',
    '03-trust-layer.mp4',
    '04-order-of-effort-qa-attempt-1.mp4',
    '04-order-of-effort.mp4',
    '05-materials-for-society-qa-attempt-1.mp4',
    '05-materials-for-society.mp4',
  ].map((name) => `public/videos/campaign-2026-07-27/${name}`);

  assert.deepEqual(
    contract.records.map((record) => record.file).sort(),
    expectedFiles.sort(),
  );
  const campaignDirectory = path.join(ROOT, 'public/videos/campaign-2026-07-27');
  const actualFiles = fs.readdirSync(campaignDirectory)
    .filter((name) => name.endsWith('.mp4'))
    .map((name) => `public/videos/campaign-2026-07-27/${name}`)
    .sort();
  assert.deepEqual(actualFiles, expectedFiles.sort());

  for (const record of contract.records) {
    assert.equal(record.publicationState, 'needs-verification');
    assert.equal(record.proposedAction, 'quarantine');
    assert.equal(sha256(path.join(ROOT, record.file)), record.sha256);
    assert.equal(
      fs.existsSync(path.join(ROOT, record.file.replace(/\.mp4$/, '.vtt'))),
      false,
      `${record.file} unexpectedly gained a narration timeline`,
    );
  }

  const expectedEvidence = [
    'media/brand-campaign-2026-07-27/final-acceptance-manifest.json',
    'media/brand-campaign-2026-07-27/qa/video-qa-evidence.json',
    'public/videos/campaign-2026-07-27/video-manifest.json',
  ];
  assert.deepEqual(
    contract.evidence.map((evidence) => evidence.path).sort(),
    expectedEvidence.sort(),
  );
  for (const evidence of contract.evidence) {
    assert.equal(sha256(path.join(ROOT, evidence.path)), evidence.sha256);
  }
});
