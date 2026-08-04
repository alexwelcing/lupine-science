import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { inspectPdf } from '../scripts/check-pdf.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'shared-dft-anchors';
const ARTICLE = path.join(ROOT, 'articles', `${SLUG}.md`);
const MANIFEST = path.join(ROOT, 'public', 'articles', SLUG, `${SLUG}.proofpack.json`);
const PDF = path.join(ROOT, 'public', 'proof-packs', `${SLUG}.proofpack.pdf`);
const EXPECTATIONS = path.join(ROOT, 'tests', 'fixtures', 'pdf-qa-shared-dft-anchors.json');

function sha256(filename) {
  return crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}

test('shared-anchor proof pack locks the approved claim without campaign conflation', async () => {
  const article = fs.readFileSync(ARTICLE, 'utf8');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const approvedClaim = '72.4% fewer DFT evaluations';

  assert.match(article, new RegExp(approvedClaim.replace('.', '\\.')));
  assert.equal(manifest.metadata.status, 'published');
  assert.equal(manifest.summary.claim.includes(approvedClaim), true);
  assert.match(manifest.credits.editorialReview, /completed; approved for publication 2026-08-03/i);

  const forbidden = ['430', '129', '70.0%', '$14.65', '$4.65', '3.62', '624 naive', '79% fewer'];
  for (const marker of forbidden) {
    assert.equal(article.includes(marker), false, `article must not contain ${marker}`);
  }

  const [figure] = manifest.figures;
  const figurePath = path.join(ROOT, 'public', 'articles', SLUG, figure.path);
  assert.equal(sha256(figurePath), figure.sha256, 'figure checksum must match the reviewed manifest');

  const report = await inspectPdf(PDF, EXPECTATIONS);
  assert.deepEqual(report.failures, []);
  assert.equal(report.fonts.allEmbedded, true);
  assert.equal(report.fonts.allUnicodeMapped, true);
  assert.equal(report.fonts.type3.length, 0);
  assert.equal(
    report.fonts.uniqueNames.every((name) => /NotoSerif|NotoSansMath|IBMPlexMono/.test(name)),
    true,
    `unexpected PDF font: ${report.fonts.uniqueNames.join(', ')}`
  );
});
