#!/usr/bin/env node
// Builds public/articles/<slug>/index.html + public/articles/index.html from
// articles/*.md. Replaces the former Python builder (unpinned dependency,
// injected a hero figure into every article whether or not its media
// existed). Conventions preserved: first blockquote = metadata block with
// "> **Date:** ..." lines; output is committed, CI checks determinism via
// `git diff --exit-code` after a rebuild.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import katexPlugin from 'markdown-it-katex';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'articles');
const PUBLIC_ROOT = process.env.LUPINE_BUILD_PUBLIC_ROOT
  ? path.resolve(process.env.LUPINE_BUILD_PUBLIC_ROOT)
  : path.join(ROOT, 'public');
const OUT = path.join(PUBLIC_ROOT, 'articles');
const SITE = 'https://lupine.science';

const KATEX_SRC = path.join(ROOT, 'node_modules', 'katex', 'dist');
const KATEX_OUT = path.join(PUBLIC_ROOT, 'katex');

// Cache-bust revision for article image assets. Bumping this forces browsers
// and any edge cache that keyed on the bare URL to fetch a fresh copy.
// v=3: BRAND-1 campaign replaced heroes on 11 articles + homepage (PR #29).
const ASSET_CACHE_BUST = '?v=3';

function bust(url) {
  if (!url || url.includes('?') || url.includes('#')) return url;
  return `${url}${ASSET_CACHE_BUST}`;
}

// Append the cache-bust query to local image URLs inside rendered Markdown.
// Matches <img src="images/...">, <source srcset="images/...">, and the
// equivalent absolute /articles/<slug>/... paths used by hero/picture helpers.
function bustInlineImages(html, slug) {
  const bustPath = (u) => {
    if (!u) return u;
    const trimmed = u.trim();
    if (trimmed.startsWith('images/') || trimmed.startsWith(`/articles/${slug}/`) || trimmed.startsWith(`${SITE}/articles/${slug}/`)) {
      return bust(trimmed);
    }
    return trimmed;
  };

  // <img src="..."> and <source srcset="...">
  return html
    .replace(/(<img\s+[^>]*src=")([^"]+)(")/gi, (m, pre, src, post) => `${pre}${bustPath(src)}${post}`)
    .replace(/(<source\s+[^>]*srcset=")([^"]+)(")/gi, (m, pre, srcset, post) => {
      const busted = srcset.split(',').map((part) => {
        const [url, ...desc] = part.trim().split(/\s+/);
        return [bustPath(url), ...desc].join(' ');
      }).join(', ');
      return `${pre}${busted}${post}`;
    });
}

function ensureKatexAssets() {
  if (!fs.existsSync(KATEX_SRC)) return false;
  fs.mkdirSync(KATEX_OUT, { recursive: true });
  for (const name of ['katex.min.css', 'fonts']) {
    const src = path.join(KATEX_SRC, name);
    const dst = path.join(KATEX_OUT, name);
    if (!fs.existsSync(src)) continue;
    if (fs.statSync(src).isDirectory()) {
      fs.cpSync(src, dst, { recursive: true, force: true, preserveTimestamps: true });
    } else {
      fs.copyFileSync(src, dst);
    }
  }
  return true;
}

// typographer: real quotes and apostrophes in prose (code blocks untouched)
const md = new MarkdownIt({ html: true, typographer: true })
  .use(footnote)
  .use(katexPlugin, { throwOnError: false, trust: false });

