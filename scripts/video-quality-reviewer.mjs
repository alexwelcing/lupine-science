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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');
const ARTICLES_DIR = path.join(ROOT, 'public', 'articles');
const ARTICLE_SOURCES_DIR = path.join(ROOT, 'articles');
const REPORT_DIR = path.join(ROOT, 'media', 'projects', 'video-review', 'reports');

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_FPS = 30;
const LOUDNESS_TARGET = -16;
const LOUDNESS_TOLERANCE = 2;
const LRA_MAX = 8;

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

function tokenize(text) {
  return text
    .replace(/[^a-zA-Z0-9\s\-]/g, ' ')
    .split(/\s+|-/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 3);
}

async function loadDictionary() {
  try {
    const raw = await readFile('/usr/share/dict/words', 'utf8');
    return new Set(raw.split(/\r?\n/).map((w) => w.trim().toLowerCase()).filter(Boolean));
  } catch {
    return new Set();
  }
}

async function buildDomainCorpus() {
  const corpus = new Set();
  const addText = (text) => {
    for (const t of tokenize(text)) corpus.add(t);
  };

  try {
    const sources = (await readdir(ARTICLE_SOURCES_DIR)).filter((f) => f.endsWith('.md'));
    for (const f of sources) {
      addText(await readFile(path.join(ARTICLE_SOURCES_DIR, f), 'utf8'));
    }
  } catch {
    // ignore missing source dir
  }

  try {
    const vtts = (await readdir(VIDEOS_DIR)).filter((f) => f.endsWith('.vtt'));
    for (const f of vtts) {
      addText(await readFile(path.join(VIDEOS_DIR, f), 'utf8'));
    }
  } catch {
    // ignore
  }

  // Common scientific / Lupine terms that may not appear in articles
  const extra = [
    'combinatorial', 'ranking', 'linkers', 'candidates', 'asymmetry', 'metastability',
    'inversion', 'defect', 'bulk', 'hydrated', 'amorphous', 'networks', 'priorities',
    'buried', 'breakthroughs', 'predicted', 'structure', 'working', 'material',
    'error-field', 'observables', 'runtime', 'build-locked', 'machine-learning',
    'deepmind', 'clean-air', 'low-carbon', 'coordination-specific', 'materials-limited',
    'single-atom', 'sorbents', 'sorbent', 'metal-organic', 'kinetically', 'ai-generated',
    'mofs', 'makeability', 'interatomic', 'near-quantum', 'defect-family', 'gigatonnes',
    'anthropogenic', 'calcination', 'feedstock', 'clean-energy', 'extractants',
    'nanograms', 'gigatons', 'cobalt-free', 'energy-hungry', 'haber-bosch', 'lead-free',
    'near-term', 'low-warming', 'atomistic', 'carbon-hydrogen', 'thirty-six',
    'synthesizability', 'milli-electronvolts', 'fifty-fold', 'density-functional',
    'enthalpies', 'coupling-aware', 'two-thirds', 'machine-learned', 'machine-checked',
    'recomputes', 'shortlists', 'web-native', 'browser-native', 'webgl', 'webgpu',
    'handoffs', 'handoff', 'lithium-manganese-rich', 'atomic-layer', 'nitrous',
    'hydrofluorocarbon', 'hexafluoride', 'non-co', 'thirty-five', 'under-coordinated',
    'first-shell', 'blind', 'prediction', 'surface', 'coordination', 'vacancy',
    'constraint', 'correction', 'force', 'measured', 'spline', 'anchor', 'local',
    'python', 'compiled', 'overlay', 'refrigerant', 'refrigerants', 'kigali',
    'amendment', 'hydrofluorocarbons', 'thermophysical', 'inspectable', 'trajectories',
    'payloads', 'telemetry', 'glyphs', 'impostors', 'colormaps', 'lammps', 'brick',
    'lod', 'bond', 'dissociation', 'energy', 'organic', 'common', 'source', 'smart',
    'kirk-othmer', 'encyclopedia', 'chemical', 'technology', 'wiley', 'npj', 'comput',
    'mater', 'deng', 'ipcc', 'wgi', 'table', 'sections', 'maginn', 'simulation',
    'cement', 'concrete', 'built', 'world', 'factory', 'kiln', 'smoke', 'emissions',
    'trust', 'layer', 'investing', 'verification', 'evidence', 'claim', 'network',
  ];
  for (const t of extra) corpus.add(t);
  return corpus;
}

function hasVowel(token) {
  return /[aeiouy]/.test(token);
}

function isScientificToken(token) {
  if (/^\d+(\.\d+)?$/.test(token)) return true;
  if (/^(mg|na|cl|ca|fe|al|si|ti|cu|li|k|s|p|n|o|c|h|f)[0-9]*$/.test(token)) return true;
  return false;
}

