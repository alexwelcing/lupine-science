#!/usr/bin/env node
// Inserts `> **Ontology:** ...` into the first metadata blockquote of each
// article listed in MAP. Idempotent — re-running on an article that already
// has the line updates it in place rather than appending a duplicate.
//
// This is editorial tooling for ATX-1: it does NOT live in the build chain.
// The build chain reads the ontology lines via the next build, not via this
// script. Keeping it as a one-shot means the editor can audit each insertion
// in the resulting diff.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'articles');

// slug -> ontology tokens (short form, e.g. ["T1","MC4"])
const MAP = {
  'shared-dft-anchors': ['T6', 'E4', 'MC4'],
  'z1-union-debrief': ['T6', 'E4', 'MC4'],
  'what-the-cap-was-hiding': ['T2', 'T6', 'E9'],
  'an-order-of-effort': ['T2', 'E4', 'E8'],
  'the-materials-we-test-against': ['T2', 'E4', 'MC4'],
  'a-smooth-environment-resolved-error-field': ['T2', 'E1', 'E5'],
  'the-trust-layer': ['T6', 'E9'],
  'the-savings-stack': ['T6', 'MC4'],
  'from-fantasy-frameworks-to-makeable-materials': ['T7', 'E7', 'MC8'],
  'four-gates-three-honest-failures-one-live-experiment': ['T2', 'T6', 'E4'],
  'the-correction-that-hurt-and-the-theorem-that-stopped-it': ['T2', 'T6'],
  'the-small-cell-held-mlip-elastic-benchmark': ['T4', 'E5', 'MC9'],
};

const RE = /^> \*\*Ontology:\*\*\s*.+?$/m;

for (const [slug, tokens] of Object.entries(MAP)) {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) {
    console.error(`missing article: ${slug}.md`);
    process.exit(1);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const replacement = `> **Ontology:** ${tokens.join(', ')}`;
  let next;
  if (RE.test(raw)) {
    next = raw.replace(RE, replacement);
    console.log(`updated ${slug}.md -> ${tokens.join(', ')}`);
  } else {
    // Insert at the end of the first blockquote (the metadata block).
    // Find the last `> ` line that is contiguous with the opening `> ` line
    // of the blockquote; insert ours immediately after it.
    const lines = raw.split('\n');
    let startIdx = -1;
    let endIdx = -1;
    for (let i = 0; i < lines.length; i += 1) {
      if (startIdx === -1) {
        if (/^>\s/.test(lines[i])) startIdx = i;
      } else if (!/^>\s/.test(lines[i])) {
        endIdx = i;
        break;
      }
    }
    if (startIdx === -1) {
      console.error(`${slug}.md: no leading blockquote found`);
      process.exit(1);
    }
    if (endIdx === -1) endIdx = startIdx + 1;
    lines.splice(endIdx, 0, replacement);
    next = lines.join('\n');
    console.log(`inserted into ${slug}.md -> ${tokens.join(', ')}`);
  }
  fs.writeFileSync(file, next);
}
