// /brand-assets/ and /proof-pack-template/ hold production material and
// templates, not public statements. They stay reachable but must carry
// X-Robots-Tag: noindex on Cloudflare Pages (public/_headers, generated from
// scripts/_headers.template) and in the nginx container image.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOINDEX_PREFIXES = ['/brand-assets/', '/proof-pack-template/'];

// Cloudflare Pages _headers: a path line followed by indented header lines.
function headerRules(text) {
  const rules = new Map();
  let current = null;
  for (const line of text.split('\n')) {
    if (!line.trim() || line.startsWith('#')) {
      current = null;
      continue;
    }
    if (!/^\s/.test(line)) {
      current = line.trim();
      rules.set(current, [...(rules.get(current) || [])]);
      continue;
    }
    if (current) rules.get(current).push(line.trim());
  }
  return rules;
}

for (const file of ['scripts/_headers.template', 'public/_headers']) {
  test(`${file} marks production and template paths noindex`, () => {
    const rules = headerRules(fs.readFileSync(path.join(ROOT, file), 'utf8'));
    for (const prefix of NOINDEX_PREFIXES) {
      assert.ok(rules.get(`${prefix}*`)?.includes('X-Robots-Tag: noindex'), `${file}: ${prefix}* has no X-Robots-Tag: noindex`);
    }
    // the site-wide rule must not noindex everything
    assert.equal((rules.get('/*') || []).some((h) => /^X-Robots-Tag:/i.test(h)), false);
  });
}

test('nginx.conf sends the same noindex header ahead of the catch-all', () => {
  const conf = fs.readFileSync(path.join(ROOT, 'nginx.conf'), 'utf8');
  for (const prefix of NOINDEX_PREFIXES) {
    const start = conf.indexOf(`location ^~ ${prefix} {`);
    assert.ok(start >= 0, `nginx.conf has a location ^~ ${prefix} block`);
    const block = conf.slice(start, conf.indexOf('}', start));
    assert.match(block, /add_header X-Robots-Tag "noindex" always;/);
    assert.ok(start < conf.indexOf('location / {'), `${prefix} block precedes the catch-all`);
  }
});

test('noindex paths are not offered in the sitemap', () => {
  const sitemap = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8');
  for (const prefix of NOINDEX_PREFIXES) assert.equal(sitemap.includes(prefix), false, prefix);
});
