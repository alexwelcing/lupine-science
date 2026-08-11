#!/usr/bin/env node
// The hero's promise is that every visitor sees the manifold: WebGPU where
// it earns it, the 2D instrument everywhere else, a still photograph without
// canvas, and a noscript twin without JavaScript. This suite pins each tier's
// existence so a refactor can't quietly amputate one.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');

test('the 2D instrument remains self-sufficient', () => {
  assert.match(index, /getContext\("2d"\)/);
  assert.match(index, /no-canvas/, 'canvas-less browsers get the still image');
  assert.match(index, /staticCanvas/, 'reduced-motion and mobile render one static frame');
  assert.match(index, /gpuOwnsRibbon/, '2D renderer knows how to resume the ribbon');
  // the skip flag must guard the ribbon blocks and default to 2D ownership
  assert.match(index, /let gpuOwnsRibbon = false/);
  assert.match(index, /if \(!gpuOwnsRibbon\) \{/);
});

test('still-image tiers survive', () => {
  assert.match(index, /class="ribbon-fallback" data-src="\/ribbon-still\.jpg"/);
  assert.match(index, /<noscript>[\s\S]*ribbon-still\.jpg[\s\S]*<\/noscript>/);
  for (const still of ['ribbon-still.jpg', 'ribbon-still.webp', 'ribbon-still.avif']) {
    assert.ok(fs.existsSync(path.join(ROOT, 'public', still)), `public/${still} ships`);
  }
});

test('GPU failure hands the ribbon back to the 2D renderer', () => {
  assert.match(index, /onLost: \(\) => \{ gpuOwnsRibbon = false;/);
  const moduleSrc = fs.readFileSync(path.join(ROOT, 'public/assets/ribbon-gpu.js'), 'utf8');
  assert.match(moduleSrc, /bridge\.onLost\(\)/);
});

test('CSP hashes in _headers match the inline scripts actually shipped', async () => {
  const { collectScriptHashes } = await import('../scripts/build-headers.mjs');
  const headers = fs.readFileSync(path.join(ROOT, 'public/_headers'), 'utf8');
  for (const hash of collectScriptHashes()) {
    assert.ok(headers.includes(hash),
      `stale CSP: ${hash} missing from public/_headers — run node scripts/build-headers.mjs`);
  }
});
