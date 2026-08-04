#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  resolveBaseUrls as resolveConfiguredBaseUrls,
  runSmokeSuite as runCoverageSuite,
  writeSmokeReport,
} from './lib/live-smoke-suite.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTATIONS_PATH = process.env.SMOKE_EXPECTATIONS_PATH
  ? path.resolve(process.env.SMOKE_EXPECTATIONS_PATH)
  : path.join(ROOT, 'tests', 'fixtures', 'live-smoke-expectations.json');

/**
 * Live-site smoke test for https://lupine.science/
 *
 * Fetches key pages, validates share metadata, and resolves canonical,
 * Open Graph image, video, and download URLs. Retries tolerate propagation
 * lag after a Cloudflare Pages deploy. Preview and production targets can
 * be checked independently or together through environment variables.
 *
 * Exit code 0 if all checks pass, 1 otherwise.
 */

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://lupine.science';
const ATTEMPTS = Math.max(1, parseInt(process.env.SMOKE_ATTEMPTS || '5', 10));
const DELAY_MS = Math.max(0, parseInt(process.env.SMOKE_DELAY_MS || '10000', 10));

export function resolveBaseUrls(env = process.env) {
  return resolveConfiguredBaseUrls(env);
}

export async function runSmokeSuite(options) {
  return runCoverageSuite(options);
}

async function main() {
  const targets = resolveBaseUrls(process.env);
  if (targets.length === 0) targets.push(BASE_URL.replace(/\/$/, ''));
  const expectations = JSON.parse(fs.readFileSync(EXPECTATIONS_PATH, 'utf8'));
  const results = [];

  for (const baseUrl of targets) {
    console.log(`Smoke-testing ${baseUrl} (${ATTEMPTS} attempt(s), ${DELAY_MS}ms delay)`);
    const result = await runSmokeSuite({
      baseUrl,
      expectations,
      attempts: ATTEMPTS,
      delayMs: DELAY_MS,
      timeoutMs: Math.max(1, parseInt(process.env.SMOKE_TIMEOUT_MS || '10000', 10))
    });
    results.push(result);
    if (result.failures.length === 0) {
      console.log(`  PASS: ${result.pagesChecked} pages, ${result.assetsChecked.length} media assets, ${result.summary.total} checks`);
      continue;
    }

    console.error(`  FAIL (${result.outcome}): ${result.failures.length} of ${result.summary.total} checks failed`);
    for (const failure of result.failures) {
      console.error(`    - [${failure.classification}] ${failure.checkId}`);
      console.error(`      ${failure.message} (${failure.url})`);
    }
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    expectationsPath: path.relative(ROOT, EXPECTATIONS_PATH),
    outcome: results.some(result => result.outcome === 'infrastructure_failure')
      ? 'infrastructure_failure'
      : results.some(result => result.outcome === 'content_failure') ? 'content_failure' : 'pass',
    targets: results,
  };
  const reportPath = path.resolve(process.env.SMOKE_REPORT_PATH || path.join(ROOT, 'artifacts', 'live-smoke-report.json'));
  writeSmokeReport(reportPath, report);
  console.log(`Machine-readable report: ${reportPath}`);

  if (report.outcome !== 'pass') {
    const failed = results.reduce((sum, result) => sum + result.summary.failed, 0);
    console.error(`Smoke test failed with ${failed} targeted problem(s) across ${targets.length} target(s).`);
    process.exitCode = 1;
    return;
  }

  console.log(`All live smoke checks passed across ${targets.length} target(s).`);
}

const isMainModule = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMainModule) {
  main().catch(err => {
    console.error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}
