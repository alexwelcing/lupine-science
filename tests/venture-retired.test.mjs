// The password-walled venture deck left the site on 2026-11-13: decks are
// shared privately now, not published here. Its files stay in git history.
// /venture, /venture/ and /venture/* answer 301 -> /about/ on Cloudflare Pages
// (public/_redirects) and in the nginx container image (nginx.conf), and no
// build step, page, header rule or sitemap entry may bring the deck back.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const RETIRED_PATHS = ['/venture', '/venture/', '/venture/deck.html', '/venture/lupine-science-venture-deck.pdf'];
const UNRELATED_PATHS = ['/ventures', '/venture-capital/', '/about/', '/'];

function files(dir, keep) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full, keep);
    return keep(entry.name) ? [full] : [];
  });
}

test('no deck, password wall or deck tooling ships', () => {
  for (const relative of [
    'public/venture',
    'public/_worker.js',
    'public/_routes.json',
    'media/projects/venture-deck',
    'scripts/build-venture-deck.mjs',
    'scripts/validate-venture-deck.mjs',
    'scripts/venture-deck-tools.mjs',
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT, relative)), false, `${relative} must stay removed`);
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.doesNotMatch(Object.keys(pkg.scripts).join('\n'), /venture/i);
  assert.doesNotMatch(Object.values(pkg.scripts).join('\n'), /venture/i);
});

test('public/_redirects sends /venture, /venture/ and /venture/* to /about/ with 301', () => {
  const rules = fs.readFileSync(path.join(PUBLIC, '_redirects'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/));
  const venture = rules.filter(([from]) => /^\/venture(\/|$)/.test(from));
  assert.deepEqual(
    venture.map(([from, to, status]) => `${from} ${to} ${status}`),
    ['/venture /about/ 301', '/venture/ /about/ 301', '/venture/* /about/ 301'],
  );
});

test('nginx.conf mirrors the redirect ahead of the catch-all', () => {
  const conf = fs.readFileSync(path.join(ROOT, 'nginx.conf'), 'utf8');
  const blocks = [...conf.matchAll(/location\s+([~=^]*)\s*(\S+)\s*\{([^}]*)\}/g)]
    .map(([, modifier, pattern, body]) => ({ modifier, pattern, body }));

  // a prefix or exact location on /venture would win over the regex below
  assert.equal(blocks.some(({ modifier, pattern }) => modifier !== '~' && pattern.startsWith('/venture')), false,
    'no prefix or exact location may take /venture');
  assert.doesNotMatch(conf, /Deck temporarily unavailable/);

  const venture = blocks.filter(({ modifier, pattern }) => modifier === '~' && pattern.includes('venture'));
  assert.equal(venture.length, 1, 'nginx.conf has one regex location for /venture');
  assert.match(venture[0].body, /^\s*return 301 \/about\/;\s*$/);

  // nginx regex locations are PCRE; this one is plain enough to run as a JS RegExp
  const regex = new RegExp(venture[0].pattern);
  for (const uri of RETIRED_PATHS) assert.match(uri, regex, `${uri} must redirect`);
  for (const uri of UNRELATED_PATHS) assert.doesNotMatch(uri, regex, `${uri} must not redirect`);
  assert.ok(conf.indexOf(venture[0].pattern) < conf.indexOf('location / {'), '/venture block precedes the catch-all');
});

test('no built page, header rule, sitemap entry or index links to /venture', () => {
  for (const file of ['_headers', 'sitemap.xml', 'robots.txt', 'llms.txt', 'feed.xml']) {
    assert.doesNotMatch(fs.readFileSync(path.join(PUBLIC, file), 'utf8'), /venture/i, `public/${file} mentions the deck`);
  }
  const surfaces = files(PUBLIC, (name) => /\.(html|xml|txt|json|js|css)$/.test(name));
  assert.ok(surfaces.length > 10, 'expected built pages to scan');
  for (const file of surfaces) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /\/venture(?![a-z0-9-])/i, `${path.relative(ROOT, file)} links to /venture`);
  }
});
