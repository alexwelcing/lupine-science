// Guards the frozen public economics while preserving the unresolved source conflict.
//
// Public copy may use `$14.65 per 129 anchors`, but the conflicting `$4.65 per 129
// anchors` record remains preserved pending authoritative ledger verification. This
// guard blocks the conflicting value from publication without declaring it a typo,
// retiring it, or otherwise laundering the unresolved state into factual prose.
//
// The earlier guard on task/t_da0354ce used a denylist and a hand-maintained surface
// list. It blocked truthful historical measurements in the source articles and still
// missed newly added files. This successor discovers rendered publication surfaces;
// reviewed primary records remain path-bound, while new/republication surfaces fail
// closed to the two frozen claims.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPROVED_COST = '$14.65 per 129 anchors';
const APPROVED_SAVINGS = '72.4% fewer DFT evaluations';
const PUBLIC_TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.py', '.svg', '.txt', '.vtt', '.xml']);
const REVIEWED_PRIMARY_RECORDS = new Set([
  'public/articles/the-savings-stack/index.html',
  'public/articles/z1-union-debrief/index.html',
  'public/booklets/the-savings-stack.pdf',
  'media/booklets/savings-stack/index.html',
  'articles/the-savings-stack.md',
  'articles/z1-union-debrief.md',
]);
const REVIEWED_PRIMARY_PREFIXES = ['public/data/savings-stack-v1/'];

const BLOCKED_CONFLICT = [
  { label: '$4.65 conflicting cost', sample: 'measured execution guardrail: $4.65 per 129 anchors', pattern: /\$\s?4\.65/ },
  { label: 'bare 4.65 per anchors', sample: '4.65 per 129 anchors', pattern: /\b4\.65\s+per\s+\d+\s+anchors/i },
];

const TEXT_SURFACES = [
  'articles/z1-union-debrief.md',
  'articles/the-savings-stack.md',
  'media/booklets/savings-stack/index.html',
  'media/projects/venture-deck/index.html',
  'media/projects/venture-deck/deck.html',
  'media/projects/venture-deck/narrative-script.md',
  'media/projects/venture-deck/evidence-manifest.json',
  'public/articles/z1-union-debrief/index.html',
  'public/articles/the-savings-stack/index.html',
  'public/venture/deck.html',
  'public/venture/evidence-manifest.json',
  'public/videos/index.html',
  // These composition sources are part of the publication inventory because their
  // text is burned into MP4 frames and cannot be recovered from HTML or captions.
  'media/brand-campaign-2026-07-27/render_campaign_videos.py',
  'media/brand-campaign-2026-07-27/campaign-video-storyboards.json',
];

const PDF_SURFACES = [
  'public/booklets/the-savings-stack.pdf',
  'public/venture/lupine-science-venture-deck.pdf',
];

function normalized(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function sha256(absolute) {
  return createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
}

function publicText(relative, raw) {
  if (!relative.endsWith('.html')) return raw;
  const document = new JSDOM(raw).window.document;
  const metadata = [...document.querySelectorAll('meta[content]')].map((node) => node.content);
  const imageText = [...document.querySelectorAll('img')].flatMap((node) => [node.alt, node.title].filter(Boolean));
  const structured = [...document.querySelectorAll('script[type="application/ld+json"], script[type="application/json"]')]
    .map((node) => node.textContent);
  document.querySelectorAll('style, script').forEach((node) => node.remove());
  const body = [];
  if (document.body) {
    const walker = document.createTreeWalker(document.body, document.defaultView.NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) body.push(node.nodeValue);
  }
  return [body.join('\n'), ...metadata, ...imageText, ...structured].join('\n');
}

function isReviewedPrimaryRecord(relative) {
  return REVIEWED_PRIMARY_RECORDS.has(relative) || REVIEWED_PRIMARY_PREFIXES.some((prefix) => relative.startsWith(prefix));
}

function assertNoUnapprovedCost(relative, raw) {
  const text = normalized(raw);
  for (const { label, pattern } of BLOCKED_CONFLICT) {
    assert.doesNotMatch(text, pattern, `${relative}: ${label} is blocked by the preserved conflict pending ledger verification`);
  }
  for (const match of text.matchAll(/\$\s?\d+(?:\.\d+)?\s+per\s+\d+\s+anchors\b/gi)) {
    assert.equal(match[0], APPROVED_COST, `${relative}: ${match[0]} is not approved public economics`);
  }
  for (const match of text.matchAll(/\d+(?:\.\d+)?\s*%\s+fewer\s+(?:DFT\s+)?evaluations\b/gi)) {
    if (isReviewedPrimaryRecord(relative)) continue;
    assert.equal(match[0], APPROVED_SAVINGS, `${relative}: ${match[0]} is not approved public economics`);
  }
  if (!isReviewedPrimaryRecord(relative)) {
    const derivedClaims = [
      /\$\s?\d+(?:\.\d+)?\s+cloud-equivalent\b/i,
      /\d+(?:\.\d+)?\s*[×x]\s+(?:(?:reduction|decrease)\s+in\s+|fewer\s+)?DFT\s+evaluations\b/i,
      /\d+(?:\.\d+)?\s+naive\s+(?:evaluations?|anchors?)[\s\S]{0,80}\d+(?:\.\d+)?\s+(?:shared|union|executed)\s+(?:evaluations?|anchors?)/i,
    ];
    for (const pattern of derivedClaims) {
      const match = text.match(pattern);
      assert.equal(match, null, `${relative}: ${match?.[0]} is not approved public economics`);
    }
  }
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolute) : [absolute];
  });
}

