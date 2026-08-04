#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEXT_EXTENSIONS = new Set(['.html', '.json', '.md', '.mjs', '.py']);
const SOURCE_ROOTS = ['articles', 'media', 'public/presentations'];

function sourceFiles(relativeRoot) {
  const root = path.join(ROOT, relativeRoot);
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) files.push(absolute);
    }
  };
  visit(root);
  return files;
}

test('A-Lab surfaces use the 2026 Author Correction denominator', () => {
  const stale = /(?:41\s+of\s+58|41\/58|58\s+targets|63%|near\s+zero|~0%)/i;
  for (const relativeRoot of SOURCE_ROOTS) {
    for (const file of sourceFiles(relativeRoot)) {
      assert.doesNotMatch(
        fs.readFileSync(file, 'utf8'),
        stale,
        `${path.relative(ROOT, file)} contains a stale A-Lab claim`,
      );
    }
  }

  for (const article of [
    'a-field-not-a-neural-net.md',
    'from-predicted-crystal-to-commercial-cell.md',
    'investing-in-the-trust-layer.md',
    'the-02-percent-synthesis-problem.md',
  ]) {
    const source = fs.readFileSync(path.join(ROOT, 'articles', article), 'utf8');
    assert.match(source, /36 confirmed of 57 eligible|36 of 57 eligible/i);
    assert.match(source, /Author Correction[^\n]*Nature 650:E1|Nature 650:E1[^\n]*Author Correction/i);
  }
});
