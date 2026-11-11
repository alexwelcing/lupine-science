#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'articles');
const OUT = path.join(ROOT, 'public', 'articles');
const PUBLIC = path.join(ROOT, 'public');
const SITE = 'https://lupine.science';

function listMarkdownSources() {
  return fs.readdirSync(SRC)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

function articleDir(slug) {
  return path.join(OUT, slug);
}

function publicPathFromUrl(reference) {
  try {
    const pathname = decodeURIComponent(new URL(reference, SITE).pathname);
    return pathname.replace(/^\//, '');
  } catch {
    return reference.replace(/^\//, '');
  }
}

function stripCacheBust(reference) {
  return reference.split('?')[0];
}

function fileExistsAndNonEmpty(absolutePath) {
  if (!fs.existsSync(absolutePath)) return false;
  const stat = fs.statSync(absolutePath);
  return stat.isFile() && stat.size > 0;
}

function resolveMarkdownImage(slug, rawReference) {
  const ref = stripCacheBust(rawReference).trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref)) {
    // External URL — intentionally ignored.
    return null;
  }
  if (ref.startsWith('/')) {
    return path.join(PUBLIC, publicPathFromUrl(ref));
  }
  // Relative to the article directory.
  return path.join(articleDir(slug), ref);
}

function extractInlineImages(markdown) {
  const images = [];
  for (const match of markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    images.push(match[1].trim());
  }
  return images;
}

function verifyHero(slug, errors) {
  const dir = articleDir(slug);
  const heroJpg = path.join(dir, 'hero.jpg');
  const heroMp4 = path.join(dir, 'hero.mp4');

  if (fileExistsAndNonEmpty(heroJpg)) return;
  if (fileExistsAndNonEmpty(heroMp4) && fileExistsAndNonEmpty(heroJpg)) return;
  if (fileExistsAndNonEmpty(heroMp4)) {
    errors.push(`${slug}: hero.mp4 exists but hero.jpg poster is missing`);
    return;
  }
  errors.push(`${slug}: missing hero.jpg (or hero.mp4 + hero.jpg poster)`);
}

function verifyInlineImages(slug, markdown, errors) {
  for (const ref of extractInlineImages(markdown)) {
    const resolved = resolveMarkdownImage(slug, ref);
    if (resolved === null) continue; // external URL
    if (!fileExistsAndNonEmpty(resolved)) {
      errors.push(`${slug}: markdown references missing or empty image ${ref} (resolved to ${path.relative(ROOT, resolved)})`);
    }
  }
}

function verifyBuiltArticleImages(slug, errors) {
  const htmlPath = path.join(articleDir(slug), 'index.html');
  if (!fs.existsSync(htmlPath)) {
    errors.push(`${slug}: built article HTML is missing`);
    return;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const references = [];

  for (const match of html.matchAll(/<img\s+[^>]*src="([^"]+)"/gi)) {
    references.push(match[1]);
  }
  for (const match of html.matchAll(/<source\s+[^>]*srcset="([^"]+)"/gi)) {
    for (const candidate of match[1].split(',')) {
      references.push(candidate.trim().split(/\s+/)[0]);
    }
  }

  for (const rawRef of references) {
    const ref = stripCacheBust(rawRef);
    if (/^[a-z][a-z0-9+.-]*:/i.test(ref)) continue; // external URL
    if (!ref.startsWith('/') && !ref.startsWith(`${SITE}/`)) {
      // Builder currently emits only root-relative article URLs; if that ever
      // changes, resolve relative paths from the article directory.
      continue;
    }
    const publicPath = publicPathFromUrl(ref);
    const absolutePath = path.join(PUBLIC, publicPath);
    if (!fileExistsAndNonEmpty(absolutePath)) {
      errors.push(`${slug}: built HTML references missing or empty asset ${rawRef} (resolved to ${publicPath})`);
    }
  }
}

function verifyIndexHasNoEmptyThumbs(errors) {
  const indexPath = path.join(OUT, 'index.html');
  if (!fs.existsSync(indexPath)) {
    errors.push('articles/index.html is missing');
    return;
  }
  const html = fs.readFileSync(indexPath, 'utf8');
  if (html.includes('card-thumb-empty')) {
    errors.push('articles/index.html contains at least one empty card thumb; every article must ship a hero.jpg or thumb.jpg');
  }
}

// Every file in public/articles/<slug>/images/ must be embedded by that
// article's built page. Files the page no longer uses stay reachable at stable
// URLs, so retired figures must be removed (git history keeps them), not left
// behind. The optional images/manifest.json may list only embedded files.
function verifyNoOrphanArticleImages(errors) {
  for (const entry of fs.readdirSync(OUT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const imagesDir = path.join(OUT, slug, 'images');
    if (!fs.existsSync(imagesDir)) continue;
    const htmlPath = path.join(OUT, slug, 'index.html');
    const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
    for (const file of fs.readdirSync(imagesDir)) {
      if (file === 'manifest.json') continue;
      if (!html.includes(`images/${file}`)) {
        errors.push(`${slug}: images/${file} is not embedded by the article; remove it or embed it`);
      }
    }
    const manifestPath = path.join(imagesDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
      errors.push(`${slug}: images/manifest.json is not valid JSON (${error.message})`);
      continue;
    }
    for (const item of Array.isArray(manifest) ? manifest : []) {
      const file = item && item.filename;
      if (file && !html.includes(`images/${file}`)) {
        errors.push(`${slug}: images/manifest.json lists ${file}, which the article does not embed`);
      }
    }
  }
}

function verifyEveryBuiltArticleHasHero(errors) {
  // Re-read the built directories in case sources and outputs diverge.
  for (const entry of fs.readdirSync(OUT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    verifyHero(entry.name, errors);
  }
}

export function verifyArticleImages() {
  const errors = [];
  const slugs = listMarkdownSources();

  if (!slugs.length) {
    errors.push('no article markdown sources found');
  }

  verifyIndexHasNoEmptyThumbs(errors);

  for (const slug of slugs) {
    const markdownPath = path.join(SRC, `${slug}.md`);
    const markdown = fs.readFileSync(markdownPath, 'utf8');

    verifyHero(slug, errors);
    verifyInlineImages(slug, markdown, errors);
    verifyBuiltArticleImages(slug, errors);
  }

  // The build can emit directories that no longer have a source file. Ensure
  // those do not silently lose heroes either.
  verifyEveryBuiltArticleHasHero(errors);
  verifyNoOrphanArticleImages(errors);

  return { ok: errors.length === 0, errors, count: slugs.length };
}

function run() {
  const { ok, errors, count } = verifyArticleImages();

  if (!ok) {
    for (const message of errors) console.error(`[error] ${message}`);
    process.exit(1);
  }

  console.log(`Article image verification passed: ${count} article(s), all heroes and inline images present, no unembedded article images.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
