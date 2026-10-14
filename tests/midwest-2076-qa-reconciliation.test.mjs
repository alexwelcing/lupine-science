import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'scripts',
  'verify-midwest-2076-qa-reconciliation.mjs',
);

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

function run(root, ...extra) {
  return execFileSync(process.execPath, [SCRIPT, '--root', root, ...extra], { encoding: 'utf8' });
}

function runExpectFailure(root, pattern, ...extra) {
  assert.throws(
    () => execFileSync(process.execPath, [SCRIPT, '--root', root, ...extra], { encoding: 'utf8', stdio: 'pipe' }),
    (error) => {
      assert.match(String(error.stderr), pattern);
      return true;
    },
  );
}

// Builds a hydrated fixture mirroring the archive-branch layout: 30 once-published
// masters across the six reviewed cohorts, provenance records with digests computed
// from the actual fixture bytes, and a 100-request manifest with zero acceptances.
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-m76-qa-'));
  const project = path.join(root, 'media', 'projects', 'midwest-2076-library');
  const published = path.join(project, 'published-tree');
  fs.mkdirSync(project, { recursive: true });

  const writeAsset = (relative, seed) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const bytes = Buffer.from(`${seed}:${relative}`);
    fs.writeFileSync(file, bytes);
    return { bytes: bytes.length, sha256: sha256(bytes) };
  };

  const makeResult = (id, cohortDir) => {
    const publicMasterPath = `public/brand-assets/assets/images/midwest-2076/${cohortDir}${id}.webp`;
    const publicThumbPath = `public/brand-assets/assets/images/midwest-2076/${cohortDir}thumbs/${id}.webp`;
    const sourceLocalPath = `media/projects/midwest-2076-library/assets/fixture-source/${id}.webp`;
    const source = writeAsset(sourceLocalPath, 'source');
    const master = writeAsset(
      path.posix.join('media/projects/midwest-2076-library/published-tree', publicMasterPath.slice('public/'.length)),
      'master',
    );
    const thumbnail = writeAsset(
      path.posix.join('media/projects/midwest-2076-library/published-tree', publicThumbPath.slice('public/'.length)),
      'thumb',
    );
    return {
      id,
      status: 'completed',
      endpoint: 'fal-ai/recraft/v4.1/pro/text-to-image',
      requestId: `req-${id}`,
      generatedAt: '2026-08-11T00:00:00Z',
      promptSha256: sha256(Buffer.from(`prompt-${id}`)),
      publicMasterPath,
      publicThumbPath,
      sourceLocalPath,
      bytes: { source: source.bytes, master: master.bytes, thumbnail: thumbnail.bytes },
      sha256: { source: source.sha256, master: master.sha256, thumbnail: thumbnail.sha256 },
    };
  };

  const writeJson = (name, value) =>
    fs.writeFileSync(path.join(project, name), JSON.stringify(value, null, 2));

  const calibrationIds = ['m76-032', 'm76-062', 'm76-073', 'm76-082', 'm76-092'];
  writeJson('calibration-02-generation-record.json', {
    provider: 'fal.ai',
    generatedAt: '2026-08-11T19:52:56.116Z',
    selectionStatus: 'superseded-calibration',
    supersededReason: 'Generated before first-principles scene specifications were authored.',
    results: calibrationIds.map((id) => ({ ...makeResult(id, ''), selectionStatus: 'superseded-calibration' })),
  });

  const pilotIds = ['m76-001', 'm76-011', 'm76-021', 'm76-031', 'm76-041', 'm76-051', 'm76-061', 'm76-071', 'm76-081', 'm76-091'];
  writeJson('pilot-generation-record.json', {
    provider: 'fal.ai',
    generatedAt: '2026-08-11T15:36:26-04:00',
    results: pilotIds.map((id) => makeResult(id, '')),
  });
  writeJson('pilot-selection.json', {
    reviews: pilotIds.map((id, index) => ({ id, state: index < 5 ? 'mutate' : 'reject', weightedScore: 3 })),
  });
  writeJson('pilot-qa.json', { reviewedAt: '2026-08-11' });

  const fpPilotIds = ['fp-01', 'fp-04', 'fp-06', 'fp-07', 'fp-08'];
  writeJson('first-principles-pilot-generation-record.json', {
    provider: 'fal.ai',
    generatedAt: '2026-08-11T18:00:00Z',
    results: fpPilotIds.map((id) => makeResult(id, 'first-principles/')),
  });
  writeJson('first-principles-pilot-selection.json', {
    results: fpPilotIds.map((id) => ({ id, state: id === 'fp-08' ? 'reject' : 'mutate' })),
  });

  const fpIt02Ids = ['fp-01-r2', 'fp-04-r2', 'fp-06-r2', 'fp-07-r2', 'fp-08-r2'];
  writeJson('first-principles-iteration-02-generation-record.json', {
    provider: 'fal.ai',
    generatedAt: '2026-08-11T19:00:00Z',
    results: fpIt02Ids.map((id) => makeResult(id, 'first-principles/iteration-02/')),
  });
  writeJson('first-principles-iteration-02-selection.json', {
    results: fpIt02Ids.map((id) => ({ id, state: id === 'fp-08-r2' ? 'reject' : 'mutate' })),
  });

  const seqIds = ['m76-fp-062', 'm76-fp-063', 'm76-fp-064', 'm76-fp-066'];
  writeJson('sequence-pilot-sys-07-generation-record.json', {
    provider: 'fal.ai',
    generatedAt: '2026-08-11T20:38:27Z',
    results: seqIds.map((id) => makeResult(id, 'sequence-pilot/sys-07/')),
  });
  writeJson('sequence-pilot-sys-07-selection.json', {
    results: [
      { id: 'm76-fp-062', state: 'mutate' },
      { id: 'm76-fp-063', state: 'reject' },
      { id: 'm76-fp-064', state: 'pass' },
      { id: 'm76-fp-066', state: 'mutate' },
    ],
    sequenceEvaluation: { verdict: 'fail' },
  });

  const editId = 'fp-07-r2-gpt-image-2-edit';
  const editResult = makeResult(editId, 'first-principles/edit-tests/');
  writeJson('first-principles-edit-test-record.json', {
    testId: editId,
    endpoint: 'openai/gpt-image-2/edit',
    providerRequestId: 'req-edit-test',
    evaluation: { workflowVerdict: 'fail', assetVerdict: 'reject' },
    files: {
      source: { path: editResult.sourceLocalPath, bytes: editResult.bytes.source, sha256: editResult.sha256.source },
      master: { path: editResult.publicMasterPath, bytes: editResult.bytes.master, sha256: editResult.sha256.master },
      thumbnail: { path: editResult.publicThumbPath, bytes: editResult.bytes.thumbnail, sha256: editResult.sha256.thumbnail },
    },
  });

  writeJson('requests.json', {
    status: 'superseded-by-first-principles-library-plan',
    eligibleForFinalLibrary: false,
    supersededBy: 'media/projects/midwest-2076-library/first-principles-library-requests.json',
    requests: Array.from({ length: 100 }, (_, index) => ({
      id: `m76-${String(index + 1).padStart(3, '0')}`,
      status: index < 95 ? 'planned' : 'calibration-superseded',
    })),
  });

  return { root, project, published };
}

