#!/usr/bin/env node
// Optimizes shipped media in place:
//  - article hero videos: H.264 CRF re-encode (audio kept only where the
//    page actually plays it), +faststart
//  - raster images: emit AVIF + WebP siblings and recompress the original
//  - OG images stay PNG/JPEG (crawlers don't read AVIF) but get recompressed
//
// ffmpeg comes from imageio-ffmpeg (pip) because the npm static binary is
// blocked by this environment's proxy. Requires: pip install imageio-ffmpeg
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const FFMPEG = process.env.FFMPEG || execFileSync('python3', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();

const kb = (p) => `${(fs.statSync(p).size / 1024).toFixed(0)} KB`;

// ── videos ──────────────────────────────────────────────────────────
const VIDEOS = [
  // narrated launch film: keep audio, it is the article's controls-embed too
  { file: 'articles/why-lupine-science/hero.mp4', audio: true, crf: 27 },
  // ambience loop, played muted everywhere: strip audio
  { file: 'articles/from-fantasy-frameworks-to-makeable-materials/hero.mp4', audio: false, crf: 27 },
];

for (const v of VIDEOS) {
  const src = path.join(PUBLIC, v.file);
  if (!fs.existsSync(src)) { console.log(`skip (missing): ${v.file}`); continue; }
  const tmp = `${src}.tmp.mp4`;
  const before = kb(src);
  const args = ['-y', '-i', src,
    '-c:v', 'libx264', '-crf', String(v.crf), '-preset', 'slow',
    '-vf', "scale='min(1280,iw)':-2", '-pix_fmt', 'yuv420p',
    ...(v.audio ? ['-c:a', 'aac', '-b:a', '96k', '-ac', '1'] : ['-an']),
    '-movflags', '+faststart', tmp];
  execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  if (fs.statSync(tmp).size < fs.statSync(src).size) {
    fs.renameSync(tmp, src);
    console.log(`${v.file}: ${before} → ${kb(src)}`);
  } else {
    fs.unlinkSync(tmp);
    console.log(`${v.file}: kept original (${before}), re-encode was larger`);
  }
}

// ── images ──────────────────────────────────────────────────────────
// content images get AVIF/WebP siblings + recompressed original
const PICTURES = [
  'articles/why-lupine-science/hero.jpg',
  'articles/from-fantasy-frameworks-to-makeable-materials/hero.jpg',
  'ribbon-still.jpg',
];

for (const rel of PICTURES) {
  const src = path.join(PUBLIC, rel);
  if (!fs.existsSync(src)) { console.log(`skip (missing): ${rel}`); continue; }
  const base = src.replace(/\.(jpe?g|png)$/i, '');
  const img = sharp(src).resize({ width: 1600, withoutEnlargement: true });
  await img.clone().avif({ quality: 55 }).toFile(`${base}.avif`);
  await img.clone().webp({ quality: 78 }).toFile(`${base}.webp`);
  const tmp = `${src}.tmp.jpg`;
  await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(tmp);
  if (fs.statSync(tmp).size < fs.statSync(src).size) fs.renameSync(tmp, src);
  else fs.unlinkSync(tmp);
  console.log(`${rel}: jpg ${kb(src)} · webp ${kb(`${base}.webp`)} · avif ${kb(`${base}.avif`)}`);
}

// OG / icon images: keep format, recompress
const FLAT = [
  { file: 'og-mof-formalization.png', width: 1200 },
  { file: 'og-lupine-science.png', width: 1200 },
  { file: 'lupine-science-icon.png', width: 256 },
];

for (const f of FLAT) {
  const src = path.join(PUBLIC, f.file);
  if (!fs.existsSync(src)) continue;
  const before = kb(src);
  const tmp = `${src}.tmp.png`;
  await sharp(src)
    .resize({ width: f.width, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toFile(tmp);
  if (fs.statSync(tmp).size < fs.statSync(src).size) {
    fs.renameSync(tmp, src);
    console.log(`${f.file}: ${before} → ${kb(src)}`);
  } else {
    fs.unlinkSync(tmp);
    console.log(`${f.file}: kept original (${before})`);
  }
}
console.log('media pass complete');
