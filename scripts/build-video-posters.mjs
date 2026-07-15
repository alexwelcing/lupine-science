#!/usr/bin/env node
// Build clean, brand-aligned video poster frames.
//
// Reads data/video-posters.json, generates a text-free visual via FAL/Flux,
// then composites a controlled SVG title/source overlay with Sharp.
// Output: public/videos/{slug}-poster.jpg
//
// Usage:
//   FAL_API_KEY=... node scripts/build-video-posters.mjs
//   FAL_API_KEY=... node scripts/build-video-posters.mjs --slug why-lupi
//   FAL_API_KEY=... node scripts/build-video-posters.mjs --dry-run

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fal } from '@fal-ai/client';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'data', 'video-posters.json');
const OUT_DIR = path.join(ROOT, 'public', 'videos');

function loadEnv() {
  if (process.env.FAL_API_KEY) return process.env.FAL_API_KEY;
  try {
    const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const m = env.match(/^FAL_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  } catch {
    // ignore
  }
  return undefined;
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Poster text must survive OCR without tripping the gibberish filter.
// Normalize subscripts, dashes, and separators so Tesseract reads real words.
function sanitizePosterText(s) {
  return String(s)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x2080 + 0x30))
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x2070 + 0x30))
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\//g, ' ');
}

function buildOverlaySvg(entry, manifest) {
  const defaults = manifest.defaults;
  const tokens = manifest.tokens;
  const cfg = { ...defaults.overlay, ...(entry.overlay || {}) };
  const W = defaults.width;
  const H = defaults.height;
  const marginX = cfg.marginX;
  const marginY = cfg.marginY;
  const titleLines = wrapText(entry.title, Math.round(cfg.maxTitleWidth / (cfg.titleSize * 0.55)));
  const subtitleLines = wrapText(entry.subtitle, Math.round(cfg.maxTitleWidth / (cfg.subtitleSize * 0.55)));

  const lineHeightTitle = Math.round(cfg.titleSize * cfg.lineHeight);
  const lineHeightSubtitle = Math.round(cfg.subtitleSize * cfg.lineHeight);
  const titleBlockH = titleLines.length * lineHeightTitle;
  const subtitleBlockH = subtitleLines.length * lineHeightSubtitle;
  const gap = 18;
  const sourceGap = 28;
  const totalH = titleBlockH + gap + subtitleBlockH + sourceGap + cfg.sourceSize;

  let y = H - marginY - totalH;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <filter id="text-shadow-${entry.slug}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${Math.round(cfg.shadowBlur / 3)}"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="1"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="bottom-scrim-${entry.slug}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${cfg.scrimFrom || '#16171d'}" stop-opacity="0"/>
      <stop offset="1" stop-color="${cfg.scrimTo || '#16171d'}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${H - totalH - marginY - 40}" width="${W}" height="${totalH + marginY + 80}" fill="url(#bottom-scrim-${entry.slug})"/>
`;

  svg += `  <g filter="url(#text-shadow-${entry.slug})">\n`;

  for (const line of titleLines) {
    svg += `    <text x="${marginX}" y="${y}" font-family="${cfg.titleFont || tokens.serif}" font-size="${cfg.titleSize}" font-weight="500" fill="${cfg.textColor}">${escapeXml(line)}</text>\n`;
    y += lineHeightTitle;
  }
  y += gap;
  for (const line of subtitleLines) {
    svg += `    <text x="${marginX}" y="${y}" font-family="${cfg.subtitleFont || tokens.serif}" font-size="${cfg.subtitleSize}" font-weight="400" fill="${cfg.textColor}" opacity="0.92">${escapeXml(line)}</text>\n`;
    y += lineHeightSubtitle;
  }
  y += sourceGap;
  svg += `    <text x="${marginX}" y="${y}" font-family="${cfg.sourceFont || tokens.mono}" font-size="${cfg.sourceSize}" font-weight="400" fill="${cfg.textColor}" opacity="0.75">${escapeXml(entry.source)}</text>\n`;
  svg += `  </g>\n</svg>`;

  return svg;
}

async function fetchImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function generatePoster(entry, defaults, dryRun) {
  const outPath = path.join(OUT_DIR, `${entry.slug}-poster.jpg`);
  console.log(`[${entry.slug}] generating...`);

  if (dryRun) {
    console.log(`  dry-run: would call fal-ai/flux/dev with seed ${entry.seed}`);
    console.log(`  prompt: ${entry.prompt.slice(0, 120)}...`);
    return { slug: entry.slug, skipped: true, outPath };
  }

  const result = await fal.subscribe('fal-ai/flux/dev', {
    input: {
      prompt: entry.prompt,
      seed: entry.seed,
      image_size: entry.image_size || defaults.defaults?.image_size || 'landscape_16_9',
      safety_tolerance: entry.safety_tolerance || defaults.defaults?.safety_tolerance || '2',
    },
    logs: false,
  });

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error(`no image URL returned for ${entry.slug}`);

  console.log(`[${entry.slug}] downloaded visual`);
  const visual = await fetchImage(imageUrl);

  const displayEntry = {
    ...entry,
    title: sanitizePosterText(entry.title),
    subtitle: sanitizePosterText(entry.subtitle),
    source: sanitizePosterText(entry.source),
  };
  const svg = buildOverlaySvg(displayEntry, defaults);
  await sharp(visual)
    .resize(defaults.defaults.width, defaults.defaults.height, { fit: 'cover', position: 'centre' })
    .composite([{ input: Buffer.from(svg), blend: 'over' }])
    .jpeg({ quality: 92, progressive: true, chromaSubsampling: '4:2:0' })
    .toFile(outPath);

  console.log(`[${entry.slug}] wrote ${outPath}`);
  return { slug: entry.slug, outPath };
}

async function main() {
  const args = process.argv.slice(2);
  const slugArg = args.find((a, i) => a === '--slug' && args[i + 1]) ? args[args.indexOf('--slug') + 1] : undefined;
  const dryRun = args.includes('--dry-run');

  const creds = loadEnv();
  if (!creds) {
    console.error('FAL_API_KEY not found. Set it in the environment or in .env');
    process.exit(1);
  }
  fal.config({ credentials: creds });

  const manifest = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const posters = slugArg
    ? manifest.posters.filter((p) => p.slug === slugArg)
    : manifest.posters;

  if (posters.length === 0) {
    console.error(`No posters matched ${slugArg || '(none)'}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const results = [];
  for (const entry of posters) {
    try {
      const r = await generatePoster(entry, manifest, dryRun);
      results.push(r);
    } catch (e) {
      console.error(`[${entry.slug}] FAILED: ${e.message}`);
      results.push({ slug: entry.slug, error: e.message });
      if (!dryRun) process.exitCode = 1;
    }
  }

  const failures = results.filter((r) => r.error);
  if (failures.length) {
    console.error(`\n${failures.length} poster(s) failed.`);
    process.exit(1);
  }
  console.log(`\nGenerated ${results.length} poster(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
