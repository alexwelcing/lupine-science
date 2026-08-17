#!/usr/bin/env node
/**
 * Smart video reviewer for Lupine Science article videos.
 *
 * Scans public/videos, runs technical checks (ffprobe/ffmpeg),
 * OCRs poster frames with Tesseract.js, checks captions, article
 * schema integration, and brand-safety signals. Produces a JSON
 * report and a markdown summary.
 */
import { createWorker } from 'tesseract.js';
import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';
import {
  tokenize,
  loadDictionary,
  buildDomainCorpus,
  trainBigramModel,
  findSuspectWords,
} from './lib/text-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');
const ARTICLES_DIR = path.join(ROOT, 'public', 'articles');
const ARTICLE_SOURCES_DIR = path.join(ROOT, 'articles');
let REPORT_DIR = path.join(ROOT, 'media', 'projects', 'video-review', 'reports');

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_FPS = 30;
const LOUDNESS_TARGET = -16;
const LOUDNESS_TOLERANCE = 2;
const LRA_MAX = 8;
const SAMPLE_STD_THRESHOLD = 12;

const SELF_CITATION_PATTERNS = [
  /lupine science strategic discovery plan/i,
  /lupine science error-field analysis/i,
  /lupine science,? sections? \d/i,
];

function toSeconds(ts) {
  const [h, m, s] = ts.split(':');
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

function run(cmd, args, options = {}) {
  return spawnSync(cmd, args, {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    cwd: ROOT,
    ...options,
  });
}

function ffprobeJson(file) {
  const r = run('ffprobe', [
    '-v', 'error',
    '-print_format', 'json',
    '-show_streams',
    '-show_format',
    file,
  ]);
  if (r.status !== 0) return { error: r.stderr };
  try {
    return JSON.parse(r.stdout);
  } catch {
    return { error: 'invalid ffprobe json' };
  }
}

function loudness(videoPath) {
  const r = run('ffmpeg', [
    '-i', videoPath,
    '-af', 'ebur128=framelog=verbose',
    '-f', 'null',
    '-',
  ]);
  const out = r.stderr || '';
  const integrated = out.match(/I:\s+([\-]?\d+\.\d+)\s+LUFS/);
  const lra = out.match(/LRA:\s+(\d+\.\d+)\s+LU/);
  const threshold = out.match(/Threshold:\s+([\-]?\d+\.\d+)\s+LUFS/);
  return {
    integrated: integrated ? Number(integrated[1]) : null,
    lra: lra ? Number(lra[1]) : null,
    threshold: threshold ? Number(threshold[1]) : null,
  };
}

function parseVtt(text) {
  const lines = text.split(/\r?\n/);
  const cues = [];
  let i = 0;
  if (lines[i]?.trim().toLowerCase() === 'webvtt') i++;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || /^NOTE|^\d+$/.test(line)) {
      i++;
      continue;
    }
    const arrowMatch = line.match(/^(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (arrowMatch) {
      const start = toSeconds(arrowMatch[1]);
      const end = toSeconds(arrowMatch[2]);
      let payload = '';
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        payload += (payload ? ' ' : '') + lines[i].trim();
        i++;
      }
      cues.push({ start, end, text: payload });
      continue;
    }
    i++;
  }

  const errors = [];
  if (cues.length === 0) errors.push('no cues parsed');
  for (let j = 1; j < cues.length; j++) {
    if (cues[j].start < cues[j - 1].end - 0.001) {
      errors.push(`cue ${j + 1} overlaps cue ${j}`);
    }
    if (cues[j].start < cues[j - 1].start) {
      errors.push(`cue ${j + 1} is not monotonic`);
    }
  }
  return { cues, errors };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    minScore: 80,
    failOnP0: true,
    sampleFrames: true,
    sampleStdThreshold: 12,
    slug: null,
    videoPath: null,
    vttPath: null,
    posterPath: null,
    reportDir: null,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--min-score') flags.minScore = Number(args[++i]);
    if (a === '--no-fail-on-p0') flags.failOnP0 = false;
    if (a === '--no-sample-frames') flags.sampleFrames = false;
    if (a === '--sample-std-threshold') flags.sampleStdThreshold = Number(args[++i]);
    if (a === '--slug') flags.slug = args[++i];
    if (a === '--video') flags.videoPath = path.resolve(args[++i]);
    if (a === '--vtt') flags.vttPath = path.resolve(args[++i]);
    if (a === '--poster') flags.posterPath = path.resolve(args[++i]);
    if (a === '--report-dir') flags.reportDir = path.resolve(args[++i]);
  }
  return flags;
}

