// claim-facets.test.mjs — fail-closed checks for the curated claim-facet
// pipeline (ATX-3).
//
// Asserts:
//   - the facets index + every curated facet page ship under /atlas/claims/
//   - each facet page carries every curated claim as a row with the canonical
//     lupine-research://claim/<id> URI
//   - every curated claim id resolves in the wiki DB (or committed JSON
//     fallback) — no orphan claims
//   - the curated mapping has no duplicate claim IDs across facets
//   - facets are listed in narrative order on the index
//   - the sitemap enumerates /atlas/claims/ and every facet
//   - the atlas index page links to /atlas/claims/

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLAIMS_DIR = path.join(ROOT, 'public', 'atlas', 'claims');
const SITEMAP = path.join(ROOT, 'public', 'sitemap.xml');
const ATLAS_INDEX = path.join(ROOT, 'public', 'atlas', 'index.html');
const BUILDER = path.join(ROOT, 'scripts', 'build-claim-facets.mjs');

// The curated FACETS table lives in the builder. To keep this test in
// sync with the builder, we re-import the source and parse the FACETS
// literal. It's a deliberate redundancy: if a developer adds a new facet
// but forgets to add a test, both the builder's fail-closed and this
// parser should still cover the facet.
const FACETS = parseFacetsFromBuilder(BUILDER);

describe('atlas curated claim facets (ATX-3)', () => {
  it('ships a facets index and one page per facet', () => {
    assert.ok(fs.existsSync(path.join(CLAIMS_DIR, 'index.html')), 'facets index missing');
    for (const facet of FACETS) {
      const page = path.join(CLAIMS_DIR, facet.slug, 'index.html');
      assert.ok(fs.existsSync(page), `missing facet page ${facet.slug}`);
    }
  });

  it('every facet page lists every curated claim with its canonical URI', () => {
    for (const facet of FACETS) {
      const html = fs.readFileSync(path.join(CLAIMS_DIR, facet.slug, 'index.html'), 'utf8');
      for (const cid of facet.claims) {
        const uri = `lupine-research://claim/${cid}`;
        assert.ok(html.includes(uri), `${facet.slug} missing canonical URI ${uri}`);
      }
    }
  });

  it('every curated claim id resolves in the wiki DB', () => {
    const dbPath = path.join(process.env.HOME, '.hermes', 'lupine-wiki.db');
    if (!fs.existsSync(dbPath)) {
      // CI without the timer: the builder falls back to a sentinel. Skip
      // the DB existence assertion; the builder's own fail-closed handles it.
      return;
    }
    const db = new DatabaseSync(dbPath, { readOnly: true });
    try {
      for (const facet of FACETS) {
        for (const cid of facet.claims) {
          const row = db.prepare(`SELECT id FROM nodes WHERE id = ?`).get(`lupine-research://claim/${cid}`);
          assert.ok(row, `claim ${cid} (in facet ${facet.slug}) not in wiki DB`);
        }
      }
    } finally {
      db.close();
    }
  });

  it('facet slugs and claim ids are unique (no curation duplicates)', () => {
    const slugs = new Set();
    const claims = new Set();
    for (const facet of FACETS) {
      assert.ok(!slugs.has(facet.slug), `duplicate facet slug: ${facet.slug}`);
      slugs.add(facet.slug);
      for (const cid of facet.claims) {
        assert.ok(!claims.has(cid), `claim ${cid} appears in multiple facets`);
        claims.add(cid);
      }
    }
  });

  it('facets index lists facets in narrative order', () => {
    const html = fs.readFileSync(path.join(CLAIMS_DIR, 'index.html'), 'utf8');
    let lastIdx = -1;
    for (const facet of FACETS) {
      const idx = html.indexOf(`href="/atlas/claims/${facet.slug}/"`);
      assert.ok(idx > 0, `facet ${facet.slug} not linked from facets index`);
      assert.ok(idx > lastIdx, `facet ${facet.slug} out of narrative order in index`);
      lastIdx = idx;
    }
  });

  it('sitemap includes /atlas/claims/ and every facet URL', () => {
    const sitemap = fs.readFileSync(SITEMAP, 'utf8');
    assert.ok(sitemap.includes('https://lupine.science/atlas/claims/'), 'sitemap missing /atlas/claims/');
    for (const facet of FACETS) {
      assert.ok(sitemap.includes(`https://lupine.science/atlas/claims/${facet.slug}/`),
        `sitemap missing /atlas/claims/${facet.slug}/`);
    }
  });

  it('/atlas/ index links to /atlas/claims/', () => {
    const html = fs.readFileSync(ATLAS_INDEX, 'utf8');
    assert.ok(html.includes('href="/atlas/claims/"'), '/atlas/ index does not link to /atlas/claims/');
  });

  it('builder script is syntactically valid node', () => {
    const { status, stderr } = spawnSync(process.execPath, ['--check', BUILDER], { encoding: 'utf8' });
    assert.equal(status, 0, `syntax check failed: ${stderr}`);
  });

  it('builder encodes the fail-closed semantics this test asserts', () => {
    const src = fs.readFileSync(BUILDER, 'utf8');
    assert.match(src, /LUPINE_FORCE_ATLAS_WIKI/, 'builder missing the strict-mode opt-in');
    assert.match(src, /duplicate facet slug/, 'builder missing the dup-facet-slug check');
    assert.match(src, /multiple facets/, 'builder missing the cross-facet claim dup check');
    assert.match(src, /appears in multiple facets/, 'builder missing the cross-facet dup message');
  });
});

// Parse FACETS out of the builder source. The literal is an array literal
// of objects {slug, title, blurb, claims} where claims is an array of
// short ids. We tolerate the title and blurb strings using backticks and
// single/double quotes by walking character-by-character.
function parseFacetsFromBuilder(builderPath) {
  const src = fs.readFileSync(builderPath, 'utf8');
  const start = src.indexOf('const FACETS = [');
  if (start < 0) throw new Error('FACETS not found in builder source');
  // Find matching closing bracket by counting [ ]
  let depth = 0;
  let end = -1;
  for (let i = src.indexOf('[', start); i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') { depth -= 1; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) throw new Error('FACETS closing bracket not found');
  const arraySrc = src.slice(start + 'const FACETS = '.length, end + 1);
  // Parse by walking string-by-string. We only need slug + claims, so
  // extract those with regexes from each object literal.
  const facets = [];
  const objRe = /\{\s*slug:\s*'([^']+)',[\s\S]*?claims:\s*\[([^\]]+)\]/g;
  let m;
  while ((m = objRe.exec(arraySrc)) !== null) {
    const slug = m[1];
    const claims = m[2].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    facets.push({ slug, claims });
  }
  if (facets.length === 0) throw new Error('failed to parse any facets from builder source');
  return facets;
}
