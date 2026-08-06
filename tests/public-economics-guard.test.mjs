import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPROVED_PERCENT = '72.4% fewer DFT evaluations';
const APPROVED_COST = '$14.65 per 129 anchors';

const TEXT_SURFACES = [
  'articles/z1-union-debrief.md',
  'articles/the-savings-stack.md',
  'media/booklets/savings-stack/index.html',
  'media/projects/venture-deck/index.html',
  'media/projects/venture-deck/deck.html',
  'media/projects/venture-deck/narrative-script.md',
  'media/projects/venture-deck/evidence-manifest.json',
  'media/brand-campaign-2026-07-27/render_campaign_videos.py',
  'media/brand-campaign-2026-07-27/campaign-video-storyboards.json',
  'public/articles/z1-union-debrief/index.html',
  'public/articles/the-savings-stack/index.html',
  'public/venture/deck.html',
  'public/venture/evidence-manifest.json',
  'public/videos/z1-union-debrief/index.html',
  'public/videos/the-savings-stack/index.html',
  'public/videos/index.html',
];

const PDF_SURFACES = [
  'media/projects/venture-deck/lupine-science-venture-deck.pdf',
  'public/booklets/the-savings-stack.pdf',
  'public/venture/lupine-science-venture-deck.pdf',
];

const FORBIDDEN = [
  { label: '70% substitute', sample: '70% fewer DFT evaluations', pattern: /\b70(?:\.0)?\s*%/i },
  { label: '3.33× derived ratio', sample: '3.33× reduction', pattern: /\b3\.33(?:3+)?\s*[×x]/i },
  { label: '3.62× derived ratio', sample: '3.62× reduction', pattern: /\b3\.62(?:3+)?\s*[×x]/i },
  { label: '~10% derived comparison', sample: 'about 10% more DFT', pattern: /(?:~|≈|about|approximately)\s*10\s*%/i },
  { label: 'sixty-cent electricity estimate', sample: 'sixty cents of electricity', pattern: /sixty\s+cents|\$0\.60/i },
  { label: '558/154 substitute economics', sample: '558 naive versus 154 shared', pattern: /\b558\b[\s\S]{0,80}\b154\b/i },
  { label: '430/129 substitute economics', sample: '430 naive versus 129 shared', pattern: /\b430\b[\s\S]{0,80}\b129\b/i },
];

function normalized(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function publicText(relative, raw) {
  if (!relative.endsWith('.html')) return raw;
  const document = new JSDOM(raw).window.document;
  const metadata = [...document.querySelectorAll('meta[content]')].map((node) => node.content);
  const imageText = [...document.querySelectorAll('img')].flatMap((node) => [node.alt, node.title].filter(Boolean));
  const structuredData = [...document.querySelectorAll('script[type="application/ld+json"], script[type="application/json"]')]
    .map((node) => node.textContent);
  document.querySelectorAll('style, script').forEach((node) => node.remove());
  const bodyNodes = [];
  if (document.body) {
    const walker = document.createTreeWalker(document.body, document.defaultView.NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) bodyNodes.push(node.nodeValue);
  }
  const bodyText = bodyNodes.join('\n');
  return [bodyText, ...metadata, ...imageText, ...structuredData].join('\n');
}

function assertFrozenEconomics(relative, raw) {
  const text = normalized(raw).replace(/\s+%/g, '%');
  for (const { label, pattern } of FORBIDDEN) {
    assert.doesNotMatch(text, pattern, `${relative}: ${label} is not approved public economics`);
  }

  for (const match of text.matchAll(/72\.4%/gi)) {
    assert.equal(
      text.slice(match.index, match.index + APPROVED_PERCENT.length).toLowerCase(),
      APPROVED_PERCENT.toLowerCase(),
      `${relative}: every 72.4% occurrence must use the exact approved claim`,
    );
  }

  for (const match of text.matchAll(/\$14\.65/gi)) {
    assert.equal(
      text.slice(match.index, match.index + APPROVED_COST.length).toLowerCase(),
      APPROVED_COST.toLowerCase(),
      `${relative}: every $14.65 occurrence must use the exact approved claim`,
    );
  }
}

describe('frozen public economics', () => {
  for (const relative of TEXT_SURFACES) {
    it(`permits only approved economics in ${relative}`, () => {
      assertFrozenEconomics(relative, publicText(relative, fs.readFileSync(path.join(ROOT, relative), 'utf8')));
    });
  }

  for (const relative of PDF_SURFACES) {
    it(`permits only approved economics in ${relative}`, () => {
      const text = execFileSync('pdftotext', ['-layout', path.join(ROOT, relative), '-'], { encoding: 'utf8' });
      assertFrozenEconomics(relative, text);
    });
  }

  it('fails closed on each known substitute economics form', () => {
    for (const { label, sample } of FORBIDDEN) {
      assert.throws(
        () => assertFrozenEconomics(`fixture:${label}`, `Public economics: ${sample}`),
        /not approved public economics/,
      );
    }
  });
});
