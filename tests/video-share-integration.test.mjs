import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { RETIRED_FILMS, UNLISTED_FILMS } from '../scripts/lib/film-listing.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readPublicPage(...segments) {
  return fs.readFileSync(path.join(ROOT, 'public', ...segments, 'index.html'), 'utf8');
}

// Films with a generated /videos/<slug>/ page are the listed ones.
function listedFilmSlugs() {
  const videos = path.join(ROOT, 'public', 'videos');
  return fs.readdirSync(videos, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(videos, entry.name, 'index.html')))
    .map((entry) => entry.name);
}

describe('video share integration', () => {
  it('integrates the share component into the video index', () => {
    const html = readPublicPage('videos');

    // the share widget's CSS is inlined into every page head (scripts/build-articles.mjs)
    assert.match(html, /<style>[^<]*\.share-root[^<]*<\/style>/);
    assert.match(html, /class="share-root"[^>]*data-url="https:\/\/lupine\.science\/videos\/"/);
    assert.match(html, /data-title="Videos — Lupine Science"/);
    assert.match(html, /aria-label="Share this page"/);
  });

  it('keeps video sharing usable without JavaScript', () => {
    const html = readPublicPage('videos');

    assert.match(html, /<a class="skip" href="#content">Skip to content<\/a>/);
    assert.deepEqual(
      [...html.matchAll(/class="share-link [^"]+"[^>]*aria-label="([^"]+)"/g)].map((match) => match[1]),
      ['Share on X', 'Share on LinkedIn', 'Share by email'],
    );
  });

  it('previews a listed film on the video index, or the site card when none is listed', () => {
    // the index previews a listed film, never unlisted or declined inventory
    const html = readPublicPage('videos');
    const listed = listedFilmSlugs();
    const image = html.match(/<meta property="og:image" content="https:\/\/lupine\.science\/videos\/([a-z0-9-]+)-poster\.jpg\?v=\d+">/);
    if (listed.length === 0) {
      assert.equal(image, null, 'no film is listed, so no film poster may preview the index');
      assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/og-lupine-science\.jpg(\?v=\d+)?">/);
      assert.match(html, /class="videos-empty"/);
      assert.doesNotMatch(html, /class="video-card"/);
      return;
    }
    assert.ok(image, 'expected a film poster as the video index social image');
    assert.ok(listed.includes(image[1]), `${image[1]} is not a listed film`);
    assert.match(html, new RegExp(`<meta name="twitter:image" content="https://lupine\\.science/videos/${image[1]}-poster\\.jpg\\?v=\\d+">`));
  });

  it('integrates sharing into article pages without the poster of an unlisted film', () => {
    for (const slug of UNLISTED_FILMS.keys()) {
      const html = readPublicPage('articles', slug);
      assert.match(html, new RegExp(`class="share-root"[^>]*data-url="https://lupine\\.science/articles/${slug}/"`));
      assert.doesNotMatch(html, new RegExp(`${slug}-poster\\.`), slug);
      assert.doesNotMatch(html, /class="article-video-player"/, slug);
    }
  });

  // Films removed on 2026-11-12 (scripts/lib/film-listing.mjs RETIRED_FILMS):
  // their narration named partners, pitched a budget or stated correction and
  // verification capabilities our results do not support.
  for (const slug of RETIRED_FILMS.keys()) {
    it(`ships no files, page, card or poster reference for the retired ${slug} film`, () => {
      for (const suffix of ['.mp4', '.vtt', '-poster.jpg', '-poster.avif', '-poster.webp']) {
        assert.equal(fs.existsSync(path.join(ROOT, 'public', 'videos', `${slug}${suffix}`)), false, `${slug}${suffix}`);
      }
      assert.equal(fs.existsSync(path.join(ROOT, 'public', 'videos', slug, 'index.html')), false);
      const pages = [readPublicPage('articles', slug), readPublicPage('videos')].join('\n');
      assert.doesNotMatch(pages, new RegExp(`${slug}-poster\\.`));
      assert.doesNotMatch(pages, new RegExp(`/videos/${slug}\\.(?:mp4|vtt)`));
    });
  }
});
