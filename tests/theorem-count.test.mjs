import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'articles');
const NARRATIVE_ROOTS = [
  ARTICLES,
  path.join(ROOT, 'media'),
  path.join(ROOT, 'public', 'brand-assets'),
  path.join(ROOT, 'public', 'presentations'),
];
const NARRATIVE_FILES = [
  path.join(ROOT, 'public', 'articles', 'from-predicted-crystal-to-commercial-cell', 'images', 'manifest.json'),
];
const STATIC_COUNT_SURFACES = [
  path.join(ROOT, 'public', 'brand-assets', 'deck-dark-sample.html'),
  path.join(ROOT, 'public', 'presentations', 'climate-investor-value', 'index.html'),
];
const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', 'lean_count.json'), 'utf8'));

function narrativeFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) return narrativeFiles(entryPath);
    return entry.isFile() && /\.(?:html|md|py)$/.test(entry.name) ? [entryPath] : [];
  });
}

test('narrative theorem counts come from the generated Lean inventory', () => {
  assert.ok(Number.isSafeInteger(inventory.count) && inventory.count > 0);
  for (const file of [...NARRATIVE_ROOTS.flatMap(narrativeFiles), ...NARRATIVE_FILES]) {
    const source = fs.readFileSync(file, 'utf8').replaceAll(
      `<strong data-lean-count>${inventory.count}</strong>`,
      '<strong data-lean-count>generated</strong>',
    );
    assert.doesNotMatch(
      source,
      /(?<!Lean )\b(?:\d+\+?|(?:seventy[ -]seven))\s+(?:build-locked\s+)?(?:Lean\s+4\s+)?theorems?\b/i,
      `${path.relative(ROOT, file)} contains a hand-typed theorem count`,
    );
  }
});

test('static theorem-count surfaces keep a generated numeric fallback', () => {
  for (const file of STATIC_COUNT_SURFACES) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(
      source,
      new RegExp(`<strong data-lean-count>${inventory.count}</strong>`),
      `${path.relative(ROOT, file)} does not contain the generated theorem count`,
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

test('homepage has a generated static theorem-count fallback', () => {
  const homepage = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
  assert.match(homepage, new RegExp(`<strong id="lean-count">${inventory.count}</strong>`));
});