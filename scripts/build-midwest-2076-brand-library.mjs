#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyAcceptedRecord } from './lib/brand-library-publication.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'media', 'projects', 'midwest-2076-library', 'requests.json');
const PAGE = path.join(ROOT, 'public', 'brand-assets', 'index.html');
const START = '<!-- MIDWEST_2076_LIBRARY_START -->';
const END = '<!-- MIDWEST_2076_LIBRARY_END -->';
const allowPartial = process.argv.includes('--allow-partial');

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function isAccepted(record) {
  return ['completed', 'generated', 'published'].includes(record.status) &&
    record.qa?.status === 'accepted';
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
if (manifest.requestedCount !== 100 || manifest.requests?.length !== 100) {
  throw new Error(`expected manifest cardinality 100, got ${manifest.requests?.length ?? 0}`);
}
if (manifest.assetClasses?.length !== 10) throw new Error('expected exactly 10 asset classes');

const accepted = manifest.requests.filter(isAccepted);
if (!allowPartial && accepted.length !== 100) {
  throw new Error(`publication refuses incomplete library: ${accepted.length}/100 QA-accepted`);
}
if (allowPartial && accepted.length === 0) {
  throw new Error('partial preview requires at least one QA-accepted output');
}

for (const record of accepted) {
  verifyAcceptedRecord(record, path.join(ROOT, 'public'));
}

const sections = manifest.assetClasses.map((assetClass) => {
  const records = accepted.filter((record) => record.assetClass === assetClass.id);
  if (!allowPartial && records.length !== 10) {
    throw new Error(`${assetClass.id} has ${records.length}/10 accepted outputs`);
  }
  if (!records.length) return '';
  const cards = records.map((record) => `
        <figure class="card world-card" data-aspect="${esc(record.aspect)}" data-class="${esc(record.assetClass)}">
          <a href="${esc(record.publicMasterPath)}" download>
            <img src="${esc(record.publicThumbPath)}" alt="${esc(record.assetClassName)} — variation ${record.variation}" loading="lazy" decoding="async">
          </a>
          <figcaption>
            <strong>${esc(record.assetClassName)} ${String(record.variation).padStart(2, '0')}</strong>
            <span>${esc(record.id)} · ${esc(record.aspect)} · download WebP</span>
          </figcaption>
        </figure>`).join('');
  return `
      <section class="world-class" id="${esc(assetClass.id)}">
        <div class="world-class-head">
          <p>${esc(assetClass.id.replaceAll('-', ' '))}</p>
          <h3>${esc(assetClass.name)}</h3>
          <span>${records.length} works</span>
        </div>
        <div class="grid world-grid">${cards}
        </div>
      </section>`;
}).join('\n');

const section = `${START}
    <section class="world-library" aria-labelledby="midwest-2076-title">
      <div class="world-intro">
        <p class="world-kicker">Speculative material culture · 2076</p>
        <h2 id="midwest-2076-title">The molecule becomes an <em>invisible cause.</em></h2>
        <p>One hundred source-free studies of future Midwestern infrastructure, institutions, tools, interiors, and material systems. These are speculative artworks—not forecasts, engineering proposals, scientific references, simulations, or evidence of real deployments.</p>
      </div>${sections}
    </section>
    ${END}`;

let html = fs.readFileSync(PAGE, 'utf8');
if (!html.includes(START) || !html.includes(END)) throw new Error('brand page is missing Midwest 2076 markers');
html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), section);
html = html.replace(/<p class="lede">[^<]*<\/p>/, `<p class="lede">${200 + accepted.length} generated stills: the Midwest 2076 world library, research motifs, abstract textures, and standalone iconography. Select an image to download it.</p>`);
html = html.replace(/<p class="stats">[^<]*<\/p>/, `<p class="stats">${200 + accepted.length} image assets · ${accepted.length} Midwest 2076 studies · 10 speculative asset classes · 4 procedural patterns · 7 result graphics · 1 deck token system</p>`);
fs.writeFileSync(PAGE, html);
console.log(JSON.stringify({ page: path.relative(ROOT, PAGE), accepted: accepted.length, classes: manifest.assetClasses.length, allowPartial }, null, 2));