export function sampleTimes(duration, cues) {
  const times = new Set();
  if (duration && duration > 0) {
    times.add(Math.max(0.5, duration * 0.25));
    times.add(Math.max(1.0, duration * 0.5));
    times.add(Math.min(duration - 0.5, duration * 0.75));
  }
  for (const cue of cues) {
    // Cue starts often coincide with a deliberate single dark cut frame. Sample
    // just inside the cue for content analysis; release review separately keeps
    // exact boundaries plus their neighbours in the 37-frame package.
    const settledStart = Math.min(cue.end - 0.1, cue.start + 0.4);
    if (settledStart > 0.2) times.add(settledStart);
    if (cue.end < duration - 0.2) times.add(Math.max(0, cue.end - 0.1));
  }
  return Array.from(times).filter((t) => t > 0 && t < duration).sort((a, b) => a - b);
}

async function extractFrame(videoPath, time, outPath) {
  const r = run('ffmpeg', [
    '-ss', String(time),
    '-i', videoPath,
    '-frames:v', '1',
    '-q:v', '2',
    '-y',
    outPath,
  ]);
  if (r.status !== 0) throw new Error(r.stderr);
}

export async function frameStats(framePath) {
  const result = await sharp(framePath).stats();
  const channels = result.channels;
  if (!Array.isArray(channels) || channels.length === 0) {
    throw new Error('Sharp returned no channel statistics');
  }
  const deviations = channels.map((channel) => Number(channel.stdev));
  if (deviations.some((value) => !Number.isFinite(value))) {
    throw new Error('Sharp returned invalid channel standard deviations');
  }
  const avgStd = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  return { avgStd };
}

async function sampleFrames(videoPath, cues, slug, worker, dictionary, corpus, bigram, stdThreshold = SAMPLE_STD_THRESHOLD) {
  const probe = ffprobeJson(videoPath);
  const fmt = probe.format || {};
  const duration = fmt.duration ? Number(fmt.duration) : null;
  if (!duration) return { samples: [], blankFrames: [], ocrHits: [] };

  const times = sampleTimes(duration, cues);
  const samples = [];
  const blankFrames = [];
  const ocrHits = [];
  const tmpDir = path.join(REPORT_DIR, '.frame-samples', slug);
  await mkdir(tmpDir, { recursive: true });

  for (const t of times) {
    const framePath = path.join(tmpDir, `${slug}-${t.toFixed(3)}.jpg`);
    try {
      await extractFrame(videoPath, t, framePath);
      const { avgStd } = await frameStats(framePath);
      samples.push({ time: t, avgStd: Number(avgStd.toFixed(2)) });
      if (avgStd < stdThreshold) {
        blankFrames.push({ time: t, avgStd: Number(avgStd.toFixed(2)) });
      }
      if (worker) {
        const { data } = await worker.recognize(framePath);
        const analysis = analyzeText(data.words || [], dictionary, corpus, bigram);
        if (analysis.unknown.length) {
          ocrHits.push({ time: t, words: analysis.unknown.slice(0, 6) });
        }
      }
    } catch (e) {
      samples.push({ time: t, error: e.message });
    }
  }
  return { samples, blankFrames, ocrHits };
}

function analyzeText(words, dictionary, corpus, bigram) {
  // Gibberish detection is delegated to the shared classifier, which keeps
  // hyphens and honors known compounds ("NON-COMPETITION" -> non+competition).
  const unknown = findSuspectWords(words, dictionary, corpus, bigram);
  const selfCitations = [];
  const fullText = words.map((w) => w.text).join(' ');

  for (const pattern of SELF_CITATION_PATTERNS) {
    const m = fullText.match(pattern);
    if (m) selfCitations.push(m[0]);
  }
  return { unknown, selfCitations };
}

