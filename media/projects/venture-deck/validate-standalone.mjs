#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const PROJECT = path.dirname(fileURLToPath(import.meta.url));
const HTML_FILE = path.join(PROJECT, 'deck.html');
const EVIDENCE_FILE = path.join(PROJECT, 'evidence-manifest.json');
const LOCK_FILE = path.join(PROJECT, 'asset-lock.json');
const failures = [];
const pass = (message) => console.log(`[pass] ${message}`);
const fail = (message) => failures.push(message);
const digest = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

const html = fs.readFileSync(HTML_FILE, 'utf8');
const evidence = JSON.parse(fs.readFileSync(EVIDENCE_FILE, 'utf8'));
const lock = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
const slideBlocks = [...html.matchAll(/<section class="slide(?: is-active)?"[\s\S]*?<\/section>/g)].map((match) => match[0]);

if (slideBlocks.length === 13) pass('exactly 13 slides'); else fail(`expected 13 slides, found ${slideBlocks.length}`);
if (/<link[^>]+rel="stylesheet"|<script[^>]+src=/.test(html)) fail('external CSS or JavaScript dependency found');
else pass('all CSS and JavaScript are inline');
if (/https?:\/\//i.test(html.replace(/<script type="application\/json"[\s\S]*?<\/script>/, ''))) fail('remote runtime URL found');
else pass('no remote runtime URLs');

const resourceUrls = [
  ...[...html.matchAll(/\bsrc="([^"]+)"/g)].map((match) => match[1]),
  ...[...html.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1]),
];
const nonEmbedded = resourceUrls.filter((url) => !url.startsWith('data:'));
if (nonEmbedded.length) fail(`non-embedded resources: ${nonEmbedded.join(', ')}`); else pass('all fonts and images are embedded data URLs');

const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
const allowed = new Set(['#faf9f6', '#16171d', '#3d4db3', '#8a5e1f']);
const colors = new Set([...style.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((match) => match[0].toLowerCase()));
const disallowed = [...colors].filter((color) => !allowed.has(color));
if (disallowed.length) fail(`disallowed CSS colors: ${disallowed.join(', ')}`); else pass('CSS uses only the four manifest colors');
if (/gradient\(|box-shadow\s*:|rgba?\(|hsla?\(|opacity\s*:/i.test(style)) fail('forbidden gradient, shadow, or opacity treatment found');
else pass('no gradients, shadows, or opacity treatments');

const embeddedRaw = html.match(/<script type="application\/json" id="evidence-manifest">([\s\S]*?)<\/script>/)?.[1];
if (!embeddedRaw) fail('embedded evidence manifest missing');
else {
  const embedded = JSON.parse(embeddedRaw.replace(/<\\\//g, '</'));
  if (JSON.stringify(embedded) === JSON.stringify(evidence)) pass('evidence manifest is embedded intact');
  else fail('embedded evidence manifest differs from source');
}

for (let index = 0; index < slideBlocks.length; index++) {
  const number = String(index + 1);
  const block = slideBlocks[index];
  const expectedFooter = evidence.slide_source_footers[number];
  const source = block.match(/<p class="source"[^>]*>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
  if (expectedFooter && source !== expectedFooter) fail(`slide ${number}: source footer mismatch`);
  if (!expectedFooter && source) fail(`slide ${number}: unexpected source footer`);
  const expectedClaims = evidence.slide_claim_ids[number] || [];
  const actualClaims = (block.match(/data-claim-id="([^"]+)"/)?.[1] || '').split(/\s+/).filter(Boolean);
  if (JSON.stringify([...actualClaims].sort()) !== JSON.stringify([...expectedClaims].sort())) fail(`slide ${number}: claim IDs differ from manifest`);
}
if (!failures.some((item) => item.includes('source footer') || item.includes('claim IDs'))) pass('all slide claim IDs and visible source footers match the manifest');

if (!html.includes('One 30-path panel. One chemistry family. Not peer-reviewed.')) fail('honest risk headline missing');
else pass('honest risk headline present');
const ownerCount = (html.replace(/<script type="application\/json"[\s\S]*?<\/script>/, '').match(/\[OWNER DECISION\]/g) || []).length;
if (ownerCount !== 3) fail(`expected 3 owner-decision fields, found ${ownerCount}`); else pass('three [OWNER DECISION] ask fields present');

const imageMatches = [...html.matchAll(/<img class="deck-asset"[^>]+src="data:image\/png;base64,([^"]+)"[^>]+data-certified-asset="([^"]+)"[^>]+data-asset-sha256="([^"]+)"/g)];
if (imageMatches.length !== lock.assets.length) fail(`expected ${lock.assets.length} embedded certified images, found ${imageMatches.length}`);
else {
  for (let index = 0; index < imageMatches.length; index++) {
    const [, payload, assetId, declaredHash] = imageMatches[index];
    const expected = lock.assets[index];
    const actualHash = digest(Buffer.from(payload, 'base64'));
    if (assetId !== expected.asset_id || declaredHash !== expected.sha256 || actualHash !== expected.sha256) fail(`slide ${index + 1}: embedded asset certification mismatch`);
  }
  if (!failures.some((item) => item.includes('asset certification'))) pass('all 13 embedded images retain certified SHA-256 hashes');
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const network = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('request', (request) => network.push(request.url()));
  await page.goto(`${pathToFileURL(HTML_FILE).href}#slide-01`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
  if (consoleErrors.length) fail(`file:// console errors: ${consoleErrors.join(' | ')}`); else pass('file:// deck opens with a clean browser console');
  const external = network.filter((url) => !url.startsWith('file:') && !url.startsWith('data:'));
  if (external.length) fail(`file:// deck attempted external requests: ${external.join(', ')}`); else pass('file:// deck makes no network requests');
  await page.emulateMedia({ media: 'print' });
  const state = await page.evaluate(() => {
    const issues = [];
    const slides = [...document.querySelectorAll('.slide')];
    for (const [index, slide] of slides.entries()) {
      const rect = slide.getBoundingClientRect();
      if (Math.abs(rect.width - 1920) > 0.5 || Math.abs(rect.height - 1080) > 0.5) issues.push(`slide ${index + 1}: ${rect.width}x${rect.height}`);
      const image = slide.querySelector('.deck-asset');
      if (!image?.complete || image.naturalWidth < 1) issues.push(`slide ${index + 1}: image unavailable`);
      for (const element of slide.querySelectorAll('[data-fit]')) {
        if (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1) issues.push(`slide ${index + 1}: overflow`);
      }
    }
    return { issues, active: document.querySelector('.slide.is-active')?.dataset.slide };
  });
  if (state.issues.length) state.issues.forEach(fail); else pass('all slides are 1920×1080 with loaded images and no declared text overflow');
  await page.emulateMedia({ media: 'screen' });
  await page.keyboard.press('ArrowRight');
  const activeAfterKey = await page.locator('.slide.is-active').getAttribute('data-slide');
  if (state.active === '1' && activeAfterKey === '2') pass('keyboard navigation works from file://'); else fail(`keyboard navigation state ${state.active} -> ${activeAfterKey}`);
} finally {
  if (browser) await browser.close();
}

if (failures.length) {
  failures.forEach((message) => console.error(`[fail] ${message}`));
  process.exit(1);
}
console.log(`standalone venture deck validation passed (${fs.statSync(HTML_FILE).size} bytes, sha256 ${digest(fs.readFileSync(HTML_FILE))}).`);
