// brand-header.test.mjs — checks the site chrome helper.
//
// The brand SVG, the primary nav and the footer were inlined separately in
// build-articles.mjs and the atlas builders. This helper closes that
// duplication and ensures any future brand, nav or footer change happens in
// one place.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { renderSiteHeader, renderSiteFooter, SITE_NAV, FOOTER_LINKS } from '../scripts/lib/brand-header.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('brand-header helper', () => {
  it('emits a <header class="site-header"> with the brand SVG and nav', () => {
    const html = renderSiteHeader();
    assert.match(html, /^<header class="site-header">/);
    assert.match(html, /<\/header>$/);
    assert.ok(html.includes('viewBox="100 44 312 440"'), 'brand SVG present');
    assert.ok(html.includes('Lupine Science'), 'brand label present');
  });

  it('carries the one-question-per-page nav: Home · Results · Articles · About · Library · LUPI', () => {
    const html = renderSiteHeader({ showVideos: false });
    const labels = [...html.matchAll(/<a href="[^"]+"[^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
    assert.deepEqual(labels, ['Home', 'Results', 'Articles', 'About', 'Library', 'LUPI']);
    assert.deepEqual(SITE_NAV.filter((l) => l.href !== '/videos/').map((l) => l.label), labels);
  });

  it('marks the matching nav link as aria-current="page"', () => {
    // ariaCurrentPath "/results/" matches the Results nav link exactly, and a
    // sub-path matches by prefix.
    const html = renderSiteHeader({ ariaCurrentPath: '/results/' });
    assert.ok(html.match(/<a href="\/results\/" aria-current="page">/), 'Results nav link has aria-current="page"');
    const sub = renderSiteHeader({ ariaCurrentPath: '/articles/why-lupi/' });
    assert.ok(sub.match(/<a href="\/articles\/" aria-current="page">/), 'Articles matches an article path');
    // Home (href "/") should not have aria-current (it's not a prefix match).
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

  it('drops the Videos nav item when no film is listed', () => {
    assert.match(renderSiteHeader(), /<a href="\/videos\/">Videos<\/a>/);
    const html = renderSiteHeader({ showVideos: false });
    assert.doesNotMatch(html, /\/videos\//);
    assert.match(html, /<a href="\/articles\/">Articles<\/a>/);
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

describe('site footer helper', () => {
  const html = renderSiteFooter({ email: { user: 'alex', domain: 'lupinesci.com' }, name: 'Lupine Science' });

  it('links Home · Results · Articles · About · Corrections · Library · LUPI · GitHub', () => {
    const nav = html.match(/<nav class="foot-nav" aria-label="Footer">([\s\S]*?)<\/nav>/)?.[1] || '';
    const labels = [...nav.matchAll(/>([^<]+)<\/a>/g)].map((m) => m[1]);
    assert.deepEqual(labels, ['Home', 'Results', 'Articles', 'About', 'Corrections', 'Library', 'LUPI', 'GitHub']);
    assert.deepEqual(FOOTER_LINKS.map((l) => l.label), labels);
    assert.doesNotMatch(html, /\/videos\//, 'the footer never offers /videos/');
  });

  it('carries the name and address only, without a mailto: in the markup', () => {
    assert.match(html, /<span class="contact">Lupine Science · <a class="mail" href="\/about\/#contact" data-u="alex" data-d="lupinesci\.com">alex \[at\] lupinesci\.com<\/a><\/span>/);
    assert.doesNotMatch(html, /mailto:/);
    // the neutral contact line belongs to contact blocks, not every page
    assert.doesNotMatch(html, /investor/i);
    assert.doesNotMatch(html, /Research partners/);
  });

  it('leaves the neutral contact line to /about/#contact and llms.txt', () => {
    const line = 'Research partners, model builders, press and investors: ';
    const read = (...parts) => fs.readFileSync(path.join(ROOT, 'public', ...parts), 'utf8');
    const about = read('about', 'index.html');
    assert.match(about, /<div id="contact"><dt>Contact<\/dt><dd>Research partners, model builders, press and investors: <a class="mail"/);
    assert.ok(read('llms.txt').includes(`- Contact: ${line}alex@lupinesci.com`), 'llms.txt contact');
    for (const page of [['index.html'], ['about', 'index.html'], ['articles', 'index.html'], ['corrections', 'index.html']]) {
      const foot = read(...page).match(/<footer class="foot">[\s\S]*?<\/footer>/)?.[0] || '';
      assert.ok(foot.length > 0, `${page.join('/')} has a footer`);
      assert.doesNotMatch(foot, /investor/i, `${page.join('/')} footer names investors`);
    }
  });
});