async function ensureReportDir() {
  await mkdir(REPORT_DIR, { recursive: true });
}

async function findArticlePage(slug) {
  const candidates = [
    path.join(ARTICLES_DIR, slug, 'index.html'),
    path.join(ARTICLES_DIR, `${slug}.html`),
  ];
  for (const c of candidates) {
    try {
      await stat(c);
      return c;
    } catch {
      // continue
    }
  }
  return null;
}

async function checkArticleIntegration(slug, videoFile, posterFile) {
  const page = await findArticlePage(slug);
  if (!page) return { found: false, errors: ['article page not found'] };
  const html = await readFile(page, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const errors = [];

  const videoObject = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
    .map((s) => {
      try {
        const data = JSON.parse(s.textContent);
        const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data];
        return graph.find((item) => item['@type'] === 'VideoObject');
      } catch {
        return null;
      }
    })
    .find(Boolean);

  if (!videoObject) errors.push('no VideoObject schema');
  else {
    const expectedVideo = `https://lupine.science/videos/${videoFile}`;
    const expectedPoster = `https://lupine.science/videos/${posterFile}`;
    if (videoObject.contentUrl !== expectedVideo) {
      errors.push(`VideoObject contentUrl mismatch: ${videoObject.contentUrl}`);
    }
    if (!videoObject.thumbnailUrl?.includes(posterFile)) {
      errors.push(`VideoObject thumbnail mismatch: ${videoObject.thumbnailUrl}`);
    }
  }

  const videoLink = Array.from(doc.querySelectorAll('a'))
    .find((a) => a.getAttribute('href')?.includes(`/videos/${videoFile}`));
  if (!videoLink) errors.push('article page missing video link');

  const ogImage = doc.querySelector('meta[property="og:image"]');
  if (!ogImage?.content?.includes(posterFile)) {
    errors.push('og:image does not use poster');
  }

  return { found: true, errors };
}

function isHighConfidenceOcrHit(hit) {
  const confidences = hit.words.map((w) => w.confidence ?? 100);
  return confidences.some((c) => c > 80);
}

export function classifyP0(report, sample) {
  const p0 = [];
  for (const n of report.technical.notes) {
    if (/no video stream|no audio stream|video codec|pixel format/.test(n)) p0.push(`technical:${n}`);
  }
  for (const n of report.poster.notes) {
    if (/poster missing/.test(n)) {
      p0.push(`poster:${n}`);
    } else if (/suspect words/.test(n)) {
      // Poster suspect words are P0 only if there are several or any is high-confidence,
      // avoiding OCR hallucinations on abstract AI-generated textures.
      const unknown = report.posterAnalysis?.unknown || [];
      const highConf = unknown.filter((u) => (u.confidence ?? 100) > 80);
      if (unknown.length >= 3 || highConf.length > 0) {
        p0.push(`poster:${n}`);
      }
    }
  }
  for (const n of report.captions.notes) {
    if (/VTT missing|no cues|final cue exceeds/.test(n)) p0.push(`captions:${n}`);
  }
  for (const n of report.brand.notes) {
    if (/self-citation/.test(n)) p0.push(`brand:${n}`);
  }
  if (sample) {
    const analysisErrors = sample.samples.filter((frame) => frame.error);
    if (analysisErrors.length) {
      p0.push(`frames:analysis failed for ${analysisErrors.length} sampled frame(s)`);
    }
    if (sample.blankFrames.length) {
      p0.push(`frames:blank/flat frames at ${sample.blankFrames.map((f) => `${f.time.toFixed(1)}s`).join(', ')}`);
    }
    const strongOcrHits = sample.ocrHits.filter(isHighConfidenceOcrHit);
    if (strongOcrHits.length) {
      p0.push(`frames:gibberish text in ${strongOcrHits.length} sampled frame(s)`);
    }
  }
  return p0;
}

