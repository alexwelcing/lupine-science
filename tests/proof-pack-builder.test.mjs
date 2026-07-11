import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { describe, it, before } from 'node:test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProofPack } from '../scripts/validate-proofpack.mjs';
import { inspectPdf } from '../scripts/check-pdf.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'build-proofpack.mjs');
const OUT_DIR = path.join(ROOT, 'public', 'proof-packs');
const SLUG = 'five-materials-for-5-to-12-gtco2-year';
const PDF_PATH = path.join(OUT_DIR, `${SLUG}.proofpack.pdf`);
const MANIFEST_PATH = path.join(OUT_DIR, `${SLUG}.proofpack.json`);
const GOLDEN_DIR = path.join(ROOT, 'tests', 'golden', 'proof-packs');
const GOLDEN_TEXT_PATH = path.join(GOLDEN_DIR, `${SLUG}.proofpack.txt`);
const UNICODE_COVERAGE_STRING =
  'CO₂ · CH₄ · GtCO₂/year · en dash – · em dash — · “curly quotes” · α β γ Δ μ σ ∑ ∂ ≈ ≤ ≥ ± × · José García · Zoë Šimůnková · François L’Écuyer';

function run(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: 'utf8' });
}

function sha256(filePath) {
  return fs.existsSync(filePath)
    ? crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
    : null;
}

describe('proof-pack builder CLI', () => {
  it('shows usage when no mode is selected', () => {
    const result = run([]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /no mode selected/);
  });

  it('shows help with --help', () => {
    const result = run(['--help']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /--consolidated/);
    assert.match(result.stdout, /--all/);
    assert.match(result.stdout, /--slug/);
  });

  it('builds a per-article pack with PDF and manifest', () => {
    const result = run(['--slug', SLUG, '--out-dir', OUT_DIR]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(PDF_PATH), 'PDF should exist');
    assert.ok(fs.existsSync(MANIFEST_PATH), 'manifest should exist');
  });
});

describe('proof-pack output validation', () => {
  before(() => {
    if (!fs.existsSync(PDF_PATH)) {
      run(['--slug', SLUG, '--out-dir', OUT_DIR]);
    }
  });

  it('input proof-pack manifest passes the validator', () => {
    const inputManifestPath = path.join(ROOT, 'public', 'articles', SLUG, `${SLUG}.proofpack.json`);
    const manifest = JSON.parse(fs.readFileSync(inputManifestPath, 'utf8'));
    const issues = validateProofPack(manifest);
    const errors = issues.filter((issue) => issue.severity === 'error');
    assert.equal(errors.length, 0, errors.map((i) => i.message).join('\n'));
  });

  it('manifest contains content-addressed input and output checksums', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    assert.equal(manifest.schemaVersion, '1.0.0');
    assert.ok(manifest.inputs?.manifest?.sha256, 'input manifest checksum missing');
    assert.ok(manifest.inputs?.articleHtml?.sha256, 'article HTML checksum missing');
    assert.ok(manifest.output?.pdf?.sha256, 'output PDF checksum missing');
    assert.equal(manifest.output.pdf.sha256, sha256(PDF_PATH), 'output checksum mismatch');
  });

  it('PDF uses embedded local fonts with Unicode maps', async () => {
    const report = await inspectPdf(PDF_PATH, path.join(ROOT, 'tests', 'fixtures', 'proof-pack-expectations.json'));
    assert.ok(report.fonts.allEmbedded, 'not all fonts are embedded');
    assert.ok(report.fonts.allUnicodeMapped, 'not all fonts have Unicode maps');
    assert.deepEqual(
      report.fonts.type3,
      [],
      `Type 3 fonts can render incorrectly in print engines: ${report.fonts.type3.join(', ')}`
    );
    assert.equal(report.info['Page size'], '612 x 792 pts (letter)');
  });

  it('PDF round-trips the required Unicode coverage string', async () => {
    const report = await inspectPdf(PDF_PATH, path.join(ROOT, 'tests', 'fixtures', 'proof-pack-expectations.json'));
    const normalized = report.text?.normalized || '';
    assert.ok(
      normalized.includes(UNICODE_COVERAGE_STRING),
      'required Unicode coverage string missing from extracted text'
    );
  });

  it('PDF contains no localhost link annotations', async () => {
    const report = await inspectPdf(PDF_PATH, path.join(ROOT, 'tests', 'fixtures', 'proof-pack-expectations.json'));
    assert.equal(report.annotations.localUris.length, 0, 'found localhost link annotations');
  });
});

describe('proof-pack determinism', () => {
  it('matches the reviewed extracted-text golden file', () => {
    const result = run(['--slug', SLUG, '--out-dir', OUT_DIR]);
    assert.equal(result.status, 0, result.stderr);

    const actualText = execFileSync('pdftotext', ['-layout', PDF_PATH, '-'], { encoding: 'utf8' });

    const updateHint = 'Review the PDF, then run npm run proofpack:update-goldens for an intentional change.';
    assert.equal(actualText, fs.readFileSync(GOLDEN_TEXT_PATH, 'utf8'), `PDF text differs from golden. ${updateHint}`);
  });

  it('produces semantically identical output on repeated builds', () => {
    const outDir = path.join(ROOT, 'public', 'proof-packs');
    const run1 = run(['--slug', SLUG, '--out-dir', outDir]);
    assert.equal(run1.status, 0, run1.stderr);
    const text1 = execFileSync('pdftotext', ['-layout', PDF_PATH, '-'], { encoding: 'utf8' });
    const manifest1 = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    const run2 = run(['--slug', SLUG, '--out-dir', outDir]);
    assert.equal(run2.status, 0, run2.stderr);
    const text2 = execFileSync('pdftotext', ['-layout', PDF_PATH, '-'], { encoding: 'utf8' });
    const manifest2 = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    assert.equal(text1, text2, 'extracted text differs between builds');
    assert.deepEqual(
      manifest1.inputs,
      manifest2.inputs,
      'input checksums differ between builds'
    );
    assert.deepEqual(
      manifest1.output.pdf,
      manifest2.output.pdf,
      'output PDF metadata differs between builds'
    );
    // Byte identity is not guaranteed because Chromium may vary object IDs;
    // the manifest documents the normalized semantic comparison above.
  });
});

describe('proof-pack consolidated mode', () => {
  it('produces the legacy climate-series PDF without Type 3 fonts', async () => {
    const consolidatedPath = path.join(ROOT, 'public', 'proof-pack-climate-series.pdf');
    const before = fs.existsSync(consolidatedPath);
    const result = run(['--consolidated']);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(consolidatedPath), 'consolidated PDF should exist');
    const report = await inspectPdf(
      consolidatedPath,
      path.join(ROOT, 'tests', 'fixtures', 'pdf-qa-expectations.json')
    );
    assert.deepEqual(
      report.fonts.type3,
      [],
      `Type 3 fonts can render incorrectly in print engines: ${report.fonts.type3.join(', ')}`
    );
    if (!before) {
      // Leave the file in the expected production location.
    }
  });
});
