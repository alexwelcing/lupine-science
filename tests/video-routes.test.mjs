import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
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

function buildArticles(publicRoot) {
  return spawnSync(process.execPath, ['scripts/build-articles.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: publicRoot
      ? { ...process.env, LUPINE_BUILD_PUBLIC_ROOT: publicRoot }
      : process.env,
  });
}

before(() => {
  const result = buildArticles();
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

  it('refreshes stale article, video detail, and video index route outputs', () => {
    const slug = 'methane-and-refrigerants-cutting-the-non-co2-climate-forcers';
    const publicRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'article-route-refresh-'));
    const videosRoot = path.join(publicRoot, 'videos');
    const files = [
      path.join(publicRoot, 'articles', slug, 'index.html'),
      path.join(videosRoot, slug, 'index.html'),
      path.join(videosRoot, 'index.html'),
    ];

    try {
      fs.mkdirSync(path.join(videosRoot, slug), { recursive: true });
      for (const extension of ['mp4', 'jpg', 'vtt']) {
        const suffix = extension === 'jpg' ? '-poster.jpg' : `.${extension}`;
        fs.writeFileSync(path.join(videosRoot, `${slug}${suffix}`), `fixture ${extension}\n`);
      }
      for (const file of files) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, '<!-- stale-output-sentinel -->\n');
      }

      // build-articles.mjs reads real inputs out of the public root it is given:
      // data/lean_count.json (machine-generated theorem count, read at module
      // load) and proof-packs/*.pdf (referenced by article metadata). A bare temp
      // directory is not a usable fixture until those are seeded.
      for (const subtree of ['data', 'proof-packs']) {
        const source = path.join(ROOT, 'public', subtree);
        if (fs.existsSync(source)) {
          fs.cpSync(source, path.join(publicRoot, subtree), { recursive: true });
        }
      }

      const result = buildArticles(publicRoot);
      assert.equal(result.status, 0, result.stderr || result.stdout);

      for (const file of files) {
        const refreshed = fs.readFileSync(file, 'utf8');
        assert.doesNotMatch(refreshed, /stale-output-sentinel/, path.relative(ROOT, file));
        assert.match(refreshed, /Non-CO₂/, `${path.relative(ROOT, file)} must preserve Unicode on rebuild`);
      }
    } finally {
      fs.rmSync(publicRoot, { recursive: true, force: true });
    }
  });
});
