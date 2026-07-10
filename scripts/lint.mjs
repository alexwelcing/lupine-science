#!/usr/bin/env node
// Lightweight project linter. Runs syntax checks and style guards on all
// hand-written JavaScript/MJS source without adding new dependencies.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function addError(file, message) {
  errors.push(`${path.relative(ROOT, file)}: ${message}`);
}

function* walk(dir, extensions) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.worktrees' || entry.name === '.git') continue;
      yield* walk(p, extensions);
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      yield p;
    }
  }
}

function lintFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/[ \t]+$/.test(lines[i])) {
      addError(file, `trailing whitespace on line ${i + 1}`);
    }
    if (/\t/.test(lines[i])) {
      addError(file, `tab character on line ${i + 1} (use two spaces)`);
    }
  }

  const { status, stderr } = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (status !== 0) {
    addError(file, `syntax check failed\n${stderr.trim()}`);
  }
}

for (const dir of ['scripts', 'tests']) {
  for (const file of walk(path.join(ROOT, dir), ['.mjs', '.js', '.cjs'])) {
    lintFile(file);
  }
}

if (errors.length) {
  console.error('lint failed:');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log('lint passed.');
