// The Savings Stack booklet (public/booklets/the-savings-stack.pdf) is a
// committed build output. These tests hold the committed PDF to its QA fixture
// and keep the release note's description of it (version, pages, size) true.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { PDFDocument } from 'pdf-lib';

import { bookletEdition } from '../scripts/build-booklet-savings-stack.mjs';
import { inspectPdf } from '../scripts/check-pdf.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'media', 'booklets', 'savings-stack', 'index.html');
const PDF = path.join(ROOT, 'public', 'booklets', 'the-savings-stack.pdf');
const EXPECTATIONS = path.join(ROOT, 'tests', 'fixtures', 'pdf-qa-savings-stack-booklet.json');
const ARTICLE = path.join(ROOT, 'articles', 'the-savings-stack.md');

test('the committed booklet passes its QA fixture with repository fonts only', async () => {
  const report = await inspectPdf(PDF, EXPECTATIONS);
  assert.deepEqual(report.failures, []);
  assert.equal(report.fonts.allEmbedded, true);
  assert.equal(report.fonts.allUnicodeMapped, true);
  assert.deepEqual(report.fonts.uniqueNames.filter((name) => !/NotoSerif|IBMPlexMono/.test(name)), []);
});

test('the committed booklet carries the edition its source declares', async () => {
  const { version, date } = bookletEdition(fs.readFileSync(SOURCE, 'utf8'));
  const document = await PDFDocument.load(fs.readFileSync(PDF), { updateMetadata: false });
  assert.equal(document.getSubject(), `Research booklet, v${version}`);
  assert.equal(document.getModificationDate()?.toISOString().slice(0, 10), date);
  const report = await inspectPdf(PDF, EXPECTATIONS);
  assert.ok(report.text.normalized.includes(`v${version}`), `PDF text must name v${version}`);
});

test('the release note describes the committed booklet accurately', async () => {
  const article = fs.readFileSync(ARTICLE, 'utf8');
  const { version, date } = bookletEdition(fs.readFileSync(SOURCE, 'utf8'));
  const document = await PDFDocument.load(fs.readFileSync(PDF), { updateMetadata: false });
  const pages = document.getPageCount();
  const kilobytes = Math.round(fs.statSync(PDF).size / 1000);
  assert.match(article, new RegExp(`booklet v${version.replace('.', '\\.')} \\(${date}\\)`));
  assert.ok(article.includes(`Get the booklet (PDF, ${kilobytes} KB)`), `article must state ${kilobytes} KB`);
  assert.ok(article.includes(`${pages} pages, US Letter`), `article must state ${pages} pages`);
  assert.doesNotMatch(article, /has not been revised|"measured"/);
});

test('bookletEdition rejects a source without a declared edition', () => {
  assert.throws(() => bookletEdition('<meta name="booklet-version" content="1.1">'), /booklet-date/);
  assert.throws(
    () => bookletEdition('<meta name="booklet-version" content="1.1"><meta name="booklet-date" content="2026-02-30">'),
    /invalid booklet-date/
  );
});
