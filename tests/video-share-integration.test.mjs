import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { UNLISTED_FILMS } from '../scripts/lib/film-listing.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readPublicPage(...segments) {
  return fs.readFileSync(path.join(ROOT, 'public', ...segments, 'index.html'), 'utf8');
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

  it('uses a listed film thumbnail for the video index social preview', () => {
    // the index previews a listed film, never unlisted or declined inventory
    const html = readPublicPage('videos');
    const image = html.match(/<meta property="og:image" content="https:\/\/lupine\.science\/videos\/([a-z0-9-]+)-poster\.jpg\?v=\d+">/);
    assert.ok(image, 'expected a film poster as the video index social image');
    assert.equal(UNLISTED_FILMS.has(image[1]), false, `${image[1]} is unlisted`);
    assert.ok(fs.existsSync(path.join(ROOT, 'public', 'videos', image[1], 'index.html')), `${image[1]} has no video page`);
    assert.match(html, new RegExp(`<meta name="twitter:image" content="https://lupine\\.science/videos/${image[1]}-poster\\.jpg\\?v=\\d+">`));
  });

  it('integrates sharing and the video thumbnail into listed-film article pages', () => {
    const slug = 'an-order-of-effort';
    const html = readPublicPage('articles', slug);

    assert.match(html, new RegExp(`class="share-root"[^>]*data-url="https://lupine\\.science/articles/${slug}/"`));
    assert.match(html, new RegExp(`<meta property="og:image" content="https://lupine\\.science/videos/${slug}-poster\\.jpg\\?v=\\d+">`));
  });

  // The water-and-air and PFAS films were re-cut in August 2026 (poster cache
  // revision v4) and unlisted on 2026-11-11 (scripts/lib/film-listing.mjs):
  // their narration states correction capabilities our results do not support.
  for (const slug of [
    'water-and-air-correcting-the-molecules-we-drink-and-breathe',
    'critical-minerals-pfas-and-the-remediation-imperative',
  ]) {
    it(`leaves no page, card or poster reference for the unlisted ${slug} film`, () => {
      assert.ok(UNLISTED_FILMS.has(slug));
      assert.equal(fs.existsSync(path.join(ROOT, 'public', 'videos', slug, 'index.html')), false);
      const pages = [readPublicPage('articles', slug), readPublicPage('videos')].join('\n');
      assert.doesNotMatch(pages, new RegExp(`${slug}-poster\\.`));
      assert.doesNotMatch(pages, new RegExp(`/videos/${slug}\\.mp4`));
    });
  }
});
