#!/usr/bin/env node
// Builds public/data/article_ontology.json from article frontmatter.
//
// Each article may declare `> **Ontology:** T1, MC4` in its metadata block
// (the first blockquote). This builder reads every article, validates each
// declared ID against public/data/atlas_nodes.json (the lupine-research
// sphere of the wiki DB), and writes a slug -> [ids] map. The article
// builder then reads this JSON and injects an `Ontology reference` footer
// into any article that declares one or more nodes.
//
// Fail-closed semantics:
//   - Unknown ID in an article (e.g. T99, MC404) -> exit 1, names the article.
//   - atlas_nodes.json missing or shape wrong -> exit 1.
//   - Article with no Ontology line -> silently omitted (no error).
//   - Article with an Ontology line but empty value -> exit 1.
//
// Skip-mode (CI runners without a wiki DB): mirrors the build-atlas-nodes
// pattern. When the wiki DB is absent, we use the committed
// public/data/atlas_nodes.json as the validator's source of truth.
// Set LUPINE_FORCE_ATLAS_WIKI=1 to refuse to skip.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'articles');
const OUT = path.join(ROOT, 'public', 'data', 'article_ontology.json');
const ATLAS_PATH = path.join(ROOT, 'public', 'data', 'atlas_nodes.json');
const DB = process.env.LUPINE_WIKI_DB
  || path.join(process.env.HOME || '/root', '.hermes', 'lupine-wiki.db');

function fail(message) {
  console.error(`build-ontology-crosslinks: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(ARTICLES_DIR)) {
  fail(`articles directory missing at ${ARTICLES_DIR}`);
}

const STRICT = process.env.LUPINE_FORCE_ATLAS_WIKI === '1';

// ---- 1. Build the validator: set of canonical URIs from the wiki DB ----
let validUris;
let validUrisByShortId;

if (!fs.existsSync(DB)) {
  if (STRICT) {
    fail(`wiki DB not found at ${DB}; is lupine-wiki-refresh.timer healthy? (LUPINE_FORCE_ATLAS_WIKI=1)`);
  }
  if (!fs.existsSync(ATLAS_PATH)) {
    fail(`wiki DB absent at ${DB} and no committed ${path.relative(ROOT, ATLAS_PATH)} exists; cannot validate article ontology IDs`);
  }
  console.log(`wiki DB absent at ${DB} — using committed ${path.relative(ROOT, ATLAS_PATH)} as the validator`);
  const atlas = JSON.parse(fs.readFileSync(ATLAS_PATH, 'utf8'));
  if (!atlas?.kinds || typeof atlas.kinds !== 'object') {
    fail(`atlas_nodes.json has no .kinds object`);
  }
  validUris = new Set();
  validUrisByShortId = new Map();
  for (const [kind, list] of Object.entries(atlas.kinds)) {
    if (!Array.isArray(list)) fail(`atlas_nodes.json kinds.${kind} is not an array`);
    for (const node of list) {
      if (typeof node.id !== 'string' || !node.id.startsWith(`lupine-research://${kind}/`)) {
        fail(`atlas_nodes.json has malformed node id: ${node.id}`);
      }
      if (typeof node.uri !== 'string') fail(`atlas_nodes.json has malformed node uri: ${node.id}`);
      validUris.add(node.id);
      validUrisByShortId.set(node.uri, node.id);
    }
  }
} else {
  const db = new DatabaseSync(DB, { readOnly: true });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='nodes'").all();
  if (tables.length !== 1) fail('wiki DB missing table: nodes');
  const rows = db.prepare(`
    SELECT id, kind, uri
    FROM nodes
    WHERE sphere_id = 'lupine-research'
      AND kind IN ('error_type','emblem','material_class')
      AND id LIKE 'lupine-research://%'
  `).all();
  db.close();
  validUris = new Set();
  validUrisByShortId = new Map();
  for (const row of rows) {
    validUris.add(row.id);
    validUrisByShortId.set(row.uri, row.id);
  }
  if (validUrisByShortId.size === 0) {
    fail(`wiki DB at ${DB} contains no lupine-research ontology nodes; refusing to ship`);
  }
  console.log(`validator: ${validUrisByShortId.size} ontology nodes loaded from wiki DB`);
}

// ---- 2. Walk every article and pull its Ontology line ----
const ARTICLE_LINE_RE = /^> \*\*Ontology:\*\*\s*(.+?)\s*$/m;
const SOURCE_GLOB = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.md') && !e.name.startsWith('_'));

const result = { generated_at_build: true, by_article: {}, by_node: {}, total_articles_with_links: 0, total_links: 0 };

for (const entry of SOURCE_GLOB) {
  const slug = entry.name.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, entry.name), 'utf8');
  const m = raw.match(ARTICLE_LINE_RE);
  if (!m) continue;
  const declared = m[1];
  if (!declared || declared.trim() === '') {
    fail(`article ${slug}: Ontology line is present but empty`);
  }
  const tokens = declared.split(',').map((s) => s.trim()).filter(Boolean);
  if (tokens.length === 0) {
    fail(`article ${slug}: Ontology line has no tokens after parsing`);
  }
  const resolvedUris = [];
  for (const token of tokens) {
    // Accept both "T1" (short form) and "lupine-research://error_type/T1" (full form).
    let uri;
    if (token.startsWith('lupine-research://')) {
      uri = token;
    } else {
      uri = validUrisByShortId.get(token);
      if (!uri) {
        fail(`article ${slug}: unknown ontology id "${token}" (not in atlas_nodes.json / wiki DB)`);
      }
    }
    if (!validUris.has(uri)) {
      fail(`article ${slug}: ontology URI "${uri}" is not in the lupine-research sphere`);
    }
    resolvedUris.push(uri);
  }
  result.by_article[slug] = resolvedUris;
  for (const uri of resolvedUris) {
    if (!result.by_node[uri]) result.by_node[uri] = [];
    result.by_node[uri].push(slug);
  }
  result.total_links += resolvedUris.length;
}

result.total_articles_with_links = Object.keys(result.by_article).length;

// Deterministic output: sort by slug, sort each token list.
const sortedArticles = Object.fromEntries(
  Object.entries(result.by_article).sort(([a], [b]) => a.localeCompare(b))
);
const sortedByNode = Object.fromEntries(
  Object.entries(result.by_node)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => [k, [...v].sort()])
);
const payload = { ...result, by_article: sortedArticles, by_node: sortedByNode };

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`article_ontology: ${result.total_articles_with_links} article(s), ${result.total_links} link(s) -> ${path.relative(ROOT, OUT)}`);
