import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { PDFDocument } from 'pdf-lib';

import { readProofPackMetadata } from '../scripts/lib/proof-pack-metadata.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLISHED_PDF = path.join(ROOT, 'public', 'proof-packs', 'shared-dft-anchors.proofpack.pdf');

function temporaryFile(name) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'proof-pack-metadata-'));
  return { directory, filename: path.join(directory, name) };
}

test('reads page count, byte size, and embedded update date from a valid proof pack', async () => {
  const metadata = await readProofPackMetadata(PUBLISHED_PDF);
  const bytes = fs.statSync(PUBLISHED_PDF).size;

  assert.equal(metadata.pageCount, 5);
  assert.equal(metadata.size, `${Math.round(bytes / 1024)} KB`);
  assert.equal(metadata.updatedDate, '2026-08-03');
});

test('rejects malformed bytes that merely contain a PDF page marker', async () => {
  const { directory, filename } = temporaryFile('malformed.pdf');
  try {
    fs.writeFileSync(filename, 'not a PDF\n/Type /Page\n');
    await assert.rejects(readProofPackMetadata(filename), /not a valid PDF/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('uses the parsed PDF page tree rather than raw marker counts', async () => {
  const { directory, filename } = temporaryFile('one-page.pdf');
  try {
    const document = await PDFDocument.create();
    document.addPage();
    document.setCreationDate(new Date('2026-08-03T00:00:00Z'));
    document.setModificationDate(new Date('2026-08-03T00:00:00Z'));
    fs.writeFileSync(filename, await document.save());
    const metadata = await readProofPackMetadata(filename);
    assert.equal(metadata.pageCount, 1);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