// Per-article hero captions. A hero figure is emitted only when the media
// files actually exist next to the article.
const HERO_CAPTIONS = {
  'water-and-air-correcting-the-molecules-we-drink-and-breathe':
    'A municipal water-treatment line and an urban air-filtration system sharing one civic cross-section, with the critical membrane and catalyst surfaces highlighted in indigo.',
  'methane-and-refrigerants-cutting-the-non-co2-climate-forcers':
    'A landfill gas well manifold feeding a sealed catalytic oxidation unit on a bare service pad — one indigo pipe route in, methane converted inside the vessel, no visible plume.',
  'critical-minerals-pfas-and-the-remediation-imperative':
    'A closed-loop water and mineral recovery facility: contaminated flow enters an ink-lined treatment train and separated critical minerals leave in small indigo sample trays.',
  'cement-concrete-and-the-weight-of-the-built-world':
    'Bridge, housing block, water conduit, and transit viaduct drawn as one continuous civic structure, with selected low-carbon binder zones highlighted in indigo.',
  'beyond-carbon-the-error-geometry-of-environmental-materials':
    'A civic systems atlas without labels: drinking-water works, air-treatment ducts, refrigerant plant, mineral recovery line, and concrete infrastructure joined by one sparse indigo evidence ribbon.',
  'the-02-percent-synthesis-problem':
    'A long laboratory bench with many empty ceramic sample boats entering a small tube furnace and one finished pellet in a coin-cell clamp — the narrow furnace-to-test route makes the physical synthesis bottleneck visible.',
  'a-field-not-a-neural-net':
    'A smooth field gradient over a sparse lattice: the measured error geometry of universal machine-learned interatomic potentials.',
  'five-materials-for-5-to-12-gtco2-year':
    'Five grounded infrastructure vignettes — battery storage, air-capture contactor, ammonia plant, solar field, and solid-state cell — connected by a quiet indigo verification line.',
  'from-predicted-crystal-to-commercial-cell':
    'A row of three grid-scale battery cabinets, the nearest a cutaway with one ceramic electrolyte plate seated between two flat electrodes, carrying the single indigo ion path.',
  'investing-in-the-trust-layer':
    'A narrow pilot pipeline from powder hopper through sintering furnace to a pressure-test fixture — one inspection gate admits only measured samples to the pilot press.',
  'why-lupine-science':
    'The launch film: from fantasy frameworks to makeable materials. Generated with AI tools, composited with open-source software — possibilities made trustworthy by process.',
  'from-fantasy-frameworks-to-makeable-materials':
    'A porous-framework powder batch moving from synthesis vessel through pellet press and stability chamber into one plain sorbent cartridge — material advances only if it survives every stage.',
  'the-order-is-right-the-size-is-wrong':
    'Five practical material coupons under paired spring gauges — each indigo predicted pointer stops below its ink measured pointer: correct ordering, systematically undersized response.',
  'the-trust-layer':
    'A load-bearing civic bridge whose hidden indigo layer is made of measurement, evidence, and verification modules: trust as literal infrastructure.',
  'rhizo-non-co2-climate-forcers-lean':
    'The Lupine Rhizo build status: 289 theorems, zero sorry, with non-CO₂ climate forcers now machine-checked in Lean 4.',
  'lupi-hfc-refrigerant-research-payloads':
    'A physical refrigeration loop — compressor, heat exchanger, and sealed refrigerant circuit — with indigo measurement traces and no readable interface text.',
  'the-savings-stack':
    'Many pale compute lanes converging into a compact shared evaluation backbone that feeds several materials programs: reuse instead of brute force.',
  'z1-union-debrief':
    'A row of solid-electrolyte coupons mounted in identical diffusion rigs, with a sparse set of shared reference pins anchoring the barrier comparison across the whole panel.',
  'an-order-of-effort':
    'A row of four increasingly specialized test bays — bulk compression, defect scanning, reaction vessel, interface microscopy — each material environment routed to the equipment its complexity requires.',
};

const MARK_SVG = `<svg viewBox="100 44 312 440" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="bb" x1="190" y1="74" x2="324" y2="356" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#88a7d8"/><stop offset=".35" stop-color="#475b9c"/><stop offset=".78" stop-color="#102f47"/><stop offset="1" stop-color="#071a2a"/>
    </linearGradient>
    <linearGradient id="bl" x1="150" y1="330" x2="360" y2="470" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7f907c"/><stop offset="1" stop-color="#4c653d"/>
    </linearGradient>
    <radialGradient id="bc" cx="48%" cy="30%" r="68%">
      <stop offset="0" stop-color="#fffdf3"/><stop offset=".7" stop-color="#f1e8c9"/><stop offset="1" stop-color="#d4c58f"/>
    </radialGradient>
  </defs>
  <g fill="none" stroke="#4c653d" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
    <path d="M256 148 C252 224 258 312 254 448"/><path d="M252 402 C222 372 178 354 124 348"/><path d="M260 402 C290 372 334 354 388 348"/>
  </g>
  <g fill="url(#bl)" opacity=".96">
    <ellipse cx="139" cy="348" rx="18" ry="62" transform="rotate(-78 139 348)"/><ellipse cx="167" cy="384" rx="18" ry="62" transform="rotate(-48 167 384)"/><ellipse cx="214" cy="410" rx="17" ry="58" transform="rotate(-20 214 410)"/><ellipse cx="373" cy="348" rx="18" ry="62" transform="rotate(78 373 348)"/><ellipse cx="345" cy="384" rx="18" ry="62" transform="rotate(48 345 384)"/><ellipse cx="298" cy="410" rx="17" ry="58" transform="rotate(20 298 410)"/>
  </g>
  <g fill="none" stroke="#fef8f5" stroke-width="5" stroke-linecap="round" opacity=".66">
    <path d="M132 348 C170 356 205 373 236 405"/><path d="M380 348 C342 356 307 373 276 405"/>
  </g>
  <g fill="url(#bb)" stroke="#fef8f5" stroke-width="5" stroke-linejoin="round">
    <ellipse cx="256" cy="86" rx="22" ry="34"/><ellipse cx="232" cy="122" rx="23" ry="35" transform="rotate(-24 232 122)"/><ellipse cx="280" cy="122" rx="23" ry="35" transform="rotate(24 280 122)"/><ellipse cx="256" cy="150" rx="30" ry="40"/><ellipse cx="211" cy="182" rx="26" ry="38" transform="rotate(-34 211 182)"/><ellipse cx="301" cy="182" rx="26" ry="38" transform="rotate(34 301 182)"/><ellipse cx="256" cy="216" rx="37" ry="48"/><ellipse cx="204" cy="256" rx="30" ry="43" transform="rotate(-42 204 256)"/><ellipse cx="308" cy="256" rx="30" ry="43" transform="rotate(42 308 256)"/><ellipse cx="256" cy="306" rx="40" ry="52"/>
  </g>
  <g fill="url(#bc)">
    <path d="M244 142 C251 124 261 124 268 142 C262 136 250 136 244 142Z"/><path d="M244 207 C252 186 263 186 271 207 C263 199 252 199 244 207Z"/><path d="M242 296 C252 272 265 272 274 296 C264 286 252 286 242 296Z"/>
  </g>
</svg>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[m - 1]} ${d}, ${y}`;
}

