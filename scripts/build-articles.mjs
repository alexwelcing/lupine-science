#!/usr/bin/env node
// Builds public/articles/<slug>/index.html + public/articles/index.html from
// articles/*.md. Replaces the former Python builder (unpinned dependency,
// injected a hero figure into every article whether or not its media
// existed). Conventions preserved: first blockquote = metadata block with
// "> **Date:** ..." lines; output is committed, CI checks determinism via
// `git diff --exit-code` after a rebuild.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'articles');
const OUT = path.join(ROOT, 'public', 'articles');
const SITE = 'https://lupine.science';

// typographer: real quotes and apostrophes in prose (code blocks untouched)
const md = new MarkdownIt({ html: true, typographer: true }).use(footnote);

// Per-article hero captions. A hero figure is emitted only when the media
// files actually exist next to the article.
const HERO_CAPTIONS = {
  'why-lupine-science':
    'The launch film: from fantasy frameworks to makeable materials. Generated with AI tools, composited with open-source software — possibilities made trustworthy by process.',
  'from-fantasy-frameworks-to-makeable-materials':
    'The formalized discovery loop: define makeability rules, simulate candidates, synthesize the certified ones, and feed the results back into stronger rules.',
  'the-order-is-right-the-size-is-wrong':
    'The error field, drawn by the front door’s live instrument in its ∇ᵧE focus — each comet a model’s dominant error direction, computed from the committed benchmark data.',
  'the-trust-layer':
    'The instrument on the front door: the hyper-ribbon and one cavity of MOF-5, drawn live from committed data.',
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

function extractMeta(raw) {
  const meta = {};
  for (const [key, name] of [['date', 'Date'], ['scope', 'Scope'], ['description', 'Description'], ['audience', 'Audience'], ['status', 'Status']]) {
    const m = raw.match(new RegExp(`^> \\*\\*${name}:\\*\\*\\s*(.+?)\\s*$`, 'm'));
    if (m) meta[key] = m[1];
  }
  return meta;
}

function heroFigure(slug) {
  const dir = path.join(OUT, slug);
  const hasJpg = fs.existsSync(path.join(dir, 'hero.jpg'));
  const hasMp4 = fs.existsSync(path.join(dir, 'hero.mp4'));
  if (!hasJpg && !hasMp4) return '';
  const caption = HERO_CAPTIONS[slug] || '';
  if (hasMp4 && hasJpg) {
    return `<figure class="article-hero"${caption ? ' aria-labelledby="hero-caption"' : ''}>
  <video preload="none" loop muted playsinline poster="/articles/${slug}/hero.jpg" width="1280" height="720" data-autoplay aria-label="${esc(caption || 'Article film')}">
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

function pictureSources(slug, base, { eager = false } = {}) {
  const dir = path.join(OUT, slug);
  const avif = fs.existsSync(path.join(dir, `${base}.avif`));
  const webp = fs.existsSync(path.join(dir, `${base}.webp`));
  const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<picture>
${avif ? `    <source srcset="/articles/${slug}/${base}.avif" type="image/avif">\n` : ''}${webp ? `    <source srcset="/articles/${slug}/${base}.webp" type="image/webp">\n` : ''}    <img src="/articles/${slug}/${base}.jpg" alt="" width="1280" height="720" ${loading} decoding="async">
  </picture>`;
}

// One small script on every page: assemble the email client-side (so no
// email pattern exists in the HTML source for rewriting proxies to mangle),
// and lazy-start hero videos only when they scroll into view.
const PAGE_SCRIPT = `<script>
(() => {
  document.querySelectorAll("a.mail").forEach((a) => {
    const addr = a.dataset.u + "@" + a.dataset.d;
    a.href = "mailto:" + addr;
    a.textContent = addr;
  });
  const vids = document.querySelectorAll("video[data-autoplay]");
  if (!vids.length) return;
  if (!("IntersectionObserver" in window)) { vids.forEach((v) => { v.preload = "metadata"; }); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.play().catch(() => {}); }
      else { e.target.pause(); }
    }
  }, { rootMargin: "120px" });
  vids.forEach((v) => io.observe(v));
})();
</script>`;

function head({ title, description, url, ogImage, jsonld, isArticle, preloadImage }) {
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${isArticle ? 'article' : 'website'}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#faf9f6">
  <link rel="icon" type="image/svg+xml" href="/lupine-science-mark.svg">
  <link rel="icon" type="image/png" href="/lupine-science-icon.png">
  <link rel="apple-touch-icon" href="/lupine-science-icon.png">
  <link rel="preload" href="/fonts/newsreader-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
${preloadImage ? `  <link rel="preload" href="${preloadImage}" as="image" fetchpriority="high">\n` : ''}  <link rel="stylesheet" href="/articles/styles.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
}

function chrome(inner) {
  return `  <a class="skip" href="#content">Skip to content</a>
  <header class="site-header">
    <a class="mark" href="/" aria-label="Lupine Science">
      ${MARK_SVG}
      <span><b>Lupine Science</b> <span class="tld">accelerating materials discovery</span></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/articles/" aria-current="page">Articles</a>
      <a href="https://library.lupine.science">Library</a>
      <a href="https://lupi.live">LUPI</a>
    </nav>
  </header>
${inner}
  <footer class="foot">
    <span class="creed">Unlocking the materials that build the future. <em>Evidence before claim.</em></span>
    <span><b>Lupine Science</b> · founder Alex Welcing · <a class="mail" data-u="alex" data-d="lupinesci.com">alex [at] lupinesci.com</a></span>
    <span><a href="/articles/">Articles</a> · <a href="https://lupi.live">LUPI</a> · <a href="https://library.lupine.science">Library</a> · <a href="https://github.com/alexwelcing/lupine">Repository</a></span>
  </footer>`;
}

function buildArticle(raw, slug) {
  let body = md.render(raw);
  body = body.replace('<div class="footnote">', '<div class="footnotes">');
  // markdown-it-footnote uses <section class="footnotes"> already; also map hr
  const meta = extractMeta(raw);
  const titleMatch = body.match(/<h1>(.*?)<\/h1>/s);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : slug;
  const description = meta.description || meta.scope || `A Lupine Science article: ${title}`;
  const url = `${SITE}/articles/${slug}/`;

  // first blockquote is the metadata block → semantic aside
  body = body.replace('<blockquote>', '<aside class="article-meta" aria-label="Article metadata">');
  body = body.replace('</blockquote>', '</aside>');

  // hero after the h1, only if media exists
  const hero = heroFigure(slug);
  if (hero) body = body.replace('</h1>', `</h1>\n${hero}`);

  const hasJpg = fs.existsSync(path.join(OUT, slug, 'hero.jpg'));
  const ogImage = slug === 'from-fantasy-frameworks-to-makeable-materials'
    ? `${SITE}/og-mof-formalization.png`
    : `${SITE}/og-lupine-science.png`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: meta.date || undefined,
    url,
    mainEntityOfPage: url,
    image: hasJpg ? `${SITE}/articles/${slug}/hero.jpg` : ogImage,
    author: { '@type': 'Organization', name: 'Lupine Science', url: SITE },
    publisher: { '@type': 'Organization', name: 'Lupine Science', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/lupine-science-icon.png` } },
  };

  // the hero poster is the LCP element on video-hero pages — fetch it first
  const hasMp4 = fs.existsSync(path.join(OUT, slug, 'hero.mp4'));
  const preloadImage = hasMp4 && hasJpg ? `/articles/${slug}/hero.jpg` : undefined;
  const page = `<!doctype html>
<html lang="en">
<head>
  ${head({ title: `${title} — Lupine Science`, description, url, ogImage, jsonld, isArticle: true, preloadImage })}
</head>
<body>
${chrome(`  <main id="content" class="article-shell">
    <article class="article">
      ${body}
    </article>
  </main>`)}
${PAGE_SCRIPT}\n</body>
</html>
`;
  return { page, title, description, meta, slug };
}

function buildIndex(articles) {
  const cards = articles.map((a) => {
    // cards use dedicated 640w thumbs; full-size heroes stay on the article
    const base = fs.existsSync(path.join(OUT, a.slug, 'thumb.jpg')) ? 'thumb'
      : fs.existsSync(path.join(OUT, a.slug, 'hero.jpg')) ? 'hero' : null;
    const thumb = base
      ? pictureSources(a.slug, base).replace('width="1280" height="720"', 'class="card-thumb" width="640" height="360"')
      : '<span class="card-thumb card-thumb-empty" aria-hidden="true"><i></i><i></i><i></i></span>';
    return `<li>
  <a class="article-card" href="/articles/${a.slug}/">
    ${thumb}
    <span class="d8">${(a.meta.date || '').replaceAll('-', '·')}</span>
    <h2>${a.title}</h2>
    <p>${a.description}</p>
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
  ${head({
    title: 'Articles — Lupine Science',
    description: 'Articles, prospectuses, and research notes from Lupine Science on formalized materials discovery.',
    url: `${SITE}/articles/`,
    ogImage: `${SITE}/og-lupine-science.png`,
    jsonld,
    isArticle: false,
  })}
</head>
<body>
${chrome(`  <main id="content" class="article-index">
    <p class="b-label">From the notebook</p>
    <h1>Research notes, prospectuses, and formalization roadmaps.</h1>
    <ul class="article-list">
${cards}
    </ul>
  </main>`)}
${PAGE_SCRIPT}
</body>
</html>
`;
}

const sources = fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).sort();
const articles = [];
for (const file of sources) {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const built = buildArticle(raw, slug);
  fs.mkdirSync(path.join(OUT, slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, slug, 'index.html'), built.page);
  articles.push(built);
  console.log(`built /articles/${slug}/`);
}
articles.sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''));
fs.writeFileSync(path.join(OUT, 'index.html'), buildIndex(articles));
console.log('built /articles/index.html');
