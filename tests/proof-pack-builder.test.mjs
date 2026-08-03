import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { describe, it, before } from 'node:test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProofPack } from '../scripts/validate-proofpack.mjs';
import { inspectPdf } from '../scripts/check-pdf.mjs';
import {
  generateProofPack,
  listEligibleArticles,
  validateProofPackOutput,
} from '../lib/proof-pack-generator.mjs';
import {
  assertNoOutputCollisions,
  isLoopbackRequestUrl,
  resolvePublicRequestPath,
} from '../scripts/build-proofpack.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'build-proofpack.mjs');
const OUT_DIR = path.join(ROOT, 'public', 'proof-packs');
const SLUG = 'five-materials-for-5-to-12-gtco2-year';
const PDF_PATH = path.join(OUT_DIR, `${SLUG}.proofpack.pdf`);
const MANIFEST_PATH = path.join(OUT_DIR, `${SLUG}.proofpack.json`);

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
  it('refuses local-server paths that escape into a prefix-matching sibling', () => {
    assert.equal(resolvePublicRequestPath('/../publicity/secret'), null);
    assert.equal(resolvePublicRequestPath('/articles/index.html'), path.join(ROOT, 'public', 'articles', 'index.html'));
  });

  it('allows only parsed loopback renderer URLs without userinfo bypasses', () => {
    assert.equal(isLoopbackRequestUrl('http://127.0.0.1:4123/figure.svg'), true);
    assert.equal(isLoopbackRequestUrl('http://localhost:4123/font.woff2'), true);
    assert.equal(isLoopbackRequestUrl('http://127.0.0.1:4123@evil.example/secret'), false);
    assert.equal(isLoopbackRequestUrl('https://evil.example/'), false);
  });

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

  it('cleans stale slug artifacts when browser startup fails', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proofpack-browser-failure-'));
    const names = [`${SLUG}.proofpack.pdf`, `${SLUG}.proofpack.json`];
    try {
      for (const name of names) fs.writeFileSync(path.join(outDir, name), 'stale');
      const result = spawnSync(
        process.execPath,
        [SCRIPT, '--slug', SLUG, '--out-dir', outDir],
        {
          cwd: ROOT,
          encoding: 'utf8',
          env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.join(outDir, 'missing-browsers') },
        }
      );
      assert.notEqual(result.status, 0);
      assert.deepEqual(fs.readdirSync(outDir), []);
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  it('builds a per-article pack with PDF and manifest', () => {
    const result = run(['--slug', SLUG, '--out-dir', OUT_DIR]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(PDF_PATH), 'PDF should exist');
    assert.ok(fs.existsSync(MANIFEST_PATH), 'manifest should exist');
  });
});

describe('proof-pack generator API', () => {
  it('lists eligible articles in stable slug order', () => {
    const articles = listEligibleArticles();
    assert.ok(articles.length > 0);
    assert.deepEqual(
      articles.map(({ slug }) => slug),
      articles.map(({ slug }) => slug).toSorted()
    );
    assert.ok(articles.some(({ slug }) => slug === SLUG));
  });

  it('removes stale outputs when a requested article is no longer eligible', async () => {
    const outDir = path.join(ROOT, '.proofpack-stale-test');
    const staleSlug = 'removed-article';
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${staleSlug}.proofpack.pdf`), 'stale PDF');
    fs.writeFileSync(path.join(outDir, `${staleSlug}.proofpack.json`), '{}');
    try {
      await assert.rejects(
        generateProofPack(staleSlug, { outDir }),
        /article is not eligible for a proof pack/
      );
      assert.deepEqual(fs.readdirSync(outDir), []);
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  it('refuses an output directory that would overwrite the reviewed source manifest', async () => {
    const articleDir = path.join(ROOT, 'public', 'articles', SLUG);
    const sourceManifest = path.join(articleDir, `${SLUG}.proofpack.json`);
    const before = sha256(sourceManifest);
    await assert.rejects(
      generateProofPack(SLUG, { outDir: articleDir }),
      /would overwrite an authoritative proof-pack input/
    );
    assert.equal(sha256(sourceManifest), before);
  });

  it('refuses outputs that collide with any authoritative figure input', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'proofpack-collision-'));
    try {
      const slug = 'collision-article';
      const articleDir = path.join(root, slug);
      const outDir = path.join(articleDir, 'figures');
      fs.mkdirSync(outDir, { recursive: true });
      const sourceManifest = path.join(articleDir, `${slug}.proofpack.json`);
      fs.writeFileSync(sourceManifest, JSON.stringify({
        figures: [{ path: `figures/${slug}.proofpack.pdf` }],
      }));
      fs.writeFileSync(path.join(outDir, `${slug}.proofpack.pdf`), 'reviewed figure');

      assert.throws(
        () => assertNoOutputCollisions(slug, outDir, sourceManifest),
        /would overwrite an authoritative proof-pack input/
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('generates and validates exactly one pack for a real Unicode article', async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proofpack-api-test-'));
    try {
      const result = await generateProofPack({ slug: SLUG }, { outDir });
      assert.equal(result.slug, SLUG);
      assert.equal(result.validated, true);
      assert.deepEqual(
        fs.readdirSync(outDir).toSorted(),
        [`${SLUG}.proofpack.json`, `${SLUG}.proofpack.pdf`]
      );
      assert.deepEqual(validateProofPackOutput(result.manifestPath), []);
      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, 'utf8'));
      assert.equal(manifest.generatedAt, '2026-07-09T00:00:00.000Z');
      assert.equal(Object.hasOwn(manifest.inputs, 'renderedHtml'), false);
      assert.equal(manifest.output.pdf.path, `${SLUG}.proofpack.pdf`);
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
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