function extractMeta(raw) {
  const meta = {};
  for (const [key, name] of [
    ['type', 'Type'],
    ['date', 'Date'],
    ['deck', 'Deck'],
    ['summary', 'Summary'],
    ['scope', 'Scope'],          // legacy alias for Deck
    ['description', 'Description'], // legacy alias for Summary
    ['status', 'Status'],
    ['ogTitle', 'OG Title'],
    ['ogDescription', 'OG Description'],
    ['ogImage', 'OG Image'],
    ['ogUrl', 'OG URL'],
    ['ogType', 'OG Type'],
  ]) {
    const m = raw.match(new RegExp(`^> \\\*\\*${name}:\\\*\\*\\s*(.+?)\\s*$`, 'm'));
    if (m) meta[key] = m[1];
  }
  // Audience is intentionally not parsed: we do not label readers in public copy.
  return meta;
}

function formatStatus(status) {
  if (!status) return '';
  // Normalize common editorial states into a restrained public label.
  const lower = status.toLowerCase();
  if (lower.includes('draft')) return 'Draft';
  if (lower.includes('published') || lower.includes('final')) return 'Published';
  if (lower.includes('review') || lower.includes('revision')) return 'In review';
  return status;
}




function publishedVideoUrl(slug) {
  const mp4 = path.join(PUBLIC_ROOT, 'videos', `${slug}.mp4`);
  return fs.existsSync(mp4) ? `${SITE}/videos/${slug}.mp4` : undefined;
}

// Player label per video kind. Most article videos are narrated article
// summaries; the 2026-07-27 campaign placed five 28-second brand films
// (descriptive captions, no narration) — label them accurately.
const VIDEO_KIND = new Map([
  ['an-order-of-effort', 'Brand film'],
  ['the-materials-we-test-against', 'Brand film'],
  ['the-savings-stack', 'Brand film'],
  ['the-trust-layer', 'Brand film'],
  ['z1-union-debrief', 'Brand film'],
]);

function inlineVideoPlayer(slug, title, { detailLink = true } = {}) {
  const mp4Path = path.join(PUBLIC_ROOT, 'videos', `${slug}.mp4`);
  if (!fs.existsSync(mp4Path)) return '';
  const posterPath = path.join(PUBLIC_ROOT, 'videos', `${slug}-poster.jpg`);
  const vttPath = path.join(PUBLIC_ROOT, 'videos', `${slug}.vtt`);
  const hasPoster = fs.existsSync(posterPath);
  const hasCaptions = fs.existsSync(vttPath);
  const posterAttr = hasPoster ? ` poster="${bust(`/videos/${slug}-poster.jpg`)}"` : '';
  const captionsTrack = hasCaptions
    ? `    <track kind="captions" src="/videos/${slug}.vtt" srclang="en" label="English" default>\n`
    : '';
  const kind = VIDEO_KIND.get(slug) ?? 'Narrated summary';
  return `<figure class="article-video-player" aria-labelledby="video-label-${slug}">
  <figcaption id="video-label-${slug}" class="video-player-label">${kind}: ${esc(title)}</figcaption>
  <div class="video-player-frame">
    <video controls preload="none" width="1920" height="1080"${posterAttr} aria-describedby="video-label-${slug}">
      <source src="/videos/${slug}.mp4" type="video/mp4">
${captionsTrack}      <p>Your browser does not support the video tag. <a href="/videos/${slug}.mp4" download>Download the MP4</a>.</p>
    </video>
  </div>
  <p class="video-player-meta">${detailLink ? `<a href="/videos/${slug}/">Video page</a> · ` : ''}<a href="/videos/${slug}.mp4" download>Download MP4</a> · ${hasCaptions ? `<a href="/videos/${slug}.vtt" download>Download captions</a>` : 'Captions pending'}</p>
</figure>`;
}

function absoluteSiteUrl(value) {
  if (!value) return undefined;
  return new URL(value, SITE).href;
}
function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function heroFigure(slug) {
  const dir = path.join(OUT, slug);
  const hasJpg = fs.existsSync(path.join(dir, 'hero.jpg'));
  const hasMp4 = fs.existsSync(path.join(dir, 'hero.mp4'));
  if (!hasJpg && !hasMp4) return '';
  const caption = HERO_CAPTIONS[slug] || '';
  if (hasMp4 && hasJpg) {
    return `<figure class="article-hero"${caption ? ' aria-labelledby="hero-caption"' : ''}>
  <video preload="none" loop muted playsinline poster="${bust(`/articles/${slug}/hero.jpg`)}" width="1280" height="720" data-autoplay aria-label="${esc(caption || 'Article film')}">
    <source src="/articles/${slug}/hero.mp4" type="video/mp4">
  </video>
${caption ? `  <figcaption id="hero-caption">${caption}</figcaption>\n` : ''}</figure>`;
  }
  // image hero is the LCP element: eager, high priority
  const poster = pictureSources(slug, 'hero', { eager: true });
  return `<figure class="article-hero"${caption ? ' aria-labelledby="hero-caption"' : ''}>
  ${poster}
${caption ? `  <figcaption id="hero-caption">${caption}</figcaption>\n` : ''}</figure>`;
}