async function reviewVideo(file, dictionary, corpus, bigram, worker, flags) {
  const slug = flags.slug || path.basename(file, '.mp4');
  const videoPath = flags.videoPath || path.join(VIDEOS_DIR, file);
  const posterPath = flags.posterPath || path.join(VIDEOS_DIR, `${slug}-poster.jpg`);
  const vttPath = flags.vttPath || path.join(VIDEOS_DIR, `${slug}.vtt`);

  const probe = ffprobeJson(videoPath);
  const report = {
    slug,
    file,
    technical: { score: 0, max: 25, notes: [] },
    poster: { score: 0, max: 25, notes: [] },
    captions: { score: 0, max: 20, notes: [] },
    integration: { score: 0, max: 15, notes: [] },
    brand: { score: 0, max: 15, notes: [] },
    total: 0,
    max: 100,
  };

  const vStream = probe.streams?.find((s) => s.codec_type === 'video');
  const aStream = probe.streams?.find((s) => s.codec_type === 'audio');
  const fmt = probe.format || {};

  if (!vStream) report.technical.notes.push('no video stream');
  else {
    if (vStream.width !== TARGET_WIDTH || vStream.height !== TARGET_HEIGHT) {
      report.technical.notes.push(`resolution ${vStream.width}x${vStream.height}`);
    }
    if (!vStream.avg_frame_rate?.includes('30')) {
      report.technical.notes.push(`frame rate ${vStream.avg_frame_rate}`);
    }
    if (vStream.codec_name !== 'h264') {
      report.technical.notes.push(`video codec ${vStream.codec_name}`);
    }
    if (vStream.pix_fmt !== 'yuv420p') {
      report.technical.notes.push(`pixel format ${vStream.pix_fmt}`);
    }
  }

  if (!aStream) report.technical.notes.push('no audio stream');
  else {
    if (aStream.codec_name !== 'aac') report.technical.notes.push(`audio codec ${aStream.codec_name}`);
    const sampleRate = Number(aStream.sample_rate);
    if (sampleRate !== 44100) report.technical.notes.push(`sample rate ${sampleRate}`);
    const channels = Number(aStream.channels);
    if (channels !== 1) report.technical.notes.push(`channels ${channels} (expected mono)`);
  }

  const duration = fmt.duration ? Number(fmt.duration) : null;
  const totalBitrate = fmt.bit_rate ? Number(fmt.bit_rate) : null;
  if (duration && (duration < 60 || duration > 240)) {
    report.technical.notes.push(`duration ${duration.toFixed(1)}s (target 90-120s)`);
  }
  if (totalBitrate && totalBitrate < 200_000) {
    report.technical.notes.push(`total bitrate ${(totalBitrate / 1000).toFixed(0)} kbps (low)`);
  }

  const ln = loudness(videoPath);
  if (ln.integrated === null) {
    report.technical.notes.push('could not measure loudness');
  } else {
    if (Math.abs(ln.integrated - LOUDNESS_TARGET) > LOUDNESS_TOLERANCE) {
      report.technical.notes.push(`loudness ${ln.integrated.toFixed(1)} LUFS`);
    }
    if (ln.lra !== null && ln.lra > LRA_MAX) {
      report.technical.notes.push(`LRA ${ln.lra.toFixed(1)} LU`);
    }
  }

  report.technical.score = Math.max(0, report.technical.max - report.technical.notes.length * 5);

  let posterWords = [];
  let posterTextPreview = '';
  try {
    await stat(posterPath);
    if (worker) {
      const { data } = await worker.recognize(posterPath);
      posterWords = data.words || [];
      posterTextPreview = data.text?.slice(0, 300) || '';
    }
  } catch {
    report.poster.notes.push('poster missing');
  }

  let posterAnalysis = { unknown: [], selfCitations: [] };
  if (posterWords.length) {
    posterAnalysis = analyzeText(posterWords, dictionary, corpus, bigram);
    if (posterAnalysis.unknown.length) {
      const names = posterAnalysis.unknown.map((u) => u.word).slice(0, 8);
      report.poster.notes.push(`suspect words: ${names.join(', ')}`);
    }
    if (posterAnalysis.selfCitations.length) {
      report.brand.notes.push(`self-citation in poster: ${posterAnalysis.selfCitations.join(', ')}`);
    }
  }
  report.poster.score = Math.max(0, report.poster.max - report.poster.notes.length * 5);

  let vttText = '';
  let vttCues = [];
  try {
    vttText = await readFile(vttPath, 'utf8');
  } catch {
    report.captions.notes.push('VTT missing');
  }
  if (vttText) {
    const vtt = parseVtt(vttText);
    vttCues = vtt.cues;
    if (vtt.errors.length) report.captions.notes.push(...vtt.errors);
    if (vtt.cues.length === 0) report.captions.notes.push('no cues');
    else if (duration && vtt.cues[vtt.cues.length - 1].end > duration + 1) {
      report.captions.notes.push('final cue exceeds video duration');
    }
  }
  report.captions.score = Math.max(0, report.captions.max - report.captions.notes.length * 4);

  // A private candidate may live outside public/videos. Placement still checks
  // the canonical filenames the approved replacement would occupy; it must not
  // require a public-media overwrite merely to run pre-publication review.
  const integration = await checkArticleIntegration(slug, `${slug}.mp4`, `${slug}-poster.jpg`);
  if (!integration.found) {
    report.integration.notes.push(...integration.errors);
  } else {
    report.integration.notes.push(...integration.errors);
  }
  report.integration.score = Math.max(0, report.integration.max - report.integration.notes.length * 5);

  if (!report.brand.notes.some((n) => n.includes('self-citation'))) {
    const capWords = tokenize(vttText).map((t) => ({ text: t }));
    const capAnalysis = analyzeText(capWords, dictionary, corpus, bigram);
    if (capAnalysis.selfCitations.length) {
      report.brand.notes.push(`self-citation in captions: ${capAnalysis.selfCitations.join(', ')}`);
    }
  }
  report.brand.score = Math.max(0, report.brand.max - report.brand.notes.length * 5);

  report.total = report.technical.score + report.poster.score + report.captions.score + report.integration.score + report.brand.score;
  report.duration = duration;
  report.loudness = ln;
  report.posterOcr = { preview: posterTextPreview, wordCount: posterWords.length };
  report.posterAnalysis = posterAnalysis;

  let sample = null;
  if (flags.sampleFrames) {
    sample = await sampleFrames(videoPath, vttCues, slug, worker, dictionary, corpus, bigram, flags.sampleStdThreshold);
  }
  report.sample = sample;
  report.p0 = classifyP0(report, sample);

  return report;
}

