import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadManifest } from '../visual/lib/config.mjs';
import { deterministicInitScript } from '../visual/lib/determinism.mjs';
import { assertBaselineUpdateAllowed } from '../visual/lib/baseline-policy.mjs';
import { buildGateReport, toJUnit } from '../visual/lib/gate-report.mjs';
import { validateR3FSnapshot } from '../visual/lib/r3f.mjs';

test('manifest applies fixed defaults and rejects duplicate check ids', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'visual-manifest-'));
  const validPath = path.join(dir, 'valid.json');
  await writeFile(validPath, JSON.stringify({ checks: [{ id: 'hero', kind: 'component', url: 'http://localhost:4173', selector: '#hero' }] }));

  const manifest = await loadManifest(validPath);
  assert.deepEqual(manifest.viewport, { width: 1280, height: 720 });
  assert.equal(manifest.seed, 20250801);
  assert.equal(manifest.checks[0].threshold, 0);

  const duplicatePath = path.join(dir, 'duplicate.json');
  await writeFile(duplicatePath, JSON.stringify({ checks: [
    { id: 'hero', kind: 'page', url: 'http://localhost:4173' },
    { id: 'hero', kind: 'page', url: 'http://localhost:4173/other' }
  ] }));
  await assert.rejects(loadManifest(duplicatePath), /duplicate check id: hero/);
});

test('deterministic init script fixes random, time, animation, and device settings', () => {
  const script = deterministicInitScript({ seed: 7, epochMs: 1234567890 });
  assert.match(script, /Math\.random/);
  assert.match(script, /Date\.now/);
  assert.match(script, /requestAnimationFrame/);
  assert.match(script, /devicePixelRatio/);
  assert.match(script, /1234567890/);
});

test('baseline updates require an explicit review acknowledgement', () => {
  assert.throws(
    () => assertBaselineUpdateAllowed({ VISUAL_UPDATE_BASELINES: '1' }),
    /VISUAL_APPROVE_BASELINES=reviewed/
  );
  assert.doesNotThrow(() => assertBaselineUpdateAllowed({
    VISUAL_UPDATE_BASELINES: '1',
    VISUAL_APPROVE_BASELINES: 'reviewed'
  }));
});

test('gate report and JUnit expose pass/fail per check', () => {
  const report = buildGateReport([
    { id: 'component/hero', status: 'passed', durationMs: 15 },
    { id: 'video/intro@1.5s', status: 'failed', durationMs: 20, error: 'pixel mismatch' }
  ]);

  assert.equal(report.schemaVersion, 1);
  assert.equal(report.passed, false);
  assert.deepEqual(report.summary, { total: 2, passed: 1, failed: 1, skipped: 0 });
  assert.equal(report.checks[1].error, 'pixel mismatch');

  const junit = toJUnit(report);
  assert.match(junit, /tests="2"/);
  assert.match(junit, /failures="1"/);
  assert.match(junit, /pixel mismatch/);
});

test('R3F inspection fails closed when the scene probe or expected objects are missing', () => {
  assert.throws(() => validateR3FSnapshot(null, {}), /scene probe returned no snapshot/);
  assert.throws(
    () => validateR3FSnapshot({ objectNames: ['camera'], objectCount: 1, camera: { type: 'PerspectiveCamera' } }, { requiredObjects: ['crystal'] }),
    /missing required R3F object: crystal/
  );
  assert.doesNotThrow(() => validateR3FSnapshot(
    { objectNames: ['camera', 'crystal'], objectCount: 2, camera: { type: 'PerspectiveCamera' } },
    { requiredObjects: ['crystal'], minObjectCount: 2, cameraType: 'PerspectiveCamera' }
  ));
});