function wrapInlineFigures(html) {
  return html.replace(
    /<p>\s*(<img\s+[^>]*src="([^"]*)"[^>]*>)\s*<em>([\s\S]*?)<\/em>\s*<\/p>/g,
    (match, imgTag, src, caption) => {
      const img = imgTag.replace(/^(<img\s+)([^>]*)(\/?>)$/, (m, open, attrs, close) => {
        const extras = [];
        if (!/loading\s*=/.test(attrs)) extras.push('loading="lazy"');
        if (!/decoding\s*=/.test(attrs)) extras.push('decoding="async"');
        return `${open}${attrs}${extras.length ? ' ' + extras.join(' ') : ''}${close}`;
      });
      const safeCaption = caption.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<figure>\n  ${img}\n  <figcaption>${safeCaption}</figcaption>\n</figure>`;
    }
  );
}

function pictureSources(slug, base, { eager = false } = {}) {
  const dir = path.join(OUT, slug);
  const avif = fs.existsSync(path.join(dir, `${base}.avif`));
  const webp = fs.existsSync(path.join(dir, `${base}.webp`));
  const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<picture>
${avif ? `    <source srcset="${bust(`/articles/${slug}/${base}.avif`)}" type="image/avif">\n` : ''}${webp ? `    <source srcset="${bust(`/articles/${slug}/${base}.webp`)}" type="image/webp">\n` : ''}    <img src="${bust(`/articles/${slug}/${base}.jpg`)}" alt="" width="1280" height="720" ${loading} decoding="async">
  </picture>`;
}

// One small script on every page: assemble the email client-side (so no
// email pattern exists in the HTML source for rewriting proxies to mangle),
// lazy-start hero videos only when they scroll into view, and power the
// article "Copy link" share button.
const PAGE_SCRIPT = `<script type="module">
import { initAllShareWidgets } from "/components/share/share.mjs";
(() => {
  document.querySelectorAll("a.mail").forEach((a) => {
    const addr = a.dataset.u + "@" + a.dataset.d;
    a.href = "mailto:" + addr;
    a.textContent = addr;
  });
  const vids = document.querySelectorAll("video[data-autoplay]");
  if (vids.length) {
    if (!("IntersectionObserver" in window)) { vids.forEach((v) => { v.preload = "metadata"; }); }
    else {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { e.target.play().catch(() => {}); }
          else { e.target.pause(); }
        }
      }, { rootMargin: "120px" });
      vids.forEach((v) => io.observe(v));
    }
  }
})();
initAllShareWidgets();
</script>`;

export function renderHead({ title, description, url, ogTitle = title, ogDescription = description, ogUrl = url, ogImage, ogType, jsonld, preloadImage, math, videoUrl }) {
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(ogDescription)}">
  <meta property="og:type" content="${esc(ogType)}">
  <meta property="og:url" content="${esc(ogUrl)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ogTitle)}">
  <meta name="twitter:description" content="${esc(ogDescription)}">
  <meta name="twitter:image" content="${esc(ogImage)}">
  <meta name="theme-color" content="#faf9f6">
  <link rel="icon" type="image/svg+xml" href="/lupine-science-mark.svg">
  <link rel="icon" type="image/png" href="/lupine-science-icon.png">
  <link rel="apple-touch-icon" href="/lupine-science-icon.png">
  <link rel="preload" href="/fonts/newsreader-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
${videoUrl ? `  <link rel="alternate" type="video/mp4" href="${esc(videoUrl)}">\n` : ''}${preloadImage ? `  <link rel="preload" href="${esc(preloadImage)}" as="image" fetchpriority="high">\n` : ''}${math ? '  <link rel="stylesheet" href="/katex/katex.min.css">\n' : ''}  <link rel="stylesheet" href="/articles/styles.css">
  <link rel="stylesheet" href="/components/share/share.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
}

function chrome(inner, { current = 'articles' } = {}) {
  return `  <a class="skip" href="#content">Skip to content</a>
  <header class="site-header">
    <a class="mark" href="/" aria-label="Lupine Science">
      ${MARK_SVG}
      <span><b>Lupine Science</b> <span class="tld">accelerating materials discovery</span></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/articles/"${current === 'articles' ? ' aria-current="page"' : ''}>Articles</a>
      <a href="/videos/"${current === 'videos' ? ' aria-current="page"' : ''}>Videos</a>
      <a href="https://library.lupine.science">Library</a>
      <a href="https://lupi.live">LUPI</a>
    </nav>
  </header>
${inner}
  <footer class="foot">
    <span class="creed">Unlocking the materials that build the future. <em>Evidence before claim.</em></span>
    <span><b>Lupine Science</b> · founder Alex Welcing · <a class="mail" href="mailto:alex@lupinesci.com" data-u="alex" data-d="lupinesci.com">alex [at] lupinesci.com</a></span>
    <span><a href="/articles/">Articles</a> · <a href="https://lupi.live">LUPI</a> · <a href="https://library.lupine.science">Library</a> · <a href="https://github.com/alexwelcing/lupine">Repository</a></span>
  </footer>`;
}

