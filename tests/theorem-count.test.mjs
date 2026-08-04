import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'articles');
const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', 'lean_count.json'), 'utf8'));

test('article theorem counts come from the generated Lean inventory', () => {
  assert.ok(Number.isSafeInteger(inventory.count) && inventory.count > 0);
  for (const name of fs.readdirSync(ARTICLES).filter((entry) => entry.endsWith('.md'))) {
    const source = fs.readFileSync(path.join(ARTICLES, name), 'utf8');
    assert.doesNotMatch(
      source,
      /(?<!Lean )\b\d+\+?\s+(?:build-locked\s+)?(?:Lean\s+4\s+)?theorems?\b/i,
      `${name} contains a hand-typed theorem count`,
    );
  }
});

test('generated articles hydrate the current theorem count token', () => {
  const source = fs.readFileSync(path.join(ARTICLES, 'a-field-not-a-neural-net.md'), 'utf8');
  assert.match(source, /\{\{LEAN_THEOREM_COUNT\}\}/);

  const output = fs.readFileSync(path.join(ROOT, 'public', 'articles', 'a-field-not-a-neural-net', 'index.html'), 'utf8');
  assert.match(output, new RegExp(`\\b${inventory.count} build-locked theorems\\b`));
  assert.doesNotMatch(output, /\{\{LEAN_THEOREM_COUNT\}\}/);
});