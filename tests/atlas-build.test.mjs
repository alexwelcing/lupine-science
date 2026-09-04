// atlas-build.test.mjs — fail-closed checks for the wiki -> public atlas
// migration.
//
// What this asserts:
//   - public/data/atlas_nodes.json exists and is committed JSON.
//   - It carries the three ontology kinds with their canonical IDs
//     (error_type/T1..T7, emblem/E1..E9, material_class/MC1..MC9).
//   - Every node id is a lupine-research:// URI (provenance), and the
//     counts meet the ontology floors (7/9/9) — see the lupine-ledger
//     ontology contract and KG-2 / SPH-1 in the kanban.
// It does NOT rebuild the JSON — the build step is `npm run build`
// (which runs scripts/build-atlas-nodes.mjs before the article builder),
// and a stale artifact is caught by check-static.mjs and by this test
// reading the committed copy.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = path.join(ROOT, 'public', 'data', 'atlas_nodes.json');
const BUILDER = path.join(ROOT, 'scripts', 'build-atlas-nodes.mjs');

const FLOOR = { error_type: 7, emblem: 9, material_class: 9 };

describe('wiki -> atlas migration', () => {
  it('commits public/data/atlas_nodes.json', () => {
    assert.ok(fs.existsSync(JSON_PATH), `missing ${path.relative(ROOT, JSON_PATH)}`);
  });

  it('contains the three ontology kinds with floor cardinality', () => {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    for (const [kind, floor] of Object.entries(FLOOR)) {
      const list = data?.kinds?.[kind];
      assert.ok(Array.isArray(list), `kinds.${kind} missing or not an array`);
      assert.ok(list.length >= floor, `kinds.${kind}: got ${list.length}, floor ${floor}`);
    }
  });

  it('every node id is a lupine-research:// URI with the expected prefix', () => {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    for (const [kind, list] of Object.entries(data.kinds)) {
      for (const node of list) {
        assert.equal(typeof node.id, 'string', `${kind} node missing id`);
        assert.ok(node.id.startsWith(`lupine-research://${kind}/`), `${kind} node has wrong id: ${node.id}`);
        assert.ok(typeof node.name === 'string' && node.name.length > 0, `${kind} node ${node.id} missing name`);
      }
    }
  });

  it('matches the canonical T1..T7, E1..E9, MC1..MC9 inventory', () => {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const tails = {
      error_type: Array.from({ length: FLOOR.error_type }, (_, i) => `T${i + 1}`),
      emblem: Array.from({ length: FLOOR.emblem }, (_, i) => `E${i + 1}`),
      material_class: Array.from({ length: FLOOR.material_class }, (_, i) => `MC${i + 1}`),
    };
    for (const [kind, expected] of Object.entries(tails)) {
      const got = data.kinds[kind].map((n) => n.uri).sort();
      assert.deepEqual(got, expected, `${kind} URIs do not match the canonical 1..N set`);
    }
  });

  it('counts field agrees with kind list lengths', () => {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    for (const [kind, list] of Object.entries(data.kinds)) {
      assert.equal(data.counts[kind], list.length, `counts.${kind} disagrees with kinds.${kind}.length`);
    }
  });

});