function shareBar(route, title) {
  const url = new URL(route, SITE).href;
  const encodedUrl = encodeURIComponent(url).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  const encodedTitle = encodeURIComponent(title).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  const actions = [
    { slug: 'x', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, label: 'X', aria: 'Share on X' },
    { slug: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, label: 'LinkedIn', aria: 'Share on LinkedIn' },
    { slug: 'email', href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`, label: 'Email', aria: 'Share by email' },
  ];
  const items = actions.map((a) =>
    `    <li><a class="share-link share-${a.slug}" href="${esc(a.href)}" aria-label="${esc(a.aria)}"${a.slug !== 'email' ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(a.label)}</a></li>`
  ).join('\n');
  return `<div class="share-root" data-url="${esc(url)}" data-title="${esc(title)}" role="group" aria-label="Share this page">
  <ul class="share-list" role="list" aria-label="Share options">
${items}
  </ul>
</div>`;
}

function buildArticle(raw, slug) {
  let body = md.render(raw);
  body = wrapInlineFigures(body);
  body = bustInlineImages(body, slug);
  body = body.replace('<div class="footnote">', '<div class="footnotes">');
  body = body.replace(/<hr class="footnotes-sep">\n?/g, '');
  body = body.replace('<h2>Footnotes</h2>', '<h2 class="footnotes-heading">Footnotes</h2>');
  const hasMath = /class="katex"/.test(body) || /<math\b/.test(body) || /<annotation\b/.test(body);
  // markdown-it-footnote uses <section class="footnotes"> already
  const meta = extractMeta(raw);
  const titleMatch = body.match(/<h1>(.*?)<\/h1>/s);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : slug;
  // Summary/deck priority: new labels first, legacy aliases as fallbacks.
  const description = meta.summary || meta.description || meta.deck || meta.scope || `A Lupine Science article: ${title}`;
  const deck = meta.deck || meta.scope;
  const url = `${SITE}/articles/${slug}/`;

  // The first blockquote in the source is the metadata block; metadata is
  // extracted above for JSON-LD and the index, then removed from the body.
  body = body.replace(/<blockquote>[\s\S]*?<\/blockquote>/, '');

  // Publication-style header: kicker + title + deck + byline (date + status), then hero.
  // Articles default to "Research note"; other document types keep their explicit label.
  const kicker = (!meta.type || meta.type.toLowerCase() === 'article')
    ? 'Research note'
    : esc(meta.type);
  body = body.replace('<h1>', `<p class="article-kicker" aria-label="Article type">${kicker}</p>\n<h1>`);
  const headerParts = [];
  if (deck) {
    headerParts.push(`<p class="article-deck">${esc(deck)}</p>`);
  }
  if (meta.date || meta.status) {
    const datePart = meta.date ? `<time datetime="${esc(meta.date)}">${formatDate(meta.date)}</time>` : '';
    const statusPart = meta.status ? `<span class="article-status">${esc(formatStatus(meta.status))}</span>` : '';
    const sep = datePart && statusPart ? '<span class="byline-sep" aria-hidden="true">·</span>' : '';
    headerParts.push(`<ul class="article-byline" aria-label="Publication details">${datePart ? `<li>${datePart}</li>` : ''}${sep ? ` <li aria-hidden="true">${sep}</li>` : ''}${statusPart ? ` <li>${statusPart}</li>` : ''}</ul>`);
  }
  const hero = heroFigure(slug);
  const video = inlineVideoPlayer(slug, title);
  if (headerParts.length || hero || video) {
    const inserted = [...headerParts, hero, video].filter(Boolean).join('\n');
    body = body.replace('</h1>', `</h1>\n${inserted}`);
  }

  // De-duplicate: when hero.jpg is a copy of the first inline image (the
  // conventional pattern), drop the redundant inline one so the article
  // doesn't show the same image twice in a row.
  const heroPath = path.join(OUT, slug, 'hero.jpg');
  if (hero && fs.existsSync(heroPath)) {
    const heroHash = sha256(heroPath);
    body = body.replace(/<p><img\s+[^>]*src="images\/([^"?]+)[^"]*"[^>]*>\s*<\/p>/, (match, name) => {
      const inlinePath = path.join(OUT, slug, 'images', name);
      return fs.existsSync(inlinePath) && sha256(inlinePath) === heroHash ? '' : match;
    });
  }

  // share bar immediately before the footnotes section / heading, or at the end if there are none
  const share = shareBar(`/articles/${slug}/`, title);
  const footnotesHeading = '<h2 class="footnotes-heading">Footnotes</h2>';
  if (body.includes(footnotesHeading)) {
    body = body.replace(footnotesHeading, `${share}\n${footnotesHeading}`);
  } else if (body.includes('<section class="footnotes"')) {
    body = body.replace('<section class="footnotes"', `${share}\n<section class="footnotes"`);
  } else {
    body += '\n' + share;
  }

  const hasJpg = fs.existsSync(path.join(OUT, slug, 'hero.jpg'));
  const ogImage = slug === 'from-fantasy-frameworks-to-makeable-materials'
    ? `${SITE}/og-mof-formalization.png`
    : `${SITE}/og-lupine-science.png`;
  const ogImageWidth = 1200;
  const ogImageHeight = 630;
  const twitterCard = 'summary_large_image';
  const videoUrl = publishedVideoUrl(slug);
  const videoPoster = fs.existsSync(path.join(PUBLIC_ROOT, 'videos', `${slug}-poster.jpg`))
    ? bust(`${SITE}/videos/${slug}-poster.jpg`)
    : undefined;
  const socialTitle = meta.ogTitle || `${title} — Lupine Science`;
  const socialDescription = meta.ogDescription || description;
  const socialUrl = absoluteSiteUrl(meta.ogUrl) || url;
  const socialImage = bust(absoluteSiteUrl(meta.ogImage) || videoPoster || ogImage);
  const socialType = meta.ogType || (videoUrl ? 'video.other' : 'article');

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: meta.date || undefined,
    url,
    mainEntityOfPage: url,
    image: hasJpg ? bust(`${SITE}/articles/${slug}/hero.jpg`) : ogImage,
    author: { '@type': 'Organization', name: 'Lupine Science', url: SITE },
    publisher: { '@type': 'Organization', name: 'Lupine Science', url: SITE, logo: { '@type': 'ImageObject', url: bust(`${SITE}/lupine-science-icon.png`) } },
  };
  const jsonld = videoUrl ? {
    '@context': 'https://schema.org',
    '@graph': [
      { ...articleJsonLd, '@id': `${url}#article` },
      {
        '@type': 'VideoObject',
        '@id': `${url}#video`,
        name: title,
        description,
        thumbnailUrl: fs.existsSync(path.join(PUBLIC_ROOT, 'videos', `${slug}-poster.jpg`))
          ? `${SITE}/videos/${slug}-poster.jpg`
          : articleJsonLd.image,
        uploadDate: meta.date,
        contentUrl: videoUrl,
        embedUrl: `${SITE}/videos/${slug}/`,
        isPartOf: { '@id': `${url}#article` },
      },
    ],
  } : articleJsonLd;

  // the hero poster is the LCP element on video-hero pages — fetch it first
  const hasMp4 = fs.existsSync(path.join(OUT, slug, 'hero.mp4'));
  const preloadImage = hasMp4 && hasJpg ? bust(`/articles/${slug}/hero.jpg`) : undefined;
  const page = `<!doctype html>
<html lang="en">
<head>
  ${renderHead({
    title: `${title} — Lupine Science`,
    description,
    url,
    ogTitle: socialTitle,
    ogDescription: socialDescription,
    ogUrl: socialUrl,
    ogImage: socialImage,
    ogType: socialType,
    jsonld,
    preloadImage,
    math: hasMath,
    videoUrl,
  })}
</head>
<body>
${chrome(`  <main id="content" class="article-shell">
    <article class="article">
      ${body}
    </article>
  </main>`)}
${PAGE_SCRIPT}
</body>
</html>
`;
  return { page, title, description, meta, slug, ogImage, ogImageWidth, ogImageHeight, twitterCard };
}

