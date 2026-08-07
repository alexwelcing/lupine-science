import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { inspectPdf } from '../scripts/check-pdf.mjs';
import { readProofPackMetadata } from '../scripts/lib/proof-pack-metadata.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'shared-dft-anchors';
const ARTICLE = path.join(ROOT, 'articles', `${SLUG}.md`);
const PAGE = path.join(ROOT, 'public', 'articles', SLUG, 'index.html');
const ARTICLE_INDEX = path.join(ROOT, 'public', 'articles', 'index.html');
const ARTICLE_STYLES = path.join(ROOT, 'public', 'articles', 'styles.css');
const HERO = path.join(ROOT, 'public', 'articles', SLUG, 'hero.jpg');
const MANIFEST = path.join(ROOT, 'public', 'articles', SLUG, `${SLUG}.proofpack.json`);
const PDF = path.join(ROOT, 'public', 'proof-packs', `${SLUG}.proofpack.pdf`);
const EXPECTATIONS = path.join(ROOT, 'tests', 'fixtures', 'pdf-qa-shared-dft-anchors.json');

function sha256(filename) {
  return crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}

test('shared-anchor proof pack locks the approved claim without campaign conflation', async () => {
  const article = fs.readFileSync(ARTICLE, 'utf8');
  const page = fs.readFileSync(PAGE, 'utf8');
  const articleIndex = fs.readFileSync(ARTICLE_INDEX, 'utf8');
  const styles = fs.readFileSync(ARTICLE_STYLES, 'utf8');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const hero = fs.readFileSync(HERO);
  const approvedClaim = '72.4% fewer DFT evaluations';

  assert.match(article, new RegExp(approvedClaim.replace('.', '\\.')));
  assert.equal(manifest.metadata.status, 'published');
  assert.equal(manifest.summary.claim.includes(approvedClaim), true);
  assert.match(manifest.credits.editorialReview, /completed; approved for publication 2026-08-03/i);
  assert.match(page, /<aside class="proof-download" aria-labelledby="proof-download-title-shared-dft-anchors">/);
  const pdfMetadata = await readProofPackMetadata(PDF);
  assert.ok(page.includes(`PDF · ${pdfMetadata.pageCount} pages · ${pdfMetadata.size} · updated August 3, 2026`));
  assert.match(page, /href="\/proof-packs\/shared-dft-anchors\.proofpack\.pdf" download/);
  assert.match(page, /https:\/\/lupine\.science\/articles\/shared-dft-anchors\/hero\.jpg\?v=4/);
  assert.equal((page.match(/hero\.jpg\?v=4/g) || []).length, 4, 'OG, Twitter, JSON-LD, and visible hero must share v4');
  assert.doesNotMatch(page, /hero\.jpg\?v=3/);
  assert.match(articleIndex, /shared-dft-anchors\/hero\.jpg\?v=4/);
  assert.deepEqual([...hero.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.ok(page.indexOf('class="proof-download"') < page.indexOf('class="article-hero"'), 'proof download must precede hero');
  assert.match(styles, /@media print[\s\S]*\.article \.proof-download__action \{ display: none; \}/);
  assert.match(styles, /@media print[\s\S]*\.proof-download__print-url \{ display: block;/);

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
