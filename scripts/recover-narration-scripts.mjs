#!/usr/bin/env node
// Recover the intended narration scripts for the article films from git history.
//
// Provenance
// ──────────
// The narration scripts were the cue payloads of public/videos/<slug>.vtt as
// those files stood at commit 4641d96. After that commit,
// scripts/generate-motion-vtt.mjs overwrote every one of those VTTs with
// scene-TITLE placeholders (35-74 words for a whole film), destroying the
// prose in the working tree. The scripts survive only in git history, so
// 4641d96 is the source of truth and this script is how they come back.
//
// This is also why the publisher can no longer read its script out of
// public/videos/<slug>.vtt: that file is an OUTPUT of the pipeline, and using
// it as the INPUT let a caption-generation step silently eat the script. The
// recovered text lands in data/narration-scripts/<slug>.json, which nothing
// downstream writes to.
//
// Usage:
//   node scripts/recover-narration-scripts.mjs            # all films with source wavs
//   node scripts/recover-narration-scripts.mjs --slug a-field-not-a-neural-net
//   node scripts/recover-narration-scripts.mjs --check    # verify, write nothing

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_DIR = path.join(ROOT, 'data', 'narration-scripts');
const VOICE_DIR = path.join(ROOT, 'media', 'projects', 'voice-tracks');

export const SCRIPT_SOURCE_COMMIT = '4641d96';

/** Parse a VTT into cue payloads (the narration paragraphs). */
export function parseVttCues(text) {
  const lines = String(text).split(/\r?\n/);
  const cues = [];
  let i = 0;
  if (lines[i]?.trim().toLowerCase() === 'webvtt') i++;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || /^NOTE|^\d+$/.test(line)) { i++; continue; }
    if (/^(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})/.test(line)) {
      i++;
      let payload = '';
      while (i < lines.length && lines[i].trim() !== '') {
        payload += (payload ? ' ' : '') + lines[i].trim();
        i++;
      }
      if (payload) cues.push(payload);
      continue;
    }
    i++;
  }
  return cues;
}

/**
 * The films in scope.
 *
 * Already-recovered scripts come first, because `media/projects/voice-tracks/` is
 * gitignored: on a fresh clone the original `<slug>-voice-dan.wav` files do not
 * exist, and enumerating only from them would make `--check` silently report
 * nothing to verify. The wav listing remains the discovery path for the initial
 * recovery, when data/narration-scripts/ is still empty.
 */
export function affectedSlugs() {
  const recovered = fs.existsSync(SCRIPT_DIR)
    ? fs.readdirSync(SCRIPT_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
    : [];
  if (recovered.length > 0) return recovered.sort();

  if (!fs.existsSync(VOICE_DIR)) return [];
  return fs.readdirSync(VOICE_DIR)
    .filter((f) => f.endsWith('-voice-dan.wav'))
    .map((f) => f.replace(/-voice-dan\.wav$/, ''))
    .sort();
}

/**
 * Assert the provenance commit is present, with an actionable message if not.
 *
 * A shallow clone (CI's default) does not contain it, and this must not degrade
 * into a skip: the whole value of the check is that nobody can quietly redefine
 * "the intended script". Fail, and say how to get the commit.
 */
function requireSourceCommit() {
  const present = spawnSync('git', ['cat-file', '-e', `${SCRIPT_SOURCE_COMMIT}^{commit}`], { cwd: ROOT });
  if (present.status === 0) return;
  throw new Error(
    `Commit ${SCRIPT_SOURCE_COMMIT} is not in this clone, so narration-script provenance cannot be `
    + `verified. This is a shallow clone; fetch the one commit with:\n`
    + `  git fetch --depth=1 origin ${SCRIPT_SOURCE_COMMIT}\n`
    + `Do not skip this check — it is what stops the recovered scripts drifting from their source.`,
  );
}

function gitShow(ref) {
  const r = spawnSync('git', ['show', ref], { encoding: 'utf8', cwd: ROOT });
  if (r.status !== 0) throw new Error(`git show ${ref} failed: ${r.stderr}`);
  return r.stdout;
}

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

function main() {
  const argv = process.argv.slice(2);
  const slugIdx = argv.indexOf('--slug');
  const check = argv.includes('--check');
  const slugs = slugIdx >= 0 ? [argv[slugIdx + 1]] : affectedSlugs();

  if (slugs.length === 0) {
    console.error(
      'No films in scope: data/narration-scripts/ is empty and no '
      + 'media/projects/voice-tracks/<slug>-voice-dan.wav sources were found.',
    );
    process.exit(1);
  }

  requireSourceCommit();
  fs.mkdirSync(SCRIPT_DIR, { recursive: true });
  let failed = 0;

  for (const slug of slugs) {
    const cues = parseVttCues(gitShow(`${SCRIPT_SOURCE_COMMIT}:public/videos/${slug}.vtt`));
    const total = cues.reduce((n, c) => n + words(c), 0);

    // A recovered "script" of scene titles is not a script. The placeholder VTTs
    // carry 35-74 words per film across ~7 cues; the real prose carries 250-450
    // words. Refuse anything that looks like the placeholder rather than
    // narrating headlines at 40 wpm.
    if (cues.length === 0 || total < 120) {
      console.error(`[${slug}] REFUSED: ${cues.length} cues / ${total} words at ${SCRIPT_SOURCE_COMMIT} — that is scene-title placeholder, not a narration script.`);
      failed++;
      continue;
    }

    const payload = {
      slug,
      source: `public/videos/${slug}.vtt at commit ${SCRIPT_SOURCE_COMMIT} (pre-overwrite narration prose)`,
      recoveredAt: new Date().toISOString().slice(0, 10),
      words: total,
      chars: cues.join(' ').length,
      paragraphs: cues,
    };
    const outPath = path.join(SCRIPT_DIR, `${slug}.json`);
    const next = JSON.stringify(payload, null, 2) + '\n';

    if (check) {
      if (!fs.existsSync(outPath)) {
        console.error(`[${slug}] MISSING ${path.relative(ROOT, outPath)}`);
        failed++;
        continue;
      }
      const have = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      const same = JSON.stringify(have.paragraphs) === JSON.stringify(cues);
      console.log(`[${slug}] ${same ? 'OK' : 'DRIFTED'} ${total} words / ${cues.length} paragraphs`);
      if (!same) failed++;
      continue;
    }

    fs.writeFileSync(outPath, next);
    console.log(`[${slug}] wrote ${path.relative(ROOT, outPath)} — ${total} words, ${cues.length} paragraphs, ${payload.chars} chars`);
  }

  if (failed) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