function buildIndex(articles) {
  const cards = articles.map((a, index) => {
    // cards use dedicated 640w thumbs; full-size heroes stay on the article
    const base = fs.existsSync(path.join(OUT, a.slug, 'thumb.jpg')) ? 'thumb'
      : fs.existsSync(path.join(OUT, a.slug, 'hero.jpg')) ? 'hero' : null;
    const thumb = base
      ? pictureSources(a.slug, base, { eager: index === 0 })
          .replace('width="1280" height="720"', 'class="card-thumb" width="640" height="360"')
      : '<span class="card-thumb card-thumb-empty" aria-hidden="true"><i></i><i></i><i></i></span>';
    const metaLine = [a.meta.date ? formatDate(a.meta.date) : '', a.meta.status ? esc(formatStatus(a.meta.status)) : ''].filter(Boolean).join(' · ');
    return `<li>
  <a class="article-card" href="/articles/${a.slug}/">
    ${thumb}
    <span class="d8">${metaLine}</span>
    <h2>${esc(a.title)}</h2>
    <p>${esc(a.meta.deck || a.meta.summary || a.meta.scope || a.description)}</p>
  </a>
</li>`;
  }).join('\n');

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Articles — Lupine Science',
    url: `${SITE}/articles/`,
    isPartOf: { '@type': 'WebSite', name: 'Lupine Science', url: SITE },
  };

  return `<!doctype html>
<html lang="en">
<head>
  ${renderHead({
    title: 'Articles — Lupine Science',
    description: 'Articles, prospectuses, and research notes on formalized, machine-checked materials discovery.',
    url: `${SITE}/articles/`,
    ogImage: `${SITE}/og-lupine-science.png`,
    ogType: 'website',
    jsonld,
  })}
</head>
<body>
${chrome(`  <main id="content" class="article-index">
    <p class="b-label">Recent notes</p>
    <h1>Research notes, prospectuses, and formalization roadmaps.</h1>
    <div class="cta proof-pack-cta">
      <p><strong>Environmental series — download the proof pack</strong></p>
      <p>A single PDF with all five environmental-series articles: cover pages, printable layout, and source URLs.</p>
      <a href="/proof-pack-climate-series.pdf" download>Download proof-pack-climate-series.pdf</a>
    </div>
    <ul class="article-list">
