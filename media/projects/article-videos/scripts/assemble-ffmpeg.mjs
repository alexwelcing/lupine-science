#!/usr/bin/env node
/**
 * ffmpeg-based assembler for FAL-generated article video assets.
 *
 * Reads an episode manifest, stitches the generated scene images to the TTS
 * narration, adds a simple cross-fade, and outputs a web-ready 1080p MP4 plus
 * a poster frame and a scene-level WebVTT caption file.
 *
 * Usage:
 *   node scripts/assemble-ffmpeg.mjs --manifest <slug>/manifest.yaml
 *   node scripts/assemble-ffmpeg.mjs --manifest <slug>/manifest.yaml --with-captions
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

function log(...args) {
  console.log('[assemble]', ...args);
}

function fail(message) {
  console.error('[assemble] ERROR:', message);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => {
      if (code !== 0) reject(new Error(`${cmd} exited ${code}: ${err || out}`));
      else resolve({ stdout: out, stderr: err });
    });
  });
}

async function getAudioDuration(path) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ]);
  const dur = parseFloat(stdout.trim());
  if (!Number.isFinite(dur) || dur <= 0) throw new Error(`invalid audio duration: ${stdout}`);
  return dur;
}

function fmtTime(t) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`;
}

async function main() {
  const args = process.argv.slice(2);
  const manifestIdx = args.indexOf('--manifest');
  if (manifestIdx === -1 || !args[manifestIdx + 1]) {
    console.error('Usage: node scripts/assemble-ffmpeg.mjs --manifest <slug>/manifest.yaml [--with-captions]');
    process.exit(1);
  }
  const manifestPath = resolve(args[manifestIdx + 1]);
  const withCaptions = args.includes('--with-captions');
  const slug = dirname(manifestPath).split('/').pop();

  const manifest = yaml.load(await readFile(manifestPath, 'utf8'));
  const episodeDir = dirname(manifestPath);
  const assetsDir = join(episodeDir, 'assets');
  const audioSlug = manifest.slug || slug;
  const audioPath = join(assetsDir, 'audio', `${audioSlug}-narration.mp3`);
  const rendersDir = join(episodeDir, 'renders');
  await mkdir(rendersDir, { recursive: true });

  const outputPath = join(rendersDir, `${slug}-web-1080p.mp4`);
  const posterPath = join(rendersDir, `${slug}-poster.jpg`);
  const vttPath = join(rendersDir, `${slug}.vtt`);

  // Build ffmpeg filter graph for cross-faded image sequence
  const scenes = manifest.scenes;
  const totalDuration = scenes[scenes.length - 1].start + scenes[scenes.length - 1].duration;

  // Create concat demuxer input
  const concatLines = [];
  for (const scene of scenes) {
    const img = join(assetsDir, 'images', `${scene.id}.png`);
    concatLines.push(`file '${img}'`);
    concatLines.push(`duration ${scene.duration.toFixed(3)}`);
  }
  // ffmpeg concat demuxer requires a final file entry
  const lastImg = join(assetsDir, 'images', `${scenes[scenes.length - 1].id}.png`);
  concatLines.push(`file '${lastImg}'`);
  const concatPath = join(rendersDir, `${slug}-concat.txt`);
  await writeFile(concatPath, concatLines.join('\n'));

  // Cross-fade every scene transition (except last)
  const fades = [];
  let cumulative = 0;
  for (let i = 0; i < scenes.length - 1; i++) {
    const dur = scenes[i].duration;
    cumulative += dur;
    const fadeDur = Math.min(0.5, dur * 0.15);
    fades.push(`fade=t=out:st=${(cumulative - fadeDur).toFixed(3)}:d=${fadeDur.toFixed(3)}:alpha=1`);
  }
  const vf = [
    'format=yuv420p',
    'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
    ...fades,
    'fps=30',
  ].join(',');

  const audioDuration = await getAudioDuration(audioPath);
  log(`assembling ${slug} (${scenes.length} scenes, ${totalDuration.toFixed(1)}s planned, ${audioDuration.toFixed(1)}s audio)`);

  await run('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatPath,
    '-i', audioPath,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-r', '30',
    '-vf', vf,
    '-shortest',
    '-t', String(audioDuration),
    outputPath,
  ]);

  // Extract poster at 25% through
  await run('ffmpeg', [
    '-y',
    '-i', outputPath,
    '-ss', `${(totalDuration * 0.25).toFixed(3)}`,
    '-vframes', '1',
    '-q:v', '2',
    '-update', '1',
    posterPath,
  ]);

  // Scene-level captions
  if (withCaptions) {
    const cues = ['WEBVTT', ''];
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      const start = s.start;
      const end = i < scenes.length - 1 ? scenes[i + 1].start : totalDuration;
      cues.push(String(i + 1));
      cues.push(`${fmtTime(start)} --> ${fmtTime(end)}`);
      cues.push(s.narration);
      cues.push('');
    }
    await writeFile(vttPath, cues.join('\n'));
    log('wrote captions', vttPath);
  }

  log('rendered', outputPath);
  log('poster', posterPath);
}

main().catch(fail);
