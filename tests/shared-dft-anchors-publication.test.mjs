import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'shared-dft-anchors';
const ARTICLE = path.join(ROOT, 'articles', `${SLUG}.md`);
const PAGE = path.join(ROOT, 'public', 'articles', SLUG, 'index.html');
const PUBLIC_MANIFEST = path.join(ROOT, 'public', 'articles', SLUG, `${SLUG}.proofpack.json`);
const PUBLIC_BUILD_MANIFEST = path.join(ROOT, 'public', 'proof-packs', `${SLUG}.proofpack.json`);
const PUBLIC_PDF = path.join(ROOT, 'public', 'proof-packs', `${SLUG}.proofpack.pdf`);
const WITHHELD = path.join(ROOT, 'evidence', 'withheld', SLUG);

test('shared-anchor publication fail-closes to the frozen public claim', () => {
  const article = fs.readFileSync(ARTICLE, 'utf8');
  const page = fs.readFileSync(PAGE, 'utf8');
  const approvedClaim = '72.4% fewer DFT evaluations';

  assert.match(article, new RegExp(approvedClaim.replace('.', '\\.')));
  assert.match(page, new RegExp(approvedClaim.replace('.', '\\.')));
  assert.doesNotMatch(article, /^> \*\*Proof Pack:\*\*/m);
  assert.doesNotMatch(page, /class="proof-download"/);

  const forbidden = [
    '558',
    '154',
    '3.62',
    '72.4 percent',
    'projected evaluations by 72.4%',
    '/data/savings-stack-v1/z1-union-anchor-economics',
  ];
  for (const marker of forbidden) {
    assert.equal(article.includes(marker), false, `article must not contain ${marker}`);
    assert.equal(page.includes(marker), false, `page must not contain ${marker}`);
  }

  assert.equal(fs.existsSync(PUBLIC_MANIFEST), false, 'unreviewed proof-pack manifest must not be public');
  assert.equal(fs.existsSync(PUBLIC_BUILD_MANIFEST), false, 'unreviewed proof-pack build manifest must not be public');
  assert.equal(fs.existsSync(PUBLIC_PDF), false, 'unreviewed proof-pack PDF must not be public');
  assert.equal(fs.existsSync(path.join(WITHHELD, `${SLUG}.proofpack.json`)), true);
  assert.equal(fs.existsSync(path.join(WITHHELD, `${SLUG}.proofpack-build.json`)), true);
  assert.equal(fs.existsSync(path.join(WITHHELD, `${SLUG}.proofpack.pdf`)), true);
});