${cards}
    </ul>
  </main>`)}
${PAGE_SCRIPT}
</body>
</html>
`;
}

function videoArticles(articles) {
  const articleSlugs = new Set(articles.map(({ slug }) => slug));
  const orphan = fs.readdirSync(path.join(PUBLIC_ROOT, 'videos'))
    .filter((name) => name.endsWith('.mp4'))
    .map((name) => name.replace(/\.mp4$/, ''))
    .find((slug) => !articleSlugs.has(slug));
  if (orphan) {
    throw new Error(`refusing to publish orphan video without article: public/videos/${orphan}.mp4`);
  }
  return articles.filter((article) => {
    const { slug } = article;
    const mp4 = path.join(PUBLIC_ROOT, 'videos', `${slug}.mp4`);
    if (!fs.existsSync(mp4)) return false;
    for (const suffix of ['-poster.jpg', '.vtt']) {
      const required = path.join(PUBLIC_ROOT, 'videos', `${slug}${suffix}`);
      if (!fs.existsSync(required)) {
        throw new Error(`refusing to publish incomplete video ${slug}: missing public/videos/${slug}${suffix}`);
      }
    }
    return true;
  });
}

function videoDescription(article) {
  // Prefer the editorial deck on the newly generated video surfaces. Some
  // article summaries contain detailed economics that require their own
  // reviewed source contract and must not be republished by implication.
  return article.meta.deck || article.description;
}

function videoHead(article, url) {
  const { slug, title, meta } = article;
  const description = videoDescription(article);
  const poster = bust(`${SITE}/videos/${slug}-poster.jpg`);
  const contentUrl = `${SITE}/videos/${slug}.mp4`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl: poster,
    uploadDate: meta.date,
    contentUrl,
    embedUrl: url,
    isPartOf: {
      '@type': 'Article',
      name: title,
      url: `${SITE}/articles/${slug}/`,
    },
  };
  return renderHead({
    title: `${title} — Video — Lupine Science`,
    description,
    url,
    ogTitle: `${title} — Video — Lupine Science`,
    ogDescription: description,
    ogUrl: url,
    ogImage: poster,
    ogType: 'video.other',
    jsonld,
    videoUrl: contentUrl,
  });
}

function buildVideoPage(article) {
  const { slug, title } = article;
  const description = videoDescription(article);
  const url = `${SITE}/videos/${slug}/`;
  return `<!doctype html>
<html lang="en">
<head>
  ${videoHead(article, url)}
</head>
<body>
${chrome(`  <main id="content" class="article-shell video-detail" data-generated-video-detail="${slug}">
    <article class="article">
      <p class="article-kicker" aria-label="Media type">${VIDEO_KIND.get(slug) ?? 'Narrated summary'}</p>
      <h1>${esc(title)}</h1>
      <p class="article-deck">${esc(description)}</p>
      ${inlineVideoPlayer(slug, title, { detailLink: false })}
      <p class="video-article-backlink">Read the source article: <a href="/articles/${slug}/">${esc(title)}</a></p>
      ${shareBar(`/videos/${slug}/`, `${title} — Video — Lupine Science`)}
    </article>
  </main>`, { current: 'videos' })}
${PAGE_SCRIPT}
</body>
</html>
`;
}

