#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'articles');
const VIDEOS = path.join(ROOT, 'public', 'videos');
const MOTION = path.join(ROOT, 'data', 'video-motion');
const NARRATION = path.join(ROOT, 'data', 'narration-scripts');
const PROJECT = path.join(ROOT, 'media', 'projects', 'article-video-replacements');
const REPORTS = path.join(ROOT, 'media', 'projects', 'video-review', 'reports');
const AUDIO_REPORT = path.join(ROOT, 'release', 'audio-gate', 'audio-gate.json');
const AUDIO_BASELINE = path.join(ROOT, 'tests', 'fixtures', 'audio-gate-baseline.json');
const CONTRACT = path.join(PROJECT, 'system-contract.json');
const DEFECTS = path.join(PROJECT, 'known-defects.json');
const OUTPUT = path.join(PROJECT, 'inventory.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function sha256(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(file);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function fileRecord(file) {
  if (!existsSync(file)) return { path: path.relative(ROOT, file), exists: false, bytes: null, sha256: null };
  const stat = await fs.stat(file);
  return {
    path: path.relative(ROOT, file),
    exists: true,
    bytes: stat.size,
    sha256: await sha256(file),
  };
}

function probeVideo(file) {
  const result = spawnSync('ffprobe', [
    '-v', 'error',
    '-print_format', 'json',
    '-show_streams',
    '-show_format',
    file,
  ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`ffprobe failed for ${path.relative(ROOT, file)}: ${result.stderr.trim()}`);
  const probe = JSON.parse(result.stdout);
  const video = probe.streams.find((stream) => stream.codec_type === 'video');
  const audio = probe.streams.find((stream) => stream.codec_type === 'audio');
  return {
    durationSeconds: Number(probe.format.duration),
    video: video ? {
      codec: video.codec_name,
      width: video.width,
      height: video.height,
      frameRate: video.avg_frame_rate,
      pixelFormat: video.pix_fmt,
    } : null,
    audio: audio ? {
      codec: audio.codec_name,
      sampleRate: Number(audio.sample_rate),
      channels: audio.channels,
    } : null,
  };
}

function articleMetadata(markdown) {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null;
  const status = markdown.match(/^>\s*\*\*Status:\*\*\s*(.+)$/m)?.[1]?.trim() ?? 'unspecified';
  return { title, status };
}

async function validVisualReviews() {
  const latest = new Map();
  if (!existsSync(REPORTS)) return latest;
  const files = (await fs.readdir(REPORTS)).filter((name) => name.endsWith('-smart-review.json')).sort();
  for (const name of files) {
    const report = await readJson(path.join(REPORTS, name));
    for (const video of report.videos ?? []) {
      const samples = video.sample?.samples ?? [];
      const errors = samples.filter((sample) => sample.error);
      if (samples.length === 0 || errors.length > 0) continue;
      latest.set(video.slug, {
        report: path.relative(ROOT, path.join(REPORTS, name)),
        generatedAt: report.generatedAt,
        score: video.total,
        p0: video.p0 ?? [],
        sampleCount: samples.length,
        blankFrameCount: video.sample.blankFrames?.length ?? 0,
        ocrHitCount: video.sample.ocrHits?.length ?? 0,
      });
    }
  }
  return latest;
}

const contract = await readJson(CONTRACT);
const knownDefects = (await readJson(DEFECTS)).articles;
const audio = await readJson(AUDIO_REPORT);
const baseline = await readJson(AUDIO_BASELINE);
const visualReviews = await validVisualReviews();
const audioByFile = new Map(audio.files.map((record) => [record.file, record]));
const videoNames = (await fs.readdir(VIDEOS)).filter((name) => name.endsWith('.mp4')).sort();
const entries = [];

for (const videoName of videoNames) {
  const slug = videoName.replace(/\.mp4$/, '');
  const articlePath = path.join(ARTICLES, `${slug}.md`);
  if (!existsSync(articlePath)) continue;
  const videoPath = path.join(VIDEOS, videoName);
  const posterPath = path.join(VIDEOS, `${slug}-poster.jpg`);
  const vttPath = path.join(VIDEOS, `${slug}.vtt`);
  const motionPath = path.join(MOTION, `${slug}.json`);
  const narrationPath = path.join(NARRATION, `${slug}.json`);
  const packagePath = path.join(ROOT, 'media', 'projects', 'article-videos', slug);
  const markdown = await fs.readFile(articlePath, 'utf8');
  const audioPath = path.relative(ROOT, videoPath);
  const audioAudit = audioByFile.get(audioPath) ?? null;
  const audioFailures = audioAudit?.checks.filter((check) => check.status === 'fail').map((check) => check.id) ?? ['not-audited'];
  const baselinedFailures = baseline.films[audioPath] ?? [];
  const defects = knownDefects[slug] ?? null;
  const visual = visualReviews.get(slug) ?? null;

  let recommendedTier = 'deterministic-motion-rebuild';
  let readiness = 'targeted-frame-review-required';
  const reasons = [];
  if (defects) {
    recommendedTier = defects.recommendedTier;
    readiness = 'blocked-pending-authored-scene-contract-and-review-package';
    reasons.push(...defects.defectClasses);
  } else if (audioFailures.length > 0) {
    recommendedTier = 'technical-remaster';
    readiness = 'technical-remaster-required';
    reasons.push(...audioFailures.map((failure) => `audio:${failure}`));
  } else if (visual && visual.p0.length === 0 && visual.score >= 85) {
    readiness = 'automated-gates-pass-human-review-required';
    reasons.push('automated-audio-pass', 'targeted-visual-pass');
  } else {
    reasons.push('fresh-targeted-visual-review-missing');
  }

  entries.push({
    slug,
    ...articleMetadata(markdown),
    source: await fileRecord(articlePath),
    published: {
      video: { ...(await fileRecord(videoPath)), probe: probeVideo(videoPath) },
      poster: await fileRecord(posterPath),
      captions: await fileRecord(vttPath),
    },
    inputs: {
      motionManifest: await fileRecord(motionPath),
      narrationScript: await fileRecord(narrationPath),
      articleVideoProject: {
        path: path.relative(ROOT, packagePath),
        exists: existsSync(packagePath),
      },
    },
    audit: {
      audio: {
        report: path.relative(ROOT, AUDIO_REPORT),
        decision: audioAudit?.verdict ?? 'missing',
        failures: audioFailures,
        baselinedFailures,
        independentlyPassing: audioFailures.length === 0,
      },
      visual: visual ?? {
        report: null,
        score: null,
        p0: null,
        sampleCount: 0,
        status: 'no-fresh-error-free-targeted-review',
      },
      knownHumanDefects: defects,
    },
    replacement: {
      recommendedTier,
      readiness,
      reasons,
      sceneContractRequired: recommendedTier === 'authored-hyperframes-replacement' || recommendedTier === 'structured-generative-motion',
      eligibleForGeneration: false,
      eligibleForPublication: false,
    },
  });
}

assert(entries.length === 22, `expected 22 top-level published article videos, got ${entries.length}`);
assert(entries.every((entry) => entry.source.exists && entry.published.video.exists), 'inventory contains an unresolved article/video relationship');
assert(contract.sceneRules.dominantProofCount === 1, 'scene contract must require one dominant proof');
assert(contract.sceneRules.visibleRelationshipMaximum === 3, 'scene contract must cap visible relationships at three');

const count = (predicate) => entries.filter(predicate).length;
const inventory = {
  schemaVersion: 1,
  project: 'article-video-replacements',
  status: 'inventory-prepared-no-replacements-generated',
  generatedFrom: {
    contract: await fileRecord(CONTRACT),
    knownDefects: await fileRecord(DEFECTS),
    audioReport: await fileRecord(AUDIO_REPORT),
    audioBaseline: await fileRecord(AUDIO_BASELINE),
  },
  summary: {
    publishedArticleVideos: entries.length,
    audioPassingIndependently: count((entry) => entry.audit.audio.independentlyPassing),
    audioFailing: count((entry) => !entry.audit.audio.independentlyPassing),
    knownHumanVisualDefects: count((entry) => entry.audit.knownHumanDefects !== null),
    freshErrorFreeTargetedVisualReviews: count((entry) => entry.audit.visual.report !== null),
    technicalRemasters: count((entry) => entry.replacement.recommendedTier === 'technical-remaster'),
    authoredHyperFramesReplacements: count((entry) => entry.replacement.recommendedTier === 'authored-hyperframes-replacement'),
    generatedMotionApproved: 0,
    publicationEligible: 0,
  },
  policy: {
    systemContract: path.relative(ROOT, CONTRACT),
    reviewStandard: 'docs/video-review-playbook.md',
    noBroadGeneration: true,
    generativeMotionRequiresOwnerApprovalPerShot: true,
    scientificAndEconomicEvidenceMustRemainDeterministic: true,
  },
  entries,
};

await fs.mkdir(PROJECT, { recursive: true });
await fs.writeFile(OUTPUT, `${JSON.stringify(inventory, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT), ...inventory.summary }, null, 2));
