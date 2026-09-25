#!/usr/bin/env node
// The WebGPU hero tier is lazily loaded progressive enhancement; the one
// property worth a gate is what it costs a visitor to download.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULE_PATH = path.join(ROOT, 'public/assets/ribbon-gpu.js');

test('module stays within the enhancement-script budget', () => {
  const brotli = zlib.brotliCompressSync(fs.readFileSync(MODULE_PATH)).length;
  assert.ok(brotli <= 15 * 1024,
    `ribbon-gpu.js is ${brotli} bytes brotli — over the 15 KB single-script budget`);
});
