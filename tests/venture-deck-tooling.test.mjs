import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, it } from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { chromium } from 'playwright-core';
import { assertSupportedSlideCount, renderDeckPdf, validateClosureCertification, validateDeckArtifacts } from '../scripts/venture-deck-tools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PROJECT = path.join(ROOT, 'media/projects/venture-deck');
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function workspace() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'venture-deck-tools-'));
  temporaryDirectories.push(directory);
  return {
    directory,
    htmlPath: path.join(directory, 'deck.html'),
    pdfPath: path.join(directory, 'deck.pdf'),
  };
}

function deckHtml({ slides = 12, overflow = false, overlap = false, boxOverlapOnly = false, externalUrl = '' } = {}) {
  const sections = Array.from({ length: slides }, (_, index) => `
    <section class="slide">
      <h1>Slide ${index + 1}</h1>
      ${index === 0 && overflow ? '<div style="width:1400px">overflow</div>' : ''}
      ${index === 0 && overlap ? '<p data-fit style="position:absolute;left:40px;top:120px;width:300px;height:100px">This long fitted sentence reaches beneath the covering asset.</p><div class="deck-asset" style="position:absolute;left:200px;top:120px;width:200px;height:100px"></div>' : ''}
      ${index === 0 && boxOverlapOnly ? '<p data-fit style="position:absolute;left:40px;top:120px;width:300px;height:100px">Short text.</p><div class="deck-asset" style="position:absolute;left:300px;top:120px;width:200px;height:100px"></div>' : ''}
      ${index === 0 && externalUrl ? `<img src="${externalUrl}" alt="remote">` : ''}
    </section>`).join('');
  return `<!doctype html>
  <meta charset="utf-8">
  <style>
    @page { size: 13.333333in 7.5in; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    .slide { width: 1280px; height: 720px; overflow: hidden; break-after: page; page-break-after: always; }
    .slide:last-child { break-after: auto; page-break-after: auto; }
  </style>
  <body>${sections}</body>`;
}

async function onePagePdf(file) {
  const document = await PDFDocument.create();
  document.addPage([960, 540]);
  fs.writeFileSync(file, await document.save());
}

function runScript(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
}

function runCommand(command, args) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
  });
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function assertCanonicalBuildIntegrity() {
  const publicVenture = path.join(ROOT, 'public/venture');
  const projectManifestPath = path.join(PROJECT, 'build-manifest.json');
  const publicManifestPath = path.join(publicVenture, 'build-manifest.json');
  const projectPdf = path.join(PROJECT, 'lupine-science-venture-deck.pdf');
  const publicPdf = path.join(publicVenture, 'lupine-science-venture-deck.pdf');
  const manifest = JSON.parse(fs.readFileSync(projectManifestPath, 'utf8'));

  assert.equal(manifest.build, 'scripts/build-venture-deck.mjs');
  assert.equal(manifest.slide_count, manifest.outputs.pdf.pages, 'manifest slide count must derive from the rendered PDF');
  assert.equal(manifest.outputs.public_pdf.path, 'public/venture/lupine-science-venture-deck.pdf');
  assert.equal(manifest.outputs.public_pdf.sha256, manifest.outputs.pdf.sha256, 'manifest must lock identical project/public PDF bytes');
  assert.equal(manifest.outputs.public_pdf.bytes, manifest.outputs.pdf.bytes);
  assert.equal(manifest.outputs.public_pdf.pages, manifest.outputs.pdf.pages);
  assert.equal(sha256(projectPdf), sha256(publicPdf), 'project/public PDFs must be byte-identical');
  assert.deepEqual(JSON.parse(fs.readFileSync(publicManifestPath, 'utf8')), manifest, 'project/public build manifests must match');
  for (const section of ['inputs', 'outputs']) {
    for (const entry of Object.values(manifest[section])) {
      assert.equal(sha256(path.join(ROOT, entry.path)), entry.sha256, `${entry.path} must match the build manifest`);
    }
  }
  const extracted = runCommand('pdftotext', ['-layout', projectPdf, '-']);
  assert.equal(extracted.status, 0, extracted.stderr);
  const pdfText = extracted.stdout.replace(/\s+/g, ' ');
  assert.match(pdfText, /100\/100 unique still slots/);
  assert.match(pdfText, /33 certified baseline stills \+ 67 independently certified Wave-4 replacements/);
  assert.match(pdfText, /Closure gate t_c2a1f8e3/);
  assert.match(pdfText, /five certified films excluded from the denominator/);
  return sha256(projectPdf);
}

