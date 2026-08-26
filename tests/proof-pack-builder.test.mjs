import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { describe, it, before } from 'node:test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPackHtml, verifyArtifactIntegrity, verifyFigureIntegrity } from '../scripts/build-proofpack.mjs';
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
const SHARED_DFT_SLUG = 'shared-dft-anchors';
const SHARED_DFT_MANIFEST_PATH = path.join(OUT_DIR, `${SHARED_DFT_SLUG}.proofpack.json`);
const INITIAL_SHARED_DFT_MANIFEST = JSON.parse(
  fs.readFileSync(SHARED_DFT_MANIFEST_PATH, 'utf8')
);
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

  it('builds all representative content classes offline', () => {
    const result = run(['--all', '--out-dir', OUT_DIR]);
    assert.equal(result.status, 0, result.stderr);
    for (const slug of REPRESENTATIVE_SLUGS) {
      assert.ok(fs.existsSync(path.join(OUT_DIR, `${slug}.proofpack.pdf`)), `${slug} PDF should exist`);
      assert.ok(fs.existsSync(path.join(OUT_DIR, `${slug}.proofpack.json`)), `${slug} output manifest should exist`);
    }
    const built = fs.readdirSync(OUT_DIR).filter((name) => name.endsWith('.proofpack.pdf')).sort();
    const eligible = listEligibleArticles().map(({ slug }) => `${slug}.proofpack.pdf`).sort();
    assert.deepEqual(built, eligible);
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

  it('replaces stale proof-pack artifacts and revalidates them end to end offline', async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proofpack-stale-refresh-'));
    try {
      const first = await generateProofPack(SLUG, { outDir });
      fs.writeFileSync(first.pdfPath, 'stale PDF');
      fs.writeFileSync(first.manifestPath, '{"stale":true}\n');

      const refreshed = await generateProofPack(SLUG, { outDir });
      const manifest = JSON.parse(fs.readFileSync(refreshed.manifestPath, 'utf8'));
      assert.equal(refreshed.validated, true);
      assert.equal(manifest.build.slug, SLUG);
      assert.equal(manifest.inputs.articleHtml.path, `public/articles/${SLUG}/index.html`);
      assert.deepEqual(validateProofPackOutput(refreshed.manifestPath), []);
      assert.notEqual(fs.readFileSync(refreshed.pdfPath, 'utf8'), 'stale PDF');
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
        { path_id: 'P1', chemical_system: 'A', material_id: 'M1', split: 'test' },
        { path_id: 'P2', chemical_system: 'B', material_id: 'M2', split: 'test' },
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
              pathCount: 2, uniquePathIdCount: 2,
              uniqueChemicalSystemCount: 2, uniqueMaterialIdCount: 2,
              pathSplit: 'test', holdoutSourceSplit: 'test',
            },
          },
          {
            id: 'training', label: 'Training', url: 'https://example.com/training',
            path: 'evidence/training.json', sha256: trainingDigest,
            jsonChecks: {
              pathCount: 1, uniquePathIdCount: 1,
              uniqueChemicalSystemCount: 1, uniqueMaterialIdCount: 1,
              pathSplit: 'train', disjointFrom: 'reference', ...trainingChecks,
            },
          },
        ],
      },
    });
    const assertReferenceMutation = (mutatedReference, expected) => {
      fs.writeFileSync(referencePath, JSON.stringify(mutatedReference));
      const mutatedDigest = sha256(referencePath);
      const training = writeTraining(
        [{ path_id: 'P3', chemical_system: 'C', material_id: 'M3', split: 'train' }],
        mutatedDigest
      );
      const manifest = manifestFor(training.trainingDigest);
      manifest.methodology.artifacts[0].sha256 = mutatedDigest;
      try {
        assert.throws(() => verifyArtifactIntegrity(slug, manifest, publicRoot), expected);
      } finally {
        fs.writeFileSync(referencePath, JSON.stringify(reference));
      }
    };

    try {
      let training = writeTraining([
        { path_id: 'P3', chemical_system: 'C', material_id: 'M3', split: 'train' },
      ]);
      assert.doesNotThrow(() => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest), publicRoot));
      assert.throws(
        () => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest, { pathCount: 2 }), publicRoot),
        /artifact path count mismatch/
      );

      assertReferenceMutation(
        { ...reference, paths: [reference.paths[0], { ...reference.paths[1], path_id: 'P1' }] },
        /artifact path-id cardinality mismatch/
      );
      assertReferenceMutation(
        { ...reference, paths: [reference.paths[0], { ...reference.paths[1], chemical_system: 'A' }] },
        /artifact chemical-system cardinality mismatch/
      );
      assertReferenceMutation(
        { ...reference, paths: [reference.paths[0], { ...reference.paths[1], material_id: 'M1' }] },
        /artifact material-id cardinality mismatch/
      );
      assertReferenceMutation(
        { ...reference, holdout: { source_split: 'train' } },
        /artifact holdout source split mismatch/
      );

      training = writeTraining([
        { path_id: 'P3', chemical_system: 'A', material_id: 'M3', split: 'train' },
      ]);
      assert.throws(
        () => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest), publicRoot),
        /artifact chemical systems overlap/
      );

      training = writeTraining([
        { path_id: 'P3', chemical_system: 'C', material_id: 'M1', split: 'train' },
      ]);
      assert.throws(
        () => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest), publicRoot),
        /artifact material ids overlap/
      );

      training = writeTraining([
        { path_id: 'P3', chemical_system: 'C', material_id: 'M3', split: 'test' },
      ]);
      assert.throws(
        () => verifyArtifactIntegrity(slug, manifestFor(training.trainingDigest), publicRoot),
        /artifact path split mismatch/
      );

      training = writeTraining(
        [{ path_id: 'P3', chemical_system: 'C', material_id: 'M3', split: 'train' }],
        '0'.repeat(64)
      );
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

  it('committed shared-DFT output remains bound to its current inputs', () => {
    const articleHtmlPath = path.join(
      ROOT,
      'public',
      'articles',
      SHARED_DFT_SLUG,
      'index.html'
    );
    assert.equal(
      INITIAL_SHARED_DFT_MANIFEST.inputs.articleHtml.sha256,
      sha256(articleHtmlPath),
      'initial shared-DFT manifest is stale relative to the current article HTML'
    );
    assert.deepEqual(validateProofPackOutput(SHARED_DFT_MANIFEST_PATH), []);
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
  it('produces a byte-identical legacy climate-series PDF on repeated builds', () => {
    const consolidatedPath = path.join(ROOT, 'public', 'proof-pack-climate-series.pdf');
    const run1 = run(['--consolidated']);
    assert.equal(run1.status, 0, run1.stderr);
    const hash1 = sha256(consolidatedPath);

    const run2 = run(['--consolidated']);
    assert.equal(run2.status, 0, run2.stderr);
    assert.equal(sha256(consolidatedPath), hash1, 'PDF bytes differ between builds');
  });

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
    assert.equal(report.annotations.localUris.length, 0, 'found localhost link annotations');
    if (!before) {
      // Leave the file in the expected production location.
    }
  });
});

