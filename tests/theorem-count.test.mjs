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
  path.join(ROOT, 'public', 'videos'),
];
const NARRATIVE_FILES = [
  path.join(ROOT, 'public', 'articles', 'from-predicted-crystal-to-commercial-cell', 'images', 'manifest.json'),
];
const STATIC_COUNT_SURFACES = [];
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

// A bare library-wide theorem count is not evidence (docs/messaging-canon.md):
// no article may carry the token, so no page can print the count as a headline.
test('no article prints the library-wide theorem count', () => {
  for (const file of fs.readdirSync(ARTICLES).filter((name) => name.endsWith('.md'))) {
    const source = fs.readFileSync(path.join(ARTICLES, file), 'utf8');
    assert.doesNotMatch(source, /\{\{LEAN_THEOREM_COUNT\}\}/, `${file} still carries the theorem-count token`);
  }
});

// The one generated, dated count that remains (a corrections note) is hydrated
// at build time, never typed.
test('generated articles hydrate the theory-artifacts count tokens', () => {
  const artifacts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', 'theory_artifacts_count.json'), 'utf8'));
  const source = fs.readFileSync(path.join(ARTICLES, 'what-the-cap-was-hiding.md'), 'utf8');
  assert.match(source, /\{\{TA_NAMED\}\}/);

  const output = fs.readFileSync(path.join(ROOT, 'public', 'articles', 'what-the-cap-was-hiding', 'index.html'), 'utf8');
  assert.match(output, new RegExp(`\\b${artifacts.named} named results\\b`));
  assert.doesNotMatch(output, /\{\{TA_[A-Z_]+\}\}/);
});

// The homepage carries no Lean section at all; what a Lean check covers is
// said once, on /results/, beside the one generated example.
test('homepage and /results/ show no theorem count; /results/ says what a Lean check covers', () => {
  const homepage = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
  const results = fs.readFileSync(path.join(ROOT, 'public', 'results', 'index.html'), 'utf8');
  for (const page of [homepage, results]) {
    assert.doesNotMatch(page, /id="lean-count"/);
    assert.doesNotMatch(page, new RegExp(`\\b${inventory.count}\\b`));
    assert.doesNotMatch(page, STATIC_THEOREM_COUNT);
  }
  assert.match(results, /<h2 id="lean">Lean-checked arithmetic<\/h2>\s*<p>Lean 4 checks the arithmetic and stated inequalities behind published numbers; it does not check the physics, the reference data or the pipeline\.<\/p>/);
});
