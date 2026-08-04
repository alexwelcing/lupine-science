#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const campaign = 'campaign-2026-07-27';
const matrixPath = path.join(here, 'asset-matrix.json');
const outputRoot = path.join(root, 'public', 'brand-assets', campaign);
const specRoot = path.join(here, 'remediation-attempt-1');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

const accepted = new Set(['B1-A01-02', 'B1-A03-01', 'B1-A03-03']);
const mechanicalRejectIndices = {
  B1: [3, 4, 8, 9, 10, 12, 14, 16, 17, 18, 19, 20],
  B2: [1, 2, 3, 4, 7, 8, 10, 11, 12, 13, 15, 16, 17, 18, 20],
  B3: [1, 2, 4, 7, 8, 11, 12, 13, 14, 17, 18, 19, 20],
  B4: [2, 3, 4, 8, 9, 10, 11, 13, 14, 17, 18, 19, 20],
  B5: [1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20],
  B6: [2, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20],
};

const editorialReasons = {
  B1: 'Editorial QA rejected this slot for composition, palette, embedded-mark, subject, or scientific-slot-fit noncompliance documented in the B1 verdict.',
  B2: 'Editorial QA rejected this slot: its export was below the required native 1536-pixel slot dimensions; the batch also showed decorative off-palette color, forbidden subjects or marks, and generic infrastructure drift.',
  B3: 'Editorial QA rejected this slot: its export was below the required native 1536-pixel slot dimensions; the batch also showed off-palette accents, forbidden vegetation or marks, and generic proof/correction imagery.',
  B4: 'Editorial QA rejected this slot: its export was below the required native 1536-pixel slot dimensions; the batch also showed flowers, generated marks, decorative color, or abstract trust-layer imagery.',
  B5: 'Editorial QA rejected this slot: its export was below the required native 1536-pixel slot dimensions; the batch also showed people, generated marks, palette drift, or abstract mechanism imagery.',
  B6: 'Editorial QA rejected this slot: its export was below the required native 1536-pixel slot dimensions; the batch also showed people, generated marks, dark/neon fields, molecular glamour, stock-3D treatment, or decorative color.',
};

const corrections = {
  B1: 'Reserve 40–60% clean warm-paper negative space. Depict the exact physical handoff or test apparatus from the original concept. Use only literal warm paper #faf9f6, near-black ink #16171d, and restrained indigo #3d4db3. Use no ochre. Render absolutely no text-like marks: no glyphs, pseudo-writing, labels, numbers, logos, interface marks, signage, or document marks. No people, hands, silhouettes, plants, flowers, dark fields, glow, molecular hero framing, generic city montage, or glossy stock-3D polish.',
  B2: 'Generate the exact original physical system at the requested slot aspect with 40–60% clean warm-paper negative space. Use only literal warm paper #faf9f6, near-black ink #16171d, and restrained indigo #3d4db3. Use no ochre or other hue. Render absolutely no text-like marks, glyphs, labels, numbers, logos, signage, people, faces, silhouettes, plants, flowers, neon, dark fields, stock-3D polish, or molecule-as-hero imagery.',
  B3: 'Center the named correction or proof apparatus and show an honest unsupported boundary through geometry, never labels. Keep 40–60% clean warm-paper negative space and only #faf9f6 paper, #16171d ink, and #3d4db3 indigo. Use no ochre, orange, cyan, green, pink, or purple. Render no text-like marks, people, vegetation, dark/glow effects, molecular glamour, or generic stock architecture.',
  B4: 'Make the named trust mechanism physical and readable without words: gates, sealed records, measurement routes, abstention paths, or instruments as specified by the original concept. Preserve 40–60% warm-paper negative space; use only #faf9f6, #16171d, and #3d4db3 with no ochre. Render no flowers, plants, people, text-like marks, logos, neon/dark fields, glassy stock-3D, or molecule/network cliché.',
  B5: 'Anchor the exact original concept in a real specimen, interface, test apparatus, or bounded field. Show proof limits through geometry, never labels. Preserve 40–60% clean warm-paper space and use only #faf9f6, #16171d, and #3d4db3 with no ochre. Render no people, silhouettes, plants, text-like marks, glyphs, logos, neon/dark backgrounds, stock-3D, neural-network, or molecule clichés.',
  B6: 'Preserve the bounded original concept using physical anchors, test stations, gauges without markings, proof frames, and pilot modules. Keep 40–60% clean warm-paper space and only #faf9f6, #16171d, and #3d4db3 with no ochre. Render no people, hands, documents, text-like marks, glyphs, dark/neon effects, molecular hero views, decorative brown/orange, or glossy stock-3D treatment.',
};

