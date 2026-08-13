#!/usr/bin/env node
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = 'critical-minerals-pfas-and-the-remediation-imperative';
const manifestPath = path.join(ROOT, 'release', 'video-replacements', `${slug}.json`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const inventoryPath = path.join(
  ROOT,
  'media',
  'projects',
  'article-video-replacements',
  'critical-minerals-pfas',
  'release-inventory.json',
);
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const canonicalMediaPaths = {
  video: `public/videos/${slug}.mp4`,
  captions: `public/videos/${slug}.vtt`,
  poster: `public/videos/${slug}-poster.jpg`,
  posterAvif: `public/videos/${slug}-poster.avif`,
  posterWebp: `public/videos/${slug}-poster.webp`,
};

function require(condition, message) {
  if (!condition) throw new Error(`PFAS release manifest blocker: ${message}`);
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, relativePath))).digest('hex');
}

function verifyAsset(asset, label) {
  const absolute = path.join(ROOT, asset.path);
  require(fs.existsSync(absolute), `${label} missing: ${asset.path}`);
  require(sha256(asset.path) === asset.sha256, `${label} SHA drift: ${asset.path}`);
  if (asset.bytes != null) require(fs.statSync(absolute).size === asset.bytes, `${label} byte count drift`);
}

function baselineBlob(relativePath) {
  require(/^[0-9a-f]{40}$/.test(manifest.sourceMainCommit), 'source main commit is not a full Git SHA');
  try {
    return execFileSync('git', ['show', `${manifest.sourceMainCommit}:${relativePath}`], {
      cwd: ROOT,
      encoding: null,
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    throw new Error(`PFAS release manifest blocker: baseline asset missing from source main commit: ${relativePath}`);
  }
}

function verifyBaselineAsset(asset, label) {
  const contents = baselineBlob(asset.path);
  require(crypto.createHash('sha256').update(contents).digest('hex') === asset.sha256, `${label} baseline SHA drift`);
  require(contents.length === asset.bytes, `${label} baseline byte count drift`);
}

require(manifest.schemaVersion === 1, 'schemaVersion must be 1');
require(manifest.slug === slug, 'slug mismatch');
require(manifest.sourceMainCommit === 'e0cccacca7e8050d6fb6d208cce3248689653532', 'source main commit drift');
require(manifest.editorial.originalDate === '2026-07-16', 'original date changed');
require(manifest.editorial.updatedDate === '2026-08-12', 'updated date changed');
require(manifest.editorial.status === 'published-with-labeled-evidence-gaps', 'editorial disclosure status drift');
require(manifest.editorial.retainedEvidenceGaps.length >= 3, 'retained evidence gaps are incomplete');
require(manifest.replacement.cacheRevision === 4, 'cache revision drift');
for (const [label, asset] of Object.entries(manifest.replacement)) {
  if (asset && typeof asset === 'object' && typeof asset.path === 'string') verifyAsset(asset, label);
}
require(sha256(manifest.editorial.articlePath) === manifest.editorial.replacementArticleSha256, 'article SHA drift');
require(
  crypto.createHash('sha256').update(baselineBlob(manifest.editorial.articlePath)).digest('hex') === manifest.editorial.previousArticleSha256,
  'previous article baseline SHA drift',
);
require(
  JSON.stringify(Object.keys(manifest.previous).sort()) === JSON.stringify(Object.keys(canonicalMediaPaths).sort()),
  'previous asset record set is incomplete or contains unknown labels',
);
for (const [label, relativePath] of Object.entries(canonicalMediaPaths)) {
  const asset = manifest.previous[label];
  require(asset?.path === relativePath, `previous ${label} canonical path drift`);
  verifyBaselineAsset(asset, `previous ${label}`);
}
require(sha256(manifest.editorial.evidenceMap.path) === manifest.editorial.evidenceMap.sha256, 'evidence-map SHA drift');
require(sha256(manifest.reviewEvidence.runtimeProvenance.path) === manifest.reviewEvidence.runtimeProvenance.sha256, 'runtime-provenance SHA drift');
require(sha256(manifest.reviewEvidence.independentExactShaReview.path) === manifest.reviewEvidence.independentExactShaReview.sha256, 'independent-review SHA drift');
require(sha256(manifest.reviewEvidence.visualSampling.path) === manifest.reviewEvidence.visualSampling.sha256, 'visual-sampling SHA drift');
require(manifest.reviewEvidence.runtimeProvenance.twoCleanCheckoutReproduction === true, 'clean-checkout reproduction not proven');
require(new Set(manifest.reviewEvidence.runtimeProvenance.candidateSha256ByCheckout).size === 1, 'clean checkouts produced different candidate hashes');
require(manifest.reviewEvidence.runtimeProvenance.candidateSha256ByCheckout[0] === manifest.replacement.video.sha256, 'clean-checkout hash differs from replacement');
require(manifest.reviewEvidence.independentExactShaReview.candidateSha256 === manifest.replacement.video.sha256, 'reviewed candidate differs from replacement');
require(manifest.reviewEvidence.independentExactShaReview.p0 === 0, 'independent review contains P0 defects');
require(manifest.reviewEvidence.posterReview.p0 === 0 && manifest.reviewEvidence.posterReview.p1 === 0, 'poster has P0/P1 findings');
require(manifest.reviewEvidence.audioGateForReplacement.decision === 'pass', 'replacement audio gate did not pass');
require(manifest.proceduralGates.projectPublicationIntegrity === 'pass', 'project publication integrity not passed');
require(manifest.proceduralGates.twoCleanCheckoutReproduction === 'pass', 'reproducibility procedural gate not passed');
require(manifest.proceduralGates.independentPrePrReview === 'pass', 'independent pre-PR review not passed');
require(manifest.proceduralGates.ownerApproval === 'approved-in-chat-2026-08-13', 'owner approval is not bound to the explicit release direction');
require(manifest.proceduralGates.pullRequestAndCi === 'pending', 'PR and CI state must remain pending before PR checks complete');
require(manifest.proceduralGates.publicationEnvironmentApproval === 'pending', 'publication approval must remain pending');
require(manifest.proceduralGates.productionEnvironmentApproval === 'pending', 'production approval must remain pending');
require(manifest.proceduralGates.liveHashAndBrowserVerification === 'pending', 'live verification must remain pending before deployment');
require(inventory.slug === slug, 'release inventory slug mismatch');
require(inventory.editorial.originalDate === manifest.editorial.originalDate, 'inventory original date drift');
require(inventory.editorial.updatedDate === manifest.editorial.updatedDate, 'inventory update date drift');
require(inventory.editorial.status === manifest.editorial.status, 'inventory editorial status drift');
require(inventory.editorial.publicationEligible === true, 'inventory publication eligibility is not true');
for (const [label, asset] of Object.entries(inventory.canonicalRelease)) {
  if (label === 'manifest' || !asset || typeof asset !== 'object') continue;
  verifyAsset(asset, `inventory ${label}`);
  require(manifest.replacement[label]?.sha256 === asset.sha256, `inventory ${label} differs from manifest`);
}
require(inventory.proceduralState.ownerApproval === manifest.proceduralGates.ownerApproval, 'inventory owner approval differs from manifest');
require(inventory.proceduralState.technicalAndEditorialPublicationGates === 'pass', 'inventory technical/editorial publication gates not passed');
require(inventory.proceduralState.pullRequestAndCi === 'pending', 'inventory PR and CI state must remain pending');
require(inventory.proceduralState.protectedDeployment === 'pending', 'inventory deployment must remain pending');
require(inventory.proceduralState.liveVerification === 'pending', 'inventory live verification must remain pending');

console.log(`PFAS replacement manifest verified: ${manifest.replacement.video.sha256}`);