test('write then verify round-trips a fully mapped, zero-accepted ledger', () => {
  const { root, project } = fixture();
  const wrote = JSON.parse(run(root, '--write'));
  assert.equal(wrote.masters, 30);
  const ledger = JSON.parse(fs.readFileSync(path.join(project, 'qa-reconciliation.json'), 'utf8'));
  assert.equal(ledger.counts.qaAccepted, 0);
  assert.equal(ledger.entries.length, 30);
  assert.ok(ledger.entries.every((entry) => entry.eligibleForFinalLibrary === false));
  assert.ok(ledger.entries.every((entry) => entry.qa.state !== 'accepted'));
  const verified = JSON.parse(run(root));
  assert.equal(verified.ok, true);
  assert.equal(verified.mappedFiles, 60);
  assert.equal(verified.qaAccepted, 0);
  assert.equal(verified.manifestQaAccepted, 0);
});

test('tampered published bytes are a refusal', () => {
  const { root, published } = fixture();
  run(root, '--write');
  const victim = path.join(published, 'brand-assets', 'assets', 'images', 'midwest-2076', 'm76-001.webp');
  fs.writeFileSync(victim, 'substituted bytes');
  runExpectFailure(root, /digest mismatch for m76-001 published master/);
});

test('a selection state of accepted outside requests.json is a refusal', () => {
  const { root, project } = fixture();
  run(root, '--write');
  const selectionPath = path.join(project, 'pilot-selection.json');
  const selection = JSON.parse(fs.readFileSync(selectionPath, 'utf8'));
  selection.reviews[0].state = 'accepted';
  fs.writeFileSync(selectionPath, JSON.stringify(selection, null, 2));
  runExpectFailure(root, /claims accepted state for m76-001/);
});

test('a hand-edited ledger that diverges from provenance is a refusal', () => {
  const { root, project } = fixture();
  run(root, '--write');
  const ledgerPath = path.join(project, 'qa-reconciliation.json');
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  ledger.entries[0].qa.state = 'accepted';
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
  runExpectFailure(root, /does not match a deterministic rebuild/);
});

test('orphan published files with no QA mapping are a refusal', () => {
  const { root, published } = fixture();
  run(root, '--write');
  fs.writeFileSync(path.join(published, 'brand-assets', 'orphan.webp'), 'orphan');
  runExpectFailure(root, /orphan published file with no QA mapping|published-tree has 61 files, ledger maps 60/);
});

test('an unhydrated checkout is a refusal, not a pass', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-m76-unhydrated-'));
  runExpectFailure(root, /missing ledger|missing hydrated file/);
});

test('manifest acceptances invalidate the frozen ledger until regenerated under review', () => {
  const { root, project } = fixture();
  run(root, '--write');
  const manifestPath = path.join(project, 'requests.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.requests[0].qa = { status: 'accepted' };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  runExpectFailure(root, /reports 1 accepted records/);
});
