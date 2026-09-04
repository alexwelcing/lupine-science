// atlas-detail-pages.test.mjs — fail-closed checks for the per-node
// detail-page pipeline (ATX-2 + ATX-5).
//
// Asserts:
//   - 25 detail pages ship at /atlas/<id>/index.html, one per node in atlas_nodes.json
//   - each page carries the canonical lupine-research:// URI in its ItemPage JSON-LD
//   - each page links back to /atlas/
//   - "Referenced by" list reflects article_ontology.json by_node (or the
//     no-refs sentinel is shown for unreferenced nodes)
//   - every /atlas/#<id> card on the index has id="<id>" so deep links work
//   - sitemap includes every detail page
//   - article ontology footer links go to /atlas/<id>/ (not the old #anchor form)

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ATLAS_DIR = path.join(ROOT, 'public', 'atlas');
const ATLAS_INDEX = path.join(ATLAS_DIR, 'index.html');
const SITEMAP = path.join(ROOT, 'public', 'sitemap.xml');
const BUILDER = path.join(ROOT, 'scripts', 'build-atlas-detail-pages.mjs');
const ATLAS_NODES = path.join(ROOT, 'public', 'data', 'atlas_nodes.json');
const CROSSLINKS = path.join(ROOT, 'public', 'data', 'article_ontology.json');

const atlas = JSON.parse(fs.readFileSync(ATLAS_NODES, 'utf8'));
const nodes = [];
for (const [kind, list] of Object.entries(atlas.kinds)) {
  for (const n of list) nodes.push({ kind, uri: n.uri, name: n.name, id: n.id });
}
const expectedIds = nodes.map((n) => n.uri).sort();

describe('atlas per-node detail pages (ATX-2 + ATX-5)', () => {
  it('ships one detail page per node in atlas_nodes.json', () => {
    assert.equal(nodes.length, 25, `expected 25 nodes, got ${nodes.length}`);
    for (const node of nodes) {
      const page = path.join(ATLAS_DIR, node.uri, 'index.html');
      assert.ok(fs.existsSync(page), `missing ${path.relative(ROOT, page)}`);
    }
  });

  it('every detail page carries its canonical URI in the JSON-LD ItemPage', () => {
    for (const node of nodes) {
      const html = fs.readFileSync(path.join(ATLAS_DIR, node.uri, 'index.html'), 'utf8');
      const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => JSON.parse(m[1]))
        .find((d) => d['@type'] === 'ItemPage');
      assert.ok(ld, `${node.uri} page has no ItemPage JSON-LD`);
      assert.equal(ld.identifier, node.id, `${node.uri} identifier mismatch`);
      assert.equal(ld.url, `https://lupine.science/atlas/${node.uri}/`, `${node.uri} url mismatch`);
    }
  });

  it('every detail page links back to /atlas/', () => {
    for (const node of nodes) {
      const html = fs.readFileSync(path.join(ATLAS_DIR, node.uri, 'index.html'), 'utf8');
      assert.ok(/href="\/atlas\/"/.test(html), `${node.uri} missing back-link to /atlas/`);
    }
  });

  it('"Referenced by" list matches article_ontology.json by_node (ATX-5)', () => {
    const cross = JSON.parse(fs.readFileSync(CROSSLINKS, 'utf8'));
    for (const node of nodes) {
      const html = fs.readFileSync(path.join(ATLAS_DIR, node.uri, 'index.html'), 'utf8');
      const expectedSlugs = (cross.by_node[node.id] || []).slice().sort();
      if (expectedSlugs.length === 0) {
        assert.ok(html.includes('No public articles reference this node yet'),
          `${node.uri} should show the no-refs sentinel (no articles in by_node)`);
      } else {
        assert.ok(html.includes('Referenced by'), `${node.uri} should show "Referenced by"`);
        for (const slug of expectedSlugs) {
          assert.ok(html.includes(`href="/articles/${slug}/"`),
            `${node.uri} missing link to ${slug}`);
        }
      }
    }
  });

  it('/atlas/ index cards have id="<short-id>" so deep links resolve', () => {
    const html = fs.readFileSync(ATLAS_INDEX, 'utf8');
    for (const id of expectedIds) {
      assert.ok(html.includes(`id="${id}"`), `/atlas/ index missing id="${id}"`);
    }
  });

  it('/atlas/ index cards link to /atlas/<id>/ (not #anchors)', () => {
    const html = fs.readFileSync(ATLAS_INDEX, 'utf8');
    for (const id of expectedIds) {
      assert.ok(html.includes(`href="/atlas/${id}/"`), `/atlas/ index missing link to /atlas/${id}/`);
      assert.ok(!html.includes(`href="#${id}"`), `/atlas/ index still has #${id} anchor (should be a real link)`);
    }
  });

  it('article ontology footer links go to /atlas/<id>/', () => {
    const cross = JSON.parse(fs.readFileSync(CROSSLINKS, 'utf8'));
    let found = 0;
    for (const slug of Object.keys(cross.by_article)) {
      const htmlPath = path.join(ROOT, 'public', 'articles', slug, 'index.html');
      if (!fs.existsSync(htmlPath)) continue;
      const html = fs.readFileSync(htmlPath, 'utf8');
      for (const uri of cross.by_article[slug]) {
        const shortId = uri.split('/').pop();
        assert.ok(html.includes(`href="/atlas/${shortId}/"`),
          `${slug} footer still links to #${shortId} (should link to /atlas/${shortId}/)`);
        found += 1;
      }
    }
    assert.ok(found > 0, 'expected at least one footer link to verify');
  });

  it('sitemap includes every detail page URL', () => {
    const sitemap = fs.readFileSync(SITEMAP, 'utf8');
    for (const id of expectedIds) {
      assert.ok(sitemap.includes(`https://lupine.science/atlas/${id}/`),
        `sitemap missing /atlas/${id}/`);
    }
  });

});
