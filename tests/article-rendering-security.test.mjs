import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { renderArticleMarkdown } = await import(path.join(ROOT, 'scripts', 'lib', 'article-markdown.mjs'));

describe('article Markdown rendering security', () => {
  it('escapes invalid KaTeX instead of returning executable error input', () => {
    const html = renderArticleMarkdown(String.raw`$\bad{<img src=x onerror=alert(1)>}$`);

    assert.doesNotMatch(html, /<img\b/i);
    assert.doesNotMatch(html, /<[^>]+\sonerror\s*=/i);
    assert.match(html, /&lt;img/);
  });

  it('fails closed when article Markdown contains an executable HTML element', () => {
    assert.throws(
      () => renderArticleMarkdown('<script>alert("unsafe")</script>'),
      /unsafe raw HTML/i,
    );
  });

  it('fails closed when otherwise allowed raw HTML contains an event handler', () => {
    assert.throws(
      () => renderArticleMarkdown('<p class="lead" onmouseover="alert(1)">Unsafe</p>'),
      /unsafe raw HTML/i,
    );
  });

  it('fails closed when a raw HTML link uses an executable URL scheme', () => {
    assert.throws(
      () => renderArticleMarkdown('<a href="javascript:alert(1)">Unsafe</a>'),
      /unsafe raw HTML/i,
    );
  });

  it('fails closed when a raw HTML link escapes to a protocol-relative origin', () => {
    assert.throws(
      () => renderArticleMarkdown('<a href="//attacker.example/payload">Unsafe</a>'),
      /unsafe raw HTML/i,
    );
  });

  it('preserves the reviewed raw HTML used by published articles', () => {
    const html = renderArticleMarkdown('<a href="/safe.pdf" download>Download</a>');

    assert.match(html, /href="\/safe\.pdf"/);
    assert.match(html, /download/);
  });
});
