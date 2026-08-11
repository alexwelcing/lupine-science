// brand-header.test.mjs — checks the site-header helper.
//
// The brand SVG and the primary nav were inlined identically in three
// builders (build-atlas-page.mjs, build-atlas-detail-pages.mjs,
// build-claim-facets.mjs) before ATX-CLEANUP. This helper closes that
// duplication and ensures any future brand change happens in one place.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { renderSiteHeader } from '../scripts/lib/brand-header.mjs';

describe('brand-header helper', () => {
  it('emits a <header class="site-header"> with the brand SVG and nav', () => {
    const html = renderSiteHeader();
    assert.match(html, /^<header class="site-header">/);
    assert.match(html, /<\/header>$/);
    assert.ok(html.includes('viewBox="100 44 312 440"'), 'brand SVG present');
    assert.ok(html.includes('Lupine Science'), 'brand label present');
  });

  it('marks the matching nav link as aria-current="page"', () => {
    // ariaCurrentPath "/atlas/claims/" matches the default Atlas nav link
    // (href "/atlas/") because the helper matches by prefix.
    const html = renderSiteHeader({ ariaCurrentPath: '/atlas/claims/' });
    // The Atlas <a> should carry aria-current="page".
    const atlasLink = html.match(/<a href="\/atlas\/" aria-current="page">/);
    assert.ok(atlasLink, 'Atlas nav link has aria-current="page"');
    // Home (href "/") should not have aria-current (it's not a prefix of /atlas/claims/).
    const homeLink = html.match(/<a href="\/" aria-current/);
    assert.ok(!homeLink, 'Home link does not have aria-current');
  });

  it('does not mark the root Home link as current even when path starts with /', () => {
    // /articles/foo/ starts with "/" but the helper explicitly excludes "/"
    // from prefix matches (otherwise every path would highlight Home).
    const html = renderSiteHeader({ ariaCurrentPath: '/articles/foo/' });
    const homeLink = html.match(/<a href="\/" aria-current/);
    assert.ok(!homeLink, 'Home link never gets aria-current');
  });

  it('emits an exact-current match when ariaCurrentPath equals a link href', () => {
    const html = renderSiteHeader({ ariaCurrentPath: '/articles/' });
    const articlesLink = html.match(/<a href="\/articles\/" aria-current="page">/);
    assert.ok(articlesLink);
  });

  it('customizes brand label and tagline', () => {
    const html = renderSiteHeader({
      brandLabel: 'Custom Brand',
      brandTagline: 'a tagline',
    });
    assert.ok(html.includes('Custom Brand'), 'custom brand label rendered');
    assert.ok(html.includes('a tagline'), 'custom tagline rendered');
  });

  it('escapes special characters in brand label to prevent attribute injection', () => {
    // Brand labels are operator-controlled but the helper must not
    // silently emit broken HTML if a future caller passes a weird value.
    const html = renderSiteHeader({
      brandLabel: '<script>alert(1)</script>',
    });
    assert.ok(!html.includes('<script>alert(1)</script>'), 'script tag must be escaped');
    assert.ok(html.includes('&lt;script&gt;'), 'escaped form present');
  });

  it('escapes special characters in link labels', () => {
    const html = renderSiteHeader({
      links: [{ href: '/x/', label: 'A & B' }],
    });
    // The label "A & B" should be escaped as "A &amp; B" in the markup
    // (link labels use escapeAttr which encodes &). The href is also
    // escaped.
    assert.ok(html.includes('A &amp; B'));
  });

  it('keeps the helper byte-deterministic across calls with the same inputs', () => {
    const a = renderSiteHeader({ ariaCurrentPath: '/atlas/' });
    const b = renderSiteHeader({ ariaCurrentPath: '/atlas/' });
    assert.equal(a, b);
  });
});