function scanPublicSurfaces(root) {
  const publicRoot = path.join(root, 'public');
  assert.ok(fs.existsSync(publicRoot), 'public publication root is missing');
  const surfaces = walkFiles(publicRoot)
    .filter((absolute) => PUBLIC_TEXT_EXTENSIONS.has(path.extname(absolute).toLowerCase()) || absolute.endsWith('.pdf'))
    .sort();
  assert.ok(surfaces.length > 0, 'public publication inventory is empty');
  for (const absolute of surfaces) {
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    const raw = absolute.endsWith('.pdf')
      ? execFileSync('pdftotext', ['-layout', absolute, '-'], { encoding: 'utf8' })
      : fs.readFileSync(absolute, 'utf8');
    assertNoUnapprovedCost(relative, publicText(relative, raw));
  }
  return surfaces.map((absolute) => path.relative(root, absolute).split(path.sep).join('/'));
}

describe('unapproved economics stay off public surfaces', () => {
  for (const relative of TEXT_SURFACES) {
    it(`keeps unapproved costs out of ${relative}`, () => {
      const absolute = path.join(ROOT, relative);
      assert.ok(fs.existsSync(absolute), `${relative} is missing — update the publication inventory if it was removed on purpose`);
      assertNoUnapprovedCost(relative, publicText(relative, fs.readFileSync(absolute, 'utf8')));
    });
  }

  for (const relative of PDF_SURFACES) {
    it(`keeps unapproved costs out of ${relative}`, () => {
      const absolute = path.join(ROOT, relative);
      assert.ok(fs.existsSync(absolute), `${relative} is missing — update the publication inventory if it was removed on purpose`);
      assertNoUnapprovedCost(relative, execFileSync('pdftotext', ['-layout', absolute, '-'], { encoding: 'utf8' }));
    });
  }

  it('rejects each conflicting form', () => {
    for (const { label, sample } of BLOCKED_CONFLICT) {
      assert.throws(
        () => assertNoUnapprovedCost(`fixture:${label}`, `Public economics: ${sample}`),
        /preserved conflict pending ledger verification/,
        `expected rejection for ${label}`,
      );
    }
  });

  it('blocks $4.65 without resolving the preserved ledger conflict', () => {
    assert.throws(
      () => assertNoUnapprovedCost('fixture:preserved-conflict', 'Measured execution guardrail: $4.65 per 129 anchors.'),
      /preserved conflict pending ledger verification/,
    );
  });

  it('rejects an arbitrary unreviewed anchor cost, not only known bad values', () => {
    assert.throws(
      () => assertNoUnapprovedCost('fixture:unknown-cost', 'Measured execution guardrail: $99.99 per 129 anchors.'),
      /not approved public economics/,
    );
  });

  it('rejects an arbitrary unreviewed DFT savings percentage', () => {
    assert.throws(
      () => assertNoUnapprovedCost('fixture:unknown-savings', 'Sharing anchors required 81.25% fewer DFT evaluations.'),
      /not approved public economics/,
    );
  });

  it('rejects arbitrary derived economics without a value denylist', () => {
    const mutations = [
      'The run cost $88.88 cloud-equivalent.',
      'Sharing anchors delivered a 4.2× reduction in DFT evaluations.',
      'The comparison used 777 naive evaluations versus 111 shared anchors.',
    ];
    for (const mutation of mutations) {
      assert.throws(
        () => assertNoUnapprovedCost('public/new-campaign/index.html', mutation),
        /not approved public economics/,
        mutation,
      );
    }
  });

  it('discovers and rejects economics in a newly added public text surface', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-economics-mutation-'));
    try {
      const publicRoot = path.join(root, 'public', 'new-campaign');
      fs.mkdirSync(publicRoot, { recursive: true });
      fs.writeFileSync(path.join(publicRoot, 'index.html'), '<main>Only $88.88 per 129 anchors.</main>');
      assert.throws(() => scanPublicSurfaces(root), /public\/new-campaign\/index\.html.*not approved public economics/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('scans the complete current public text and PDF inventory', () => {
    const surfaces = scanPublicSurfaces(ROOT);
    assert.ok(surfaces.includes('public/index.html'));
    assert.ok(surfaces.includes('public/venture/lupine-science-venture-deck.pdf'));
  });

  it('supports selected immutable video rerenders without overwriting prior evidence', () => {
    const help = execFileSync('python3', ['media/brand-campaign-2026-07-27/render_campaign_videos.py', '--help'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    assert.match(help, /--qa-attempt QA_ATTEMPT/);
    assert.match(help, /--film-id FILM_ID/);
  });

  it('binds frozen-copy sources to immutable renders and promoted public films', () => {
    const receiptPath = path.join(ROOT, 'tests/fixtures/public-economics-video-receipts.json');
    assert.ok(fs.existsSync(receiptPath), 'video receipt manifest is missing');
    const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    for (const [relative, expected] of Object.entries(receipt.sources)) {
      assert.equal(sha256(path.join(ROOT, relative)), expected, `${relative} changed without rerendering the frozen-copy films`);
    }
    for (const promotion of receipt.promotions) {
      const renderHash = sha256(path.join(ROOT, promotion.render));
      const publicHash = sha256(path.join(ROOT, promotion.public));
      assert.equal(renderHash, promotion.sha256, `${promotion.render} does not match its reviewed receipt`);
      assert.equal(publicHash, promotion.sha256, `${promotion.public} is stale relative to ${promotion.render}`);
    }
  });

  it('permits the approved figure', () => {
    assert.doesNotThrow(() => assertNoUnapprovedCost('fixture:approved', `Measured execution guardrail: ${APPROVED_COST}.`));
  });

  it('permits an unrelated 4.65 that is not the cost claim', () => {
    assert.doesNotThrow(() => assertNoUnapprovedCost('fixture:unrelated', 'The lattice constant is 4.65 angstroms.'));
  });
});
