#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = { project: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project') flags.project = path.resolve(args[++i]);
  }
  if (!flags.project) throw new Error('Usage: node scripts/review-article-video-candidate.mjs --project <candidate-project>');
  return flags;
}

function run(command, args, { allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (!allowFailure && result.status !== 0) {
    throw new Error(`${command} failed (${result.status}): ${(result.stderr || result.stdout || '').slice(-4000)}`);
  }
  return result;
}

async function sha256(file) {
  return createHash('sha256').update(await fs.readFile(file)).digest('hex');
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

function probeVideo(file) {
  const result = run('ffprobe', [
    '-v', 'error', '-show_streams', '-show_format', '-of', 'json', file,
  ]);
  return JSON.parse(result.stdout);
}

function parseVtt(text) {
  const cuePattern = /(\d{2}):(\d{2}):(\d{2}\.\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2}\.\d{3})/g;
  const seconds = (h, m, s) => Number(h) * 3600 + Number(m) * 60 + Number(s);
  const cues = [];
  for (const match of text.matchAll(cuePattern)) {
    cues.push({
      start: seconds(match[1], match[2], match[3]),
      end: seconds(match[4], match[5], match[6]),
    });
  }
  return cues;
}

function reviewTimes(scenes, duration) {
  const entries = [
    { time: 1, kind: 'sentinel-start', scene: scenes[0].id },
    ...scenes.flatMap((scene) => {
      const [early, proof, late] = scene.reviewTimesSeconds;
      return [
        { time: early, kind: 'scene-early', scene: scene.id },
        { time: proof, kind: 'scene-proof', scene: scene.id },
        { time: late, kind: 'scene-late', scene: scene.id },
      ];
    }),
    ...scenes.slice(1).map((scene) => ({
      time: scene.windowSeconds[0],
      kind: 'exact-boundary',
      scene: scene.id,
    })),
    { time: duration - 1, kind: 'sentinel-end', scene: scenes.at(-1).id },
  ];
  entries.sort((a, b) => a.time - b.time || a.kind.localeCompare(b.kind));
  if (entries.length !== 37) throw new Error(`Expected exactly 37 review frames, got ${entries.length}`);
  return entries;
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

async function labelledThumb(file, label) {
  const width = 384;
  const height = 216;
  const overlay = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="184" width="${width}" height="32" fill="#101513" fill-opacity="0.92"/>
    <text x="10" y="205" fill="#f2efe6" font-family="monospace" font-size="14">${escapeXml(label)}</text>
  </svg>`);
  return sharp(file).resize(width, height, { fit: 'cover' }).composite([{ input: overlay }]).jpeg({ quality: 90 }).toBuffer();
}

async function makeSheet(records, output) {
  const columns = 5;
  const width = 384;
  const height = 216;
  const rows = Math.ceil(records.length / columns);
  const composites = [];
  for (let i = 0; i < records.length; i++) {
    composites.push({
      input: await labelledThumb(records[i].absoluteFile, `${records[i].index} · ${records[i].time.toFixed(2)}s · ${records[i].kind}`),
      left: (i % columns) * width,
      top: Math.floor(i / columns) * height,
    });
  }
  await sharp({
    create: { width: columns * width, height: rows * height, channels: 3, background: '#101513' },
  }).composite(composites).jpeg({ quality: 90 }).toFile(output);
}

async function main() {
  const { project } = parseArgs();
  const contractFile = path.join(project, 'production-contract.json');
  const video = path.join(project, 'output', 'private-candidate.mp4');
  const vtt = path.join(project, 'output', 'private-candidate.vtt');
  const poster = path.join(project, 'output', 'private-candidate-poster.jpg');
  const posterCrop = path.join(project, 'output', 'private-candidate-poster-1200x630.jpg');
  const review = path.join(project, 'review');
  const frameDir = path.join(review, 'frames-37');
  const visualReportDir = path.join(review, 'visual-review');
  await fs.mkdir(review, { recursive: true });

  const contract = await readJson(contractFile);
  const errors = [];
  const checks = [];
  const check = (id, condition, detail) => {
    checks.push({ id, status: condition ? 'pass' : 'fail', detail });
    if (!condition) errors.push(`${id}: ${detail}`);
  };

  check('private-status', contract.status === 'authored-private-candidate-only', `status=${contract.status}`);
  check('publication-disabled', contract.eligibleForPublication === false, `eligibleForPublication=${contract.eligibleForPublication}`);
  check('scene-count', contract.scenes?.length === 9, `scenes=${contract.scenes?.length ?? 0}`);
  const frameSpec = await fs.readFile(path.join(project, 'frame.md'), 'utf8');
  const compositionHtml = await fs.readFile(path.join(project, 'index.html'), 'utf8');
  const palette = contract.colorDirection?.palette || {};
  const semanticRoles = contract.colorDirection?.semantics || {};
  const normalizedFrameSpec = frameSpec.toLowerCase();
  const normalizedComposition = compositionHtml.toLowerCase();
  check('color-palette-present', Object.keys(palette).length >= 4, `roles=${Object.keys(palette).join(',')}`);
  check(
    'color-semantics-present',
    Object.keys(palette).every((role) => Boolean(semanticRoles[role])),
    `semanticRoles=${Object.keys(semanticRoles).join(',')}`,
  );
  check(
    'color-prohibitions-present',
    contract.colorDirection?.prohibitions?.length >= 3 && Boolean(contract.colorDirection?.nonColorRedundancy),
    `prohibitions=${contract.colorDirection?.prohibitions?.length ?? 0}; nonColorRedundancy=${Boolean(contract.colorDirection?.nonColorRedundancy)}`,
  );
  for (const [role, value] of Object.entries(palette)) {
    const token = String(value).toLowerCase();
    check(`color-${role}-in-frame-spec`, normalizedFrameSpec.includes(token), `${role}=${value}`);
    check(`color-${role}-in-composition`, normalizedComposition.includes(token), `${role}=${value}`);
  }
  for (const scene of contract.scenes || []) {
    check(`scene-${scene.id}-proof`, Boolean(scene.dominantProof), 'exactly one dominantProof field required');
    check(`scene-${scene.id}-relationships`, scene.visibleRelationships?.length >= 1 && scene.visibleRelationships.length <= 3, `relationships=${scene.visibleRelationships?.length ?? 0}`);
    check(
      `scene-${scene.id}-review-times`,
      scene.reviewTimesSeconds?.length === 3
        && scene.reviewTimesSeconds.every((time) => time >= scene.windowSeconds[0] && time <= scene.windowSeconds[1]),
      `reviewTimesSeconds=${JSON.stringify(scene.reviewTimesSeconds)}`,
    );
    check(
      `scene-${scene.id}-semantic-colors`,
      scene.semanticColorRoles?.length >= 1
        && scene.semanticColorRoles.every((role) => Boolean(palette[role]) && Boolean(semanticRoles[role])),
      `semanticColorRoles=${JSON.stringify(scene.semanticColorRoles)}`,
    );
  }

  const contractValidation = run('node', [path.resolve(project, contract.artifacts?.contractValidator || '')], { allowFailure: true });
  check('candidate-contract-validator', contractValidation.status === 0, (contractValidation.stdout || contractValidation.stderr || '').trim());

  const strictReportPath = path.resolve(project, contract.artifacts?.hyperframesStrictReport || '');
  const strictReport = JSON.parse(await fs.readFile(strictReportPath, 'utf8'));
  const strictSections = ['lint', 'runtime', 'layout', 'motion', 'contrast'];
  check('hyperframes-version-pinned', strictReport._meta?.version === contract.artifacts?.hyperframesVersion, `${strictReport._meta?.version} expected ${contract.artifacts?.hyperframesVersion}`);
  check(
    'hyperframes-strict-pass',
    strictReport.ok === true && strictReport.strict === true
      && strictSections.every((section) => strictReport[section]?.ok === true)
      && strictReport.contrast?.warningCount === 0,
    strictSections.map((section) => `${section}=${strictReport[section]?.ok}`).join('; '),
  );

  for (const file of [video, vtt, poster, posterCrop]) {
    try {
      await fs.stat(file);
      check(`file-${path.basename(file)}`, true, path.relative(ROOT, file));
    } catch {
      check(`file-${path.basename(file)}`, false, `missing ${path.relative(ROOT, file)}`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));

  const probe = probeVideo(video);
  const videoStream = probe.streams.find((stream) => stream.codec_type === 'video');
  const audioStream = probe.streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(probe.format.duration);
  const bytes = Number(probe.format.size);
  check('video-codec', videoStream?.codec_name === 'h264', `codec=${videoStream?.codec_name}`);
  check('video-resolution', videoStream?.width === 1920 && videoStream?.height === 1080, `${videoStream?.width}x${videoStream?.height}`);
  check('video-pixel-format', videoStream?.pix_fmt === 'yuv420p', `pix_fmt=${videoStream?.pix_fmt}`);
  check('video-frame-rate', videoStream?.avg_frame_rate === '30/1', `fps=${videoStream?.avg_frame_rate}`);
  check('audio-codec', audioStream?.codec_name === 'aac', `codec=${audioStream?.codec_name}`);
  check('audio-sample-rate', Number(audioStream?.sample_rate) === 44100, `sample_rate=${audioStream?.sample_rate}`);
  check('audio-channels', Number(audioStream?.channels) === 1, `channels=${audioStream?.channels}`);
  check('duration', Math.abs(duration - contract.delivery.durationSeconds) <= 0.1, `actual=${duration}, contract=${contract.delivery.durationSeconds}`);
  check('hard-file-budget', bytes <= contract.delivery.hardFileSizeBytes, `bytes=${bytes}, max=${contract.delivery.hardFileSizeBytes}`);
  check('soft-file-budget', bytes <= contract.delivery.softFileSizeBytes, `bytes=${bytes}, max=${contract.delivery.softFileSizeBytes}`);

  const posterMeta = await sharp(poster).metadata();
  const cropMeta = await sharp(posterCrop).metadata();
  check('poster-source-size', posterMeta.width === 1920 && posterMeta.height === 1080, `${posterMeta.width}x${posterMeta.height}`);
  check('poster-social-size', cropMeta.width === 1200 && cropMeta.height === 630, `${cropMeta.width}x${cropMeta.height}`);

  const vttText = await fs.readFile(vtt, 'utf8');
  const cues = parseVtt(vttText);
  check('captions-present', cues.length > 0, `cues=${cues.length}`);
  check('captions-monotonic', cues.every((cue, index) => index === 0 || cue.start >= cues[index - 1].end), 'cues must be monotonic and non-overlapping');
  check('captions-in-duration', cues.every((cue) => cue.end <= duration + 0.1), `last=${cues.at(-1)?.end}, duration=${duration}`);
  if (contract.audioExcision?.forbiddenSpokenPattern) {
    const spokenVtt = vttText.split(/\r?\n/).filter((line) => !line.startsWith('NOTE ')).join('\n');
    const forbidden = new RegExp(contract.audioExcision.forbiddenSpokenPattern, 'i');
    check('excluded-caption-claim-absent', !forbidden.test(spokenVtt), `pattern=${contract.audioExcision.forbiddenSpokenPattern}`);
  }

  const articlePage = path.join(ROOT, 'public', 'articles', contract.slug, 'index.html');
  const videoPage = path.join(ROOT, 'public', 'videos', contract.slug, 'index.html');
  const articleHtml = await fs.readFile(articlePage, 'utf8');
  const videoHtml = await fs.readFile(videoPage, 'utf8');
  check('article-video-placement', articleHtml.includes(`/videos/${contract.slug}.mp4`), 'article references canonical MP4');
  check('article-poster-placement', articleHtml.includes(`/videos/${contract.slug}-poster.jpg`), 'article references canonical poster');
  check('player-controls', /<video\s+controls\s/.test(videoHtml), 'video detail uses native controls');
  check('player-poster-first', /<video[^>]+preload="none"[^>]+poster=/.test(videoHtml), 'preload none with poster');
  check('player-no-autoplay', !/<video[^>]+autoplay/.test(videoHtml), 'autoplay absent');
  check('player-no-loop', !/<video[^>]+loop/.test(videoHtml), 'loop absent');
  check('player-caption-track', new RegExp(`<track kind="captions" src="/videos/${contract.slug}\\.vtt"[^>]+default>`).test(videoHtml), 'default English WebVTT track');
  check('player-aria-label', /<video[^>]+aria-describedby=/.test(videoHtml), 'video player has an accessible description');

  const decode = run('ffmpeg', ['-v', 'error', '-i', video, '-f', 'null', '-'], { allowFailure: true });
  check('full-decode', decode.status === 0 && !(decode.stderr || '').trim(), `exit=${decode.status}; stderr=${(decode.stderr || '').trim() || 'empty'}`);

  const black = run('ffmpeg', [
    '-hide_banner', '-nostats', '-i', video,
    '-vf', 'blackdetect=d=0.5:pic_th=0.98:pix_th=0.10', '-an', '-f', 'null', '-',
  ], { allowFailure: true });
  check('no-sustained-black', black.status === 0 && !/black_start:/.test(black.stderr || ''), 'no black interval may persist for 0.5 seconds');

  if (contract.audioExcision) {
    const [removeStart, removeEnd] = contract.audioExcision.removedIntervalSeconds;
    const excision = run('node', [
      'scripts/verify-audio-excision.mjs',
      '--source', path.resolve(project, contract.audioExcision.source),
      '--candidate', video,
      '--remove', `${removeStart}:${removeEnd}`,
      '--min-correlation', String(contract.audioExcision.minimumDecodedPcmCorrelation),
      '--output', path.join(review, 'narration-exclusion-verification.json'),
    ], { allowFailure: true });
    check('excluded-spoken-claim-absent', excision.status === 0, (excision.stdout || excision.stderr || '').trim());
  }

  const audioGate = run('node', [
    'scripts/audio-release-gate.mjs', '--file', video, '--vtt', vtt,
    '--output', path.join(review, 'audio-gate.json'),
    '--summary', path.join(review, 'audio-gate.md'),
  ], { allowFailure: true });
  check('audio-release-gate', audioGate.status === 0, (audioGate.stdout || audioGate.stderr || '').trim());

  const visualReview = run('node', [
    'scripts/video-quality-reviewer.mjs',
    '--slug', contract.slug,
    '--video', video,
    '--vtt', vtt,
    '--poster', poster,
    '--report-dir', visualReportDir,
    '--min-score', '80',
  ], { allowFailure: true });
  check('fail-closed-visual-reviewer', visualReview.status === 0, (visualReview.stdout || visualReview.stderr || '').trim());

  await fs.rm(frameDir, { recursive: true, force: true });
  await fs.mkdir(frameDir, { recursive: true });
  const entries = reviewTimes(contract.scenes, duration);
  const records = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const index = String(i + 1).padStart(2, '0');
    const file = path.join(frameDir, `frame-${index}-${entry.time.toFixed(3)}s.jpg`);
    run('ffmpeg', ['-v', 'error', '-ss', entry.time.toFixed(6), '-i', video, '-frames:v', '1', '-q:v', '2', '-y', file]);
    records.push({
      index,
      time: Number(entry.time.toFixed(6)),
      kind: entry.kind,
      scene: entry.scene,
      file: path.relative(project, file),
      absoluteFile: file,
      sha256: await sha256(file),
    });
  }
  const sheet1 = path.join(review, 'contact-sheet-01-20.jpg');
  const sheet2 = path.join(review, 'contact-sheet-21-37.jpg');
  await makeSheet(records.slice(0, 20), sheet1);
  await makeSheet(records.slice(20), sheet2);
  check('review-frame-count', records.length === 37, `frames=${records.length}`);

  const manifest = {
    schemaVersion: 1,
    slug: contract.slug,
    candidate: {
      video: { path: path.relative(ROOT, video), bytes, sha256: await sha256(video) },
      captions: { path: path.relative(ROOT, vtt), sha256: await sha256(vtt) },
      poster: { path: path.relative(ROOT, poster), sha256: await sha256(poster) },
      posterCrop: { path: path.relative(ROOT, posterCrop), sha256: await sha256(posterCrop) },
    },
    frames: records.map(({ absoluteFile, ...record }) => record),
    contactSheets: [
      { path: path.relative(project, sheet1), sha256: await sha256(sheet1) },
      { path: path.relative(project, sheet2), sha256: await sha256(sheet2) },
    ],
  };
  await fs.writeFile(path.join(review, 'review-37-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const result = {
    schemaVersion: 1,
    slug: contract.slug,
    decision: errors.length ? 'fail' : 'pass',
    checks,
    errors,
    reviewManifest: path.relative(project, path.join(review, 'review-37-manifest.json')),
  };
  await fs.writeFile(path.join(review, 'candidate-review.json'), `${JSON.stringify(result, null, 2)}\n`);

  if (errors.length) {
    console.error(`Candidate review FAIL (${errors.length}):\n${errors.join('\n')}`);
    process.exit(1);
  }
  console.log(`Candidate review PASS: ${checks.length}/${checks.length} checks; 37 decoded frames`);
  console.log(`Evidence: ${path.relative(ROOT, path.join(review, 'candidate-review.json'))}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
