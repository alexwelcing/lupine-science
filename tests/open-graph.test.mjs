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
  it('uses scope when the optional description is missing', () => {
    const html = readArticle('the-order-is-right-the-size-is-wrong');

    assert.match(html, /<meta name="description" content="Foundation machine-learned interatomic potentials/);
    assert.match(html, /<meta property="og:description" content="Foundation machine-learned interatomic potentials/);
    assert.match(html, /<meta name="twitter:description" content="Foundation machine-learned interatomic potentials/);
    assert.doesNotMatch(html, /(?:name="description"|property="og:description"|name="twitter:description") content=""/);
  });

  it('uses the site social image when optional image metadata and a video poster are missing', () => {
    const html = readArticle('the-order-is-right-the-size-is-wrong');

    assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/og-lupine-science\.png\?v=2">/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/lupine\.science\/og-lupine-science\.png\?v=2">/);
  });

  it('uses video poster metadata and video type when an article has a published video', () => {
    const html = readArticle('the-02-percent-synthesis-problem');

    assert.match(html, /<meta property="og:title" content="The 0\.2% Synthesis Problem — Lupine Science">/);
    assert.match(html, /<meta property="og:description" content="An honest look at the 0\.2% validation rate/);
    assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/videos\/the-02-percent-synthesis-problem-poster\.jpg\?v=2">/);
    assert.match(html, /<meta property="og:url" content="https:\/\/lupine\.science\/articles\/the-02-percent-synthesis-problem\/">/);
    assert.match(html, /<meta property="og:type" content="video\.other">/);
  });
});
