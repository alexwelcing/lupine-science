import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { documentStatus } from '../scripts/lib/discovery.mjs';
import { filmListed } from '../scripts/lib/film-listing.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const VIDEOS = path.join(PUBLIC, 'videos');

// Listed films only: unlisted films (scripts/lib/film-listing.mjs) and films of
// Archived articles keep their files but get no page, card or embed.
function videoSlugs() {
  return fs.readdirSync(VIDEOS)
    .filter((name) => name.endsWith('.mp4'))
    .map((name) => name.replace(/\.mp4$/, ''))
    .filter((slug) => {
      const source = fs.readFileSync(path.join(ROOT, 'articles', `${slug}.md`), 'utf8');
      const status = documentStatus(source.match(/^> \*\*Status:\*\*\s*(.+?)\s*$/m)?.[1]);
      return filmListed(slug, status);
    })
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
    // the 404 offers /videos/ only while it has a film to show
    if (videoSlugs().length) assert.match(html, /href="\/videos\/"/);
    else assert.doesNotMatch(html, /href="\/videos\/"/);
    assert.match(html, /href="\/articles\/"/);
  });

  it('does not send readers or crawlers to an empty /videos/ index', () => {
    const index = read('videos', 'index.html');
    const sitemap = read('sitemap.xml');
    const llms = read('llms.txt');
    if (videoSlugs().length) {
      assert.match(index, /<meta name="robots" content="index,follow">/);
      assert.match(sitemap, /<loc>https:\/\/lupine\.science\/videos\/<\/loc>/);
      assert.match(llms, /^- Films: https:\/\/lupine\.science\/videos\/$/m);
      return;
    }
    assert.match(index, /No films are listed at the moment/);
    assert.match(index, /<meta name="robots" content="noindex,follow">/);
    assert.doesNotMatch(sitemap, /lupine\.science\/videos\//);
    assert.doesNotMatch(llms, /lupine\.science\/videos\//);
    const pages = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.html')) pages.push(full);
      }
    })(PUBLIC);
    for (const page of pages) {
      assert.doesNotMatch(fs.readFileSync(page, 'utf8'), /href="\/videos\/"/, `${path.relative(PUBLIC, page)} links the empty /videos/ index`);
    }
  });

  it('refreshes stale article, video detail, and video index route outputs', () => {
    // a slug whose film would be listed (Published, not in film-listing.mjs);
    // unlisted films get no video detail page at all
    const slug = 'the-small-cell-held-mlip-elastic-benchmark';
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
        assert.match(refreshed, /1×1×1/, `${path.relative(ROOT, file)} must preserve Unicode on rebuild`);
      }
      // with no hero image in the fixture root, a listed film's poster is the social image
      const article = fs.readFileSync(files[0], 'utf8');
      assert.match(article, new RegExp(`<meta property="og:image" content="https://lupine\\.science/videos/${slug}-poster\\.jpg\\?v=\\d+">`));
      assert.match(article, /<meta property="og:type" content="video\.other">/);
    } finally {
      fs.rmSync(publicRoot, { recursive: true, force: true });
    }
  });
});

// Film detail pages that were once published (and indexed) redirect to their
// articles. Each retired slug is listed explicitly, in public/_redirects for
// Cloudflare Pages and in nginx.conf for the container image, so the rule never
// shadows the /videos/ index, the media files or a film page published later.
describe('retired film detail pages', () => {
  const ROUTE = /^\/videos\/([a-z0-9-]+)\/\s+\/articles\/([a-z0-9-]+)\/\s+301$/;
  function redirectedSlugs() {
    return fs.readFileSync(path.join(PUBLIC, '_redirects'), 'utf8')
      .split('\n')
      .filter((line) => line.startsWith('/videos/'))
      .map((line) => {
        const match = line.trim().match(ROUTE);
        assert.ok(match, `unexpected /videos/ redirect: ${line}`);
        assert.equal(match[1], match[2], `/videos/${match[1]}/ must redirect to its own article`);
        return match[1];
      });
  }

  it('redirect each retired /videos/<slug>/ to an existing article', () => {
    const slugs = redirectedSlugs();
    assert.ok(slugs.length >= 22, `expected the 22 retired film pages, found ${slugs.length}`);
    assert.equal(new Set(slugs).size, slugs.length, 'duplicate /videos/ redirect');
    for (const slug of slugs) {
      assert.ok(fs.existsSync(path.join(PUBLIC, 'articles', slug, 'index.html')), `no article for /videos/${slug}/`);
      assert.equal(fs.existsSync(path.join(VIDEOS, slug, 'index.html')), false, `/videos/${slug}/ is a live page and must not redirect`);
      assert.equal(videoSlugs().includes(slug), false, `${slug} is a listed film and must not redirect`);
    }
  });

  it('mirror the same redirects in nginx.conf, as exact matches', () => {
    const conf = fs.readFileSync(path.join(ROOT, 'nginx.conf'), 'utf8');
    const nginx = [...conf.matchAll(/location = \/videos\/([a-z0-9-]+)\/ \{ return 301 \/articles\/([a-z0-9-]+)\/; \}/g)]
      .map((match) => {
        assert.equal(match[1], match[2], match[0]);
        return match[1];
      });
    assert.deepEqual(nginx.sort(), redirectedSlugs().sort());
    assert.doesNotMatch(conf, /location ~[^{]*\^\/videos/, 'no regex location may catch /videos/');
    assert.ok(conf.indexOf('location = /videos/') < conf.indexOf('location / {'));
  });
});
