import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCUMENT_STATUSES, documentStatus } from '../scripts/lib/discovery.mjs';
import { UNLISTED_FILMS } from '../scripts/lib/film-listing.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'articles');
const OUT = path.join(ROOT, 'public', 'articles');
const VIDEOS = path.join(ROOT, 'public', 'videos');

function readArticle(slug) {
  return fs.readFileSync(path.join(OUT, slug, 'index.html'), 'utf8');
}

function sourceSlugs() {
  return fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort();
}

function sourceMeta(slug, field) {
  const source = fs.readFileSync(path.join(SRC, `${slug}.md`), 'utf8');
  return source.match(new RegExp(`^> \\*\\*${field}:\\*\\*\\s*(.+?)\\s*$`, 'm'))?.[1];
}

function statusOf(slug) {
  return documentStatus(sourceMeta(slug, 'Status'));
}

// Films with a generated /videos/<slug>/ page are the listed ones.
function listedVideoSlugs() {
  return fs.readdirSync(VIDEOS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(VIDEOS, entry.name, 'index.html')))
    .map((entry) => entry.name);
}

function jsonLdFrom(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

describe('document status taxonomy', () => {
  it('gives every article exactly one status from the closed list', () => {
    for (const slug of sourceSlugs()) {
      const raw = sourceMeta(slug, 'Status');
      assert.ok(raw, `${slug} has no Status line`);
      assert.ok(DOCUMENT_STATUSES.includes(raw), `${slug}: Status "${raw}" is not one of ${DOCUMENT_STATUSES.join(' / ')}`);
    }
  });

  it('rejects the retired editorial labels instead of guessing', () => {
    for (const legacy of ['Final', 'Live', 'Live evidence', 'Draft', 'Draft for discussion', 'In review', 'FOR EDITOR REVIEW', 'Poster abstract accepted']) {
      assert.throws(() => documentStatus(legacy), /not one of/);
    }
  });

  it('renders the plain status in the byline', () => {
    for (const slug of sourceSlugs()) {
      const status = statusOf(slug);
      const html = readArticle(slug);
      assert.match(html, new RegExp(`<span class="article-status status-[a-z-]+">${status}</span>`), slug);
    }
  });

  it('labels Direction pieces with the one-line meaning', () => {
    for (const slug of sourceSlugs().filter((s) => statusOf(s) === 'Direction')) {
      assert.match(readArticle(slug), /<aside class="callout info article-direction"[^>]*><strong>Direction\.<\/strong> Describes where this work is aimed\. Not a result\.<\/aside>/, slug);
    }
  });

  it('keeps Archived pages at their URL behind a dated banner and noindex', () => {
    const archived = sourceSlugs().filter((s) => statusOf(s) === 'Archived');
    assert.ok(archived.length > 0, 'expected at least one archived article');
    const index = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
    const feed = fs.readFileSync(path.join(ROOT, 'public', 'feed.xml'), 'utf8');
    const llms = fs.readFileSync(path.join(ROOT, 'public', 'llms.txt'), 'utf8');
    const sitemap = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8');
    const about = fs.readFileSync(path.join(ROOT, 'public', 'about', 'index.html'), 'utf8');
    const home = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
    for (const slug of archived) {
      const html = readArticle(slug);
      assert.match(html, /<meta name="robots" content="noindex,follow">/, slug);
      assert.match(html, /<aside class="callout warning article-archived"[^>]*><strong>Archived <time datetime="\d{4}-\d{2}-\d{2}">/, slug);
      assert.match(html, /Read the current version →<\/a>/, slug);
      const route = `/articles/${slug}/`;
      for (const [name, surface] of [['/articles/', index], ['feed.xml', feed], ['llms.txt', llms], ['sitemap.xml', sitemap], ['/about/', about], ['homepage', home]]) {
        assert.equal(surface.includes(route), false, `${slug} is archived but still listed on ${name}`);
      }
    }
  });

  it('lets every non-archived page be indexed', () => {
    for (const slug of sourceSlugs().filter((s) => statusOf(s) !== 'Archived')) {
      assert.match(readArticle(slug), /<meta name="robots" content="index,follow">/, slug);
    }
  });
});

describe('article top-line metadata', () => {
  it('renders a "Research note" kicker when Type is missing', () => {
    const html = readArticle('what-error-patterns-can-tell-us');
    assert.match(html, /<p class="article-kicker"[^>]*>\s*Research note\s*<\/p>/i);
  });

  it('renders the deck from Deck metadata directly under the title', () => {
    const html = readArticle('from-fantasy-frameworks-to-makeable-materials');
    assert.match(html, /<p class="article-deck">/);
    assert.match(html, /Metal[–\s]organic frameworks/i);
  });

  it('renders date and status as a list for screen readers', () => {
    const html = readArticle('from-fantasy-frameworks-to-makeable-materials');
    assert.match(html, /<ul class="article-byline" aria-label="Publication details">/);
    assert.match(html, /<time datetime="2026-06-25">/);
    assert.match(html, /<span class="article-status status-direction">Direction<\/span>/);
  });

  it('preserves the original date and renders a separate update date', () => {
    const slug = 'critical-minerals-pfas-and-the-remediation-imperative';
    const updated = sourceMeta(slug, 'Updated');
    const html = readArticle(slug);
    assert.match(html, /Originally published <time datetime="2026-07-16">July 16, 2026<\/time>/);
    assert.match(html, new RegExp(`Updated <time datetime="${updated}">`));
    const nodes = jsonLdFrom(html).flatMap((data) => data['@graph'] || [data]);
    const article = nodes.find((node) => node['@type'] === 'Article');
    assert.equal(article.datePublished, '2026-07-16');
    assert.equal(article.dateModified, updated);
  });

  it('renders explicit evidence-gap metadata without claiming validation', () => {
    const html = readArticle('critical-minerals-pfas-and-the-remediation-imperative');
    assert.match(html, /class="callout warning article-evidence-status"/);
    assert.match(html, /not demonstrated Lupine outcomes/i);
  });

  it('never exposes the Audience field to readers', () => {
    for (const slug of sourceSlugs()) {
      assert.doesNotMatch(readArticle(slug).replace(/<script[\s\S]*?<\/script>/g, ''), /\bAudience:/, slug);
    }
  });

  it('keeps the byline accessible when only a date is present', () => {
    const html = readArticle('the-trust-layer');
    assert.match(html, /<ul class="article-byline"[^>]*>.*<time datetime="[^"]+">[^<]+<\/time>/s);
  });

  it('applies the kicker, title, deck, and byline stack in the correct order', () => {
    const html = readArticle('four-gates-three-honest-failures-one-live-experiment');
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

describe('article index', () => {
  const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');

  it('lists results and methods apart from Direction pieces', () => {
    const results = html.indexOf('id="results-title"');
    const direction = html.indexOf('id="direction-title"');
    assert.ok(results > 0 && direction > results, 'expected a Results section followed by a Direction section');
    for (const slug of sourceSlugs()) {
      const status = statusOf(slug);
      const at = html.indexOf(`<a class="article-card" href="/articles/${slug}/">`);
      if (status === 'Archived') {
        assert.equal(at, -1, `${slug} is archived but has a card`);
      } else if (status === 'Direction') {
        assert.ok(at > direction, `${slug} should be listed under Direction`);
      } else {
        assert.ok(at > results && at < direction, `${slug} should be listed under Results and methods`);
      }
    }
  });

  it('labels cards with the plain status and no verified styling', () => {
    assert.doesNotMatch(html, /is-published/);
    for (const m of html.matchAll(/class="card-status[^"]*">([^<]*)</g)) {
      assert.ok(DOCUMENT_STATUSES.includes(m[1]), `unexpected card status "${m[1]}"`);
    }
  });

  it('no longer offers the retired climate-series download', () => {
    assert.doesNotMatch(html, /proof-pack-climate-series/);
    assert.doesNotMatch(html, /prospectuses/i);
  });
});

describe('article video discovery metadata', () => {
  it('advertises every listed film from its article head', () => {
    for (const slug of listedVideoSlugs()) {
      const html = readArticle(slug);
      assert.match(
        html,
        new RegExp(`<link rel="alternate" type="video/mp4" href="https://lupine\\.science/videos/${slug}\\.mp4">`),
        `expected alternate video link for ${slug}`,
      );
      const nodes = jsonLdFrom(html).flatMap((data) => data['@graph'] || [data]);
      const video = nodes.find((node) => node['@type'] === 'VideoObject');
      assert.ok(video, `expected VideoObject for ${slug}`);
      assert.equal(video.contentUrl, `https://lupine.science/videos/${slug}.mp4`);
      assert.equal(video.embedUrl, `https://lupine.science/videos/${slug}/`);
      const article = nodes.find((node) => node['@type'] === 'Article');
      assert.equal(video.uploadDate, article?.dateModified || article?.datePublished);
      assert.match(video.thumbnailUrl, /^https:\/\/lupine\.science\//);
    }
  });

  it('neither embeds nor advertises an unlisted film', () => {
    const listed = new Set(listedVideoSlugs());
    const videoIndex = fs.readFileSync(path.join(VIDEOS, 'index.html'), 'utf8');
    const sitemap = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8');
    for (const slug of sourceSlugs()) {
      if (listed.has(slug)) continue;
      const html = readArticle(slug);
      assert.doesNotMatch(html, /<link rel="alternate" type="video\/mp4"/, slug);
      assert.doesNotMatch(html, /"@type":"VideoObject"/, slug);
      assert.doesNotMatch(html, /class="article-video-player"/, slug);
      assert.equal(videoIndex.includes(`/videos/${slug}/`), false, `${slug} is unlisted but on /videos/`);
      assert.equal(sitemap.includes(`/videos/${slug}/`), false, `${slug} is unlisted but in the sitemap`);
    }
    for (const slug of UNLISTED_FILMS.keys()) {
      assert.equal(listed.has(slug), false, `${slug} is on the unlisted-film list but has a video page`);
    }
  });
});

// These pages autoplayed muted hero films whose on-screen text made claims the
// pages no longer make (a retired tagline; an atom-count claim for LUPI). The
// films were removed; each page must render its text-free still hero instead.
describe('still article heroes', () => {
  for (const slug of ['why-lupine-science', 'why-lupi']) {
    it(`${slug} renders a captioned still hero, not a hero film`, () => {
      assert.equal(fs.existsSync(path.join(OUT, slug, 'hero.mp4')), false, `${slug}/hero.mp4 must stay removed`);
      const html = readArticle(slug);
      const hero = html.match(/<figure class="article-hero"[\s\S]*?<\/figure>/)?.[0];
      assert.ok(hero, `${slug}: expected an article hero`);
      assert.doesNotMatch(hero, /<video\b/, slug);
      assert.doesNotMatch(html, /hero\.mp4/, slug);
      assert.match(hero, new RegExp(`<img src="/articles/${slug}/hero\\.jpg`), slug);
      assert.match(hero, /<figcaption id="hero-caption">[^<]+<\/figcaption>/, slug);
    });
  }
});
