import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { JSDOM } from 'jsdom';
import {
  encodeQuery,
  buildShareActions,
  copyUrlToClipboard,
  initShare,
} from '../public/components/share/share.mjs';

const SHARE_ICON_FILES = ['bluesky.svg', 'x.svg', 'linkedin.svg', 'copy-link.svg', 'email.svg'];

/**
 * Share-component unit tests
 *
 * These tests exercise the pure parts of the share widget (URL/query encoding,
 * share-action generation, and the clipboard copy fallback). They do not
 * require a browser; jsdom supplies the minimal DOM needed for the fallback
 * path.
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

  it('returns five actions in the expected order', () => {
    assert.deepEqual(actions.map((a) => a.slug), ['bluesky', 'x', 'linkedin', 'copy', 'email']);
  });

  it('uses the Bluesky intent compose URL with title and URL separated by a space', () => {
    const bluesky = actions.find((a) => a.slug === 'bluesky');
    assert.equal(bluesky.href, 'https://bsky.app/intent/compose?text=The%20Trust%20Layer%20https%3A%2F%2Flupine.science%2Farticles%2Fthe-trust-layer%2F');
  });

  it('uses the X intent tweet URL with separate text and url parameters', () => {
    const x = actions.find((a) => a.slug === 'x');
    assert.equal(x.href, 'https://twitter.com/intent/tweet?text=The%20Trust%20Layer&url=https%3A%2F%2Flupine.science%2Farticles%2Fthe-trust-layer%2F');
  });

  it('uses the LinkedIn share-offsite URL with only the encoded URL', () => {
    const linkedin = actions.find((a) => a.slug === 'linkedin');
    assert.equal(linkedin.href, 'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Flupine.science%2Farticles%2Fthe-trust-layer%2F');
  });

  it('marks the copy action and gives it a placeholder href', () => {
    const copy = actions.find((a) => a.slug === 'copy');
    assert.equal(copy.isCopy, true);
    assert.equal(copy.href, '#copy');
  });

  it('builds a mailto URL with encoded subject and body', () => {
    const email = actions.find((a) => a.slug === 'email');
    assert.equal(email.href, 'mailto:?subject=The%20Trust%20Layer&body=https%3A%2F%2Flupine.science%2Farticles%2Fthe-trust-layer%2F');
  });

  it('marks external social links with target and rel for security', () => {
    for (const slug of ['bluesky', 'x', 'linkedin']) {
      const action = actions.find((a) => a.slug === slug);
      assert.equal(action.target, '_blank');
      assert.equal(action.rel, 'noopener noreferrer');
    }
  });
});

describe('copyUrlToClipboard', () => {
  it('falls back to textarea + execCommand when navigator.clipboard is unavailable', async () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'https://lupine.science/articles/the-trust-layer/',
    });
    const document = dom.window.document;
    const navigator = dom.window.navigator;
    let execCalled = false;
    document.execCommand = (command) => {
      if (command === 'copy') {
        execCalled = true;
        return true;
      }
      return false;
    };
    // Patch the module to use the jsdom document/navigator
    const ok = await copyUrlToClipboard.call({ document, navigator }, 'https://lupine.science/articles/the-trust-layer/');
    assert.equal(ok, true);
    assert.equal(execCalled, true);
    // textarea should be removed after the copy attempt
    assert.equal(document.querySelectorAll('textarea').length, 0);
  });

  it('returns false when the fallback execCommand fails', async () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'https://lupine.science/articles/the-trust-layer/',
    });
    const document = dom.window.document;
    const navigator = dom.window.navigator;
    document.execCommand = () => false;

    const ok = await copyUrlToClipboard.call({ document, navigator }, 'https://lupine.science/articles/the-trust-layer/');
    assert.equal(ok, false);
    assert.equal(document.querySelectorAll('textarea').length, 0);
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

      assert.equal(root.querySelectorAll('a[aria-label]').length, 4);
      assert.equal(root.querySelectorAll('button[aria-label="Copy link"]').length, 1);
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

  it('documents accessible link, button, image, and standalone SVG patterns', async () => {
    const fs = await import('node:fs');
    const readme = fs.readFileSync(new URL('../public/assets/icons/share/README.md', import.meta.url), 'utf8');

    assert.match(readme, /aria-label="Share on Bluesky/);
    assert.match(readme, /aria-label="Copy link"/);
    assert.match(readme, /alt=""/);
    assert.match(readme, /role="img" aria-labelledby=/);
    assert.match(readme, /role="status" aria-live="polite"/);
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
    assert.match(html, /<meta property="og:type" content="article">/);
    assert.match(html, /<meta property="og:url" content="https:\/\/lupine\.science\/articles\/the-trust-layer\/">/);
    assert.match(html, /<meta property="og:image" content="https:\/\/lupine\.science\/og-lupine-science\.png\?v=2">/);
    assert.match(html, /<meta property="og:image:width" content="1200">/);
    assert.match(html, /<meta property="og:image:height" content="630">/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
    assert.match(html, /<meta name="twitter:title" content="The Trust Layer — Lupine Science">/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/lupine\.science\/og-lupine-science\.png\?v=2">/);
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
