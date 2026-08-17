#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = path.join(ROOT, 'media', 'projects', 'midwest-2076-library');
const SOURCE = path.join(PROJECT, 'first-principles-library-plan.json');
const OUTPUT = path.join(PROJECT, 'first-principles-library-requests.json');
const ENDPOINT = 'fal-ai/recraft/v4.1/pro/text-to-image';
const UNIT_ALLOWANCE_USD = 0.21;
const plan = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(plan.method === 'ten-material-systems-by-ten-evidence-views', 'unexpected library method');
assert(Array.isArray(plan.systems) && plan.systems.length === 10, `expected 10 systems, got ${plan.systems?.length}`);
assert(Array.isArray(plan.viewRoles) && plan.viewRoles.length === 10, 'expected exactly 10 view roles');
assert(new Set(plan.viewRoles).size === 10, 'view roles must be unique');

const ids = new Set();
const prompts = new Set();
const requests = [];
for (const system of plan.systems) {
  for (const field of ['id', 'title', 'sourceSceneId', 'materialPremise', 'removedConstraint', 'topologyChange']) {
    assert(typeof system[field] === 'string' && system[field].trim(), `${system.id ?? 'unknown system'}: missing ${field}`);
  }
  assert(Array.isArray(system.shots) && system.shots.length === 10, `${system.id}: expected 10 shots`);
  assert(new Set(system.shots.map((shot) => shot.role)).size === 10, `${system.id}: duplicate view roles`);
  assert(plan.viewRoles.every((role) => system.shots.some((shot) => shot.role === role)), `${system.id}: incomplete view-role sequence`);

  for (const shot of system.shots) {
    for (const field of ['id', 'role', 'dominantProof', 'cameraVisibleScene', 'camera']) {
      assert(typeof shot[field] === 'string' && shot[field].trim(), `${shot.id ?? system.id}: missing ${field}`);
    }
    assert(!ids.has(shot.id), `duplicate shot id ${shot.id}`);
    ids.add(shot.id);
    assert(plan.viewRoles.includes(shot.role), `${shot.id}: unknown role ${shot.role}`);
    assert(Array.isArray(shot.evidence) && shot.evidence.length >= 2 && shot.evidence.length <= 3, `${shot.id}: evidence count must be 2-3, got ${shot.evidence?.length}`);
    assert(new Set(shot.evidence).size === shot.evidence.length, `${shot.id}: duplicate evidence item`);

    const prompt = [
      'Render this exact pre-authored speculative evidence view. Preserve the specified future system and do not attempt to show the complete causal chain in one frame.',
      `System context: ${system.materialPremise}`,
      `Present constraint removed: ${system.removedConstraint}`,
      `Resulting system topology: ${system.topologyChange}`,
      `This image has one dominant proof only: ${shot.dominantProof}`,
      `Exact visible scene: ${shot.cameraVisibleScene}`,
      `Required visible facts, limited to these ${shot.evidence.length}: ${shot.evidence.join('; ')}.`,
      `Camera hierarchy: ${shot.camera}`,
      'Matter-of-fact institutional documentary photography. Believable gravity, explicit joints, repair wear, ordinary neutral light, restrained color, and materially specific surfaces. Weather is visible only through material effects, residue, frost, moisture, or maintenance. Sky must be absent or visually negligible.',
      `Never include or substitute: ${plan.globalProhibitions.join('; ')}.`,
      plan.classification,
    ].join(' ');

    assert(!/\b(imagine|invent|come up with|design a)\b/i.test(prompt), `${shot.id}: prompt delegates authorship`);
    assert(!prompts.has(prompt), `${shot.id}: duplicate prompt`);
    prompts.add(prompt);
    requests.push({
      id: shot.id,
      systemId: system.id,
      systemTitle: system.title,
      sourceSceneId: system.sourceSceneId,
      role: shot.role,
      dominantProof: shot.dominantProof,
      requiredEvidence: shot.evidence,
      endpoint: ENDPOINT,
      requestedSize: { width: 2048, height: 1152 },
      prompt,
      promptSha256: createHash('sha256').update(prompt).digest('hex'),
      conservativeAllowanceUsd: UNIT_ALLOWANCE_USD,
      exactBilledCostUsd: null,
      classification: plan.classification,
      status: 'authored-not-submitted',
      eligibleForFinalLibrary: false,
    });
  }
}

assert(requests.length === 100, `expected 100 requests, got ${requests.length}`);
const roleCounts = Object.fromEntries(plan.viewRoles.map((role) => [role, requests.filter((request) => request.role === role).length]));
assert(Object.values(roleCounts).every((count) => count === 10), 'every role must occur exactly 10 times');

const manifest = {
  schemaVersion: 1,
  project: plan.project,
  method: plan.method,
  status: 'authored-not-submitted',
  source: path.relative(ROOT, SOURCE),
  endpoint: ENDPOINT,
  systemCount: plan.systems.length,
  requestCount: requests.length,
  roleCounts,
  conservativeUnitAllowanceUsd: UNIT_ALLOWANCE_USD,
  conservativeTotalAllowanceUsd: Number((requests.length * UNIT_ALLOWANCE_USD).toFixed(2)),
  exactBilledCostUsd: null,
  classification: plan.classification,
  selectionGate: 'Each output requires technical preflight plus human evidence review. Generation alone never changes eligibleForFinalLibrary to true.',
  requests,
};
fs.writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT), systems: manifest.systemCount, requests: manifest.requestCount, roleCounts, allowanceUsd: manifest.conservativeTotalAllowanceUsd }, null, 2));
