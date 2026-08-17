#!/usr/bin/env node
// The WebGPU hero tier is pure progressive enhancement. These tests pin the
// properties that make it safe to ship: the module stays tiny and dependency-
// free, the WGSL carries the uniforms the bridge feeds it, and index.html
// gates the tier so no unsupported browser ever pays for it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULE_PATH = path.join(ROOT, 'public/assets/ribbon-gpu.js');
const INDEX_PATH = path.join(ROOT, 'public/index.html');

const moduleSrc = fs.readFileSync(MODULE_PATH, 'utf8');
const index = fs.readFileSync(INDEX_PATH, 'utf8');

test('module stays within the enhancement-script budget', () => {
  const brotli = zlib.brotliCompressSync(fs.readFileSync(MODULE_PATH)).length;
  assert.ok(brotli <= 15 * 1024,
    `ribbon-gpu.js is ${brotli} bytes brotli — over the 15 KB single-script budget`);
});

test('module has zero dependencies and one export', () => {
  assert.ok(!/^\s*import\b/m.test(moduleSrc), 'module must not import anything');
  assert.ok(!/\brequire\s*\(/.test(moduleSrc), 'module must not require anything');
  const exports = moduleSrc.match(/^export\s/gm) || [];
  assert.equal(exports.length, 1, 'module exposes exactly one export (start)');
  assert.match(moduleSrc, /export async function start\(bridge\)/);
});

test('WGSL carries the uniform contract the bridge feeds', () => {
  const wgsl = moduleSrc.match(/const WGSL = \/\* wgsl \*\/ `([\s\S]*?)`;\n/)?.[1];
  assert.ok(wgsl, 'WGSL block present');
  for (const field of ['focusA', 'focusB', 'stage', 'zones', 'pot', 'pc1']) {
    assert.ok(new RegExp(`\\b${field}\\s*:`).test(wgsl), `uniform struct has ${field}`);
  }
  assert.match(wgsl, /@vertex/);
  assert.match(wgsl, /@fragment/);
});

test('module composites premultiplied and never claims before presenting', () => {
  assert.match(moduleSrc, /alphaMode:\s*"premultiplied"/);
  // claim() must be downstream of onSubmittedWorkDone — a backend that
  // accepts submits but cannot present must never own the ribbon
  const workDone = moduleSrc.indexOf('onSubmittedWorkDone');
  const claim = moduleSrc.indexOf('bridge.claim()');
  assert.ok(workDone > -1 && claim > workDone,
    'bridge.claim() happens only after the queue confirms presented work');
  assert.match(moduleSrc, /device\.lost\.then/);
  assert.match(moduleSrc, /onuncapturederror/);
});

test('index.html gates the GPU tier correctly', () => {
  const gate = index.match(/if \(gpuCanvas && navigator\.gpu && !staticCanvas && !saveData\)/);
  assert.ok(gate, 'tier gate requires navigator.gpu, non-static canvas, and no save-data');
  assert.match(index, /import\("\/assets\/ribbon-gpu\.js\?v=\d+"\)/);
  assert.match(index, /requestIdleCallback/);
  // the versioned import must point at the file that actually ships
  assert.ok(fs.existsSync(MODULE_PATH), 'shipped module exists at the imported path');
});

test('the GPU canvas is decorative and ordered inside the fallback chain', () => {
  const gpuCanvas = index.indexOf('<canvas id="ribbon-gpu" aria-hidden="true">');
  const twoD = index.indexOf('<canvas id="ribbon" aria-hidden="true">');
  const still = index.indexOf('class="ribbon-fallback"');
  const noscript = index.indexOf('<noscript>');
  assert.ok(gpuCanvas > -1, 'GPU canvas present and aria-hidden');
  assert.ok(twoD > -1 && twoD < gpuCanvas, 'GPU canvas composites above the 2D canvas');
  assert.ok(gpuCanvas < still, 'still-image fallback follows the canvases');
  assert.ok(still < noscript, 'noscript tier closes the chain');
});

test('focus vocabulary stays in sync between page and module', () => {
  // the bridge hands FOCUS targets straight to the module's interpolator;
  // both sides must speak the same keys
  const focusBlock = index.match(/const FOCUS = \{([\s\S]*?)\};/)?.[1];
  assert.ok(focusBlock, 'index.html FOCUS table present');
  for (const key of ['converge', 'ribbon', 'vector', 'ledger', 'ochre']) {
    assert.ok(focusBlock.includes(`${key}:`), `FOCUS table carries ${key}`);
    assert.ok(moduleSrc.includes(key), `module references ${key}`);
  }
  for (const state of ['objective', 'manifold', 'errorvectors', 'ledger']) {
    assert.ok(focusBlock.includes(`${state}:`), `FOCUS table carries ${state}`);
  }
});
