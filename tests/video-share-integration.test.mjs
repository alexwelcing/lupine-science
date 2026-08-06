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

  it('keeps video sharing usable without JavaScript and at 320px', () => {
    const html = readPublicPage('videos');

    assert.match(html, /<a class="skip" href="#content">Skip to content<\/a>/);
    assert.match(html, /grid-template-columns:\s*repeat\(auto-fit, minmax\(min\(100%, 320px\), 1fr\)\)/);
    assert.deepEqual(
      [...html.matchAll(/class="share-link [^"]+"[^>]*aria-label="([^"]+)"/g)].map((match) => match[1]),
      ['Share on X', 'Share on LinkedIn', 'Share by email'],
    );
  });

  it('uses a video thumbnail for the video index social preview', () => {
    const html = readPublicPage('videos');

    assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/videos\/the-savings-stack-poster\.jpg\?v=\d+">/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/lupine\.science\/videos\/the-savings-stack-poster\.jpg\?v=\d+">/);
  });

  it('integrates sharing and the video thumbnail into published video article pages', () => {
    const slug = 'the-order-is-right-the-size-is-wrong';
    const html = readPublicPage('articles', slug);

    assert.match(html, new RegExp(`class="share-root"[^>]*data-url="https://lupine\\.science/articles/${slug}/"`));
    assert.match(html, new RegExp(`<meta property="og:image" content="https://lupine\\.science/videos/${slug}-poster\\.jpg\\?v=\\d+">`));
    assert.match(html, /import \{ initAllShareWidgets \} from "\/components\/share\/share\.mjs"/);
  });
});
