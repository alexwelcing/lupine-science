import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'articles');
const NARRATIVE_ROOTS = [
  ARTICLES,

  path.join(ROOT, 'data', 'narration-scripts'),
  path.join(ROOT, 'media'),
  path.join(ROOT, 'public', 'brand-assets'),
  path.join(ROOT, 'public', 'presentations'),
  path.join(ROOT, 'public', 'videos'),
];
const NARRATIVE_FILES = [
  path.join(ROOT, 'public', 'articles', 'from-predicted-crystal-to-commercial-cell', 'images', 'manifest.json'),
];
const STATIC_COUNT_SURFACES = [
  path.join(ROOT, 'public', 'brand-assets', 'deck-dark-sample.html'),
  path.join(ROOT, 'public', 'presentations', 'climate-investor-value', 'index.html'),
];
const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', 'lean_count.json'), 'utf8'));
const STATIC_THEOREM_COUNT = /(?<!Lean )\b(?:\d+\+?|(?:seventy[ -]seven))\s+(?:build-locked\s+)?(?:Lean\s+4\s+)?theorems?\b/i;
const PFAS_CONTRACT = path.join(ROOT, 'media', 'projects', 'article-video-replacements', 'critical-minerals-pfas', 'production-contract.json');

function narrativeSource(file, source) {
  if (file !== PFAS_CONTRACT) return source;
  // This exact contract records examples that must never be published. Keep
  // scanning every other field, including any copy that repeats those examples.
  const contract = JSON.parse(source);
  if (contract.rules) delete contract.rules.prohibitedClaimPatterns;
  return JSON.stringify(contract);
}

function narrativeFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) return narrativeFiles(entryPath);
    return entry.isFile() && /\.(?:html|json|md|py|vtt)$/.test(entry.name) ? [entryPath] : [];
  });
}

test('narrative theorem counts come from the generated Lean inventory', () => {
  assert.ok(Number.isSafeInteger(inventory.count) && inventory.count > 0);
  for (const file of [...NARRATIVE_ROOTS.flatMap(narrativeFiles), ...NARRATIVE_FILES]) {
    const source = narrativeSource(file, fs.readFileSync(file, 'utf8')).replaceAll(
      `<strong data-lean-count>${inventory.count}</strong>`,
      '<strong data-lean-count>generated</strong>',
    );
    if (/"epistemicStatus":\s*"frozen historical snapshot from commit [0-9a-f]+; retained verbatim for narration recovery provenance"/.test(source)) {
      continue;
    }
    assert.doesNotMatch(
      source,
      STATIC_THEOREM_COUNT,
      `${path.relative(ROOT, file)} contains a hand-typed theorem count`,
    );
  }
});

test('prohibited examples in the PFAS contract are not narrative claims', () => {
  const source = fs.readFileSync(PFAS_CONTRACT, 'utf8');
  const contract = JSON.parse(source);
  assert.ok(contract.rules.prohibitedClaimPatterns.some((pattern) => STATIC_THEOREM_COUNT.test(pattern)));
  assert.doesNotMatch(narrativeSource(PFAS_CONTRACT, source), STATIC_THEOREM_COUNT);
  // An arbitrary narrative file cannot claim the contract's exemption.
  assert.match(narrativeSource(path.join(ARTICLES, 'claim.json'), source), STATIC_THEOREM_COUNT);
});

test('the contract still rejects a prohibited count repeated as narrative copy', () => {
  const contract = JSON.parse(fs.readFileSync(PFAS_CONTRACT, 'utf8'));
  contract.narration = contract.rules.prohibitedClaimPatterns.find((pattern) => STATIC_THEOREM_COUNT.test(pattern));
  assert.match(narrativeSource(PFAS_CONTRACT, JSON.stringify(contract)), STATIC_THEOREM_COUNT);
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
