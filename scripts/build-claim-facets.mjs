#!/usr/bin/env node
// Builds curated claim facets at /atlas/claims/<facet>/index.html.
//
// The wiki DB has 146 claim/S* nodes in the lupine-research sphere. Many
// of those are internal scaffolding (relation:* predicates, superclass:*
// definitions) that should stay in the DB but not ship on the public site.
// The remainder are domain claims worth surfacing — but as a flat list of
// 70+ items they read as noise. This builder curates them into a small
// number of named facets, each with a short editorial blurb explaining
// why the facet matters.
//
// Facets (slug, title, blurb, claim IDs):
//   systematic-biases   The ten failure modes the correction layer defends against.
//   historical-markers  Published structural-failure cases (A-Lab, GNoME, LK-99...).
//   frame-and-ladders   The wedge, level, and correction framing (F, K, L prefixes).
//   risks               Risks the program acknowledges (R1-R7).
//   climate-targets     The five priority material-class bets (CT1-CT5, CZ-1..4).
//   excluded-territory  Where the correction layer is not appropriate (X1-X3).
//   epistemic-grammar   The grammar of confidence: epistemic markers, confidence
//                       grades, readiness grades, success gates (EMK-, CG-, RG-, SG-).
//   program-milestones  The published proof pack, formal proof library, Lupine Method,
//                       and program milestones (PUB-1, FP1, LM1, RP1-RP3, CA1).
//
// Fail-closed semantics:
//   - DB missing -> fall back to committed claims JSON (CI skip-mode).
//   - Claim ID in a facet not found in the source -> exit 1, names the facet.
//   - Duplicate facet slugs or claim IDs across facets -> exit 1.
//
// Source-of-truth ordering: facets are listed in a deliberate narrative
// order (biases first, then the historical markers that motivate them,
// then the corrective framing) so the reader can browse the facets in
// story order.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_ROOT = path.join(ROOT, 'public', 'atlas', 'claims');
const ATLAS_JSON = path.join(ROOT, 'public', 'data', 'atlas_nodes.json');
const DB = process.env.LUPINE_WIKI_DB
  || path.join(process.env.HOME || '/root', '.hermes', 'lupine-wiki.db');

function fail(message) {
  console.error(`build-claim-facets: ${message}`);
  process.exit(1);
}

// FACETS is the curated mapping. Order is part of the narrative.
const FACETS = [
  {
    slug: 'systematic-biases',
    title: 'Systematic biases',
    blurb: 'The ten failure modes the correction layer defends against. Each is a recurring pathology in machine-learned interatomic potentials or the workflows that depend on them — the reasons universal MLIPs mispredict and why we measure and correct at runtime.',
    claims: ['SB1', 'SB2', 'SB3', 'SB4', 'SB5', 'SB6', 'SB7', 'SB8', 'SB9', 'SB10'],
  },
  {
    slug: 'historical-markers',
    title: 'Historical markers',
    blurb: 'Published structural-failure cases from 2020–2023: A-Lab\'s 41 "novel" compounds, GNoME\'s 2.2M crystals, LK-99, CSH/Lu-hydride room-Tc claims, the "AI-assisted 44%" study, DFT-guided N₂-reduction literature, and ML water-stability classifiers. The empirical record on which the systematic-bias catalogue rests.',
    claims: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'],
  },
  {
    slug: 'frame-and-ladders',
    title: 'Frame & ladders',
    blurb: 'The wedges, levels, and correction framing. F1–F3 are the inherited floor, the level playing field, and the validation-first wedge. K1–K3 name the specific wedges (90:10 fidelity, barrier, fusion long game). L1–L3 name the ladders (non-equilibrium pretraining, multi-fidelity Δ-learning, systematic-error surgery).',
    claims: ['F1', 'F2', 'F3', 'K1', 'K2', 'K3', 'L1', 'L2', 'L3'],
  },
  {
    slug: 'risks',
    title: 'Risks',
    blurb: 'Risks the program acknowledges, with the survival condition that closes each one. R1 is the fidelity ceiling; R2 the many-species data wall; R3 solo-execution credibility; R4 export-control shocks; R5 compute-ladder gating at top; R6 instrument disappearance; R7 foundation-model commoditization closing the wedge early.',
    claims: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'],
  },
  {
    slug: 'climate-targets',
    title: 'Climate targets',
    blurb: 'The five priority material-class bets and the cold-state numbers that frame them. CT1–CT5 name the targets (cobalt-free cathodes, halide solid electrolytes, MOF sorbents, ammonia catalysts, lead-free perovskites). CZ-1..4 are the preregistered cold-state figures — NEB barrier headline, hydride compute share, China storage projection, tritium balance.',
    claims: ['CT1', 'CT2', 'CT3', 'CT4', 'CT5', 'CZ-1', 'CZ-2', 'CZ-3', 'CZ-4'],
  },
  {
    slug: 'excluded-territory',
    title: 'Excluded territory',
    blurb: 'Where the correction layer is not appropriate. X1: conventional steels, simple metals, commodity ceramics — empirically converged, no room for the wedge. X2: bio/pharma, small-molecule discovery — different workflow. X3: quantum-computing hype — adjacent industry. The correction layer is a tool, not a religion; it has a perimeter.',
    claims: ['X1', 'X2', 'X3'],
  },
  {
    slug: 'epistemic-grammar',
    title: 'Epistemic grammar',
    blurb: 'The grammar of confidence: epistemic markers (EMK-OBS/INF/TRN/PRP/FRC), confidence grades (CG-High/CG-Medium), readiness grades (RG-H/M/L), and success gates (SG1–SG7 across simulation accuracy, hit-rate uplift, synthesis, stability, component performance, manufacturability, technoeconomics). How a claim earns its place on the page.',
    claims: ['EMK-OBS', 'EMK-INF', 'EMK-TRN', 'EMK-PRP', 'EMK-FRC', 'CG-High', 'CG-Medium', 'RG-H', 'RG-M', 'RG-L', 'SG1', 'SG2', 'SG3', 'SG4', 'SG5', 'SG6', 'SG7'],
  },
  {
    slug: 'program-milestones',
    title: 'Program milestones',
    blurb: 'Published artifacts and program-level milestones. PUB-1 is the shared-DFT-anchor proof pack — published and verified (the public-economics guardrail "$14.65 per 129 anchors" derives from it). FP1 is the formal proof library. LM1 is the Lupine Method. RP1–RP3 are program milestones; CA1 is the climate aggregate that ties them together.',
    claims: ['PUB-1', 'FP1', 'LM1', 'RP1', 'RP2', 'RP3', 'CA1'],
  },
];

