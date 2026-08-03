import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  assertValidProofPackOutput,
  validateProofPackOutput,
} from '../lib/proof-pack-generator.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function createPack() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proof-pack-output-'));
  const articleDir = path.join(rootDir, 'public', 'articles', 'unicode-article');
  const outDir = path.join(rootDir, 'public', 'proof-packs');
  fs.mkdirSync(path.join(articleDir, 'images'), { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  const inputManifestPath = path.join(articleDir, 'unicode-article.proofpack.json');
  const articleHtmlPath = path.join(articleDir, 'index.html');
  const figurePath = path.join(articleDir, 'images', 'unicode-figure.png');
  const pdfPath = path.join(outDir, 'unicode-article.proofpack.pdf');
  const inputManifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'proof-pack', 'valid.json'), 'utf8')
  );
  inputManifest.metadata.slug = 'unicode-article';
  inputManifest.metadata.date = '2026-07-09';
  inputManifest.metadata.title = 'Unicode — CO₂';
  inputManifest.figures[0].path = 'images/unicode-figure.png';
  fs.writeFileSync(inputManifestPath, `${JSON.stringify(inputManifest)}\n`);
  fs.writeFileSync(articleHtmlPath, '<h1>Unicode — CO₂</h1>\n');
  fs.writeFileSync(figurePath, 'figure bytes');
  fs.writeFileSync(pdfPath, '%PDF-1.7\nUnicode — CO₂\n');

  const outputManifestPath = path.join(outDir, 'unicode-article.proofpack.json');
  const outputManifest = {
    schemaVersion: '1.0.0',
    generatedAt: '2026-07-09T00:00:00.000Z',
    build: {
      script: 'scripts/build-proofpack.mjs',
      mode: 'per-article',
      slug: 'unicode-article',
    },
    inputs: {
      manifest: {
        path: path.relative(rootDir, inputManifestPath),
        sha256: sha256(inputManifestPath),
      },
      articleHtml: {
        path: path.relative(rootDir, articleHtmlPath),
        sha256: sha256(articleHtmlPath),
      },
      figures: {
        'images/unicode-figure.png': sha256(figurePath),
      },

    },
    output: {
      pdf: {
        path: path.basename(pdfPath),
        sha256: sha256(pdfPath),
        bytes: fs.statSync(pdfPath).size,
      },
    },
  };
  fs.writeFileSync(outputManifestPath, `${JSON.stringify(outputManifest, null, 2)}\n`);
  return { rootDir, figurePath, inputManifestPath, pdfPath, outputManifestPath };
}

