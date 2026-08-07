#!/usr/bin/env node
// Machine-generates the declaration inventory for the `theory-artifacts` Lean
// tree — the eight modules behind the sharp-correction-license work — and writes
// public/data/theory_artifacts_count.json.
//
// Why this exists: gate 5 of the house rules is "never hand-type a theorem
// count". Narrative prose must reference generated tokens, not literals, because
// hand-typed subset counts are exactly how the historical 77/190/262-vs-839
// conflict arose. `generate-lean-count.mjs` covers the OpenDistillationFactory
// tree; this covers theory-artifacts, which is a separate sibling checkout.
//
// Usage:
//   node scripts/generate-theory-artifacts-count.mjs [path-to-theory-artifacts]
//   (default: ../theory-artifacts relative to this repository)

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TREE = path.resolve(process.argv[2] ?? path.join(REPO_ROOT, '..', 'theory-artifacts'));
const OUT = path.join(REPO_ROOT, 'public', 'data', 'theory_artifacts_count.json');

// The four families the sharp-license narrative attributes its subset count to.
const FAMILIES = ['ConformalDelta', 'EscapeRate', 'OracleProblem', 'RobustMinimaxFamily'];

// Same counting rule as generate-lean-count.mjs: strip nested block comments,
// line comments and string literals, then match declarations allowing
// attributes and declaration modifiers.
const DECL = /^[ \t]*(?:@\[[^\n]*\][ \t]*)*(?:(?:private|protected|noncomputable|unsafe|partial)[ \t]+)*(theorem|lemma|example)\b/gm;
const SORRY = /(?:^|[^A-Za-z_])sorry(?![A-Za-z_])/;

function stripNonCode(src) {
  let out = '';
  let depth = 0;
  for (let i = 0; i < src.length; i += 1) {
    if (src.startsWith('/-', i)) { depth += 1; i += 1; continue; }
    if (src.startsWith('-/', i) && depth > 0) { depth -= 1; i += 1; out += ' '; continue; }
    if (depth > 0) { out += src[i] === '\n' ? '\n' : ' '; continue; }
    if (src.startsWith('--', i)) { while (i < src.length && src[i] !== '\n') i += 1; out += '\n'; continue; }
    if (src[i] === '"') {
      i += 1;
      while (i < src.length && src[i] !== '"') { if (src[i] === '\\') i += 1; i += 1; }
      out += '""';
      continue;
    }
    out += src[i];
  }
  return out;
}

// The sibling checkout is a maintenance input, not a build input: the inventory
// it produces is committed. CI checks out only this repository, so a missing tree
// must not break the build — the committed JSON is already what hydration reads,
// and build-articles.mjs fails loudly if that file is absent or invalid.
// Run this script locally (where the sibling exists) to refresh the inventory.
if (!fs.existsSync(TREE)) {
  console.log(`theory-artifacts checkout absent at ${TREE} — keeping the committed inventory`);
  process.exit(0);
}

const files = fs.readdirSync(TREE, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.lean'))
  .map((e) => e.name)
  .sort();

const perModule = {};
let theorem = 0;
let lemma = 0;
let example = 0;
let sorryHits = 0;
const hash = createHash('sha256');

for (const name of files) {
  const raw = fs.readFileSync(path.join(TREE, name), 'utf8');
  hash.update(`${name}\0${raw}\0`);
  const code = stripNonCode(raw);
  if (SORRY.test(code)) sorryHits += 1;
  const counts = { theorem: 0, lemma: 0, example: 0 };
  for (const m of code.matchAll(DECL)) counts[m[1]] += 1;
  perModule[name.replace(/\.lean$/, '')] = counts;
  theorem += counts.theorem;
  lemma += counts.lemma;
  example += counts.example;
}

if (sorryHits > 0) {
  console.error(`refusing to write inventory: ${sorryHits} module(s) contain an active sorry`);
  process.exit(1);
}

const familyNamed = FAMILIES.reduce((sum, f) => {
  const c = perModule[f];
  if (!c) throw new Error(`family module missing from theory-artifacts: ${f}`);
  return sum + c.theorem + c.lemma;
}, 0);

const inventory = {
  modules: files.length,
  theorem,
  lemma,
  named: theorem + lemma,
  example,
  zero_sorry: true,
  families: FAMILIES,
  family_named: familyNamed,
  per_module: perModule,
  counted_at: new Date().toISOString().slice(0, 10),
  source: 'theory-artifacts (sharp-correction-license Lean tree, sibling checkout)',
  source_sha256: hash.digest('hex'),
  rule: 'theorem/lemma/example declarations after stripping nested comments and strings; supports attributes and declaration modifiers; an active sorry token fails the run; regenerate with scripts/generate-theory-artifacts-count.mjs — never hand-edit',
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(inventory, null, 2)}\n`);
console.log(
  `generate-theory-artifacts-count: ${theorem} theorem, ${lemma} lemma, ${inventory.named} named, `
  + `${example} example across ${files.length} modules; ${FAMILIES.length} families hold ${familyNamed} → ${path.relative(REPO_ROOT, OUT)}`,
);