describe('venture deck render tooling', () => {
  it('renders and validates a 12-slide 16:9 deck without network access', async () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml());

    const build = await renderDeckPdf(files);
    const validation = await validateDeckArtifacts(files);

    assert.equal(build.slideCount, 12);
    assert.equal(build.pageCount, 12);
    assert.deepEqual(build.externalRequests, []);
    assert.deepEqual(build.overflowIssues, []);
    assert.equal(validation.slideCount, 12);
    assert.equal(validation.pageCount, 12);
    assert.deepEqual(validation.externalRequests, []);
    assert.deepEqual(validation.overflowIssues, []);

    const firstHash = sha256(files.pdfPath);
    await renderDeckPdf(files);
    assert.equal(sha256(files.pdfPath), firstHash, 'repeated builds must be byte-identical');
  });

  it('rejects a deck outside the 12-14 slide range before writing a PDF', async () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml({ slides: 11 }));

    await assert.rejects(renderDeckPdf(files), /slide count 11 is outside allowed range 12-14/);
    assert.equal(fs.existsSync(files.pdfPath), false);
  });

  it('shares the 12-14 slide-count gate with the canonical builder', () => {
    assert.doesNotThrow(() => assertSupportedSlideCount(12));
    assert.doesNotThrow(() => assertSupportedSlideCount(14));
    assert.throws(() => assertSupportedSlideCount(11), /slide count 11 is outside allowed range 12-14/);
    assert.throws(() => assertSupportedSlideCount(15), /slide count 15 is outside allowed range 12-14/);
    assert.match(fs.readFileSync(path.join(ROOT, 'scripts/build-venture-deck.mjs'), 'utf8'), /assertSupportedSlideCount\(slideCount\)/);
  });

  it('fails when any slide content overflows', async () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml({ overflow: true }));

    await assert.rejects(renderDeckPdf(files), /overflow detected on slide 1/);
  });

  it('fails when fitted text intersects a deck asset', async () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml({ overlap: true }));

    await assert.rejects(renderDeckPdf(files), /overlap detected on slide 1: p\[data-fit\] with div\.deck-asset/);
  });

  it('allows empty box intersection when rendered text glyphs remain clear', async () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml({ boxOverlapOnly: true }));

    const report = await renderDeckPdf(files);
    assert.deepEqual(report.overlapIssues, []);
  });

  it('fails on attempted external runtime requests', async () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml({ externalUrl: 'https://example.invalid/remote.png' }));

    await assert.rejects(renderDeckPdf(files), /external runtime request.*example\.invalid/);
  });

  it('fails on requests to a different loopback origin', async () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml({ externalUrl: 'http://127.0.0.1:9/private.png' }));

    await assert.rejects(renderDeckPdf(files), /external runtime request.*127\.0\.0\.1:9/);
  });

  it('fails validation when the PDF page count differs from the slide count', async () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml());
    await onePagePdf(files.pdfPath);

    await assert.rejects(validateDeckArtifacts(files), /PDF page count 1 does not match slide count 12/);
  });

  it('provides build and validate CLIs that operate on explicit fixture paths', () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml());
    const buildScript = path.resolve(import.meta.dirname, '../media/projects/venture-deck/build-deck.mjs');
    const validateScript = path.resolve(import.meta.dirname, '../media/projects/venture-deck/validate-deck.mjs');

    const build = runScript(buildScript, ['--html', files.htmlPath, '--pdf', files.pdfPath]);
    assert.equal(build.status, 0, build.stderr);
    assert.match(build.stdout, /rendered 12 slides to .*deck\.pdf \(12 pages\)/);

    const validation = runScript(validateScript, ['--html', files.htmlPath, '--pdf', files.pdfPath]);
    assert.equal(validation.status, 0, validation.stderr);
    assert.match(validation.stdout, /validated 12 slides, 12 PDF pages, 0 external requests, 0 overflow issues/);
  });

  it('rejects partial fixture arguments without touching the canonical PDF', () => {
    const files = workspace();
    fs.writeFileSync(files.htmlPath, deckHtml());
    const buildScript = path.resolve(import.meta.dirname, '../media/projects/venture-deck/build-deck.mjs');
    const validateScript = path.resolve(import.meta.dirname, '../media/projects/venture-deck/validate-deck.mjs');
    const canonicalPdf = path.join(PROJECT, 'lupine-science-venture-deck.pdf');
    const canonicalHash = sha256(canonicalPdf);

    const build = runScript(buildScript, ['--html', files.htmlPath]);
    assert.notEqual(build.status, 0);
    assert.match(build.stderr, /--html and --pdf must be provided together/);
    assert.equal(sha256(canonicalPdf), canonicalHash, 'partial fixture arguments must not overwrite the canonical PDF');

    const validation = runScript(validateScript, ['--html', files.htmlPath]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /--html and --pdf must be provided together/);
  });

  it('keeps the integrated stage and controls inside short 1280px viewports', async () => {
    const files = workspace();
    const template = fs.readFileSync(path.resolve(import.meta.dirname, '../media/projects/venture-deck/index.html'), 'utf8');
    fs.writeFileSync(files.htmlPath, template.replace('__EVIDENCE_MANIFEST__', '{}'));
    const browser = await chromium.launch({ headless: true });

    try {
      for (const viewport of [{ width: 1280, height: 800 }, { width: 1280, height: 577 }]) {
        const page = await browser.newPage({ viewport });
        await page.goto(`file://${files.htmlPath}#slide-01`);
        const geometry = await page.evaluate(() => {
          const stage = document.querySelector('.deck-stage').getBoundingClientRect();
          const controls = document.querySelector('.controls').getBoundingClientRect();
          const body = document.querySelector('#slide-01 .body').getBoundingClientRect();
          const overlapsBody = !(
            controls.right <= body.left || controls.left >= body.right ||
            controls.bottom <= body.top || controls.top >= body.bottom
          );
          return {
            stage: { left: stage.left, top: stage.top, right: stage.right, bottom: stage.bottom },
            controls: { left: controls.left, top: controls.top, right: controls.right, bottom: controls.bottom },
            overlapsBody,
          };
        });

        assert.ok(geometry.stage.left >= -0.5, `${viewport.width}×${viewport.height} stage clips left`);
        assert.ok(geometry.stage.top >= -0.5, `${viewport.width}×${viewport.height} stage clips top`);
        assert.ok(geometry.stage.right <= viewport.width + 0.5, `${viewport.width}×${viewport.height} stage clips right`);
        assert.ok(geometry.stage.bottom <= viewport.height + 0.5, `${viewport.width}×${viewport.height} stage clips bottom`);
        assert.equal(geometry.overlapsBody, false, `${viewport.width}×${viewport.height} controls overlap slide-1 body copy`);
        assert.ok(geometry.controls.left >= geometry.stage.left && geometry.controls.right <= geometry.stage.right);
        assert.ok(geometry.controls.top >= geometry.stage.top && geometry.controls.bottom <= geometry.stage.bottom);
        await page.close();
      }
    } finally {
      await browser.close();
    }
  });

  it('scopes the certified closure to 100/100 unique still slots and excludes films from the denominator', () => {
    const template = fs.readFileSync(path.join(PROJECT, 'index.html'), 'utf8');
    const narrative = fs.readFileSync(path.join(PROJECT, 'narrative-script.md'), 'utf8');
    const artDirection = fs.readFileSync(path.join(PROJECT, 'art-direction.md'), 'utf8');
    const evidence = JSON.parse(fs.readFileSync(path.join(PROJECT, 'evidence-manifest.json'), 'utf8'));
    const exactClaim = '100/100 unique still slots';
    const exactBoundary = 'The five certified films are separate and remain outside the 100-still denominator.';

    assert.match(template, new RegExp(exactClaim.replace('/', '\\/')));
    assert.match(template, /Closure gate t_c2a1f8e3/);
    assert.doesNotMatch(template, /100\/100 (?:models|campaigns|films|certification chain)/i);
    assert.match(narrative, new RegExp(exactClaim.replace('/', '\\/')));
    assert.match(narrative, new RegExp(exactBoundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(artDirection, /only as `100\/100 unique still slots`/);

    const claim = evidence.claims['C-STILL-CLOSURE-01'];
    assert.equal(claim.claim, '33 certified baseline stills + 67 independently certified Wave-4 replacements = 100/100 unique still slots.');
    assert.equal(claim.films_outside_denominator, 5);
    assert.equal(claim.closure_gate_task, 't_c2a1f8e3');
    assert.equal(evidence.discrepancies_and_exclusions['D-100-CHAIN'].decision, 'Use only the precisely scoped 100/100 unique still slots closure claim; do not imply models, campaigns, films, or generic certification.');
    assert.doesNotMatch(JSON.stringify(evidence.discrepancies_and_exclusions['D-100-CHAIN']), /100\/100 certification chain/i);
  });

  it('rejects closure evidence unless every Wave-4 group and aggregate certification passes', () => {
    const evidence = JSON.parse(fs.readFileSync(path.join(PROJECT, 'evidence-manifest.json'), 'utf8'));
    const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, evidence.sources['S-STILL-BASELINE'].path), 'utf8'));
    const aggregate = JSON.parse(fs.readFileSync(path.join(ROOT, evidence.sources['S-WAVE4-AGGREGATE'].path), 'utf8'));

    assert.deepEqual(validateClosureCertification({ baseline, aggregate, evidence }), []);
    const failed = structuredClone(aggregate);
    failed.child_manifests[0].composition_status = 'fail';
    assert.match(validateClosureCertification({ baseline, aggregate: failed, evidence }).join('\n'), /child certification status/i);
  });

  it('routes every supported final build entry point to byte-identical canonical PDF and manifest outputs', () => {
    const entryPoints = [
      { label: 'package script', command: 'npm', args: ['run', 'venture:build'] },
      { label: 'canonical node script', command: process.execPath, args: ['scripts/build-venture-deck.mjs'] },
      { label: 'documented compatibility wrapper', command: process.execPath, args: ['media/projects/venture-deck/build-deck.mjs'] },
    ];
    let canonicalPdfHash;

    for (const entryPoint of entryPoints) {
      const result = runCommand(entryPoint.command, entryPoint.args);
      assert.equal(result.status, 0, `${entryPoint.label} failed:\n${result.stderr}`);
      const currentHash = assertCanonicalBuildIntegrity();
      canonicalPdfHash ??= currentHash;
      assert.equal(currentHash, canonicalPdfHash, `${entryPoint.label} produced a different PDF byte stream`);
    }
  });

  it('derives the canonical build-manifest slide count rather than hardcoding it', () => {
    const builder = fs.readFileSync(path.join(ROOT, 'scripts/build-venture-deck.mjs'), 'utf8');
    assert.doesNotMatch(builder, /slide_count:\s*13\b/);
  });

  it('regenerates venture artifacts before the site build packages public output', () => {
    const scripts = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).scripts;
    assert.match(scripts.build, /^npm run venture:build && /);
    assert.ok(scripts.build.indexOf('npm run venture:build') < scripts.build.indexOf('node scripts/build-headers.mjs'));
  });
});
