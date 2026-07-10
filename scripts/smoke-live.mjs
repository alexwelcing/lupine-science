#!/usr/bin/env node
/**
 * Live-site smoke test for https://lupine.science/
 *
 * Fetches a set of production URLs and checks that each returns HTTP 200
 * and contains expected text. Retries a few times to tolerate propagation
 * lag after a Cloudflare Pages deploy.
 *
 * Exit code 0 if all checks pass, 1 otherwise.
 */

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://lupine.science';
const ATTEMPTS = Math.max(1, parseInt(process.env.SMOKE_ATTEMPTS || '5', 10));
const DELAY_MS = Math.max(0, parseInt(process.env.SMOKE_DELAY_MS || '10000', 10));

const checks = [
  {
    url: `${BASE_URL}/`,
    expected: 'Evidence before claim',
    description: 'homepage shows creed'
  },
  {
    url: `${BASE_URL}/articles/`,
    expected: 'Research notes, prospectuses, and formalization roadmaps',
    description: 'articles index shows heading'
  },
  {
    url: `${BASE_URL}/brand-assets/`,
    expected: 'Brand Assets',
    description: 'brand assets page shows site brand'
  },
  {
    url: `${BASE_URL}/articles/the-02-percent-synthesis-problem/`,
    expected: 'The 0.2% Synthesis Problem',
    description: '0.2% synthesis article shows title'
  },
  {
    url: `${BASE_URL}/articles/a-field-not-a-neural-net/`,
    expected: 'A Field, Not a Neural Net',
    description: 'field article shows title'
  },
  {
    url: `${BASE_URL}/articles/five-materials-for-5-to-12-gtco2-year/`,
    expected: 'Five Materials That Could Unlock 5–12 GtCO₂/Year',
    description: 'five materials article shows title'
  },
  {
    url: `${BASE_URL}/articles/from-predicted-crystal-to-commercial-cell/`,
    expected: 'From Predicted Crystal to Commercial Cell',
    description: 'crystal-to-cell article shows title'
  },
  {
    url: `${BASE_URL}/articles/investing-in-the-trust-layer/`,
    expected: 'Investing in the Trust Layer',
    description: 'trust layer article shows title'
  },
  {
    url: `${BASE_URL}/articles/beyond-carbon-the-error-geometry-of-environmental-materials/`,
    expected: 'Beyond Carbon',
    description: 'environmental expansion intro article shows title'
  },
  {
    url: `${BASE_URL}/articles/water-and-air-correcting-the-molecules-we-drink-and-breathe/`,
    expected: 'Water and Air',
    description: 'water and air article shows title'
  },
  {
    url: `${BASE_URL}/articles/methane-and-refrigerants-cutting-the-non-co2-climate-forcers/`,
    expected: 'Methane and Refrigerants',
    description: 'methane and refrigerants article shows title'
  },
  {
    url: `${BASE_URL}/articles/critical-minerals-pfas-and-the-remediation-imperative/`,
    expected: 'Critical Minerals, PFAS',
    description: 'critical minerals and PFAS article shows title'
  },
  {
    url: `${BASE_URL}/articles/cement-concrete-and-the-weight-of-the-built-world/`,
    expected: 'Cement, Concrete',
    description: 'cement article shows title'
  },
  {
    url: `${BASE_URL}/articles/from-predicted-crystal-to-commercial-cell/`,
    expected: 'From Predicted Crystal to Commercial Cell',
    description: 'predicted-crystal article shows title'
  },
  {
    url: `${BASE_URL}/articles/investing-in-the-trust-layer/`,
    expected: 'Investing in the Trust Layer',
    description: 'trust-layer investment article shows title'
  },
  {
    url: `${BASE_URL}/videos/`,
    expected: 'Article videos',
    description: 'videos index page shows heading'
  },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, expected) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/html' },
        redirect: 'follow'
      });

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
        if (attempt < ATTEMPTS) await sleep(DELAY_MS);
        continue;
      }

      const body = await response.text();
      if (!body.includes(expected)) {
        lastError = new Error(`expected text not found: ${expected}`);
        if (attempt < ATTEMPTS) await sleep(DELAY_MS);
        continue;
      }

      return { ok: true };
    } catch (err) {
      lastError = err;
      if (attempt < ATTEMPTS) await sleep(DELAY_MS);
    }
  }

  return { ok: false, error: lastError };
}

async function main() {
  console.log(`Smoke-testing ${BASE_URL} (${ATTEMPTS} attempt(s), ${DELAY_MS}ms delay)`);

  const failures = [];
  for (const check of checks) {
    process.stdout.write(`${check.url} ... `);
    const result = await fetchWithRetry(check.url, check.expected);
    if (result.ok) {
      console.log('ok');
    } else {
      console.log(`FAIL: ${result.error.message}`);
      failures.push({ ...check, error: result.error.message });
    }
  }

  console.log('');
  if (failures.length === 0) {
    console.log(`All ${checks.length} checks passed.`);
    process.exit(0);
  }

  console.error(`Smoke test failed: ${failures.length}/${checks.length} URL(s) did not pass.`);
  for (const f of failures) {
    console.error(`  - ${f.url}`);
    console.error(`    ${f.description}: ${f.error}`);
  }
  process.exit(1);
}

main().catch(err => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
