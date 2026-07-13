import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { JSDOM } from 'jsdom';
import {
  encodeQuery,
  buildShareActions,
  initShare,
} from '../public/components/share/share.mjs';

const SHARE_ICON_FILES = ['x.svg', 'linkedin.svg', 'email.svg'];

/**
 * Share-component unit tests
 *
 * These tests exercise the pure parts of the share widget (URL/query encoding
 * and share-action generation). They do not require a browser; jsdom supplies
 * the minimal DOM needed for the render paths.
 */

describe('encodeQuery', () => {
  it('percent-encodes spaces and punctuation', () => {
    assert.equal(encodeQuery('The Trust Layer'), 'The%20Trust%20Layer');
  });

  it('encodes the comma and apostrophe per RFC 3986', () => {
    assert.equal(encodeQuery("The Order Is Right, the Size Is Wrong"), 'The%20Order%20Is%20Right%2C%20the%20Size%20Is%20Wrong');
  });

  it('encodes slashes and colons in URLs', () => {
    assert.equal(
      encodeQuery('https://lupine.science/articles/the-trust-layer/'),
      'https%3A%2F%2Flupine.science%2Farticles%2Fthe-trust-layer%2F'
    );
  });
});

describe('buildShareActions', () => {
  const url = 'https://lupine.science/articles/the-trust-layer/';
  const title = 'The Trust Layer';
  const actions = buildShareActions({ url, title });

  it('returns three actions in the expected order', () => {
    assert.deepEqual(actions.map((a) => a.slug), ['x', 'linkedin', 'email']);
  });

  it('uses the X intent tweet URL with separate text and url parameters', () => {
    const x = actions.find((a) => a.slug === 'x');
    assert.equal(x.href, 'https://twitter.com/intent/tweet?text=The%20Trust%20Layer&url=https%3A%2F%2Flupine.science%2Farticles%2Fthe-trust-layer%2F');
  });

  it('uses the LinkedIn share-offsite URL with only the encoded URL', () => {
    const linkedin = actions.find((a) => a.slug === 'linkedin');
    assert.equal(linkedin.href, 'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Flupine.science%2Farticles%2Fthe-trust-layer%2F');
  });

  it('builds a mailto URL with encoded subject and body', () => {
    const email = actions.find((a) => a.slug === 'email');
    assert.equal(email.href, 'mailto:?subject=The%20Trust%20Layer&body=The%20Trust%20Layer%0A%0Ahttps%3A%2F%2Flupine.science%2Farticles%2Fthe-trust-layer%2F');
  });

  it('marks external social links with target and rel for security', () => {
    for (const slug of ['x', 'linkedin']) {
      const action = actions.find((a) => a.slug === slug);
      assert.equal(action.target, '_blank');
      assert.equal(action.rel, 'noopener noreferrer');
    }
  });

  it('does not mark the email action as external', () => {
    const email = actions.find((a) => a.slug === 'email');
    assert.equal(email.target, undefined);
    assert.equal(email.rel, undefined);
  });
});