fs.mkdirSync(specRoot, { recursive: true });
const summary = { campaign, attempt: 1, accepted_untouched: [...accepted], batches: {}, requested: 0 };

for (const section of matrix.production_sections) {
  const batch = section.batch_id;
  const assets = section.article_assets.flatMap((article) => article.assets);
  const manifestPath = path.join(outputRoot, batch, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const originals = new Map(manifest.assets.filter((record) => record.attempt == null).map((record) => [record.asset_id, record]));
  const mechanical = new Set(mechanicalRejectIndices[batch].map((index) => assets[index - 1].asset_id));
  const retrySpec = [];

  for (const asset of assets) {
    if (accepted.has(asset.asset_id)) continue;
    const original = originals.get(asset.asset_id);
    if (!original) throw new Error(`Missing original manifest record for ${asset.asset_id}`);
    const qaReason = [
      editorialReasons[batch],
      mechanical.has(asset.asset_id)
        ? 'Independent OCR/palette/composition QA also rejected this slot; its batch-card verdict supplies the asset-specific evidence.'
        : null,
    ]
      .filter(Boolean)
      .join(' ');
    const exactPrompt = [
      'Editorial scientific illustration for Lupine Science; calm premium research-monograph linework with practical systems before atomic imagery.',
      `Original matrix concept: ${asset.prompt_direction}`,
      'QA correction: keep 40–60% clean warm-paper negative space; use only literal #faf9f6 paper, #16171d ink, and restrained #3d4db3 indigo; use no ochre or other hue.',
      'Render no text-like marks, glyphs, pseudo-writing, labels, numbers, logos, signage, people, hands, faces, silhouettes, plants, flowers, neon, dark fields, glow, molecular hero framing, generic stock architecture, or glossy stock-3D polish.',
      `Batch-specific emphasis: ${corrections[batch].split('.').slice(0, 2).join('.')}.`,
    ].join(' ');
    if (exactPrompt.length >= 1500) throw new Error(`Retry prompt too long for ${asset.asset_id}: ${exactPrompt.length}`);
    retrySpec.push({
      asset_id: `${asset.asset_id}-R1`,
      original_asset_id: asset.asset_id,
      key: `${asset.key}--retry-1`,
      original_path: original.output_path,
      aspect: asset.aspect_ratio,
      target_width: asset.target_size_px.width,
      target_height: asset.target_size_px.height,
      exact_prompt: exactPrompt,
      spec_hash: original.spec_hash,
      qa_reason: qaReason,
      qa_sources: ['t_f5047e27', 't_805f6ca4', 't_73e4535a'],
      attempt: 1,
    });
  }

  const specPath = path.join(specRoot, `${batch}-retry-1.json`);
  fs.writeFileSync(specPath, `${JSON.stringify(retrySpec, null, 2)}\n`);
  summary.batches[batch] = { requested: retrySpec.length, spec_path: specPath };
  summary.requested += retrySpec.length;
}

fs.writeFileSync(path.join(specRoot, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
if (summary.requested !== 117) throw new Error(`Expected 117 retries, got ${summary.requested}`);
console.log(JSON.stringify(summary, null, 2));
