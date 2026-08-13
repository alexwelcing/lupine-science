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
const canonicalEvidence = {
  independentReview: {
    path: 'media/projects/article-video-replacements/critical-minerals-pfas/reviews/private-candidate-review.json',
    sha256: 'd04c35a5cb1e1f8bc89059364bcd11035ffc8bef80d70123a7367b7895f9888c',
  },
  claimMap: {
    path: 'media/projects/article-video-replacements/critical-minerals-pfas/claim-evidence-map.json',
    sha256: '8ea71addbc912acc9f2dbeedd6efebdcd50a79454e1e12acc580cd54651eb0f7',
  },
};
const inventoryPath = path.join(
  ROOT,
  'media',
  'projects',
  'article-video-replacements',
  'critical-minerals-pfas',
  'release-inventory.json',
);
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const independentReview = JSON.parse(
  fs.readFileSync(path.join(ROOT, manifest.reviewEvidence.independentExactShaReview.path), 'utf8'),
);
const evidenceMap = JSON.parse(fs.readFileSync(path.join(ROOT, manifest.editorial.evidenceMap.path), 'utf8'));
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
require(
  manifest.editorial.evidenceMap.path === canonicalEvidence.claimMap.path &&
    manifest.editorial.evidenceMap.sha256 === canonicalEvidence.claimMap.sha256,
  'evidence map canonical identity drift',
);
require(sha256(manifest.reviewEvidence.runtimeProvenance.path) === manifest.reviewEvidence.runtimeProvenance.sha256, 'runtime-provenance SHA drift');
require(sha256(manifest.reviewEvidence.independentExactShaReview.path) === manifest.reviewEvidence.independentExactShaReview.sha256, 'independent-review SHA drift');
require(
  manifest.reviewEvidence.independentExactShaReview.path === canonicalEvidence.independentReview.path &&
    manifest.reviewEvidence.independentExactShaReview.sha256 === canonicalEvidence.independentReview.sha256,
  'independent review canonical identity drift',
);
require(
  manifest.reviewEvidence.independentExactShaReview.role === 'exact-sha-private-owner-visual-suitability-review-not-publication-approval',
  'independent review role drift',
);
require(
  manifest.reviewEvidence.independentExactShaReview.decision === 'suitable-for-private-owner-visual-review-not-publication',
  'independent review decision was laundered into publication approval',
);
require(manifest.reviewEvidence.independentExactShaReview.publicationEligibleAtReviewTime === false, 'review-time publication ineligibility must be preserved');
require(manifest.reviewEvidence.independentExactShaReview.publicationBlockersAtReviewTime === independentReview.publication.blockers.length, 'review-time blocker count drift');
require(independentReview.publication.eligible === false, 'private visual review must retain its publication-ineligible verdict');
require(independentReview.independentReview.publicationEligible === false, 'independent review publication verdict drift');
require(independentReview.decision === 'suitable-for-private-owner-visual-review-not-publication', 'bound review decision drift');
require(independentReview.publication.blockers.length === 4, 'bound review blocker inventory drift');
require(
  manifest.reviewEvidence.editorialPublicationPolicy.path === manifest.editorial.evidenceMap.path &&
    manifest.reviewEvidence.editorialPublicationPolicy.sha256 === manifest.editorial.evidenceMap.sha256,
  'editorial publication policy is not bound to the evidence map',
);
require(manifest.reviewEvidence.editorialPublicationPolicy.decision === 'publication-eligible-with-labeled-evidence-gaps', 'editorial publication policy decision drift');
require(evidenceMap.publicationEligible === true, 'disclosure policy does not permit publication');
require(evidenceMap.releaseBlockers.length === 0, 'disclosure policy retains release blockers');
require(evidenceMap.claims.length === 5, 'quantitative claim inventory drift');
require(evidenceMap.claims.every((claim) => claim.status === 'source-cited-needs-independent-evidence-review'), 'unreviewed claims were promoted or relabeled');
require(manifest.reviewEvidence.editorialPublicationPolicy.unreviewedQuantitativeClaimCount === evidenceMap.claims.length, 'editorial policy claim count drift');
require(manifest.reviewEvidence.editorialPublicationPolicy.releaseBlockerCount === evidenceMap.releaseBlockers.length, 'editorial policy blocker count drift');
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