describe('initShare accessibility', () => {
  it('renders labelled native controls with a polite live region on desktop', () => {
    const dom = new JSDOM('<div class="share-root" aria-label="Share"></div>');
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    dom.window.matchMedia = () => ({ matches: false });

    try {
      const root = dom.window.document.querySelector('.share-root');
      initShare(root, { url: 'https://lupine.science/article/', title: 'Article' });

      assert.equal(root.querySelectorAll('a[aria-label]').length, 3);
      assert.equal(root.querySelectorAll('button').length, 0);
      assert.equal(root.querySelector('.share-live').getAttribute('aria-live'), 'polite');
      assert.equal(root.querySelector('.share-live').getAttribute('aria-atomic'), 'true');
    } finally {
      globalThis.window = previousWindow;
      globalThis.document = previousDocument;
      dom.window.close();
    }
  });

  it('closes the mobile disclosure with Escape and restores toggle focus', () => {
    const dom = new JSDOM('<div class="share-root" aria-label="Share"></div>');
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    dom.window.matchMedia = () => ({ matches: true });

    try {
      const root = dom.window.document.querySelector('.share-root');
      initShare(root, { url: 'https://lupine.science/article/', title: 'Article' });
      const toggle = root.querySelector('.share-toggle');
      const menu = root.querySelector('.share-menu');

      toggle.click();
      assert.equal(toggle.getAttribute('aria-expanded'), 'true');
      assert.equal(menu.hidden, false);

      menu.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      assert.equal(toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(menu.hidden, true);
      assert.equal(dom.window.document.activeElement, toggle);
    } finally {
      globalThis.window = previousWindow;
      globalThis.document = previousDocument;
      dom.window.close();
    }
  });
});

describe('share component styles', () => {
  it('provides visible keyboard focus and disables motion when requested', async () => {
    const fs = await import('node:fs');
    const css = fs.readFileSync(new URL('../public/components/share/share.css', import.meta.url), 'utf8');

    assert.match(css, /\.share-link:focus-visible/);
    assert.match(css, /outline:\s*2px solid var\(--share-focus\)/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(css, /transition:\s*none !important/);
    assert.match(css, /animation:\s*none !important/);
  });
});

describe('static share icons', () => {
  it('ships a safe, decorative, currentColor SVG for every share action', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const iconDirectory = path.join(__dirname, '../public/assets/icons/share');

    for (const file of SHARE_ICON_FILES) {
      const source = fs.readFileSync(path.join(iconDirectory, file), 'utf8');
      const dom = new JSDOM(source, { contentType: 'image/svg+xml' });
      const svg = dom.window.document.documentElement;

      assert.equal(svg.localName, 'svg', `${file} has an SVG root`);
      assert.equal(svg.getAttribute('viewBox'), '0 0 24 24', `${file} uses the shared viewBox`);
      assert.equal(svg.getAttribute('aria-hidden'), 'true', `${file} is decorative by default`);
      assert.equal(svg.getAttribute('focusable'), 'false', `${file} cannot receive focus`);
      assert.match(source, /currentColor/, `${file} inherits the control color`);
      assert.doesNotMatch(source, /<(?:script|foreignObject)\b/i, `${file} has no executable content`);
      assert.doesNotMatch(source, /\b(?:href|src)\s*=/i, `${file} has no external references`);
      dom.window.close();
    }
  });

  it('documents accessible link and standalone SVG patterns', async () => {
    const fs = await import('node:fs');
    const readme = fs.readFileSync(new URL('../public/assets/icons/share/README.md', import.meta.url), 'utf8');

    assert.match(readme, /aria-label="Share on X/);
    assert.match(readme, /aria-label="Share on LinkedIn/);
    assert.match(readme, /aria-label="Share by email/);
    assert.match(readme, /alt=""/);
    assert.match(readme, /role="img" aria-labelledby=/);
  });
});

describe('article metadata output', () => {
  it('includes Open Graph and Twitter Card tags with matching image', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const html = fs.readFileSync(path.join(__dirname, '../public/articles/the-trust-layer/index.html'), 'utf8');

    assert.match(html, /<meta property="og:title" content="The Trust Layer — Lupine Science">/);
    assert.match(html, /<meta property="og:type" content="video\.other">/);
    assert.match(html, /<meta property="og:url" content="https:\/\/lupine\.science\/articles\/the-trust-layer\/">/);
    assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/videos\/the-trust-layer-poster\.jpg\?v=2">/);
    assert.match(html, /<meta property="og:image:width" content="1200">/);
    assert.match(html, /<meta property="og:image:height" content="630">/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
    assert.match(html, /<meta name="twitter:title" content="The Trust Layer — Lupine Science">/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/lupine\.science\/videos\/the-trust-layer-poster\.jpg\?v=2">/);
  });

  it('links the share component stylesheet and module script', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const html = fs.readFileSync(path.join(__dirname, '../public/articles/the-trust-layer/index.html'), 'utf8');

    assert.match(html, /<link rel="stylesheet" href="\/components\/share\/share\.css">/);
    assert.match(html, /import \{ initAllShareWidgets \} from "\/components\/share\/share\.mjs"/);
  });
});
