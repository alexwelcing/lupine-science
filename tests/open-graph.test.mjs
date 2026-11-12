import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { before, describe, it } from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readArticle(slug) {
  return fs.readFileSync(path.join(ROOT, 'public', 'articles', slug, 'index.html'), 'utf8');
}

before(() => {
  const result = spawnSync(process.execPath, ['scripts/build-articles.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
});

describe('article Open Graph metadata', () => {
  it('uses the Summary for every description surface', () => {
    const html = readArticle('the-order-is-right-the-size-is-wrong');

    assert.match(html, /<meta name="description" content="Across 21 materials and 228 published reference values/);
    assert.match(html, /<meta property="og:description" content="Across 21 materials and 228 published reference values/);
    assert.match(html, /<meta name="twitter:description" content="Across 21 materials and 228 published reference values/);
    assert.doesNotMatch(html, /(?:name="description"|property="og:description"|name="twitter:description") content=""/);
  });

  it('uses the video poster and video type when an article has a listed film but no hero image', () => {
    const html = readArticle('an-order-of-effort');

    assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/videos\/an-order-of-effort-poster\.jpg\?v=\d+">/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/lupine\.science\/videos\/an-order-of-effort-poster\.jpg\?v=\d+">/);
    assert.match(html, /<meta property="og:type" content="video\.other">/);
  });

  it('falls back to the site card and article type when the article has no listed film', () => {
    const html = readArticle('the-02-percent-synthesis-problem');

    assert.match(html, /<meta property="og:title" content="The 0\.2% Synthesis Problem — Lupine Science">/);
    assert.match(html, /<meta property="og:description" content="A literature review: of 380,000 structures/);
    assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/og-lupine-science\.jpg(\?v=\d+)?">/);
    assert.match(html, /<meta property="og:url" content="https:\/\/lupine\.science\/articles\/the-02-percent-synthesis-problem\/">/);
    assert.match(html, /<meta property="og:type" content="article">/);
    assert.doesNotMatch(html, /the-02-percent-synthesis-problem-poster/);
  });
});