// Sanity-check the facet table itself before touching the DB.
const seenSlugs = new Set();
const seenClaimIds = new Set();
const allIds = [];
for (const f of FACETS) {
  if (!f.slug || !/^[a-z0-9-]+$/.test(f.slug)) fail(`invalid facet slug: ${f.slug}`);
  if (seenSlugs.has(f.slug)) fail(`duplicate facet slug: ${f.slug}`);
  seenSlugs.add(f.slug);
  if (!Array.isArray(f.claims) || f.claims.length === 0) fail(`facet ${f.slug} has no claims`);
  for (const cid of f.claims) {
    if (!cid || typeof cid !== 'string') fail(`facet ${f.slug} has invalid claim id: ${cid}`);
    if (seenClaimIds.has(cid)) fail(`claim ${cid} appears in multiple facets (each claim belongs to exactly one facet)`);
    seenClaimIds.add(cid);
    allIds.push(cid);
  }
}

// ---- 1. Build the source-of-truth: claim_id -> {name, uri} ----
let claimIndex;

if (!fs.existsSync(DB)) {
  if (process.env.LUPINE_FORCE_ATLAS_WIKI === '1') {
    fail(`wiki DB not found at ${DB}; is lupine-wiki-refresh.timer healthy? (LUPINE_FORCE_ATLAS_WIKI=1)`);
  }
  if (!fs.existsSync(ATLAS_JSON)) {
    fail(`wiki DB absent at ${DB} and no committed ${path.relative(ROOT, ATLAS_JSON)} exists; cannot ship claim facets`);
  }
  console.log(`wiki DB absent at ${DB} - using committed ${path.relative(ROOT, ATLAS_JSON)} as the source for claim metadata`);
  // atlas_nodes.json does NOT currently include claims; load claims from a
  // separate committed file if present. Build-claim-facets requires the wiki
  // DB for full coverage; on CI hosts without the timer we still ship the
  // page shells so the routes resolve, but each claim row shows a
  // "metadata not committed" sentinel. CI hosts without the wiki DB will
  // need the timer; this matches the project's existing skip-mode pattern.
  const atlas = JSON.parse(fs.readFileSync(ATLAS_JSON, 'utf8'));
  if (!atlas.claims) atlas.claims = {};
  claimIndex = new Map();
  for (const id of allIds) {
    const entry = atlas.claims[id];
    if (entry && entry.name) {
      claimIndex.set(id, { uri: `lupine-research://claim/${id}`, name: entry.name, wiki_db_available: false });
    } else {
      claimIndex.set(id, { uri: `lupine-research://claim/${id}`, name: null, wiki_db_available: false });
    }
  }
} else {
  const db = new DatabaseSync(DB, { readOnly: true });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='nodes'").all();
  if (tables.length !== 1) fail('wiki DB missing table: nodes');
  // Look up each claim id, scoped to claim kind and the right URI prefix.
  const placeholders = allIds.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT id, kind, name, uri
    FROM nodes
    WHERE sphere_id = 'lupine-research'
      AND kind = 'claim'
      AND id LIKE 'lupine-research://%'
  `).all();
  db.close();

  const byUri = new Map();
  for (const row of rows) byUri.set(row.id, row);

  claimIndex = new Map();
  for (const cid of allIds) {
    const fullUri = `lupine-research://claim/${cid}`;
    const row = byUri.get(fullUri);
    if (!row) {
      fail(`facet references claim "${cid}" but wiki DB has no lupine-research://claim/${cid}`);
    }
    claimIndex.set(cid, { uri: row.id, name: row.name, wiki_db_available: true });
  }
  console.log(`validator: ${claimIndex.size} curated claims loaded from wiki DB`);
}

