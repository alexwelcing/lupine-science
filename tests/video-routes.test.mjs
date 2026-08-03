import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const VIDEOS = path.join(PUBLIC, 'videos');

function videoSlugs() {
  return fs.readdirSync(VIDEOS)
    .filter((name) => name.endsWith('.mp4'))
    .map((name) => name.replace(/\.mp4$/, ''))
    .sort();
}

function read(...segments) {
  return fs.readFileSync(path.join(PUBLIC, ...segments), 'utf8');
}

before(() => {
  const result = spawnSync(process.execPath, ['scripts/build-articles.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

describe('article and video publication routes', () => {
  it('lists every top-level article video exactly once', () => {
    const index = read('videos', 'index.html');
    const cards = [...index.matchAll(/class="video-card-primary" href="\/videos\/([^/]+)\/"/g)]
      .map((match) => match[1])
      .sort();
    assert.deepEqual(cards, videoSlugs());
  });

  it('resolves detail, article, poster, captions, share, and download routes for every video', () => {
    const index = read('videos', 'index.html');
    for (const slug of videoSlugs()) {
      const articleFile = path.join(PUBLIC, 'articles', slug, 'index.html');
      const detailFile = path.join(VIDEOS, slug, 'index.html');
      const mp4File = path.join(VIDEOS, `${slug}.mp4`);
      const posterFile = path.join(VIDEOS, `${slug}-poster.jpg`);
      const captionsFile = path.join(VIDEOS, `${slug}.vtt`);
      for (const file of [articleFile, detailFile, mp4File, posterFile, captionsFile]) {
        assert.ok(fs.existsSync(file), `expected route artifact ${path.relative(PUBLIC, file)}`);
        assert.ok(fs.statSync(file).size > 0, `expected non-empty route artifact ${path.relative(PUBLIC, file)}`);
      }

      const article = fs.readFileSync(articleFile, 'utf8');
      const detail = fs.readFileSync(detailFile, 'utf8');
      assert.match(article, new RegExp(`href="/videos/${slug}/"`), `article must link to video page: ${slug}`);
      assert.match(detail, new RegExp(`href="/articles/${slug}/"`), `video must link to article: ${slug}`);
      assert.match(detail, new RegExp(`data-url="https://lupine\\.science/videos/${slug}/"`), `video share URL: ${slug}`);
      assert.match(detail, new RegExp(`href="/videos/${slug}\\.mp4" download`), `video download: ${slug}`);
      assert.match(detail, new RegExp(`href="/videos/${slug}\\.vtt" download`), `captions download: ${slug}`);
      assert.match(index, new RegExp(`href="/videos/${slug}\\.mp4" download`), `index download: ${slug}`);
    }
  });

  it('ships a useful 404 response surface for missing pages and downloads', () => {
    const html = read('404.html');
    assert.match(html, /page or download is not available/i);
    assert.match(html, /href="\/videos\/"/);
    assert.match(html, /href="\/articles\/"/);
  });
});
