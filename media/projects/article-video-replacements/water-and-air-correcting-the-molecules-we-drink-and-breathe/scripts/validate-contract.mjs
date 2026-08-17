import fs from "node:fs";

const contract = JSON.parse(fs.readFileSync(new URL("../production-contract.json", import.meta.url), "utf8"));
const failures = [];

if (contract.status !== "authored-private-candidate-only") failures.push("status must remain private-only");
if (contract.eligibleForPublication !== false) failures.push("eligibleForPublication must be false");
if (contract.productionTier !== "authored-hyperframes-deterministic-motion") failures.push("production tier must be deterministic HyperFrames");
if (!Array.isArray(contract.scenes) || contract.scenes.length !== 9) failures.push("exactly 9 scenes are required");

let previousEnd = 0;
for (const [index, scene] of contract.scenes.entries()) {
  const label = scene.id || `scene-${index + 1}`;
  if (!scene.dominantProof) failures.push(`${label}: missing dominantProof`);
  if (!scene.motion || !scene.why) failures.push(`${label}: missing motion/why`);
  if (!Array.isArray(scene.visibleRelationships) || scene.visibleRelationships.length === 0 || scene.visibleRelationships.length > 3) {
    failures.push(`${label}: visibleRelationships must contain 1-3 items`);
  }
  if (!Array.isArray(scene.evidenceThatMustRemainVisible) || scene.evidenceThatMustRemainVisible.length === 0 || scene.evidenceThatMustRemainVisible.length > 3) {
    failures.push(`${label}: evidenceThatMustRemainVisible must contain 1-3 items`);
  }
  const [start, end] = scene.windowSeconds || [];
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) failures.push(`${label}: invalid time window`);
  if (Math.abs(start - previousEnd) > 0.011) failures.push(`${label}: non-contiguous start ${start}; expected ${previousEnd}`);
  if (!Array.isArray(scene.reviewTimesSeconds) || scene.reviewTimesSeconds.length !== 3) {
    failures.push(`${label}: exactly 3 authored review times are required`);
  } else if (!scene.reviewTimesSeconds.every((time, reviewIndex) => Number.isFinite(time)
    && time >= start && time <= end
    && (reviewIndex === 0 || time > scene.reviewTimesSeconds[reviewIndex - 1]))) {
    failures.push(`${label}: authored review times must be increasing and remain inside the scene window`);
  }
  previousEnd = end;
}

if (Math.abs(previousEnd - contract.delivery.durationSeconds) > 0.011) failures.push("scene windows do not end at delivery duration");
if (contract.delivery.resolution !== "1920x1080" || contract.delivery.aspectRatio !== "16:9") failures.push("delivery canvas must remain 1920x1080 16:9");
if (contract.delivery.playback !== "on-demand-controls-no-autoplay-no-loop") failures.push("playback contract must remain on-demand and non-looping");
if (contract.delivery.hardFileSizeBytes > 16777216) failures.push("hard file-size budget exceeds 16 MiB");
if (!contract.excludedEvidence?.some((item) => /190 build-locked/.test(item.claim))) failures.push("contradicted theorem-count exclusion is missing");
if (!contract.audioExcision || !Array.isArray(contract.audioExcision.removedIntervalSeconds)
  || contract.audioExcision.removedIntervalSeconds.length !== 2
  || contract.audioExcision.minimumDecodedPcmCorrelation < 0.99) failures.push("audio-excision evidence contract is missing or weak");
if (!contract.artifacts?.contractValidator || !contract.artifacts?.hyperframesStrictReport
  || contract.artifacts?.hyperframesVersion !== "0.7.107") failures.push("pinned validation artifacts are missing");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  scenes: contract.scenes.length,
  durationSeconds: contract.delivery.durationSeconds,
  maxVisibleRelationships: Math.max(...contract.scenes.map((scene) => scene.visibleRelationships.length)),
  eligibleForPublication: contract.eligibleForPublication,
  excludedClaims: contract.excludedEvidence.map((item) => item.claim)
}, null, 2));
