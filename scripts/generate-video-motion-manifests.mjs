#!/usr/bin/env node
// Generate a default motion-video manifest for every article that has images.
//
// Scans articles/*.md, matches embedded images to files in
// public/articles/<slug>/images/, and writes data/video-motion/<slug>.json.
// Existing manifests are left alone unless --force is passed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'articles');
const PUBLIC_ARTICLES_DIR = path.join(ROOT, 'public', 'articles');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');

const EFFECTS = [
  'slow-zoom-in',
  'slow-zoom-out',
  'pan-right',
  'pan-left',
  'pan-up',
  'pan-down',
  'drift',
];

function parseMetadata(md) {
  const meta = {};
  const blockMatch = md.match(/^>(.+?)\n\n/s);
  if (blockMatch) {
    const lines = blockMatch[1].split('\n');
    for (const line of lines) {
      const m = line.match(/^>\s*\*\*(\w+)\*\*:\s*(.+)$/);
      if (m) meta[m[1].toLowerCase()] = m[2].trim();
    }
  }
  const titleMatch = md.match(/^#\s+(.+)$/m);
  meta.title = titleMatch ? titleMatch[1].trim() : meta.deck || '';
  return meta;
}

function parseImages(md, slug) {
  const images = [];
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    let src = m[2].trim();
    const alt = m[1].trim();
    // Only consider images inside this article's images/ folder.
    const prefix = `images/`;
    if (!src.startsWith(prefix)) continue;
    const file = src.slice(prefix.length);
    const full = path.join(PUBLIC_ARTICLES_DIR, slug, 'images', file);
    if (!fs.existsSync(full)) continue;
    images.push({
      image: path.join('public', 'articles', slug, 'images', file),
      alt,
    });
  }
  return images;
}

function buildManifest(slug, md) {
  const meta = parseMetadata(md);
  const images = parseImages(md, slug);
  if (images.length === 0) return null;

  const scenes = images.map((img, i) => {
    const text = img.alt ? [img.alt] : undefined;
    // Keep text overlays short enough to read on a phone.
    const safeText = text && text[0].length > 120 ? undefined : text;
    return {
      image: img.image.split(path.sep).join('/'),
      duration: 6,
      effect: EFFECTS[i % EFFECTS.length],
      ...(safeText ? { text: safeText } : {}),
    };
  });

  return {
    version: new Date().toISOString().slice(0, 10),
    slug,
    title: meta.title,
    description: meta.summary || `Motion-enhanced article video for “${meta.title}”.`,
    scenes,
  };
}

function main() {
  const force = process.argv.includes('--force');
  fs.mkdirSync(MANIFEST_DIR, { recursive: true });

  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  let generated = 0;
  let skipped = 0;
  let noImages = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const outPath = path.join(MANIFEST_DIR, `${slug}.json`);
    if (!force && fs.existsSync(outPath)) {
      skipped++;
      continue;
    }
    const md = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
    const manifest = buildManifest(slug, md);
    if (!manifest) {
      noImages++;
      continue;
    }
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
    generated++;
    console.log(`${slug}: ${manifest.scenes.length} scenes`);
  }

  console.log(`\nGenerated: ${generated}, skipped (existing): ${skipped}, no images: ${noImages}`);
}

main();