function buildVideoIndex(articles) {
  const cards = articles.map((article) => {
    const { slug, title } = article;
    const description = videoDescription(article);
    return `<li>
  <article class="video-card">
    <a class="video-card-primary" href="/videos/${slug}/">
      <img src="${bust(`/videos/${slug}-poster.jpg`)}" alt="" loading="lazy" decoding="async">
      <span class="video-card-meta">
        <span class="play">▶ Watch</span>
        <h2>${esc(title)}</h2>
        <span class="video-card-description">${esc(description)}</span>
      </span>
    </a>
    <p class="video-card-actions"><a href="/articles/${slug}/">Read article</a> · <a href="/videos/${slug}.mp4" download>Download MP4</a> · <a href="/videos/${slug}.vtt" download>Captions</a></p>
  </article>
</li>`;
  }).join('\n');
  const url = `${SITE}/videos/`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Videos — Lupine Science',
    url,
    hasPart: articles.map(({ slug, title }) => ({
      '@type': 'VideoObject',
      name: title,
      url: `${SITE}/videos/${slug}/`,
      contentUrl: `${SITE}/videos/${slug}.mp4`,
    })),
  };
  return `<!doctype html>
<html lang="en">
<head>
  ${renderHead({
    title: 'Videos — Lupine Science',
    description: 'Narrated motion versions and short films from Lupine Science articles.',
    url,
    ogImage: bust(`${SITE}/videos/the-02-percent-synthesis-problem-poster.jpg`),
    ogType: 'website',
    jsonld,
  })}
  <style>
    .videos-index { max-width: 1100px; margin: 0 auto; padding: clamp(40px, 7vh, 84px) 22px 80px; }
    .videos-index h1 { font-size: clamp(2.2rem, 5vw, 3.2rem); line-height: 1.1; margin: 0 0 .5rem; }
    .videos-index .lead { color: var(--ink-soft); font-size: 1.15rem; max-width: 680px; margin: 0 0 2.5rem; }
    .video-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 28px; list-style: none; padding: 0; margin: 0; }
    .video-card { background: #fff; border: 1px solid var(--rule); border-radius: 12px; overflow: hidden; }
    .video-card-primary { display: block; text-decoration: none; color: inherit; }
    .video-card-primary img { display: block; width: 100%; aspect-ratio: 16/9; object-fit: cover; border-bottom: 1px solid var(--rule); }
    .video-card-meta { display: block; padding: 18px 20px 14px; }
    .video-card .play { display: block; font-family: var(--mono); font-size: .75rem; font-weight: 600; text-transform: uppercase; color: var(--indigo); margin-bottom: .5rem; }
    .video-card h2 { font-size: 1.35rem; line-height: 1.2; margin: 0 0 .4rem; }
    .video-card-description { display: block; font-size: .95rem; color: var(--ink-soft); line-height: 1.5; }
    .video-card-actions { border-top: 1px solid var(--rule); margin: 0; padding: 12px 20px 16px; font-family: var(--mono); font-size: .75rem; }
  </style>
</head>
<body>
${chrome(`  <main id="content" class="videos-index">
    <p class="b-label">Narrated motion and short films</p>
    <h1>Article videos.</h1>
    <p class="lead">Watch the research in motion, return to the full source article, or download the reviewed video and captions.</p>
    ${shareBar('/videos/', 'Videos — Lupine Science')}
    <ul class="video-list">
${cards}
    </ul>
  </main>`, { current: 'videos' })}
${PAGE_SCRIPT}
</body>
</html>
`;
}

function buildNotFoundPage() {
  return `<!doctype html>
<html lang="en">
<head>
  ${renderHead({
    title: 'Content not found — Lupine Science',
    description: 'The requested Lupine Science page or download is not available.',
    url: `${SITE}/404.html`,
    ogImage: `${SITE}/og-lupine-science.png`,
    ogType: 'website',
    jsonld: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Content not found' },
  })}
</head>
<body>
${chrome(`  <main id="content" class="article-shell">
    <article class="article">
      <p class="article-kicker">404</p>
      <h1>That page or download is not available.</h1>
      <p>Check the address, browse <a href="/videos/">all published videos</a>, or return to <a href="/articles/">the article index</a>.</p>
    </article>
  </main>`, { current: null })}
${PAGE_SCRIPT}
</body>
</html>
`;
}

ensureKatexAssets();

const sources = fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).sort();
const articles = [];
// Write-then-rename: concurrent readers (parallel test files, deploys
// mid-build) must never observe a partially written page.
function writeAtomic(file, contents) {
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, contents);
  fs.renameSync(tmp, file);
}
for (const file of sources) {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const built = buildArticle(raw, slug);
  fs.mkdirSync(path.join(OUT, slug), { recursive: true });
  writeAtomic(path.join(OUT, slug, 'index.html'), built.page);
  articles.push(built);
  console.log(`built /articles/${slug}/`);
}
articles.sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''));
writeAtomic(path.join(OUT, 'index.html'), buildIndex(articles));
console.log('built /articles/index.html');

const videos = videoArticles(articles);
const videosRoot = path.join(PUBLIC_ROOT, 'videos');
for (const entry of fs.readdirSync(videosRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const generatedPage = path.join(videosRoot, entry.name, 'index.html');
  if (!fs.existsSync(generatedPage)) continue;
  if (!fs.readFileSync(generatedPage, 'utf8').includes('data-generated-video-detail=')) continue;
  if (!videos.some(({ slug }) => slug === entry.name)) fs.rmSync(path.join(videosRoot, entry.name), { recursive: true });
}
for (const article of videos) {
  const dir = path.join(videosRoot, article.slug);
  fs.mkdirSync(dir, { recursive: true });
  writeAtomic(path.join(dir, 'index.html'), buildVideoPage(article));
  console.log(`built /videos/${article.slug}/`);
}
writeAtomic(path.join(videosRoot, 'index.html'), buildVideoIndex(videos));
writeAtomic(path.join(PUBLIC_ROOT, '404.html'), buildNotFoundPage());
console.log(`built /videos/index.html (${videos.length} videos)`);
