import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import test from 'node:test';

const scriptUrl = new URL('../scripts/review-article-video-candidate.mjs', import.meta.url);
const audioExcisionUrl = new URL('../scripts/verify-audio-excision.mjs', import.meta.url);

test('candidate reviewer is valid JavaScript and exposes the project-scoped CLI', () => {
  const result = spawnSync(process.execPath, ['--check', scriptUrl.pathname], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('audio-excision verifier is valid JavaScript and fails closed on correlation', async () => {
  const result = spawnSync(process.execPath, ['--check', audioExcisionUrl.pathname], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const source = await fs.readFile(audioExcisionUrl, 'utf8');
  assert.match(source, /whole\.correlation >= flags\.minCorrelation/);
  assert.match(source, /if \(decision !== 'pass'\) process\.exitCode = 1/);
});

test('candidate reviewer keeps publication disabled and requires exactly 37 decoded frames', async () => {
  const source = await fs.readFile(scriptUrl, 'utf8');
  assert.match(source, /contract\.eligibleForPublication === false/);
  assert.match(source, /check\('candidate-contract-validator'/);
  assert.match(source, /'hyperframes-strict-pass'/);
  assert.match(source, /check\('color-palette-present'/);
  assert.match(source, /'color-semantics-present'/);
  assert.match(source, /'color-prohibitions-present'/);
  assert.match(source, /contrast\?\.warningCount === 0/);
  assert.match(source, /scene-\$\{scene\.id\}-semantic-colors/);
  assert.match(source, /if \(entries\.length !== 37\)/);
  assert.match(source, /check\('full-decode'/);
  assert.match(source, /check\('no-sustained-black'/);
  assert.match(source, /scripts\/verify-audio-excision\.mjs/);
  assert.match(source, /scripts\/audio-release-gate\.mjs/);
  assert.match(source, /scripts\/video-quality-reviewer\.mjs/);
  assert.doesNotMatch(source, /copyFile\([^)]*public[^)]*videos/);
  assert.doesNotMatch(source, /rename\([^)]*public[^)]*videos/);
});

test('candidate reviewer covers exact scene boundaries and settled scene content', async () => {
  const source = await fs.readFile(scriptUrl, 'utf8');
  assert.match(source, /kind: 'scene-early'/);
  assert.match(source, /kind: 'scene-proof'/);
  assert.match(source, /kind: 'scene-late'/);
  assert.match(source, /kind: 'exact-boundary'/);
  assert.match(source, /scenes\.slice\(1\)/);
  assert.match(source, /scene\.reviewTimesSeconds/);
});
