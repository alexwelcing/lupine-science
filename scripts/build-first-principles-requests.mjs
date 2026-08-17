#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = path.join(ROOT, 'media', 'projects', 'midwest-2076-library');
const SOURCE = path.join(PROJECT, 'first-principles-scenes.json');
const OUTPUT = path.join(PROJECT, 'first-principles-requests.json');
const ENDPOINT = 'fal-ai/recraft/v4.1/pro/text-to-image';
const ALLOWANCE_USD = 0.21;
const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));

if (!Array.isArray(data.requiredFields) || !Array.isArray(data.scenes)) {
  throw new Error('first-principles source must declare requiredFields and scenes');
}
if (data.scenes.length !== 10) throw new Error(`expected 10 authored pilot scenes, got ${data.scenes.length}`);

const ids = new Set();
for (const scene of data.scenes) {
  if (!scene.id || ids.has(scene.id)) throw new Error(`missing or duplicate scene id: ${scene.id}`);
  ids.add(scene.id);
  const revision = scene.revision ?? 1;
  if (!Number.isInteger(revision) || revision < 1) throw new Error(`${scene.id}: revision must be a positive integer`);
  for (const field of data.requiredFields) {
    const value = scene[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      throw new Error(`${scene.id}: missing authored field ${field}`);
    }
  }
  if (scene.mechanicalEvidence.length < 6) throw new Error(`${scene.id}: needs at least six camera-visible mechanical facts`);
  if (scene.doNotSubstitute.length < 5) throw new Error(`${scene.id}: needs at least five explicit substitutions to reject`);
}

function promptFor(scene) {
  const prompt = [
    'Render exactly the following pre-authored speculative scene. Do not redesign the machine, add a different future concept, or replace specified relationships with familiar science-fiction imagery.',
    `Title: ${scene.title}.`,
    `Speculative material premise, not a validated scientific claim: ${scene.materialPremise}`,
    `First-principles consequence: this removes the present constraint that ${scene.removedConstraint.charAt(0).toLowerCase()}${scene.removedConstraint.slice(1)}`,
    `Required machine topology: ${scene.topologyChange}`,
    `Required scale consequence: ${scene.scaleDiscontinuity}`,
    `Required operational logic: ${scene.operationalConsequence}`,
    `Required spatial organization: ${scene.spatialConsequence}`,
    `Regional reason: ${scene.regionalConsequence}`,
    `Exact visible scene: ${scene.cameraVisibleScene}`,
    `The image must visibly contain all of these mechanical facts: ${scene.mechanicalEvidence.join('; ')}.`,
    `Camera and hierarchy: ${scene.camera}`,
    'Use quiet matter-of-fact institutional documentary photography, believable gravity, consistent joints, maintenance wear, ordinary neutral light, and materially specific surfaces. Weather may appear only through residue, moisture, frost, light, or maintenance. Never make sky or clouds the subject.',
    `Do not substitute: ${scene.doNotSubstitute.join('; ')}.`,
    'No words, letters, numbers, labels, signs, logos, flags, diagrams, screens, pseudo-data, molecule imagery, DNA, holograms, neon, flying vehicles, generic smart-city towers, solarpunk greenery, apocalypse, luxury architecture, dramatic cloudscape, storm spectacle, or promotional gloss.',
    data.classification,
  ].join(' ');
  if (/\b(imagine|invent|design a|come up with)\b/i.test(prompt)) {
    throw new Error(`${scene.id}: prompt delegates authorship to model`);
  }
  return prompt;
}

const requests = data.scenes.map((scene) => {
  const prompt = promptFor(scene);
  const revision = scene.revision ?? 1;
  const requestId = revision === 1 ? scene.id : `${scene.id}-r${revision}`;
  return {
    id: requestId,
    title: scene.title,
    sourceSceneId: scene.id,
    revision,
    endpoint: ENDPOINT,
    requestedSize: { width: 2048, height: 1152 },
    prompt,
    promptSha256: createHash('sha256').update(prompt).digest('hex'),
    classification: data.classification,
    conservativeAllowanceUsd: ALLOWANCE_USD,
    status: 'authored-not-submitted',
  };
});

const manifest = {
  schemaVersion: 1,
  project: data.project,
  method: 'first-principles-authored-scenes',
  status: 'authored-not-submitted',
  source: path.relative(ROOT, SOURCE),
  endpoint: ENDPOINT,
  requestCount: requests.length,
  conservativeTotalAllowanceUsd: Number((requests.length * ALLOWANCE_USD).toFixed(2)),
  classification: data.classification,
  requests,
};
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT), requestCount: requests.length, conservativeTotalAllowanceUsd: manifest.conservativeTotalAllowanceUsd }, null, 2));
