// Generates public/data/lean_count.json — the single source of truth for the
// "build-locked theorems" figure shown on public surfaces.
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
// then commit the updated inventory and static fallback surfaces. Never hand-edit
// the generated count in any of those files.

import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hydrateLeanCount } from './hydrate-lean-count.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEAN_SPEC = path.resolve(process.argv[2] ?? path.join(REPO_ROOT, '..', 'lupine-rhizo', 'lean-spec'));
const OUT = path.join(REPO_ROOT, 'public', 'data', 'lean_count.json');

const DECL_RE = /^[ \t]*(?:@\[[^\n]*\][ \t]*)*(?:(?:private|protected|noncomputable|unsafe)[ \t]+)*(?:theorem|lemma)\b/gm;

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

function stripLeanTrivia(source) {
  let out = '';
  let blockDepth = 0;
  let inString = false;
  let inInterpolatedString = false;
  let interpolationDepth = 0;
  let inInterpolationString = false;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (blockDepth > 0) {
      if (ch === '/' && next === '-') { blockDepth += 1; out += '  '; i += 1; }
      else if (ch === '-' && next === '/') { blockDepth -= 1; out += '  '; i += 1; }
      else out += ch === '\n' ? '\n' : ' ';
    } else if (inInterpolatedString) {
      if (interpolationDepth === 0) {
        if (ch === '\\') { out += '  '; i += 1; }
        else if (ch === '"') { inInterpolatedString = false; out += ' '; }
        else if (ch === '{') { interpolationDepth = 1; out += ' '; }
        else out += ch === '\n' ? '\n' : ' ';
      } else if (inInterpolationString) {
        if (ch === '\\') { out += '  '; i += 1; }
        else if (ch === '"') { inInterpolationString = false; out += ' '; }
        else out += ch === '\n' ? '\n' : ' ';
      } else if (ch === '-' && next === '-') {
        const end = source.indexOf('\n', i);
        if (end === -1) { out += ' '.repeat(source.length - i); break; }
        out += ' '.repeat(end - i); i = end - 1;
      } else if (ch === '/' && next === '-') { blockDepth = 1; out += '  '; i += 1; }
      else if (ch === '"') { inInterpolationString = true; out += ' '; }
      else if (ch === '{') { interpolationDepth += 1; out += ' '; }
      else if (ch === '}') { interpolationDepth -= 1; out += ' '; }
      else out += ch;
    } else if (inString) {
      if (ch === '\\') { out += '  '; i += 1; }
      else if (ch === '"') { inString = false; out += ' '; }
      else out += ch === '\n' ? '\n' : ' ';
    } else if (ch === '-' && next === '-') {
      const end = source.indexOf('\n', i);
      if (end === -1) { out += ' '.repeat(source.length - i); break; }
      out += ' '.repeat(end - i); i = end - 1;
    } else if (ch === '/' && next === '-') { blockDepth = 1; out += '  '; i += 1; }
    else if (ch === '"') {
      if (source.slice(i - 2, i) === 's!') inInterpolatedString = true;
      else inString = true;
      out += ' ';
    }
    else out += ch;
  }
  if (blockDepth !== 0 || inString || inInterpolatedString || inInterpolationString) {
    throw new Error('unterminated Lean comment or string');
  }
  return out;
}

const parserProbe = stripLeanTrivia(`
theorem plain : True := by trivial
@[simp] theorem attributed : True := by trivial
private theorem hidden : True := by trivial
  protected lemma indented : True := by trivial
-- theorem commented : True := by sorry
/- lemma blocked : True := by sorry -/
def quoted := "sorry"
def interpolated := s!"{(sorry : Nat)}"
`);
if ([...parserProbe.matchAll(DECL_RE)].length !== 4 || [...parserProbe.matchAll(/\bsorry\b/g)].length !== 1) {
  throw new Error('Lean inventory parser self-check failed');
}

const target = path.join(LEAN_SPEC, 'OpenDistillationFactory');
const files = leanFiles(target);
files.sort();
if (!files.length) {
  console.error(`generate-lean-count: no .lean files found under ${target} — pass the lean-spec path as argv[2]`);
  process.exit(1);
}

let count = 0;
let sorryHits = 0;
const sourceHash = createHash('sha256');
for (const f of files) {
  const source = fs.readFileSync(f, 'utf8');
  const relative = path.relative(LEAN_SPEC, f).split(path.sep).join('/');
  sourceHash.update(relative).update('\0').update(source).update('\0');
  const code = stripLeanTrivia(source);
  count += [...code.matchAll(DECL_RE)].length;
  sorryHits += [...code.matchAll(/\bsorry\b/g)].length;
}

const sourceSha256 = sourceHash.digest('hex');
let countedAt = '';
try {
  countedAt = execSync(
    'git log -1 --format=%cs -- OpenDistillationFactory OpenDistillationFactory.lean',
    { cwd: LEAN_SPEC, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  ).trim();
} catch {
  const sourceInventory = path.join(LEAN_SPEC, 'theorem-count.json');
  const prior = fs.existsSync(sourceInventory) ? JSON.parse(fs.readFileSync(sourceInventory, 'utf8')) : {};
  if (prior.source_sha256 === sourceSha256) countedAt = prior.counted_at;
  else if (process.env.SOURCE_DATE_EPOCH) {
    countedAt = new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString().slice(0, 10);
  }
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(countedAt)) throw new Error('could not derive Lean source as-of date');

const payload = {
  count,
  zero_sorry: sorryHits === 0,
  counted_at: countedAt,
  source: 'lupine-rhizo/lean-spec (OpenDistillationFactory tree, vendored packages excluded)',
  source_sha256: sourceSha256,
  rule: 'theorem/lemma declarations after stripping nested comments and strings; supports attributes, whitespace, and declaration modifiers; every active sorry token fails; regenerate with scripts/generate-lean-count.mjs — never hand-edit',
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
hydrateLeanCount(count);
console.log(`generate-lean-count: ${count} declarations (sorry hits in proof code: ${sorryHits}) → ${path.relative(REPO_ROOT, OUT)}`);
if (sorryHits > 0) {
  console.error('generate-lean-count: WARNING — sorry found in proof code; the homepage zero-sorry claim would be false.');
  process.exit(2);
}
