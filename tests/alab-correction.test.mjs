#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEXT_EXTENSIONS = new Set(['.html', '.json', '.md', '.mjs', '.py']);
const SOURCE_ROOTS = ['articles', 'media', 'public/presentations'];
const DIRECT_STALE = /(?:41\s+of\s+58|41\/58|58\s+targets)/i;
const AMBIGUOUS_STALE = /(?:63%|near\s+zero|~0%)/gi;
const ALAB_CONTEXT = /A-?Lab|autonomous laborator|Berkeley/i;

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

function staleAlabClaim(text) {
  if (DIRECT_STALE.test(text)) return true;
  for (const match of text.matchAll(AMBIGUOUS_STALE)) {
    const start = Math.max(0, match.index - 300);
    const end = Math.min(text.length, match.index + match[0].length + 300);
    if (ALAB_CONTEXT.test(text.slice(start, end))) return true;
  }
  return false;
}

test('A-Lab surfaces use the 2026 Author Correction denominator', () => {
  for (const relativeRoot of SOURCE_ROOTS) {
    for (const file of sourceFiles(relativeRoot)) {
      assert.equal(
        staleAlabClaim(fs.readFileSync(file, 'utf8')),
        false,
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

test('A-Lab stale-copy scan ignores unrelated percentages and prose', () => {
  assert.equal(staleAlabClaim('An unrelated catalyst retained 63% activity at near zero pressure.'), false);
  assert.equal(staleAlabClaim('A-Lab reported a 63% rate before the correction.'), true);
  assert.equal(staleAlabClaim('The autonomous laboratory tested 41 of 58 targets.'), true);
});
