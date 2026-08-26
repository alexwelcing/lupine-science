import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';

export const APPROVED_PUBLIC_ECONOMICS = [
  '72.4% fewer DFT evaluations',
  '$14.65 per 129 anchors',
];

export const PUBLIC_ECONOMICS_PDFS = [
  'public/booklets/the-savings-stack.pdf',
  'public/venture/lupine-science-venture-deck.pdf',
];

export const PUBLIC_TEXT_EXTENSIONS = new Set([
  '.css', '.html', '.js', '.json', '.md', '.mjs', '.py', '.svg', '.txt', '.vtt', '.xml',
]);

const BLOCKED_PATTERNS = [
  { label: 'blocked $4.65 cost', pattern: /\$\s?4\.65/ },
  { label: 'blocked 4.65 per anchors', pattern: /\b4\.65\s+per\s+\d+\s+anchors/i },
  { label: 'blocked cloud-equivalent', pattern: /\$\s?\d+(?:\.\d+)?\s+cloud-equivalent/i },
  { label: 'blocked wall-hours cost', pattern: /\d+(?:\.\d+)?\s+wall-hours\s+of\s+execution\s+cost/i },
  { label: 'blocked naive-vs-shared counts', pattern: /\d+\s+naive\s+(?:evaluations?|anchors?)[\s\S]{0,80}\d+\s+(?:shared|union|executed)\s+(?:evaluations?|anchors?)/i },
  { label: 'blocked reduction multiplier', pattern: /\d+(?:\.\d+)?\s*[×x]\s+(?:(?:reduction|decrease)\s+in\s+|fewer\s+)?DFT\s+evaluations/i },
  { label: 'blocked local electricity', pattern: /sixty\s+cents\s+of\s+local\s+electricity/i },
  { label: 'blocked ~10% more', pattern: /about\s+10%\s+more\s+DFT/i },
  { label: 'blocked 71% fewer', pattern: /71%\s+fewer\s+DFT\s+evaluations/i },
];

const REVIEWED_PRIMARY_RECORDS = new Set([
  'public/articles/the-savings-stack/index.html',
  'public/articles/z1-union-debrief/index.html',
  'public/booklets/the-savings-stack.pdf',
  'media/booklets/savings-stack/index.html',
  'articles/the-savings-stack.md',
  'articles/z1-union-debrief.md',
]);

const REVIEWED_PRIMARY_PREFIXES = ['public/data/savings-stack-v1/'];

export function isReviewedPrimaryRecord(relative) {
  if (REVIEWED_PRIMARY_RECORDS.has(relative)) return true;
  return REVIEWED_PRIMARY_PREFIXES.some((prefix) => relative.startsWith(prefix));
}

export function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolute) : [absolute];
  });
}

export function scanPublicSurfaces(root) {
  const publicRoot = path.join(root, 'public');
  if (!fs.existsSync(publicRoot)) {
    throw new Error('public publication root is missing');
  }
  const surfaces = walkFiles(publicRoot)
    .filter((absolute) => {
      const ext = path.extname(absolute).toLowerCase();
      return PUBLIC_TEXT_EXTENSIONS.has(ext) || absolute.endsWith('.pdf');
    })
    .sort()
    .map((absolute) => path.relative(root, absolute).split(path.sep).join('/'));

  if (surfaces.length === 0) {
    throw new Error('public publication inventory is empty');
  }
  return surfaces;
}

export function publicEconomicsTextSurfaces(root) {
  return scanPublicSurfaces(root).filter((relative) => !relative.endsWith('.pdf'));
}

export function publicText(relative, raw) {
  if (!relative.endsWith('.html')) return raw;
  const document = new JSDOM(raw).window.document;
  const metadata = [...document.querySelectorAll('meta[content]')].map((node) => node.content);
  const imageText = [...document.querySelectorAll('img')].flatMap((node) => [node.alt, node.title].filter(Boolean));
  const structured = [...document.querySelectorAll('script[type="application/ld+json"], script[type="application/json"]')]
    .map((node) => node.textContent);
  document.querySelectorAll('style, script').forEach((node) => node.remove());
  return [document.body?.textContent || '', ...metadata, ...imageText, ...structured].join('\n');
}

export function validatePublicEconomics(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const failures = [];

  for (const approved of APPROVED_PUBLIC_ECONOMICS) {
    if (normalized.includes(approved)) continue;
    failures.push({ approved, reason: 'approved claim missing from publication surface' });
  }

  for (const { label, pattern } of BLOCKED_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) failures.push({ label, match: match[0] });
  }

  const approvedCost = APPROVED_PUBLIC_ECONOMICS.find((claim) => claim.startsWith('$'));
  for (const match of normalized.matchAll(/\$\s?\d+(?:\.\d+)?\s+per\s+\d+\s+anchors\b/gi)) {
    if (approvedCost && match[0] === approvedCost) continue;
    failures.push({ label: 'unapproved cost claim', match: match[0] });
  }

  for (const match of normalized.matchAll(/\d+(?:\.\d+)?\s*%?\s*[-–—]\s*\d+(?:\.\d+)?\s+naive\s+(?:evaluations?|anchors?)[\s\S]{0,80}\d+(?:\.\d+)?\s+(?:shared|union|executed)\s+(?:evaluations?|anchors?)/i)) {
    failures.push({ label: 'count comparison', match: match[0] });
  }

  for (const match of normalized.matchAll(/\b\d+(?:\.\d+)?\s*[×x]\s+(?:(?:reduction|decrease)\s+in\s+|fewer\s+)?DFT\s+evaluations\b/i)) {
    if (match[0].includes('72.4')) continue;
    failures.push({ label: 'multiplier claim', match: match[0] });
  }

  return failures;
}