function formatReport(reports, dateStamp) {
  const lines = [];
  lines.push('# Smart Video Review Report');
  lines.push(`Generated: ${dateStamp}`);
  lines.push(`Videos reviewed: ${reports.length}`);
  lines.push('');

  const sorted = [...reports].sort((a, b) => a.total - b.total);
  const worst = sorted[0];
  const best = sorted[sorted.length - 1];
  const avg = reports.reduce((s, r) => s + r.total, 0) / reports.length;
  const p0Count = reports.reduce((s, r) => s + r.p0.length, 0);

  lines.push(`- Average score: ${avg.toFixed(1)}/100`);
  lines.push(`- P0 issues: ${p0Count}`);
  lines.push(`- Lowest: ${worst.slug} (${worst.total}/${worst.max})`);
  lines.push(`- Highest: ${best.slug} (${best.total}/${best.max})`);
  lines.push('');

  for (const r of sorted) {
    lines.push(`## ${r.slug}`);
    lines.push(`**Total ${r.total}/${r.max}** — technical ${r.technical.score}/${r.technical.max}, poster ${r.poster.score}/${r.poster.max}, captions ${r.captions.score}/${r.captions.max}, integration ${r.integration.score}/${r.integration.max}, brand ${r.brand.score}/${r.brand.max}`);
    lines.push(`Duration: ${r.duration ? `${r.duration.toFixed(1)}s` : 'unknown'} · Loudness: ${r.loudness.integrated ? `${r.loudness.integrated.toFixed(1)} LUFS` : 'unknown'} · LRA: ${r.loudness.lra ? `${r.loudness.lra.toFixed(1)} LU` : 'unknown'}`);
    if (r.p0.length) {
      lines.push('');
      lines.push('**P0 issues:**');
      for (const p of r.p0) lines.push(`- ${p}`);
    }
    const notes = [
      ...r.technical.notes.map((n) => `- technical: ${n}`),
      ...r.poster.notes.map((n) => `- poster: ${n}`),
      ...r.captions.notes.map((n) => `- captions: ${n}`),
      ...r.integration.notes.map((n) => `- integration: ${n}`),
      ...r.brand.notes.map((n) => `- brand: ${n}`),
    ];
    if (notes.length) {
      lines.push('');
      lines.push(...notes);
    }
    if (r.sample?.blankFrames?.length) {
      lines.push('');
      lines.push(`Blank/flat sampled frames: ${r.sample.blankFrames.map((f) => `${f.time.toFixed(1)}s (σ=${f.avgStd})`).join(', ')}`);
    }
    if (r.sample?.ocrHits?.length) {
      lines.push('');
      lines.push(`OCR hits in sampled frames: ${r.sample.ocrHits.map((h) => `${h.time.toFixed(1)}s: ${h.words.map((w) => w.word || w).join(', ')}`).join('; ')}`);
    }
    if (r.posterOcr.preview) {
      lines.push('');
      lines.push(`Poster OCR preview: "${r.posterOcr.preview.replace(/\s+/g, ' ').trim()}"`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const flags = parseArgs();
  if (flags.reportDir) REPORT_DIR = flags.reportDir;
  await ensureReportDir();
  const files = flags.videoPath
    ? [path.basename(flags.videoPath)]
    : (await readdir(VIDEOS_DIR))
      .filter((f) => f.endsWith('.mp4'))
      .filter((f) => !flags.slug || f === `${flags.slug}.mp4`)
      .sort();

  if (files.length === 0) {
    console.error(flags.videoPath
      ? `No MP4 found at ${flags.videoPath}`
      : flags.slug ? `No MP4 found for slug ${flags.slug}` : `No MP4s found in ${VIDEOS_DIR}`);
    process.exit(1);
  }

  const dictionary = await loadDictionary();
  const corpus = await buildDomainCorpus();
  // CI runners do not ship /usr/share/dict/words. When the system dictionary
  // is empty, train the character model on the domain corpus instead so the
  // nonsense-word detector still has a reference distribution.
  const bigram = trainBigramModel(dictionary.size > 0 ? dictionary : corpus);
  console.error(`Dictionary ${dictionary.size}, corpus ${corpus.size}`);

  let worker = null;
  try {
    worker = await createWorker('eng', 1, {
      logger: (m) => { if (m.status === 'error') console.error('tesseract:', m); },
    });
  } catch (e) {
    console.error('OCR unavailable:', e.message);
  }

  const reports = [];
  for (const file of files) {
    console.error(`Reviewing ${file}...`);
    const report = await reviewVideo(file, dictionary, corpus, bigram, worker, flags);
    reports.push(report);
  }

  if (worker) await worker.terminate();

  const dateStamp = new Date().toISOString();
  const base = dateStamp.slice(0, 19).replace(/[:T]/g, '-');
  const jsonPath = path.join(REPORT_DIR, `${base}-smart-review.json`);
  const mdPath = path.join(REPORT_DIR, `${base}-smart-review.md`);

  await writeFile(jsonPath, JSON.stringify({ generatedAt: dateStamp, videos: reports }, null, 2));
  await writeFile(mdPath, formatReport(reports, dateStamp));

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);

  const avg = reports.reduce((s, r) => s + r.total, 0) / reports.length;
  console.log(`Average score: ${avg.toFixed(1)}/100 across ${reports.length} videos`);
  const p0Videos = reports.filter((r) => r.p0.length);
  if (p0Videos.length) {
    console.log(`\nP0 failures (${p0Videos.length} videos):`);
    for (const r of p0Videos) {
      console.log(`- ${r.slug}: ${r.p0.length} issue(s)`);
    }
  }

  let exitCode = 0;
  if (flags.failOnP0 && p0Videos.length) {
    console.error(`\nFailing because ${p0Videos.length} video(s) have P0 issues.`);
    exitCode = 1;
  }
  if (avg < flags.minScore) {
    console.error(`\nFailing because average score ${avg.toFixed(1)} is below threshold ${flags.minScore}.`);
    exitCode = 1;
  }
  if (exitCode) process.exit(exitCode);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
