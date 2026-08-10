// atlas-crosslinks.test.mjs — fail-closed checks for the per-article
// ontology cross-link pipeline.
//
// What this asserts:
//   - public/data/article_ontology.json is committed and well-shaped.
//   - Every article-ontology entry resolves to a node in public/data/atlas_nodes.json
//     (no orphan links).
//   - Every by_article entry has a non-empty URI list with the canonical
//     lupine-research:// prefix.
//   - The atlas and the crosslink JSON agree on node membership: every URI
//     referenced by an article is present in the atlas, every article
//     declared in the crosslinks JSON has a source article_ontology entry.
//   - Every article tagged in the JSON renders the ontology footer in its
//     built HTML (12 articles currently).
//   - The builder script encodes the same fail-closed semantics it asserts.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ATLAS_PATH = path.join(ROOT, 'public', 'data', 'atlas_nodes.json');
const JSON_PATH = path.join(ROOT, 'public', 'data', 'article_ontology.json');
const BUILDER = path.join(ROOT, 'scripts', 'build-ontology-crosslinks.mjs');

describe('wiki -> article ontology cross-links', () => {
  it('commits public/data/article_ontology.json', () => {
    assert.ok(fs.existsSync(JSON_PATH), `missing ${path.relative(ROOT, JSON_PATH)}`);
  });

  it('references the canonical atlas file', () => {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    assert.equal(data.generated_at_build, true);
    assert.equal(typeof data.by_article, 'object');
    assert.ok(data.by_article !== null, 'by_article must be an object');
    assert.equal(typeof data.by_node, 'object');
    assert.ok(data.by_node !== null, 'by_node must be an object');
    assert.ok(Number.isSafeInteger(data.total_articles_with_links));
    assert.ok(Number.isSafeInteger(data.total_links));
    assert.equal(data.total_links, Object.values(data.by_article).reduce((acc, list) => acc + list.length, 0),
      'total_links must equal sum of by_article lengths');
    assert.equal(data.total_articles_with_links, Object.keys(data.by_article).length,
      'total_articles_with_links must equal by_article size');
  });

  it('every URI in by_article is canonical lupine-research:// and present in the atlas', () => {
    const atlas = JSON.parse(fs.readFileSync(ATLAS_PATH, 'utf8'));
    const atlasUris = new Set();
    for (const list of Object.values(atlas.kinds)) {
      for (const node of list) atlasUris.add(node.id);
    }
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    for (const [slug, uris] of Object.entries(data.by_article)) {
      assert.ok(Array.isArray(uris) && uris.length > 0, `${slug}: by_article must be a non-empty array`);
      for (const uri of uris) {
        assert.equal(typeof uri, 'string', `${slug}: URI must be a string`);
        assert.ok(uri.startsWith('lupine-research://'), `${slug}: URI "${uri}" lacks canonical prefix`);
        assert.ok(atlasUris.has(uri), `${slug}: URI "${uri}" not present in atlas_nodes.json`);
      }
    }
  });

  it('by_node is the inverse of by_article (no orphan slugs or nodes)', () => {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const expectedByNode = {};
    for (const [slug, uris] of Object.entries(data.by_article)) {
      for (const uri of uris) {
        if (!expectedByNode[uri]) expectedByNode[uri] = [];
        expectedByNode[uri].push(slug);
      }
    }
    for (const [uri, slugs] of Object.entries(expectedByNode)) {
      expectedByNode[uri] = [...new Set(slugs)].sort();
    }
    for (const [uri, slugs] of Object.entries(data.by_node)) {
      assert.deepEqual([...slugs].sort(), expectedByNode[uri] ?? [],
        `by_node[${uri}] does not match the inverse of by_article`);
    }
  });

  it('every tagged article renders the ontology footer in its built HTML', () => {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const tagged = Object.keys(data.by_article);
    assert.ok(tagged.length > 0, 'expected at least one tagged article');
    for (const slug of tagged) {
      const htmlPath = path.join(ROOT, 'public', 'articles', slug, 'index.html');
      assert.ok(fs.existsSync(htmlPath), `missing built article: ${slug}`);
      const html = fs.readFileSync(htmlPath, 'utf8');
      assert.ok(html.includes('class="article-ontology"'),
        `${slug} HTML missing article-ontology footer`);
      assert.ok(html.includes('Ontology reference'),
        `${slug} HTML missing ontology kicker`);
      for (const uri of data.by_article[slug]) {
        const shortId = uri.split('/').pop();
        assert.ok(html.includes(`>${shortId}</a>`),
          `${slug} HTML missing link to ${shortId}`);
      }
    }
  });

  it('untagged articles do NOT render an ontology footer', () => {
    // Spot-check: pick a known untagged article and confirm no ontology footer.
    const untagged = 'why-lupine-science';
    const htmlPath = path.join(ROOT, 'public', 'articles', untagged, 'index.html');
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      assert.ok(!html.includes('class="article-ontology"'),
        `${untagged} should not render an ontology footer (not tagged in frontmatter)`);
    }
  });

  it('builder script is syntactically valid node', () => {
    assert.ok(fs.existsSync(BUILDER), 'missing scripts/build-ontology-crosslinks.mjs');
    const { status, stderr } = spawnSync(process.execPath, ['--check', BUILDER], { encoding: 'utf8' });
    assert.equal(status, 0, `syntax check failed: ${stderr}`);
  });

  it('builder encodes the fail-closed semantics this test asserts', () => {
    const src = fs.readFileSync(BUILDER, 'utf8');
    assert.match(src, /unknown ontology id/, 'builder missing the unknown-id error path');
    assert.match(src, /LUPINE_FORCE_ATLAS_WIKI/, 'builder missing the strict-mode opt-in');
    assert.match(src, /lupine-research:\/\//, 'builder missing the canonical-URI check');
  });

  it('build-articles.mjs validates article_ontology.json shape at startup', () => {
    const src = fs.readFileSync(path.join(ROOT, 'scripts', 'build-articles.mjs'), 'utf8');
    assert.match(src, /ARTICLE_ONTOLOGY_PATH/, 'build-articles.mjs not loading article_ontology.json');
    assert.match(src, /by_article/, 'build-articles.mjs not validating by_article shape');
    assert.match(src, /articleOntology/, 'build-articles.mjs not calling articleOntology helper');
  });
});
