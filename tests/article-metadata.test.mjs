import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'articles');
const VIDEOS = path.join(ROOT, 'public', 'videos');

// eslint-disable-next-line no-underscore-dangle
const __extractMeta = await import(path.join(ROOT, 'scripts', 'build-articles.mjs')).then(m => m.__extractMeta).catch(() => undefined);

function readArticle(slug) {
  return fs.readFileSync(path.join(OUT, slug, 'index.html'), 'utf8');
}

function publishedVideoSlugs() {
  return fs.readdirSync(VIDEOS)
    .filter((name) => name.endsWith('.mp4'))
    .map((name) => name.replace(/\.mp4$/, ''));
}

function jsonLdFrom(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

describe('article top-line metadata', () => {
  it('renders a "Research note" kicker for articles', () => {
    const html = readArticle('a-field-not-a-neural-net');
    assert.match(html, /<p class="article-kicker"[^>]*>\s*Research note\s*<\/p>/i);
  });

  it('renders the deck from Deck metadata directly under the title', () => {
    const html = readArticle('from-fantasy-frameworks-to-makeable-materials');
    assert.match(html, /<p class="article-deck">/);
    assert.match(html, /Metal[–\s]organic frameworks/i);
  });

  it('renders date and normalized status as a list for screen readers', () => {
    const html = readArticle('from-fantasy-frameworks-to-makeable-materials');
    assert.match(html, /<ul class="article-byline" aria-label="Publication details">/);
    assert.match(html, /<time datetime="2026-06-25">June 25, 2026<\/time>/);
    assert.match(html, /<span class="article-status">Draft<\/span>/);
  });

  it('normalizes published status to a single public label', () => {
    const html = readArticle('why-lupine-science');
    assert.match(html, /<span class="article-status">Published<\/span>/);
  });

  it('never exposes the Audience field to readers', () => {
    const html = readArticle('a-field-not-a-neural-net');
    assert.doesNotMatch(html, /audience/i);
  });

  it('still renders a "Research note" kicker when Type is missing', () => {
    const html = readArticle('why-lupine-science');
    assert.match(html, /<p class="article-kicker"[^>]*>\s*Research note\s*<\/p>/i);
  });

  it('keeps the byline accessible when only a date is present', () => {
    const html = readArticle('the-trust-layer');
    assert.match(html, /<ul class="article-byline"[^>]*>.*<time datetime="[^"]+">[^<]+<\/time>/s);
  });

  it('applies the kicker, title, deck, and byline stack in the correct order', () => {
    const html = readArticle('a-field-not-a-neural-net');
    const kicker = html.match(/<p class="article-kicker"[^>]*>.*?<\/p>/s)?.[0] || '';
    const title = html.match(/<h1>.*?<\/h1>/s)?.[0] || '';
    const deck = html.match(/<p class="article-deck">.*?<\/p>/s)?.[0] || '';
    const byline = html.match(/<ul class="article-byline"[^>]*>.*?<\/ul>/s)?.[0] || '';
    assert.ok(kicker.length && title.length && deck.length && byline.length, 'expected kicker, title, deck, and byline');
    assert.ok(html.indexOf(kicker) < html.indexOf(title), 'kicker must come before title');
    assert.ok(html.indexOf(title) < html.indexOf(deck), 'title must come before deck');
    assert.ok(html.indexOf(deck) < html.indexOf(byline), 'deck must come before byline');
  });
});

describe('index metadata line', () => {
  it('normalizes article status on the index card', () => {
    const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
    assert.match(html, /class="d8"[^>]*>[^<]*Draft<\/span>/);
  });
});

describe('published article video discovery metadata', () => {
  it('advertises every published MP4 from its article head', () => {
    for (const slug of publishedVideoSlugs()) {
      const html = readArticle(slug);
      assert.match(
        html,
        new RegExp(`<link rel="alternate" type="video/mp4" href="https://lupine\\.science/videos/${slug}\\.mp4">`),
        `expected alternate video link for ${slug}`,
      );
    }
  });

  it('adds a valid VideoObject for every published MP4', () => {
    for (const slug of publishedVideoSlugs()) {
      const html = readArticle(slug);
      const nodes = jsonLdFrom(html).flatMap((data) => data['@graph'] || [data]);
      const video = nodes.find((node) => node['@type'] === 'VideoObject');

      assert.ok(video, `expected VideoObject for ${slug}`);
      assert.ok(video.name, `expected VideoObject.name for ${slug}`);
      assert.ok(video.description, `expected VideoObject.description for ${slug}`);
      assert.equal(video.contentUrl, `https://lupine.science/videos/${slug}.mp4`);
      assert.equal(video.embedUrl, `https://lupine.science/articles/${slug}/`);
      assert.equal(video.uploadDate, nodes.find((node) => node['@type'] === 'Article')?.datePublished);
      assert.match(video.thumbnailUrl, /^https:\/\/lupine\.science\//);
    }
  });

  it('does not advertise a video for an article without a published MP4', () => {
    // All current articles have published MP4s, so this invariant is checked
    // positively above. The negative case is preserved as a guardrail for
    // future articles that may not have videos.
    const published = new Set(publishedVideoSlugs());
    for (const entry of fs.readdirSync(OUT, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const slug = entry.name;
      const html = readArticle(slug);
      if (published.has(slug)) {
        assert.match(
          html,
          new RegExp(`<link rel="alternate" type="video/mp4" href="https://lupine\\.science/videos/${slug}\\.mp4">`),
          `expected alternate video link for ${slug}`,
        );
      } else {
        assert.doesNotMatch(html, /<link rel="alternate" type="video\/mp4"/);
      }
    }
  });
});
