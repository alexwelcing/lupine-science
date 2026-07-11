#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

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

export function resolveBaseUrls(env = process.env) {
  const bases = [];
  if (env.SMOKE_PREVIEW_BASE_URL) bases.push(env.SMOKE_PREVIEW_BASE_URL.replace(/\/$/, ''));
  if (env.SMOKE_PRODUCTION_BASE_URL) bases.push(env.SMOKE_PRODUCTION_BASE_URL.replace(/\/$/, ''));
  if (bases.length === 0 && env.SMOKE_BASE_URL) bases.push(env.SMOKE_BASE_URL.replace(/\/$/, ''));
  return [...new Set(bases)];
}

function metadataValue(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const propertyFirst = new RegExp(`<meta\\s+[^>]*property=["']${escaped}["'][^>]*content=["']([^"']+)["']`, 'i');
  const contentFirst = new RegExp(`<meta\\s+[^>]*content=["']([^"']+)["'][^>]*property=["']${escaped}["']`, 'i');
  return (html.match(propertyFirst) || html.match(contentFirst))?.[1]?.trim() || '';
}

function linkValue(html, rel) {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const relFirst = new RegExp(`<link\\s+[^>]*rel=["']${escaped}["'][^>]*href=["']([^"']+)["']`, 'i');
  const hrefFirst = new RegExp(`<link\\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']${escaped}["']`, 'i');
  return (html.match(relFirst) || html.match(hrefFirst))?.[1]?.trim() || '';
}