describe('proof-pack output integrity validation', () => {
  it('accepts a complete pack whose declared files and digests match', () => {
    const pack = createPack();
    try {
      assert.deepEqual(validateProofPackOutput(pack.outputManifestPath, { rootDir: pack.rootDir }), []);
      assert.doesNotThrow(() => assertValidProofPackOutput(pack.outputManifestPath, { rootDir: pack.rootDir }));
    } finally {
      fs.rmSync(pack.rootDir, { recursive: true, force: true });
    }
  });

  it('reports every missing or tampered artifact with an actionable path', () => {
    const pack = createPack();
    try {
      fs.appendFileSync(pack.pdfPath, 'tampered');
      fs.rmSync(pack.figurePath);
      const issues = validateProofPackOutput(pack.outputManifestPath, { rootDir: pack.rootDir });
      assert.match(issues.join('\n'), /output\.pdf digest mismatch/);
      assert.match(issues.join('\n'), /inputs\.figures\[images\/unicode-figure\.png\] is missing/);
      assert.throws(
        () => assertValidProofPackOutput(pack.outputManifestPath, { rootDir: pack.rootDir }),
        /proof-pack output validation failed/
      );
    } finally {
      fs.rmSync(pack.rootDir, { recursive: true, force: true });
    }
  });

  it('rejects an output manifest that omits a declared input figure', () => {
    const pack = createPack();
    try {
      const manifest = JSON.parse(fs.readFileSync(pack.outputManifestPath, 'utf8'));
      manifest.inputs.figures = {};
      fs.writeFileSync(pack.outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const issues = validateProofPackOutput(pack.outputManifestPath, { rootDir: pack.rootDir });
      assert.match(issues.join('\n'), /inputs\.figures\[images\/unicode-figure\.png\] is required/);
    } finally {
      fs.rmSync(pack.rootDir, { recursive: true, force: true });
    }
  });

  it('ties the generated date and slug to the source manifest', () => {
    const pack = createPack();
    try {
      const manifest = JSON.parse(fs.readFileSync(pack.outputManifestPath, 'utf8'));
      manifest.generatedAt = '2026-07-10T00:00:00.000Z';
      manifest.build.slug = 'different-article';
      fs.writeFileSync(pack.outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const issues = validateProofPackOutput(pack.outputManifestPath, { rootDir: pack.rootDir });
      assert.match(issues.join('\n'), /generatedAt must match inputs\.manifest metadata\.date/);
      assert.match(issues.join('\n'), /build\.slug must match inputs\.manifest metadata\.slug/);
    } finally {
      fs.rmSync(pack.rootDir, { recursive: true, force: true });
    }
  });

  it('rejects a digest-valid output whose source manifest is schema-invalid', () => {
    const pack = createPack();
    try {
      const source = JSON.parse(fs.readFileSync(pack.inputManifestPath, 'utf8'));
      delete source.metadata.title;
      fs.writeFileSync(pack.inputManifestPath, `${JSON.stringify(source)}\n`);
      const output = JSON.parse(fs.readFileSync(pack.outputManifestPath, 'utf8'));
      output.inputs.manifest.sha256 = sha256(pack.inputManifestPath);
      fs.writeFileSync(pack.outputManifestPath, `${JSON.stringify(output, null, 2)}\n`);

      const issues = validateProofPackOutput(pack.outputManifestPath, { rootDir: pack.rootDir });
      assert.match(issues.join('\n'), /inputs\.manifest: metadata\.title is required/);
    } finally {
      fs.rmSync(pack.rootDir, { recursive: true, force: true });
    }
  });

  it('binds source-manifest and article-HTML paths to the declared slug', () => {
    const pack = createPack();
    try {
      const unrelatedDir = path.join(pack.rootDir, 'public', 'articles', 'unrelated');
      fs.mkdirSync(unrelatedDir);
      const unrelatedManifest = path.join(unrelatedDir, 'unrelated.proofpack.json');
      const unrelatedHtml = path.join(unrelatedDir, 'index.html');
      fs.copyFileSync(pack.inputManifestPath, unrelatedManifest);
      fs.writeFileSync(unrelatedHtml, '<h1>Unrelated</h1>');

      const output = JSON.parse(fs.readFileSync(pack.outputManifestPath, 'utf8'));
      output.inputs.manifest = {
        path: path.relative(pack.rootDir, unrelatedManifest),
        sha256: sha256(unrelatedManifest),
      };
      output.inputs.articleHtml = {
        path: path.relative(pack.rootDir, unrelatedHtml),
        sha256: sha256(unrelatedHtml),
      };
      fs.writeFileSync(pack.outputManifestPath, `${JSON.stringify(output, null, 2)}\n`);

      const issues = validateProofPackOutput(pack.outputManifestPath, { rootDir: pack.rootDir });
      assert.match(issues.join('\n'), /inputs\.manifest\.path must identify the declared slug/);
      assert.match(issues.join('\n'), /inputs\.articleHtml\.path must identify the declared slug/);
    } finally {
      fs.rmSync(pack.rootDir, { recursive: true, force: true });
    }
  });

  it('binds builder identity and sibling artifact names to the declared slug', () => {
    const pack = createPack();
    try {
      const forgedManifestPath = path.join(path.dirname(pack.outputManifestPath), 'forged.json');
      const aliasPdf = path.join(path.dirname(pack.pdfPath), 'alias.pdf');
      fs.copyFileSync(pack.pdfPath, aliasPdf);
      const output = JSON.parse(fs.readFileSync(pack.outputManifestPath, 'utf8'));
      output.build.script = 'scripts/other-builder.mjs';
      output.output.pdf.path = path.basename(aliasPdf);
      output.output.pdf.sha256 = sha256(aliasPdf);
      output.output.pdf.bytes = fs.statSync(aliasPdf).size;
      fs.writeFileSync(forgedManifestPath, `${JSON.stringify(output, null, 2)}\n`);

      const issues = validateProofPackOutput(forgedManifestPath, { rootDir: pack.rootDir });
      assert.match(issues.join('\n'), /build\.script must equal "scripts\/build-proofpack\.mjs"/);
      assert.match(issues.join('\n'), /output manifest filename must match build\.slug/);
      assert.match(issues.join('\n'), /output\.pdf\.path must match build\.slug/);
    } finally {
      fs.rmSync(pack.rootDir, { recursive: true, force: true });
    }
  });
});
