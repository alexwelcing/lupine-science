// The curated /atlas/claims/ facets were retired on 2026-11-11 (commit
// deb5a42): their claim names came from a private wiki database and included
// internal risk items that are not public statements. This guard keeps them,
// and those risk items, from coming back through any build step.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const INTERNAL_RISK_ITEMS = [
  /solo-execution/i,
  /one failed prediction is existential/i,
  /SBIR lapsed/i,
  /INCITE readiness/i,
  /ALCC funding prerequisite/i,
];

function files(dir, keep) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full, keep);
    return keep(entry.name) ? [full] : [];
  });
}

test('no claim-facet pages or builder ship', () => {
  assert.equal(fs.existsSync(path.join(PUBLIC, 'atlas', 'claims')), false);
  assert.equal(fs.existsSync(path.join(ROOT, 'scripts', 'build-claim-facets.mjs')), false);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.doesNotMatch(Object.values(pkg.scripts).join('\n'), /claim-facets/);
  assert.match(fs.readFileSync(path.join(PUBLIC, '_redirects'), 'utf8'), /^\/atlas\/claims\/\*\s+\/atlas\/\s+301$/m);
});

test('atlas pages and data carry no internal risk items', () => {
  const surfaces = [
    ...files(path.join(PUBLIC, 'atlas'), (name) => name.endsWith('.html')),
    ...files(path.join(PUBLIC, 'data'), (name) => /^(atlas|article_ontology).*\.json$/.test(name)),
    path.join(PUBLIC, 'sitemap.xml'),
    path.join(PUBLIC, 'llms.txt'),
  ];
  assert.ok(surfaces.length > 2, 'expected atlas pages to scan');
  for (const file of surfaces) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of INTERNAL_RISK_ITEMS) {
      assert.doesNotMatch(text, pattern, `${path.relative(ROOT, file)} carries an internal risk item`);
    }
  }
});