function extractLinkedResources(baseUrl, html, metadata) {
  const resources = [
    { value: metadata.canonical, kind: 'canonical URL' },
    { value: metadata.ogUrl, kind: 'og:url' },
    { value: metadata.ogImage, kind: 'og:image' }
  ];
  const patterns = [
    { regex: /<source\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, kind: 'video link', extensions: /\.(mp4|webm|mov|mkv)(?:[?#]|$)/i },
    { regex: /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, kind: 'image' },
    { regex: /<img\b[^>]*\bposter=["']([^"']+)["'][^>]*>/gi, kind: 'image' },
    { regex: /<source\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/gi, kind: 'image', splitSrcset: true },
    { regex: /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*\bdownload(?:\s|=|>|$)/gi, kind: 'download link' },
    { regex: /<a\b[^>]*\bhref=["']([^"']+\.(?:mp4|webm|mov|mkv|pdf|zip|gz|tar|docx?|xlsx?|pptx?|epub)(?:[?#][^"']*)?)["'][^>]*>/gi, kind: 'linked file' }
  ];

  for (const { regex, kind, extensions, splitSrcset } of patterns) {
    for (const match of html.matchAll(regex)) {
      const raw = match[1];
      const candidates = splitSrcset
        ? raw.split(',').map(part => part.trim().split(/\s+/)[0]).filter(Boolean)
        : [raw];
      for (const value of candidates) {
        if (!extensions || extensions.test(value)) resources.push({ value, kind });
      }
    }
  }

  return resources
    .filter(resource => resource.value && !/^(?:data:|mailto:|#)/i.test(resource.value))
    .map(resource => ({ ...resource, url: new URL(resource.value, baseUrl).toString() }));
}

async function checkUrl(url, { attempts, delayMs, timeoutMs, accept = '*/*' }) {
  let lastResult = { ok: false, status: 0, error: 'unknown error' };
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      let response = await fetch(url, {
        method: 'HEAD',
        headers: { Accept: accept },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (response.status === 405 || response.status === 501) {
        response = await fetch(url, {
          method: 'GET',
          headers: { Accept: accept, Range: 'bytes=0-0' },
          redirect: 'follow',
          signal: AbortSignal.timeout(timeoutMs)
        });
      }
      lastResult = { ok: response.ok, status: response.status, statusText: response.statusText };
    } catch (error) {
      lastResult = { ok: false, status: 0, error: error.message };
    }
    if (lastResult.ok || attempt === attempts) return lastResult;
    await sleep(delayMs);
  }
  return lastResult;
}

function failureDetail(result) {
  return result.status ? `HTTP ${result.status}${result.statusText ? ` ${result.statusText}` : ''}` : result.error || 'unreachable';
}

export async function runSmokeSuite({ baseUrl, paths, attempts = 1, delayMs = 0, timeoutMs = 10_000 }) {
  const absolute = new URL(baseUrl).toString().replace(/\/$/, '');
  const failures = [];
  const assetsChecked = new Set();

  for (const pagePath of paths) {
    const url = new URL(pagePath, `${absolute}/`).toString();
    const pageResult = await checkUrl(url, { attempts, delayMs, timeoutMs, accept: 'text/html' });
    if (!pageResult.ok) {
      failures.push({ url, message: `page unreachable: ${failureDetail(pageResult)}` });
      continue;
    }

    let html;
    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/html' },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs)
      });
      html = await response.text();
    } catch (error) {
      failures.push({ url, message: `page body unreadable: ${error.message}` });
      continue;
    }

    const metadata = {
      title: html.match(/<title\b[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '',
      ogTitle: metadataValue(html, 'og:title'),
      ogDescription: metadataValue(html, 'og:description'),
      ogType: metadataValue(html, 'og:type'),
      ogUrl: metadataValue(html, 'og:url'),
      ogImage: metadataValue(html, 'og:image'),
      canonical: linkValue(html, 'canonical')
    };

    if (!metadata.title) failures.push({ url, message: 'missing <title>' });
    if (!metadata.ogTitle) failures.push({ url, message: 'missing og:title' });
    if (!metadata.ogDescription) failures.push({ url, message: 'missing og:description' });
    if (!metadata.ogType) failures.push({ url, message: 'missing og:type' });
    if (!metadata.ogUrl) failures.push({ url, message: 'missing og:url' });
    if (!metadata.ogImage) failures.push({ url, message: 'missing og:image' });
    if (!metadata.canonical) failures.push({ url, message: 'missing canonical link' });

    const resources = extractLinkedResources(absolute, html, metadata);
    for (const resource of resources) {
      assetsChecked.add(resource.url);
      const result = await checkUrl(resource.url, { attempts, delayMs, timeoutMs });
      if (!result.ok) {
        let kind = resource.kind;
        if (kind === 'linked file') {
          kind = /\.(?:mp4|webm|mov|mkv)(?:[?#]|$)/i.test(resource.url) ? 'video link' : 'download link';
        }
        failures.push({
          url: resource.url,
          message: `${kind} broken: ${failureDetail(result)} (${resource.url})`
        });
      }
    }
  }

  return { failures, pagesChecked: paths.length, assetsChecked: [...assetsChecked] };
}

async function main() {
  const targets = resolveBaseUrls(process.env);
  if (targets.length === 0) targets.push(BASE_URL.replace(/\/$/, ''));
  const paths = [...new Set(checks.map(check => new URL(check.url).pathname))];
  const allFailures = [];

  for (const baseUrl of targets) {
    console.log(`Smoke-testing ${baseUrl} (${ATTEMPTS} attempt(s), ${DELAY_MS}ms delay)`);
    const result = await runSmokeSuite({
      baseUrl,
      paths,
      attempts: ATTEMPTS,
      delayMs: DELAY_MS,
      timeoutMs: Math.max(1, parseInt(process.env.SMOKE_TIMEOUT_MS || '10000', 10))
    });
    if (result.failures.length === 0) {
      console.log(`  PASS: ${result.pagesChecked} pages and ${result.assetsChecked.length} linked resources`);
      continue;
    }

    allFailures.push(...result.failures.map(failure => ({ ...failure, baseUrl })));
    console.error(`  FAIL: ${result.failures.length} problem(s) across ${result.pagesChecked} pages`);
    for (const failure of result.failures) {
      console.error(`    - ${failure.url}`);
      console.error(`      ${failure.message}`);
    }
  }

  if (allFailures.length > 0) {
    console.error(`Smoke test failed with ${allFailures.length} actionable problem(s) across ${targets.length} target(s).`);
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
