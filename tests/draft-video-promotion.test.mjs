import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const HELD_VIDEO = 'z1-union-debrief';
const { isVideoIndexPromotable } = await import('../scripts/publication-policy.mjs')
  .catch(() => ({ isVideoIndexPromotable: () => undefined }));
const SUPPRESSED_FROM_VIDEO_INDEX = [
  'a-field-not-a-neural-net',
  'beyond-carbon-the-error-geometry-of-environmental-materials',
  'cement-concrete-and-the-weight-of-the-built-world',
  'critical-minerals-pfas-and-the-remediation-imperative',
  'five-materials-for-5-to-12-gtco2-year',
  'from-fantasy-frameworks-to-makeable-materials',
  'from-predicted-crystal-to-commercial-cell',
  'investing-in-the-trust-layer',
  'methane-and-refrigerants-cutting-the-non-co2-climate-forcers',
  'the-02-percent-synthesis-problem',
  'water-and-air-correcting-the-molecules-we-drink-and-breathe',
  'z1-union-debrief',
].sort();

function read(...segments) {
  return fs.readFileSync(path.join(PUBLIC, ...segments), 'utf8');
}

function run(script) {
  const result = spawnSync(process.execPath, [script], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function indexVideoSlugs(html) {
  return [...html.matchAll(/class="video-card-primary" href="\/videos\/([^/]+)\/"/g)]
    .map((match) => match[1])
    .sort();
}

function sourceArticleSlugs() {
  return fs.readdirSync(path.join(ROOT, 'articles'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''))
    .sort();
}

function sitemapSlugs(kind, xml) {
  return [...xml.matchAll(new RegExp(`<loc>https://lupine\\.science/${kind}/([^<]+)/</loc>`, 'g'))]
    .map((match) => match[1])
    .sort();
}

before(() => {
  run('scripts/build-articles.mjs');
  run('scripts/build-sitemap.mjs');
});

describe('draft-labelled article video promotion', () => {
  it('fails closed unless the editorial status is explicitly released', () => {
    for (const status of [
      'Published',
      'Final',
      'Live',
      'Live evidence',
      'Live evidence — every number reported is sealed as a machine-checked theorem over provenance-hashed data; kills and corrections are preserved in the record',
      'Reviewed',
      'Verified',
    ]) {
      assert.equal(isVideoIndexPromotable(status), true, status);
    }

    for (const status of [
      undefined,
      '',
      'unknown',
      'Draft',
      'FOR EDITOR REVIEW',
      'not for citation',
      'pending review',
      'in review',
      'needs verification',
      'unverified',
      'Published — unknown',
      'Published — editor-review',
      'Published — not-for-citation',
      'Published — pending',
      'Published — pending/in-review',
      'Published — needs-verification',
      'Final — updated 2026-07-20',
      'Live evidence — provenance sealed',
    ]) {
      assert.equal(isVideoIndexPromotable(status), false, String(status));
    }
  });

  it('keeps the public article indexed and shareable while preserving its direct video route', () => {
    const article = read('articles', HELD_VIDEO, 'index.html');
    const articleIndex = read('articles', 'index.html');
    const videoDetail = read('videos', HELD_VIDEO, 'index.html');
    const sitemap = read('sitemap.xml');

    assert.match(article, /<span class="article-status">Draft<\/span>/);
    assert.match(article, /<meta name="robots" content="index,follow">/);
    assert.match(article, /class="share-root"/);
    assert.match(article, /<meta property="og:title"/);
    assert.match(article, /<meta name="twitter:title"/);
    assert.match(article, /"@type":"Article"/);
    assert.match(articleIndex, new RegExp(`href="/articles/${HELD_VIDEO}/"`));
    assert.match(videoDetail, new RegExp(`href="/articles/${HELD_VIDEO}/"`));
    assert.ok(fs.existsSync(path.join(PUBLIC, 'videos', `${HELD_VIDEO}.mp4`)));
    assert.match(sitemap, new RegExp(`<loc>https://lupine\\.science/articles/${HELD_VIDEO}/</loc>`));
    assert.match(sitemap, new RegExp(`<loc>https://lupine\\.science/videos/${HELD_VIDEO}/</loc>`));
  });

  it('suppresses exactly the 12 held videos from cards and CollectionPage.hasPart', () => {
    const videoIndex = read('videos', 'index.html');
    const allVideoSlugs = fs.readdirSync(path.join(PUBLIC, 'videos'))
      .filter((name) => name.endsWith('.mp4'))
      .map((name) => name.replace(/\.mp4$/, ''))
      .sort();
    const expectedPromoted = allVideoSlugs
      .filter((slug) => !SUPPRESSED_FROM_VIDEO_INDEX.includes(slug))
      .sort();
    const jsonldMatch = videoIndex.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
    assert.ok(jsonldMatch, 'expected video index JSON-LD');
    const jsonld = JSON.parse(jsonldMatch[1]);
    const structuredSlugs = jsonld.hasPart
      .map(({ url }) => new URL(url).pathname.split('/').filter(Boolean).at(-1))
      .sort();

    assert.deepEqual(indexVideoSlugs(videoIndex), expectedPromoted);
    assert.deepEqual(structuredSlugs, expectedPromoted);
    assert.equal(expectedPromoted.length, 10);
  });

  it('does not change article or direct-video sitemap membership', () => {
    const sitemap = read('sitemap.xml');
    const directVideoSlugs = fs.readdirSync(path.join(PUBLIC, 'videos'))
      .filter((name) => name.endsWith('.mp4'))
      .map((name) => name.replace(/\.mp4$/, ''))
      .sort();

    assert.deepEqual(sitemapSlugs('articles', sitemap), sourceArticleSlugs());
    assert.deepEqual(sitemapSlugs('videos', sitemap), directVideoSlugs);
  });
});
