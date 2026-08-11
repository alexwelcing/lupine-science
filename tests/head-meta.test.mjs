// head-meta.test.mjs — checks the title-segment + render helper.
//
// The whole point of these helpers is to close the title-consistency
// defect class that fired on PR #66 and PR #67: every builder previously
// emitted <title>, og:title and twitter:title by hand, and the smoke
// gate caught two cases where og/twitter was missing a trailing segment.
// These tests pin down the contract so a future builder can't re-introduce
// the bug by mistake.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_SEPARATOR,
  headMetaTitleSegments,
  renderHeadMetaTags,
  escapeHtml,
  escapeAttrContent,
} from '../scripts/lib/head-meta.mjs';

describe('head-meta helper', () => {
  describe('escapeHtml', () => {
    it('encodes & as &amp;', () => {
      assert.equal(escapeHtml('A & B'), 'A &amp; B');
    });
    it('encodes < and > as &lt; and &gt;', () => {
      assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
    });
    it('encodes " and \' as &quot; and &#39;', () => {
      assert.equal(escapeHtml('"hi" \'ok\''), '&quot;hi&quot; &#39;ok&#39;');
    });
    it('does not double-encode existing entities (caller responsibility)', () => {
      // escapeHtml is a simple .replace chain; it does NOT decode-then-reencode.
      // This is the conservative choice for content we control. Documented behavior.
      assert.equal(escapeHtml('A &amp; B'), 'A &amp;amp; B');
    });
  });

  describe('escapeAttrContent', () => {
    it('encodes < > " \' but NOT & (intentional asymmetry)', () => {
      // escapeAttrContent mirrors the smoke gate's normalize behavior:
      // <title> gets &amp; decoded, og/twitter attributes do not. So we
      // emit raw & on the attribute side to keep both sides equal after
      // normalization.
      assert.equal(escapeAttrContent('A & B'), 'A & B');
      assert.equal(escapeAttrContent('<a>'), '&lt;a&gt;');
      assert.equal(escapeAttrContent('"x"'), '&quot;x&quot;');
      assert.equal(escapeAttrContent("'y'"), '&#39;y&#39;');
    });
  });

  describe('headMetaTitleSegments', () => {
    it('returns all three forms equal when no prefix', () => {
      const s = headMetaTitleSegments({ primary: 'A', suffix: 'Lupine Science' });
      assert.equal(s.title, 'A \u2014 Lupine Science');
      assert.equal(s.ogTitle, 'A \u2014 Lupine Science');
      assert.equal(s.twitterTitle, 'A \u2014 Lupine Science');
      assert.equal(s.separator, DEFAULT_SEPARATOR);
    });

    it('returns all three forms equal when prefix is set', () => {
      const s = headMetaTitleSegments({ primary: 'Validation-data gap', prefix: 'T6', suffix: 'Lupine Science' });
      assert.equal(s.title, 'T6 \u2014 Validation-data gap \u2014 Lupine Science');
      assert.equal(s.ogTitle, 'T6 \u2014 Validation-data gap \u2014 Lupine Science');
      assert.equal(s.twitterTitle, 'T6 \u2014 Validation-data gap \u2014 Lupine Science');
    });

    it('respects a custom separator (claim-facets uses " - ")', () => {
      const s = headMetaTitleSegments({
        primary: 'Systematic biases - Lupine research claims',
        suffix: 'Lupine Science',
        separator: ' - ',
      });
      assert.equal(s.title, 'Systematic biases - Lupine research claims - Lupine Science');
    });

    it('throws when primary is missing', () => {
      assert.throws(() => headMetaTitleSegments({ suffix: 'X' }), /primary is required/);
    });

    it('throws when suffix is missing', () => {
      assert.throws(() => headMetaTitleSegments({ primary: 'X' }), /suffix is required/);
    });
  });

  describe('renderHeadMetaTags', () => {
    it('emits <title> with full HTML escaping (& -> &amp;)', () => {
      const segments = headMetaTitleSegments({
        primary: 'Strong correlation & self-interaction',
        prefix: 'E1',
        suffix: 'Lupine Science',
      });
      const html = renderHeadMetaTags(segments);
      // The <title> tag uses escapeHtml -> & encoded as &amp;
      assert.match(html, /<title>E1 \u2014 Strong correlation &amp; self-interaction \u2014 Lupine Science<\/title>/);
    });

    it('emits og:title with attribute escaping (& NOT encoded)', () => {
      const segments = headMetaTitleSegments({
        primary: 'Strong correlation & self-interaction',
        prefix: 'E1',
        suffix: 'Lupine Science',
      });
      const html = renderHeadMetaTags(segments);
      // The og:title attribute uses escapeAttrContent -> & stays raw.
      // This is the asymmetry that makes <title> and og:title equal
      // post-normalization (smoke gate decodes &amp; in <title> but
      // not in og:title).
      assert.match(html, /<meta property="og:title" content="E1 \u2014 Strong correlation & self-interaction \u2014 Lupine Science">/);
    });

    it('emits twitter:title with the same attribute-encoding rules', () => {
      const segments = headMetaTitleSegments({
        primary: 'A',
        suffix: 'Lupine Science',
      });
      const html = renderHeadMetaTags(segments);
      assert.match(html, /<meta name="twitter:title" content="A \u2014 Lupine Science">/);
    });

    it('emits canonical + og:url when opts.url is set', () => {
      const segments = headMetaTitleSegments({ primary: 'A', suffix: 'Lupine Science' });
      const html = renderHeadMetaTags(segments, { url: 'https://lupine.science/atlas/' });
      assert.match(html, /<link rel="canonical" href="https:\/\/lupine\.science\/atlas\/">/);
      assert.match(html, /<meta property="og:url" content="https:\/\/lupine\.science\/atlas\/">/);
    });

    it('omits canonical and og:url when opts.url is unset', () => {
      const segments = headMetaTitleSegments({ primary: 'A', suffix: 'Lupine Science' });
      const html = renderHeadMetaTags(segments);
      assert.ok(!html.includes('canonical'), 'no canonical tag when url unset');
      assert.ok(!html.includes('og:url'), 'no og:url tag when url unset');
    });

    it('throws when segments is missing', () => {
      assert.throws(() => renderHeadMetaTags(null), /segments is required/);
    });

    it('the three title forms are byte-identical after normalize()', () => {
      // This is the regression the helper exists to prevent: a builder
      // emitting og/twitter title with literal &amp; while <title>
      // decodes to & would fail the smoke gate's title-consistency check.
      // With escapeAttrContent used for og/twitter, both sides end up
      // as raw & post-normalization.
      const segments = headMetaTitleSegments({
        primary: 'Cement & concrete',
        prefix: 'MC8',
        suffix: 'Lupine Science',
      });
      const html = renderHeadMetaTags(segments);
      // Simulate the smoke gate's normalize(): replace &amp; with &.
      const normalized = html.replace(/&amp;/g, '&');
      const titleMatch = normalized.match(/<title>([^<]+)<\/title>/);
      const ogMatch = normalized.match(/<meta property="og:title" content="([^"]+)">/);
      const twitterMatch = normalized.match(/<meta name="twitter:title" content="([^"]+)">/);
      assert.ok(titleMatch && ogMatch && twitterMatch, 'all three title tags present');
      assert.equal(titleMatch[1], ogMatch[1], '<title> matches og:title post-normalize');
      assert.equal(titleMatch[1], twitterMatch[1], '<title> matches twitter:title post-normalize');
    });
  });
});
