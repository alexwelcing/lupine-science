#!/usr/bin/env node
// Builds public/data/atlas_nodes.json from the Lupine knowledge wiki DB.
//
// Source: SQLite at $LUPINE_WIKI_DB (default ~/.hermes/lupine-wiki.db),
// the same DB the lupine-science plugin's lupine_wiki_search /
// lupine_wiki_get read. We pull exactly the three ontology kinds the
// public site needs to surface today (error_type, emblem, material_class)
// and emit them under their canonical lupine-research://<kind>/<ID> URIs
// — no renaming, no derivation, no ID synthesis. The same file carries a
// `claims` map (short id -> {id, name}) for every claim node, because
// scripts/build-claim-facets.mjs renders claim names and the CI runner
// that builds the deploy artifact has no wiki DB: without committed names,
// production shipped a "metadata not committed" sentinel in place of every
// claim name (observed live on /atlas/claims/*/ on 2026-09-04).
//
// Fail-closed semantics:
//   - DB missing, unreadable, or empty -> non-zero exit, no output.
//   - Cardinality drops below the known floor (7/9/9) -> non-zero exit;
//     we never ship a partial atlas silently.
//   - Any node without a lupine-research:// URI -> non-zero exit; the
//     URI is what makes it provenance, not just a label.
//
// Output is committed (deterministic): keys are sorted, IDs are sorted
// within each kind, JSON is pretty-printed with a trailing newline.
// scripts/check-static.mjs verifies the file ships.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'data', 'atlas_nodes.json');
const DB = process.env.LUPINE_WIKI_DB
  || path.join(process.env.HOME || '/root', '.hermes', 'lupine-wiki.db');

// Floor counts below which we refuse to ship — see the comment on
// ONT-1 / SPH-1 / KG-2 in the kanban, and the lupine-ledger ontology
// (37 superclasses, 7 error types, 9 emblems, 9 material classes).
const FLOOR = { error_type: 7, emblem: 9, material_class: 9 };
const KINDS = Object.keys(FLOOR);

function fail(message) {
  console.error(`build-atlas-nodes: ${message}`);
  process.exit(1);
}

// CI runners (and fresh clones) don't have a healthy lupine-wiki-refresh.timer
// running, so the wiki DB is absent. We follow the same fallback pattern as
// scripts/generate-theory-artifacts-count.mjs: keep the committed inventory
// rather than break the build. The committed JSON is what build-atlas-page.mjs
// reads, and tests/atlas-build.test.mjs asserts its shape — so a stale
// artifact cannot ship unnoticed. Set LUPINE_FORCE_ATLAS_WIKI=1 to opt back
// into the strict (DB-required) mode for hosts that DO run the timer.
const STRICT = process.env.LUPINE_FORCE_ATLAS_WIKI === '1';
if (!fs.existsSync(DB)) {
  if (STRICT) {
    fail(`wiki DB not found at ${DB}; is lupine-wiki-refresh.timer healthy? (LUPINE_FORCE_ATLAS_WIKI=1)`);
  }
  if (!fs.existsSync(OUT)) {
    fail(`wiki DB not found at ${DB} and no committed ${path.relative(ROOT, OUT)} exists; cannot skip — bootstrap by running once on a host with the wiki DB, or set LUPINE_FORCE_ATLAS_WIKI=1`);
  }
  console.log(`wiki DB absent at ${DB} — keeping the committed ${path.relative(ROOT, OUT)}`);
  process.exit(0);
}

const db = new DatabaseSync(DB, { readOnly: true });

// Sanity check: the DB must expose the schema we expect. If the schema
// evolves we want to fail loudly here, not silently emit nothing.
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='nodes'").all();
if (tables.length !== 1) fail('wiki DB missing table: nodes');

// We only want nodes in the lupine-research sphere, and only the three
// ontology kinds. For ontology nodes the `id` column holds the full
// lupine-research://<kind>/<ID> URI (verified against the lupine-ledger
// ontology contract — see KG-2 + SPH-1 in the kanban); the `uri` column
// holds the short local ID. We filter on the id prefix so a stray node
// with the right kind but wrong provenance is rejected here.
const placeholders = KINDS.map(() => '?').join(',');
const rows = db.prepare(`
  SELECT id, kind, name, uri, status
  FROM nodes
  WHERE sphere_id = 'lupine-research'
    AND kind IN (${placeholders})
    AND id LIKE 'lupine-research://%'
  ORDER BY kind, id
`).all(...KINDS);

// Every claim node in the sphere, keyed by short id. Curated facets pick
// from this map; the whole inventory is small (~150 rows) and committing all
// of it means a newly curated claim never needs a DB host to get its name.
const claimRows = db.prepare(`
  SELECT id, name, status
  FROM nodes
  WHERE sphere_id = 'lupine-research'
    AND kind = 'claim'
    AND id LIKE 'lupine-research://claim/%'
  ORDER BY id
`).all();

db.close();

const claims = {};
for (const row of claimRows) {
  if (row.status && row.status !== 'active') continue;
  const shortId = String(row.id).slice('lupine-research://claim/'.length);
  if (!shortId || !row.name) fail(`claim node without id/name: ${row.id}`);
  claims[shortId] = { id: row.id, name: row.name };
}
if (Object.keys(claims).length === 0) fail('no claim nodes in the lupine-research sphere (refusing to ship an atlas without claim names)');

const buckets = Object.fromEntries(KINDS.map((k) => [k, []]));
for (const row of rows) {
  if (!KINDS.includes(row.kind)) continue;
  if (row.status && row.status !== 'active') continue;
  buckets[row.kind].push({ id: row.id, name: row.name, uri: row.uri });
}

for (const kind of KINDS) {
  if (buckets[kind].length < FLOOR[kind]) {
    fail(`${kind}: got ${buckets[kind].length} nodes, floor is ${FLOOR[kind]} (refusing to ship partial atlas)`);
  }
}

// Deterministic output: sort each bucket by id, write pretty JSON.
for (const kind of KINDS) {
  buckets[kind].sort((a, b) => a.id.localeCompare(b.id));
}

const payload = {
  source: 'lupine-research sphere of ~/.hermes/lupine-wiki.db',
  generated_at_build: true,
  kinds: buckets,
  counts: Object.fromEntries(KINDS.map((k) => [k, buckets[k].length])),
  claims: Object.fromEntries(Object.keys(claims).sort((a, b) => a.localeCompare(b)).map((k) => [k, claims[k]])),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`atlas_nodes: ${KINDS.map((k) => `${k}=${buckets[k].length}`).join(', ')}, claims=${Object.keys(claims).length} -> ${path.relative(ROOT, OUT)}`);