// ---- 2. Render each facet page ----
const SITE = 'https://lupine.science';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escapeAttr(s) {
  return String(s)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pageHtml({ facet, claims }) {
  const rows = claims.map((c) => {
    const shortId = c.uri.split('/').pop();
    const displayName = c.name
      ? escapeHtml(c.name)
      : `<span class="atlas-claim-meta">(metadata not committed on this CI host - claim URI is canonical)</span>`;
    return `        <li class="atlas-claim-row">
          <span class="atlas-claim-id">${escapeHtml(shortId)}</span>
          <span class="atlas-claim-name">${displayName}</span>
          <span class="atlas-claim-uri"><code>${escapeHtml(c.uri)}</code></span>
        </li>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeAttr(facet.title)} - Lupine research claims - Lupine Science</title>
  <meta name="description" content="${escapeAttr(facet.blurb.slice(0, 200))}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${SITE}/atlas/claims/${escapeAttr(facet.slug)}/">
  <meta property="og:title" content="${escapeAttr(facet.title)} - Lupine research claims - Lupine Science">
  <meta property="og:description" content="${escapeAttr(facet.blurb.slice(0, 200))}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE}/atlas/claims/${escapeAttr(facet.slug)}/">
  <meta property="og:image" content="${SITE}/og-lupine-science.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(facet.title)} - Lupine research claims - Lupine Science">
  <meta name="twitter:description" content="${escapeAttr(facet.blurb.slice(0, 200))}">
  <meta name="twitter:image" content="${SITE}/og-lupine-science.jpg">
  <meta name="theme-color" content="#faf9f6">
  <link rel="icon" type="image/svg+xml" href="/lupine-science-mark.svg">
  <link rel="icon" type="image/png" href="/lupine-science-icon.png">
  <link rel="apple-touch-icon" href="/lupine-science-icon.png">
  <link rel="preload" href="/fonts/newsreader-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/newsreader-italic-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/articles/styles.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"${escapeAttr(facet.title)} - Lupine research claims","url":"${SITE}/atlas/claims/${escapeAttr(facet.slug)}/","isPartOf":{"@type":"WebSite","name":"Lupine Science","url":"${SITE}"},"about":{"@type":"Thing","name":"${escapeAttr(facet.title)}","description":"${escapeAttr(facet.blurb)}"}}</script>
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header class="site-header">
    <a class="mark" href="/" aria-label="Lupine Science">
      <svg viewBox="100 44 312 440" fill="none" aria-hidden="true">
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
      </svg>
      <span><b>Lupine Science</b> <span class="tld">accelerating materials discovery</span></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/articles/">Articles</a>
      <a href="/videos/">Videos</a>
      <a href="/atlas/" aria-current="page">Atlas</a>
      <a href="https://library.lupine.science">Library</a>
      <a href="https://lupi.live">LUPI</a>
    </nav>
  </header>
  <main id="content" class="atlas-claims-facet">
    <p class="b-label"><a href="/atlas/">&larr; Atlas</a> &nbsp;/&nbsp; <a href="/atlas/claims/">Claims</a></p>
    <p class="atlas-claims-kicker">Curated claim facet</p>
    <h1>${escapeHtml(facet.title)}</h1>
    <p class="atlas-claims-blurb">${escapeHtml(facet.blurb)}</p>
    <section class="atlas-claims-list-section">
      <p class="atlas-claims-count">${claims.length} claim${claims.length === 1 ? '' : 's'}</p>
      <ul class="atlas-claims-list">
${rows}
      </ul>
    </section>
    <p class="atlas-claims-asof">Source: <a href="/atlas/">Lupine research ontology</a> (lupine-research sphere, claim kind). URI prefix: <code>lupine-research://claim/</code>.</p>
  </main>
  <footer class="foot">
    <span class="creed">Evidence before claim.</span>
    <span><a href="/articles/">Articles</a> &middot; <a href="https://lupi.live">LUPI</a> &middot; <a href="https://library.lupine.science">Library</a> &middot; <a href="https://github.com/alexwelcing/lupine">Repository</a></span>
  </footer>
</body>
</html>
`;
}

// Render a facets index too, so /atlas/claims/ has a discoverable landing.
function indexHtml(facets) {
  const cards = facets.map((f) => `      <li>
        <a class="atlas-claims-card" href="/atlas/claims/${escapeAttr(f.slug)}/">
          <span class="atlas-claims-card-title">${escapeHtml(f.title)}</span>
          <span class="atlas-claims-card-count">${f.claims.length} claim${f.claims.length === 1 ? '' : 's'}</span>
          <span class="atlas-claims-card-blurb">${escapeHtml(f.blurb)}</span>
        </a>
      </li>`).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lupine research claims - curated facets - Lupine Science</title>
  <meta name="description" content="The Lupine research claims surface: 8 curated facets organizing the published claim inventory.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${SITE}/atlas/claims/">
  <meta property="og:title" content="Lupine research claims - curated facets - Lupine Science">
  <meta property="og:description" content="The Lupine research claims surface: 8 curated facets organizing the published claim inventory.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/atlas/claims/">
  <meta property="og:image" content="${SITE}/og-lupine-science.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Lupine research claims - curated facets - Lupine Science">
  <meta name="twitter:description" content="The Lupine research claims surface: 8 curated facets organizing the published claim inventory.">
  <meta name="twitter:image" content="${SITE}/og-lupine-science.jpg">
  <meta name="theme-color" content="#faf9f6">
  <link rel="icon" type="image/svg+xml" href="/lupine-science-mark.svg">
  <link rel="icon" type="image/png" href="/lupine-science-icon.png">
  <link rel="apple-touch-icon" href="/lupine-science-icon.png">
  <link rel="preload" href="/fonts/newsreader-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/newsreader-italic-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/articles/styles.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"Lupine research claims - curated facets","url":"${SITE}/atlas/claims/","isPartOf":{"@type":"WebSite","name":"Lupine Science","url":"${SITE}"}}</script>
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header class="site-header">
    <a class="mark" href="/" aria-label="Lupine Science">
      <svg viewBox="100 44 312 440" fill="none" aria-hidden="true">
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
      </svg>
      <span><b>Lupine Science</b> <span class="tld">accelerating materials discovery</span></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/articles/">Articles</a>
      <a href="/videos/">Videos</a>
      <a href="/atlas/" aria-current="page">Atlas</a>
      <a href="https://library.lupine.science">Library</a>
      <a href="https://lupi.live">LUPI</a>
    </nav>
  </header>
  <main id="content" class="atlas-claims-index">
    <p class="b-label"><a href="/atlas/">&larr; Atlas</a></p>
    <p class="atlas-claims-kicker">Curated claim facets</p>
    <h1>Lupine research claims</h1>
    <p class="atlas-claims-blurb">The 146 claim/S* nodes in the Lupine research ontology. Internal scaffolding (relation:* predicates, superclass:* definitions) stays in the wiki DB. Domain claims are surfaced here in 8 named facets, ordered so the story reads from the failure modes to the corrective framing to the published artifacts.</p>
    <ul class="atlas-claims-grid">
${cards}
    </ul>
  </main>
  <footer class="foot">
    <span class="creed">Evidence before claim.</span>
    <span><a href="/articles/">Articles</a> &middot; <a href="https://lupi.live">LUPI</a> &middot; <a href="https://library.lupine.science">Library</a> &middot; <a href="https://github.com/alexwelcing/lupine">Repository</a></span>
  </footer>
</body>
</html>
`;
}

let written = 0;
const seenFacetSlugs = new Set();
for (const facet of FACETS) {
  if (seenFacetSlugs.has(facet.slug)) fail(`internal: duplicate facet slug ${facet.slug}`);
  seenFacetSlugs.add(facet.slug);
  const claims = facet.claims.map((cid) => {
    const c = claimIndex.get(cid);
    if (!c) fail(`internal: claimIndex missing ${cid}`);
    return c;
  });
  const dir = path.join(OUT_ROOT, facet.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml({ facet, claims }));
  written += 1;
}

// Facets index.
fs.mkdirSync(OUT_ROOT, { recursive: true });
fs.writeFileSync(path.join(OUT_ROOT, 'index.html'), indexHtml(FACETS));

// Retire stale facet directories that no longer correspond to a curated facet.
const stale = [];
for (const entry of fs.readdirSync(OUT_ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (!seenFacetSlugs.has(entry.name)) stale.push(entry.name);
}
for (const slug of stale) {
  fs.rmSync(path.join(OUT_ROOT, slug), { recursive: true });
  console.log(`retired /atlas/claims/${slug}/ (no curated facet)`);
}

console.log(`claim facets: ${written} facet(s) + index -> ${path.relative(ROOT, OUT_ROOT)}/<facet>/index.html`);
