#!/usr/bin/env node
// CI watcher + first-line failure analyst.
//
//   node scripts/dev/ci-watch.mjs                 # newest run on current branch
//   node scripts/dev/ci-watch.mjs --sha <sha>     # run for a specific commit
//   node scripts/dev/ci-watch.mjs --branch main   # another branch
//   node scripts/dev/ci-watch.mjs --once          # report current state, no waiting
//
// Polls the newest matching GitHub Actions run to completion, then prints a
// per-job breakdown with the exact failed steps, and (with GITHUB_TOKEN set)
// the tail of each failing job's log. Exit code mirrors the run conclusion,
// so this can gate local scripts: `npm run ci && npm run deploy-thing`.
import { execSync } from 'node:child_process';

const REPO = process.env.CI_REPO || 'alexwelcing/lupine-science';
const API = `https://api.github.com/repos/${REPO}`;
const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i > -1 ? argv[i + 1] : null; };
const ONCE = argv.includes('--once');
const SHA = flag('--sha');
const BRANCH = flag('--branch') || execSync('git branch --show-current').toString().trim();

const headers = { accept: 'application/vnd.github+json', 'user-agent': 'lupine-ci-watch' };
// 'proxy-injected' is a placeholder in proxied environments where real
// credentials are attached in transit — forwarding it would break auth
const TOKEN = process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'proxy-injected'
  ? process.env.GITHUB_TOKEN : null;
if (TOKEN) headers.authorization = `Bearer ${TOKEN}`;

// fetch first; fall back to curl (which honors HTTPS_PROXY everywhere and
// is allowlisted in restricted environments where raw fetch is not)
const curlGet = (url) => {
  const hdr = Object.entries(headers).map(([k, v]) => `-H "${k}: ${v}"`).join(' ');
  return JSON.parse(execSync(`curl -sfL ${hdr} "${url}"`, { maxBuffer: 16 * 1024 * 1024 }).toString());
};
const get = async (url) => {
  try {
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  } catch {
    return curlGet(url);
  }
};

async function newestRun() {
  const q = SHA ? `head_sha=${SHA}` : `branch=${encodeURIComponent(BRANCH)}`;
  const data = await get(`${API}/actions/runs?${q}&per_page=1`);
  return data.workflow_runs?.[0] || null;
}

async function report(run) {
  const jobs = (await get(`${API}/actions/runs/${run.id}/jobs?per_page=50`)).jobs || [];
  console.log(`\n━━ ${run.name} #${run.run_number} · ${run.head_sha.slice(0, 7)} · ${run.status}${run.conclusion ? ` → ${run.conclusion.toUpperCase()}` : ''}`);
  console.log(`   ${run.html_url}`);
  for (const j of jobs) {
    const mark = j.conclusion === 'success' ? '✓' : j.conclusion === 'skipped' ? '·' : j.status !== 'completed' ? '…' : '✗';
    console.log(` ${mark} ${j.name} (${j.conclusion || j.status})`);
    if (j.conclusion === 'failure') {
      for (const s of j.steps.filter((s) => s.conclusion === 'failure')) {
        console.log(`     failed step: "${s.name}"`);
      }
      if (TOKEN) {
        try {
          const hdr = Object.entries(headers).map(([k, v]) => `-H "${k}: ${v}"`).join(' ');
          const text = execSync(`curl -sfL ${hdr} "${API}/actions/jobs/${j.id}/logs"`, { maxBuffer: 64 * 1024 * 1024 }).toString();
          const tail = text.split('\n').filter((l) => !/^\s*$/.test(l)).slice(-30);
          console.log('     ── log tail ──');
          for (const l of tail) console.log(`     ${l.slice(0, 200)}`);
        } catch { /* logs need auth; the step names above still localize it */ }
      } else {
        console.log('     (set GITHUB_TOKEN for automatic log tails)');
      }
    }
  }
  return run.conclusion;
}

let run = await newestRun();
if (!run) { console.error(`no workflow runs found for ${SHA || BRANCH}`); process.exit(2); }

if (!ONCE) {
  process.stdout.write(`watching run #${run.run_number} (${run.head_sha.slice(0, 7)}) `);
  while (run.status !== 'completed') {
    await new Promise((r) => setTimeout(r, 20000));
    process.stdout.write('.');
    run = await get(`${API}/actions/runs/${run.id}`);
  }
  console.log('');
}

const conclusion = await report(run);
process.exit(conclusion === 'success' ? 0 : conclusion ? 1 : 0);
