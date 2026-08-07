import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { describe, it, before } from 'node:test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyArtifactIntegrity, verifyFigureIntegrity } from '../scripts/build-proofpack.mjs';
import { validateProofPack } from '../scripts/validate-proofpack.mjs';
import { inspectPdf } from '../scripts/check-pdf.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'build-proofpack.mjs');
const OUT_DIR = path.join(ROOT, 'public', 'proof-packs');
const SLUG = 'five-materials-for-5-to-12-gtco2-year';
const PDF_PATH = path.join(OUT_DIR, `${SLUG}.proofpack.pdf`);
const MANIFEST_PATH = path.join(OUT_DIR, `${SLUG}.proofpack.json`);
const REPRESENTATIVE_SLUGS = [
  'a-smooth-environment-resolved-error-field',
  'five-materials-for-5-to-12-gtco2-year',
  'the-materials-we-test-against',
];

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

  it('builds all representative content classes offline', () => {
    const result = run(['--all', '--out-dir', OUT_DIR]);
    assert.equal(result.status, 0, result.stderr);
    for (const slug of REPRESENTATIVE_SLUGS) {
      assert.ok(fs.existsSync(path.join(OUT_DIR, `${slug}.proofpack.pdf`)), `${slug} PDF should exist`);
      assert.ok(fs.existsSync(path.join(OUT_DIR, `${slug}.proofpack.json`)), `${slug} output manifest should exist`);
    }
    const built = fs.readdirSync(OUT_DIR).filter((name) => name.endsWith('.proofpack.pdf')).sort();
    assert.deepEqual(built, REPRESENTATIVE_SLUGS.map((slug) => `${slug}.proofpack.pdf`).sort());
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

  it('all representative manifests validate and pin every figure byte-for-byte', () => {
    for (const slug of REPRESENTATIVE_SLUGS) {
      const articleDir = path.join(ROOT, 'public', 'articles', slug);
      const manifest = JSON.parse(
        fs.readFileSync(path.join(articleDir, `${slug}.proofpack.json`), 'utf8')
      );
      const errors = validateProofPack(manifest).filter((issue) => issue.severity === 'error');
      assert.equal(errors.length, 0, `${slug}: ${errors.map((issue) => issue.message).join('\n')}`);
      assert.equal(manifest.metadata.slug, slug);
      for (const figure of manifest.figures) {
        assert.match(figure.sha256, /^[a-f0-9]{64}$/, `${slug}/${figure.id} digest missing`);
        assert.equal(
          figure.sha256,
          sha256(path.join(articleDir, figure.path)),
          `${slug}/${figure.id} digest mismatch`
        );
      }
    }
  });

  it('fails closed for missing, external, escaping, absent, or digest-mismatched figures', () => {
    const publicRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'proofpack-integrity-'));
    const slug = 'integrity-fixture';
    const articleDir = path.join(publicRoot, 'articles', slug);
    const outsideDir = path.join(publicRoot, 'outside');
    fs.mkdirSync(articleDir, { recursive: true });
    fs.mkdirSync(outsideDir, { recursive: true });
    fs.writeFileSync(path.join(articleDir, 'figure.png'), 'reviewed figure bytes');
    fs.writeFileSync(path.join(outsideDir, 'outside.png'), 'outside figure bytes');
    fs.symlinkSync(path.join(outsideDir, 'outside.png'), path.join(articleDir, 'linked.png'));
    fs.symlinkSync(outsideDir, path.join(articleDir, 'linked-dir'));
    fs.symlinkSync(outsideDir, path.join(publicRoot, 'articles', 'linked-article'));
    const digest = sha256(path.join(articleDir, 'figure.png'));
    const outsideDigest = sha256(path.join(outsideDir, 'outside.png'));
    const manifestFor = (figure) => ({ figures: [{ id: 'fig-1', ...figure }] });

    try {
      assert.doesNotThrow(() =>
        verifyFigureIntegrity(slug, manifestFor({ path: 'figure.png', sha256: digest }), publicRoot)
      );
      assert.throws(
        () => verifyFigureIntegrity(slug, manifestFor({ path: 'figure.png' }), publicRoot),
        /figure digest missing/
      );
      assert.throws(
        () => verifyFigureIntegrity(slug, manifestFor({ path: 'https:\/\/example.com\/figure.png', sha256: digest }), publicRoot),
        /repository-local/
      );
      assert.throws(
        () => verifyFigureIntegrity(slug, manifestFor({ path: '../figure.png', sha256: digest }), publicRoot),
        /escapes article directory/
      );
      assert.throws(
        () => verifyFigureIntegrity(slug, manifestFor({ path: 'linked.png', sha256: outsideDigest }), publicRoot),
        /resolves outside article directory/
      );
      assert.throws(
        () => verifyFigureIntegrity(slug, manifestFor({ path: 'linked-dir/outside.png', sha256: outsideDigest }), publicRoot),
        /resolves outside article directory/
      );
      assert.throws(
        () => verifyFigureIntegrity('linked-article', manifestFor({ path: 'outside.png', sha256: outsideDigest }), publicRoot),
        /article directory resolves outside public articles root/
      );
      assert.throws(
        () => verifyFigureIntegrity(slug, manifestFor({ path: 'missing.png', sha256: digest }), publicRoot),
        /figure file missing/
      );
      assert.throws(
        () => verifyFigureIntegrity(slug, manifestFor({ path: 'figure.png', sha256: '0'.repeat(64) }), publicRoot),
        /figure digest mismatch/
      );
    } finally {
      fs.rmSync(publicRoot, { recursive: true, force: true });
    }
  });

  it('verifies local JSON artifact cardinality, split, digest binding, and panel disjointness', () => {
    const publicRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'proofpack-artifacts-'));
    const slug = 'artifact-fixture';
    const articleDir = path.join(publicRoot, 'articles', slug);
    const evidenceDir = path.join(articleDir, 'evidence');
    const outsideDir = path.join(publicRoot, 'outside');
    fs.mkdirSync(evidenceDir, { recursive: true });
    fs.mkdirSync(outsideDir, { recursive: true });

    const reference = {
      holdout: { source_split: 'test' },
      paths: [
        { chemical_system: 'A', material_id: 'M1', split: 'test' },
        { chemical_system: 'B', material_id: 'M2', split: 'test' },
      ],
    };
    const referencePath = path.join(evidenceDir, 'reference.json');
    fs.writeFileSync(referencePath, JSON.stringify(reference));
    const referenceDigest = sha256(referencePath);

    const writeTraining = (paths, disjointDigest = referenceDigest) => {
      const trainingPath = path.join(evidenceDir, 'training.json');
      fs.writeFileSync(trainingPath, JSON.stringify({
        holdout: { disjoint_from_sha256: `sha256:${disjointDigest}` },
        paths,
      }));
      return { trainingPath, trainingDigest: sha256(trainingPath) };
    };
    const manifestFor = (trainingDigest, trainingChecks = {}) => ({
      figures: [],
      methodology: {
        artifacts: [
          {
            id: 'reference', label: 'Reference', url: 'https://example.com/reference',
            path: 'evidence/reference.json', sha256: referenceDigest,
            jsonChecks: {
              pathCount: 2, uniqueChemicalSystemCount: 2, uniqueMaterialIdCount: 2,
              pathSplit: 'test', holdoutSourceSplit: 'test',
            },
          },
          {
            id: 'training', label: 'Training', url: 'https://example.com/training',
            path: 'evidence/training.json', sha256: trainingDigest,
            jsonChecks: {
              pathCount: 1, uniqueChemicalSystemCount: 1, uniqueMaterialIdCount: 1,
              pathSplit: 'train', disjointFrom: 'reference', ...trainingChecks,
            },
          },
        ],
      },
    });

    try {
      let training = writeTraining([{ chemical_system: 'C', material_id: 'M3', split: 'train' }]);
      assert.doesNotThrow(() => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest), publicRoot));
      assert.throws(
        () => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest, { pathCount: 2 }), publicRoot),
        /artifact path count mismatch/
      );

      training = writeTraining([{ chemical_system: 'A', material_id: 'M3', split: 'train' }]);
      assert.throws(
        () => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest), publicRoot),
        /artifact chemical systems overlap/
      );

      training = writeTraining([{ chemical_system: 'C', material_id: 'M3', split: 'train' }], '0'.repeat(64));
      assert.throws(
        () => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest), publicRoot),
        /artifact disjoint digest mismatch/
      );

      const outsidePath = path.join(outsideDir, 'outside.json');
      fs.writeFileSync(outsidePath, JSON.stringify(reference));
      fs.symlinkSync(outsidePath, path.join(evidenceDir, 'linked.json'));
      const linkedManifest = manifestFor(training.trainingDigest);
      linkedManifest.methodology.artifacts[0].path = 'evidence/linked.json';
      linkedManifest.methodology.artifacts[0].sha256 = sha256(outsidePath);
      assert.throws(
        () => verifyArtifactIntegrity(slug, linkedManifest, publicRoot),
        /artifact path resolves outside article directory/
      );
    } finally {
      fs.rmSync(publicRoot, { recursive: true, force: true });
    }
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
