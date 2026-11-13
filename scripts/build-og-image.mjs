#!/usr/bin/env node
// Renders public/og-lupine-science.jpg (the 1200×630 share card used by the
// homepage, /about/ and /corrections/) from media/og/og-lupine-science.html
// with the site's own self-hosted fonts. Run after editing the card's copy.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { chromiumExecutablePath } from './lib/chromium-executable.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'media', 'og', 'og-lupine-science.html');
const OUT = path.join(ROOT, 'public', 'og-lupine-science.jpg');

const browser = await chromium.launch({ executablePath: chromiumExecutablePath() });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(SOURCE).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
} finally {
  await browser.close();
}
