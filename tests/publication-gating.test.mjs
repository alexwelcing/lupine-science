import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { isReleasedStatus } from '../scripts/publication-policy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const DRAFT = 'z1-union-debrief';
const RELEASED = 'the-savings-stack';

function read(...segments) {
  return fs.readFileSync(path.join(PUBLIC, ...segments), 'utf8');
}

before(() => {
  const result = spawnSync(process.execPath, ['scripts/build-articles.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const sitemap = spawnSync(process.execPath, ['scripts/build-sitemap.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(sitemap.status, 0, sitemap.stderr || sitemap.stdout);
});

describe('fail-closed publication gating', () => {
  it('keeps editorial-state articles explicit but non-indexable and non-shareable', () => {
    const html = read('articles', DRAFT, 'index.html');

    assert.match(html, /<span class="article-status">Draft<\/span>/);
    assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/);
    assert.doesNotMatch(html, /class="share-root"/);
    assert.doesNotMatch(html, /<link rel="alternate" type="video\/mp4"/);
    assert.doesNotMatch(html, /"@type":"VideoObject"/);
    assert.doesNotMatch(html, new RegExp(`href="/videos/${DRAFT}/"`));
    assert.doesNotMatch(html, /<meta property="og:/);
    assert.doesNotMatch(html, /<meta name="twitter:/);
    assert.doesNotMatch(html, /<script type="application\/ld\+json">/);
  });

  it('does not promote editorial-state articles or videos on public indexes and routes', () => {
    const articleIndex = read('articles', 'index.html');
    const videoIndex = read('videos', 'index.html');
    const sitemap = read('sitemap.xml');

    assert.doesNotMatch(articleIndex, new RegExp(`href="/articles/${DRAFT}/"`));
    assert.doesNotMatch(videoIndex, new RegExp(`/videos/${DRAFT}(?:/|\\.mp4)`));
    assert.ok(!fs.existsSync(path.join(PUBLIC, 'videos', DRAFT, 'index.html')));
    assert.doesNotMatch(sitemap, new RegExp(`/(?:articles|videos)/${DRAFT}/`));
  });

  it('continues publishing explicitly released article and video surfaces', () => {
    const article = read('articles', RELEASED, 'index.html');
    const articleIndex = read('articles', 'index.html');
    const videoIndex = read('videos', 'index.html');
    const sitemap = read('sitemap.xml');

    assert.match(article, /<meta name="robots" content="index,follow">/);
    assert.match(article, /class="share-root"/);
    assert.match(articleIndex, new RegExp(`href="/articles/${RELEASED}/"`));
    assert.match(videoIndex, new RegExp(`href="/videos/${RELEASED}/"`));
    assert.ok(fs.existsSync(path.join(PUBLIC, 'videos', RELEASED, 'index.html')));
    assert.match(sitemap, new RegExp(`/articles/${RELEASED}/`));
    assert.match(sitemap, new RegExp(`/videos/${RELEASED}/`));
  });

  it('releases only explicit reviewed states and rejects contradictory suffixes', () => {
    for (const status of ['Published', 'Final — updated 2026-07-20', 'Live evidence — provenance sealed', 'Reviewed', 'Verified']) {
      assert.equal(isReleasedStatus(status), true, status);
    }

    for (const status of [undefined, '', 'Draft', 'FOR EDITOR REVIEW', 'not for citation', 'Final draft', 'Published — pending review', 'Verified — needs verification', 'unknown']) {
      assert.equal(isReleasedStatus(status), false, String(status));
    }
  });
});