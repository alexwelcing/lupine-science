import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readPublicPage(...segments) {
  return fs.readFileSync(path.join(ROOT, 'public', ...segments, 'index.html'), 'utf8');
}

describe('video share integration', () => {
  it('integrates the share component into the video index', () => {
    const html = readPublicPage('videos');

    assert.match(html, /<link rel="stylesheet" href="\/components\/share\/share\.css">/);
    assert.match(html, /class="share-root"[^>]*data-url="https:\/\/lupine\.science\/videos\/"/);
    assert.match(html, /data-title="Videos — Lupine Science"/);
    assert.match(html, /aria-label="Share this page"/);
    assert.match(html, /import \{ initAllShareWidgets \} from "\/components\/share\/share\.mjs"/);
    assert.match(html, /initAllShareWidgets\(\)/);
  });

  it('uses a video thumbnail for the video index social preview', () => {
    const html = readPublicPage('videos');

    assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/videos\/the-02-percent-synthesis-problem-poster\.jpg\?v=2">/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/lupine\.science\/videos\/the-02-percent-synthesis-problem-poster\.jpg\?v=2">/);
  });

  it('integrates sharing and the video thumbnail into published video article pages', () => {
    const slug = 'the-02-percent-synthesis-problem';
    const html = readPublicPage('articles', slug);

    assert.match(html, new RegExp(`class="share-root"[^>]*data-url="https://lupine\\.science/articles/${slug}/"`));
    assert.match(html, new RegExp(`<meta property="og:image" content="https://lupine\\.science/videos/${slug}-poster\\.jpg\\?v=2">`));
    assert.match(html, /import \{ initAllShareWidgets \} from "\/components\/share\/share\.mjs"/);
  });
});
