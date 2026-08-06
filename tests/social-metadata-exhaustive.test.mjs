import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { JSDOM } from 'jsdom';
import { renderHead } from '../scripts/build-articles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'public', 'articles');
const VIDEOS = path.join(ROOT, 'public', 'videos');
const SITE = 'https://lupine.science';

function documentFromHead(head) {
  return new JSDOM(`<!doctype html><html><head>${head}</head><body></body></html>`).window.document;
}

function articleSlugs() {
  return fs.readdirSync(ARTICLES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function only(document, selector, slug) {
  const matches = document.querySelectorAll(selector);
  assert.equal(matches.length, 1, `${slug}: expected exactly one ${selector}`);
  return matches[0];
}

describe('social metadata rendering', () => {
  it('preserves Unicode and escapes reserved characters in metadata attributes', () => {
    const title = 'CO₂, evidence & “proof” < prediction';
    const description = 'Measured 3–5× — not "estimated" & never < verified.';
    const url = `${SITE}/articles/evidence/?view=public&lang=en`;
    const image = `${SITE}/share.png?crop=wide&v=1`;
    const head = renderHead({
      title,
      description,
      url,
      ogImage: image,
      ogType: 'article',
      jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: title },
    });
    const document = documentFromHead(head);

    assert.equal(document.title, title);
    assert.equal(document.querySelector('meta[name="description"]').content, description);
    assert.equal(document.querySelector('link[rel="canonical"]').href, url);
    assert.equal(document.querySelector('meta[property="og:title"]').content, title);
    assert.equal(document.querySelector('meta[property="og:description"]').content, description);
    assert.equal(document.querySelector('meta[property="og:url"]').content, url);
    assert.equal(document.querySelector('meta[property="og:image"]').content, image);
    assert.equal(document.querySelector('meta[name="twitter:title"]').content, title);
    assert.equal(document.querySelector('meta[name="twitter:description"]').content, description);
    assert.equal(document.querySelector('meta[name="twitter:image"]').content, image);
    assert.match(head, /content="CO₂, evidence &amp; “proof” &lt; prediction"/);
    assert.match(head, /href="https:\/\/lupine\.science\/articles\/evidence\/\?view=public&amp;lang=en"/);
  });

  it('emits complete, canonical metadata and accessible share links for every released article', () => {
    let unicodeTitles = 0;
    let unicodeDescriptions = 0;

    for (const slug of articleSlugs()) {
      const html = fs.readFileSync(path.join(ARTICLES, slug, 'index.html'), 'utf8');
      const document = new JSDOM(html).window.document;
      if (document.querySelector('meta[name="robots"]')?.content !== 'index,follow') continue;
      const canonical = `${SITE}/articles/${slug}/`;
      const title = only(document, 'meta[property="og:title"]', slug).content;
      const description = only(document, 'meta[property="og:description"]', slug).content;
      const image = only(document, 'meta[property="og:image"]', slug).content;
      const share = only(document, '.share-root', slug);

      assert.ok(title, `${slug}: Open Graph title must not be empty`);
      assert.ok(description, `${slug}: Open Graph description must not be empty`);
      assert.equal(only(document, 'link[rel="canonical"]', slug).href, canonical);
      assert.equal(only(document, 'meta[property="og:url"]', slug).content, canonical);
      assert.match(image, /^https:\/\/lupine\.science\//, `${slug}: social image must be same-origin and absolute`);
      assert.equal(only(document, 'meta[name="twitter:card"]', slug).content, 'summary_large_image');
      assert.equal(only(document, 'meta[name="twitter:title"]', slug).content, title);
      assert.equal(only(document, 'meta[name="twitter:description"]', slug).content, description);
      assert.equal(only(document, 'meta[name="twitter:image"]', slug).content, image);
      assert.equal(share.dataset.url, canonical);
      assert.equal(share.getAttribute('role'), 'group');
      assert.ok(share.getAttribute('aria-label'));
      assert.deepEqual(
        [...share.querySelectorAll('a')].map((link) => link.getAttribute('aria-label')),
        ['Share on X', 'Share on LinkedIn', 'Share by email'],
        `${slug}: server-rendered share actions must remain labelled and keyboard-focusable`,
      );
      assert.doesNotMatch(`${title}${description}`, /�/, `${slug}: metadata must not contain replacement characters`);

      if (/[^\x00-\x7F]/.test(title)) unicodeTitles += 1;
      if (/[^\x00-\x7F]/.test(description)) unicodeDescriptions += 1;
    }

    assert.ok(unicodeTitles > 0, 'expected representative Unicode article titles');
    assert.ok(unicodeDescriptions > 0, 'expected representative Unicode article descriptions');
  });

  it('emits page-specific Open Graph and Twitter metadata for every video detail route', () => {
    for (const slug of articleSlugs().filter((candidate) => fs.existsSync(path.join(VIDEOS, candidate, 'index.html')))) {
      const document = new JSDOM(fs.readFileSync(path.join(VIDEOS, slug, 'index.html'), 'utf8')).window.document;
      const canonical = `${SITE}/videos/${slug}/`;
      const title = only(document, 'meta[property="og:title"]', slug).content;
      const description = only(document, 'meta[property="og:description"]', slug).content;
      const image = only(document, 'meta[property="og:image"]', slug).content;

      assert.equal(only(document, 'link[rel="canonical"]', slug).href, canonical);
      assert.equal(only(document, 'meta[property="og:url"]', slug).content, canonical);
      assert.equal(only(document, 'meta[property="og:type"]', slug).content, 'video.other');
      assert.equal(only(document, 'meta[name="twitter:card"]', slug).content, 'summary_large_image');
      assert.equal(only(document, 'meta[name="twitter:title"]', slug).content, title);
      assert.equal(only(document, 'meta[name="twitter:description"]', slug).content, description);
      assert.equal(only(document, 'meta[name="twitter:image"]', slug).content, image);
      assert.match(image, new RegExp(`^${SITE.replaceAll('.', '\\.')}/videos/${slug}-poster\\.jpg\\?v=\\d+$`));
      assert.doesNotMatch(`${title}${description}`, /�/, `${slug}: metadata must preserve Unicode`);
    }
  });
});
