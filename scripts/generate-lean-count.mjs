// Generates public/data/lean_count.json — the single source of truth for the
// "build-locked theorems" figure shown on the homepage ledger panel.
//
// COUNTING RULE (do not change silently — the homepage cites this number):
//   count = lines matching /^(theorem|lemma)\s/ (top-level declarations only,
//   no indentation) across all *.lean files under OpenDistillationFactory/
//   and OpenDistillationFactory.lean in the lupine-rhizo/lean-spec checkout,
//   excluding vendored dependencies (any path containing /packages/ or /.lake/).
//   Equivalent shell check:
//     grep -rE '^(theorem|lemma) ' OpenDistillationFactory OpenDistillationFactory.lean \
//       --include='*.lean' | grep -v '/packages/' | wc -l
//
// ZERO-SORRY RULE: proof code must contain no `sorry` terms; occurrences inside
//   line comments (--) or block-comment/doc-string lines are ignored.
//
// REGENERATE with:
//   node scripts/generate-lean-count.mjs [path-to-lean-spec]
//   (default path: ../lupine-rhizo/lean-spec relative to this repository)
// then commit the updated public/data/lean_count.json. Never hand-edit the JSON.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEAN_SPEC = path.resolve(process.argv[2] ?? path.join(REPO_ROOT, '..', 'lupine-rhizo', 'lean-spec'));
const OUT = path.join(REPO_ROOT, 'public', 'data', 'lean_count.json');

const DECL_RE = /^(theorem|lemma)\s/;
const SORRY_RE = /:=\s*sorry\b|\bby\s+sorry\b|^\s*sorry\s*$/;
const COMMENT_RE = /^\s*(--|\/-|\*)/; // line comments, block-comment openers/continuations

function leanFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (p.includes(`${path.sep}packages${path.sep}`) || p.includes(`${path.sep}.lake${path.sep}`)) continue;
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && p.endsWith('.lean')) out.push(p);
    }
  };
  const rootFile = `${root}.lean`;
  if (fs.existsSync(rootFile)) out.push(rootFile);
  if (fs.existsSync(root)) walk(root);
  return out;
}

const target = path.join(LEAN_SPEC, 'OpenDistillationFactory');
const files = leanFiles(target);
if (!files.length) {
  console.error(`generate-lean-count: no .lean files found under ${target} — pass the lean-spec path as argv[2]`);
  process.exit(1);
}

let count = 0;
let sorryHits = 0;
for (const f of files) {
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    if (DECL_RE.test(line)) count += 1;
    if (SORRY_RE.test(line) && !COMMENT_RE.test(line)) sorryHits += 1;
  }
}

let commit = null;
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: LEAN_SPEC, encoding: 'utf8' }).trim();
} catch { /* lean-spec may not be a git checkout on this machine */ }

const payload = {
  count,
  zero_sorry: sorryHits === 0,
  counted_at: new Date().toISOString().slice(0, 10),
  source: 'lupine-rhizo/lean-spec (OpenDistillationFactory tree, vendored packages excluded)',
  source_commit: commit,
  rule: "top-level declarations: lines matching /^(theorem|lemma)\\s/ in *.lean under OpenDistillationFactory{,.lean}, excluding /packages/ and /.lake/; regenerate with scripts/generate-lean-count.mjs — never hand-edit",
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`generate-lean-count: ${count} declarations (sorry hits in proof code: ${sorryHits}) → ${path.relative(REPO_ROOT, OUT)}`);
if (sorryHits > 0) {
  console.error('generate-lean-count: WARNING — sorry found in proof code; the homepage zero-sorry claim would be false.');
  process.exit(2);
}