describe('proof-pack promises reach the rendered page', () => {
  // A pack whose orientation advertises "exact lock URLs and SHA-256 digests" shipped
  // a PDF containing neither: the template rendered four methodology scalars plus the
  // description, and the audit section iterated only auditLinks. Readers could not
  // follow the audit trail behind the panel-identity verdict. Assert the rendered HTML
  // actually carries every locked artifact, so the promise cannot drift from the output.
  const SLUG = 'the-materials-we-test-against';

  it('renders url, repository path and digest for every methodology artifact', () => {
    const manifestPath = path.join(ROOT, 'public', 'articles', SLUG, `${SLUG}.proofpack.json`);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const artifacts = manifest.methodology?.artifacts || [];
    assert.ok(artifacts.length > 0, 'fixture must declare methodology artifacts');

    const html = renderPackHtml(SLUG, manifest, {
      title: manifest.title || SLUG,
      description: '',
      canonicalUrl: `https://lupine.science/articles/${SLUG}/`,
    });

    const locked = artifacts.filter((artifact) => artifact.path && artifact.sha256);
    assert.ok(locked.length > 0, 'fixture must declare at least one locked artifact');
    for (const artifact of locked) {
      assert.ok(html.includes(artifact.url), `${artifact.id}: url missing from rendered pack`);
      assert.ok(html.includes(artifact.sha256), `${artifact.id}: sha256 missing from rendered pack`);
      assert.ok(html.includes(artifact.path), `${artifact.id}: repository path missing from rendered pack`);
    }
  });

  it('omits the lock section for a pack whose artifacts are url-only references', () => {
    // shared-dft-anchors declares five artifacts with no id, path or digest. Rendering
    // those under "exact URLs and SHA-256 digests" printed blank code elements and
    // silently added a sixth page, which the page-count test caught only by luck.
    const manifestPath = path.join(ROOT, 'public', 'articles', 'shared-dft-anchors', 'shared-dft-anchors.proofpack.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok((manifest.methodology?.artifacts || []).length > 0, 'fixture must declare url-only artifacts');
    const html = renderPackHtml('shared-dft-anchors', manifest, {
      title: manifest.title || 'shared-dft-anchors',
      description: '',
      canonicalUrl: 'https://lupine.science/articles/shared-dft-anchors/',
    });
    assert.ok(!html.includes('Lock artifacts'), 'lock section must not render without locked artifacts');
  });

  it('rejects an artifact that advertises checks but omits a local path', () => {
    // The builder used to filter these out silently, so a manifest typo produced a
    // green build that ran none of its advertised digest or cardinality checks.
    const checks = {
      pathCount: 1, uniquePathIdCount: 1, uniqueChemicalSystemCount: 1, uniqueMaterialIdCount: 1,
    };
    for (const partial of [{ jsonChecks: checks }, { sha256: 'a'.repeat(64) }]) {
      assert.throws(
        () => verifyArtifactIntegrity(SLUG, {
          methodology: { artifacts: [{ id: 'panel', label: 'Panel', url: 'https://example.org/p', ...partial }] },
        }),
        /no local path/,
        `expected rejection for ${Object.keys(partial)[0]} without path`
      );
    }
  });

  it('still accepts a reference link that advertises no checks', () => {
    assert.doesNotThrow(() => verifyArtifactIntegrity(SLUG, {
      methodology: { artifacts: [{ id: 'ref', label: 'Reference', url: 'https://example.org/r' }] },
    }));
  });
});
