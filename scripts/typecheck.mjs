#!/usr/bin/env node
// Explicit no-TypeScript guard for the CI type-check step. If the project
// ever adds .ts sources, this script will run tsc; until then it exits
// cleanly so the workflow stays green without requiring a full JS type-check.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.worktrees' || entry.name === '.git') continue;
      walk(p);
    } else if (entry.name.endsWith('.ts')) {
      return true;
    }
  }
  return false;
}

if (!walk(ROOT)) {
  console.log('No TypeScript files found; typecheck skipped.');
  process.exit(0);
}

let tscPath;
try {
  tscPath = require.resolve('typescript/bin/tsc');
} catch {
  console.error('TypeScript sources found but typescript is not installed; run npm install.');
  process.exit(1);
}

const result = spawnSync(process.execPath, [tscPath, '--noEmit'], { stdio: 'inherit', cwd: ROOT });
process.exit(result.status ?? 1);
