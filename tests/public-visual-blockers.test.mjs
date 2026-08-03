import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(absolute, out);
    else if (entry.name.endsWith('.html')) out.push(absolute);
  }
  return out;
}

function localAssetReferences(html) {
  const references = [];
  for (const match of html.matchAll(/\b(?:src|poster|href)="(\/[^"]+)"/g)) {
    references.push(match[1]);
  }
  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      references.push(candidate.trim().split(/\s+/)[0]);
    }
  }
  return references.filter((reference) =>
    !reference.endsWith('/') &&
    !reference.startsWith('/articles/#') &&
    !reference.startsWith('/#') &&
    !reference.includes('#')
  );
}

test('every public page references only published first-party assets', () => {
  const missing = [];
  for (const file of walkHtml(PUBLIC)) {
    const html = fs.readFileSync(file, 'utf8');
    for (const reference of localAssetReferences(html)) {
      const pathname = decodeURIComponent(new URL(reference, 'https://lupine.science').pathname);
      if (!fs.existsSync(path.join(PUBLIC, pathname.slice(1)))) {
        missing.push(`${path.relative(ROOT, file)} -> ${pathname}`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

test('brand library uses self-hosted typography and every card image exists', () => {
  const file = path.join(PUBLIC, 'brand-assets/index.html');
  const html = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/);
  const cardImages = [...html.matchAll(/<figure class="card"[\s\S]*?<img src="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(cardImages.length > 0, 'brand library must publish at least one card');
  for (const reference of cardImages) {
    assert.ok(fs.existsSync(path.join(PUBLIC, reference.slice(1))), `missing brand image ${reference}`);
  }
});

test('public pages use the published canonical OG image and brand metadata is consistent', () => {
  const html = fs.readFileSync(path.join(PUBLIC, 'brand-assets/index.html'), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)">/)?.[1];
  const ogImage = path.join(PUBLIC, 'og-lupine-science.jpg');

  assert.ok(description, 'brand library must publish a meta description');
  assert.equal(ogTitle, title, 'brand library og:title must match its page title');
  assert.deepEqual(
    fs.readFileSync(ogImage).subarray(0, 2),
    Buffer.from([0xff, 0xd8]),
    'canonical Open Graph image must contain JPEG bytes'
  );
  const staleReferences = walkHtml(PUBLIC)
    .filter((file) => fs.readFileSync(file, 'utf8').includes('og-lupine-science.png'))
    .map((file) => path.relative(ROOT, file));
  assert.deepEqual(staleReferences, [], 'public pages must not reference the deleted legacy PNG');
  assert.doesNotMatch(
    fs.readFileSync(path.join(ROOT, 'scripts', 'build-articles.mjs'), 'utf8'),
    /og-lupine-science\.png/,
    'article builds must not restore the deleted legacy PNG reference'
  );
});

test('article stylesheet contains guards for long links and code blocks', () => {
  const css = fs.readFileSync(path.join(PUBLIC, 'articles/styles.css'), 'utf8');
  assert.match(css, /\.article a\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.article pre\s*\{[^}]*max-width:\s*100%/s);
  assert.match(css, /\.article pre code\s*\{[^}]*white-space:\s*pre-wrap/s);
});