function trainBigramModel(dictionary) {
  const counts = new Map();
  const totals = new Map();
  for (const word of dictionary) {
    if (word.length < 3) continue;
    const chars = ['^', ...word.split(''), '$'];
    for (let i = 0; i < chars.length - 1; i++) {
      const a = chars[i];
      const b = chars[i + 1];
      totals.set(a, (totals.get(a) || 0) + 1);
      const key = `${a}:${b}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return { counts, totals };
}

function bigramScore(token, model) {
  if (token.length < 3) return 0;
  const chars = ['^', ...token.split(''), '$'];
  let logSum = 0;
  let n = 0;
  for (let i = 0; i < chars.length - 1; i++) {
    const a = chars[i];
    const b = chars[i + 1];
    const total = model.totals.get(a) || 0;
    const count = model.counts.get(`${a}:${b}`) || 0;
    if (total === 0) return -Infinity;
    const p = (count + 0.5) / (total + 26);
    logSum += Math.log(p);
    n++;
  }
  return n ? logSum / n : 0;
}

function analyzeText(words, dictionary, corpus, bigram) {
  const unknown = [];
  const selfCitations = [];
  const fullText = words.map((w) => w.text).join(' ');

  for (const { text, confidence } of words) {
    const clean = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (clean.length < 4) continue;
    if (isScientificToken(clean)) continue;
    if (dictionary.has(clean) || corpus.has(clean)) continue;
    // Allow hyphenated parts that are in dictionary
    const parts = clean.split('-');
    if (parts.some((p) => p.length >= 3 && (dictionary.has(p) || corpus.has(p)))) continue;
    const score = bigramScore(clean, bigram);
    const isNonsense = score < -4.5 || !hasVowel(clean) || /(.{2,})\1/.test(clean);
    const lowConfidence = confidence !== undefined && confidence < 60;
    if (isNonsense || lowConfidence) {
      unknown.push({ word: text, clean, score: score.toFixed(2), confidence });
    }
  }

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

async function reviewVideo(file, dictionary, corpus, bigram, worker) {
  const slug = path.basename(file, '.mp4');
  const videoPath = path.join(VIDEOS_DIR, file);
  const posterPath = path.join(VIDEOS_DIR, `${slug}-poster.jpg`);
  const vttPath = path.join(VIDEOS_DIR, `${slug}.vtt`);

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

  if (posterWords.length) {
    const analysis = analyzeText(posterWords, dictionary, corpus, bigram);
    if (analysis.unknown.length) {
      const names = analysis.unknown.map((u) => u.word).slice(0, 8);
      report.poster.notes.push(`suspect words: ${names.join(', ')}`);
    }
    if (analysis.selfCitations.length) {
      report.brand.notes.push(`self-citation in poster: ${analysis.selfCitations.join(', ')}`);
    }
  }
  report.poster.score = Math.max(0, report.poster.max - report.poster.notes.length * 5);

  let vttText = '';
  try {
    vttText = await readFile(vttPath, 'utf8');
  } catch {
    report.captions.notes.push('VTT missing');
  }
  if (vttText) {
    const vtt = parseVtt(vttText);
    if (vtt.errors.length) report.captions.notes.push(...vtt.errors);
    if (vtt.cues.length === 0) report.captions.notes.push('no cues');
    else if (duration && vtt.cues[vtt.cues.length - 1].end > duration + 1) {
      report.captions.notes.push('final cue exceeds video duration');
    }
  }
  report.captions.score = Math.max(0, report.captions.max - report.captions.notes.length * 4);

  const integration = await checkArticleIntegration(slug, file, `${slug}-poster.jpg`);
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

  lines.push(`- Average score: ${avg.toFixed(1)}/100`);
  lines.push(`- Lowest: ${worst.slug} (${worst.total}/${worst.max})`);
  lines.push(`- Highest: ${best.slug} (${best.total}/${best.max})`);
  lines.push('');

  for (const r of sorted) {
    lines.push(`## ${r.slug}`);
    lines.push(`**Total ${r.total}/${r.max}** — technical ${r.technical.score}/${r.technical.max}, poster ${r.poster.score}/${r.poster.max}, captions ${r.captions.score}/${r.captions.max}, integration ${r.integration.score}/${r.integration.max}, brand ${r.brand.score}/${r.brand.max}`);
    lines.push(`Duration: ${r.duration ? `${r.duration.toFixed(1)}s` : 'unknown'} · Loudness: ${r.loudness.integrated ? `${r.loudness.integrated.toFixed(1)} LUFS` : 'unknown'} · LRA: ${r.loudness.lra ? `${r.loudness.lra.toFixed(1)} LU` : 'unknown'}`);
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
    if (r.posterOcr.preview) {
      lines.push('');
      lines.push(`Poster OCR preview: "${r.posterOcr.preview.replace(/\s+/g, ' ').trim()}"`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  await ensureReportDir();
  const files = (await readdir(VIDEOS_DIR))
    .filter((f) => f.endsWith('.mp4'))
    .sort();

  if (files.length === 0) {
    console.error('No MP4s found in', VIDEOS_DIR);
    process.exit(1);
  }

  const dictionary = await loadDictionary();
  const corpus = await buildDomainCorpus();
  const bigram = trainBigramModel(dictionary);
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
    const report = await reviewVideo(file, dictionary, corpus, bigram, worker);
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
  const flagged = reports.filter((r) => r.total < 80 || r.poster.notes.some((n) => n.includes('suspect')) || r.brand.notes.length);
  if (flagged.length) {
    console.log(`\nFlagged videos (${flagged.length}):`);
    for (const r of flagged) {
      console.log(`- ${r.slug}: ${r.total}/100`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
