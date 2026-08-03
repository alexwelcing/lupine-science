import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const MEDIA_TYPES = {
  audio: 'audio/',
  image: 'image/',
  video: 'video/',
  pdf: 'application/pdf',
};

const normalize = (value) => value.replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#(?:39|x27);/gi, "'")
  .replace(/\s+/g, ' ')
  .trim();

const tagValue = (html, attribute, name, valueAttribute = 'content') => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const first = new RegExp(`<[^>]+\\b${attribute}=["']${escaped}["'][^>]+\\b${valueAttribute}=["']([^"']+)["'][^>]*>`, 'i');
  const second = new RegExp(`<[^>]+\\b${valueAttribute}=["']([^"']+)["'][^>]+\\b${attribute}=["']${escaped}["'][^>]*>`, 'i');
  return (html.match(first) || html.match(second))?.[1]?.trim() || '';
};

const classifyFailure = (status, error) => {
  if (error || status === 0 || status === 408 || status === 429 || status >= 500) return 'infrastructure';
  return 'content';
};

const summaryFor = (checks) => {
  const summary = { total: checks.length, passed: 0, failed: 0, infrastructureFailures: 0, contentFailures: 0 };
  for (const check of checks) {
    if (check.status === 'pass') summary.passed += 1;
    else {
      summary.failed += 1;
      if (check.classification === 'infrastructure') summary.infrastructureFailures += 1;
      else summary.contentFailures += 1;
    }
  }
  return summary;
};

function addCheck(checks, { id, category, target, url, ok, expected, actual, message, classification = 'content' }) {
  checks.push({
    id,
    category,
    target,
    url,
    status: ok ? 'pass' : 'fail',
    classification: ok ? null : classification,
    expected,
    actual,
    message: ok ? null : message,
  });
}

async function fetchWithRetry(url, { attempts, delayMs, timeoutMs, headers = {}, read = 'text' }) {
  let last = { ok: false, status: 0, error: 'request did not run', bytes: 0, contentType: '' };
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
      });
      const contentType = response.headers.get('content-type') || '';
      const contentLength = Number(response.headers.get('content-length') || 0);
      let body;
      let bytes = 0;
      if (read === 'buffer') {
        body = Buffer.from(await response.arrayBuffer());
        bytes = body.length;
      } else if (read === 'sample') {
        const reader = response.body?.getReader();
        const chunk = reader ? await reader.read() : { value: null };
        bytes = chunk.value?.byteLength || 0;
        await reader?.cancel();
      } else {
        body = await response.text();
        bytes = Buffer.byteLength(body);
      }
      last = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        contentType,
        contentLength,
        bytes,
        body,
        finalUrl: response.url,
      };
    } catch (error) {
      last = { ok: false, status: 0, error: error.message, bytes: 0, contentType: '' };
    }
    if (last.ok || attempt === attempts) return last;
    if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return last;
}

function extractResources(pageUrl, html) {
  const found = [];
  const push = (raw, kind) => {
    if (!raw || /^(?:data:|mailto:|javascript:|#)/i.test(raw)) return;
    try {
      found.push({ kind, url: new URL(raw, pageUrl).toString() });
    } catch {
      found.push({ kind, url: raw, invalid: true });
    }
  };
  const patterns = [
    [/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, 'image'],
    [/<video\b[^>]*\bposter=["']([^"']+)["'][^>]*>/gi, 'image'],
    [/<(?:video|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, 'source'],
    [/<audio\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, 'audio'],
    [/<a\b[^>]*\bhref=["']([^"']+\.(?:mp4|webm|mov|mkv|mp3|wav|ogg|m4a|flac|pdf)(?:[?#][^"']*)?)["'][^>]*>/gi, 'linked'],
  ];
  for (const [regex, initialKind] of patterns) {
    for (const match of html.matchAll(regex)) {
      let kind = initialKind;
      if (kind === 'source' || kind === 'linked') {
        if (/\.(?:mp4|webm|mov|mkv)(?:[?#]|$)/i.test(match[1])) kind = 'video';
        else if (/\.(?:mp3|wav|ogg|m4a|flac)(?:[?#]|$)/i.test(match[1])) kind = 'audio';
        else if (/\.pdf(?:[?#]|$)/i.test(match[1])) kind = 'pdf';
        else if (kind === 'source') continue;
      }
      push(match[1], kind);
    }
  }
  for (const match of html.matchAll(/<(?:img|source)\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/gi)) {
    for (const part of match[1].split(',')) push(part.trim().split(/\s+/)[0], 'image');
  }
  return found;
}

function expectedAssetType(kind) {
  return MEDIA_TYPES[kind] || '';
}

function validateMetadata(checks, { html, pageUrl, route, canonicalOrigin, target }) {
  const title = normalize(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const values = {
    title,
    description: tagValue(html, 'name', 'description'),
    ogTitle: tagValue(html, 'property', 'og:title'),
    ogDescription: tagValue(html, 'property', 'og:description'),
    ogType: tagValue(html, 'property', 'og:type'),
    ogUrl: tagValue(html, 'property', 'og:url'),
    ogImage: tagValue(html, 'property', 'og:image'),
    canonical: tagValue(html, 'rel', 'canonical', 'href'),
  };
  const expectedCanonical = new URL(route.path, `${canonicalOrigin}/`).toString();
  const required = [
    ['title', 'non-empty <title>'],
    ['description', 'non-empty description'],
    ['ogTitle', 'non-empty og:title'],
    ['ogDescription', 'non-empty og:description'],
    ['ogType', 'non-empty og:type'],
    ['ogUrl', expectedCanonical],
    ['ogImage', 'absolute HTTP(S) image URL'],
    ['canonical', expectedCanonical],
  ];
  for (const [name, expected] of required) {
    let ok = Boolean(values[name]);
    if (name === 'ogUrl' || name === 'canonical') ok = values[name] === expectedCanonical;
    if (name === 'ogImage') ok = /^https?:\/\//.test(values[name]);
    addCheck(checks, {
      id: `meta:${route.path}:${name}`,
      category: 'metadata', target, url: pageUrl, ok, expected,
      actual: values[name] || null,
      message: `${name} is missing or incorrect`,
    });
  }
  addCheck(checks, {
    id: `meta:${route.path}:title-consistency`, category: 'metadata', target, url: pageUrl,
    ok: Boolean(title && values.ogTitle && (values.ogTitle === title || values.ogTitle.startsWith(`${title} —`))),
    expected: title, actual: values.ogTitle || null,
    message: 'og:title does not match the page title',
  });
  return values;
}

function extractPdfText(bytes) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-live-smoke-'));
  const pdfPath = path.join(directory, 'document.pdf');
  try {
    fs.writeFileSync(pdfPath, bytes);
    const result = spawnSync('pdftotext', ['-layout', pdfPath, '-'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.error?.code === 'ENOENT') return { error: 'pdftotext is not installed' };
    if (result.status !== 0) return { error: result.stderr.trim() || `pdftotext exited ${result.status}` };
    return { text: normalize(result.stdout) };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

export function resolveBaseUrls(env = process.env) {
  const bases = [];
  if (env.SMOKE_PREVIEW_BASE_URL) bases.push(env.SMOKE_PREVIEW_BASE_URL.replace(/\/$/, ''));
  if (env.SMOKE_PRODUCTION_BASE_URL) bases.push(env.SMOKE_PRODUCTION_BASE_URL.replace(/\/$/, ''));
  if (!bases.length && env.SMOKE_BASE_URL) bases.push(env.SMOKE_BASE_URL.replace(/\/$/, ''));
  return [...new Set(bases)];
}

export async function runSmokeSuite({
  baseUrl,
  expectations,
  paths,
  attempts = 1,
  delayMs = 0,
  timeoutMs = 10_000,
}) {
  const target = new URL(baseUrl).toString().replace(/\/$/, '');
  const routes = expectations?.routes || (paths || []).map(routePath => ({ path: routePath, marker: '' }));
  const canonicalOrigin = expectations?.canonicalOrigin || target;
  const pdfs = expectations?.pdfs || [];
  const checks = [];
  const assets = new Map();

  if (expectations) {
    const sitemapUrl = new URL('/sitemap.xml', `${target}/`).toString();
    const sitemap = await fetchWithRetry(sitemapUrl, { attempts, delayMs, timeoutMs });
    addCheck(checks, {
      id: 'sitemap:reachable', category: 'route', target, url: sitemapUrl,
      ok: sitemap.ok, expected: 'HTTP 200', actual: sitemap.status || sitemap.error,
      message: 'sitemap is unreachable', classification: classifyFailure(sitemap.status, sitemap.error),
    });
    if (sitemap.ok) {
      const manifestPaths = new Set(routes.filter(route => route.sitemap !== false).map(route => route.path));
      const livePaths = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map(match => new URL(match[1]).pathname)
        .filter(routePath => !routePath.toLowerCase().endsWith('.pdf'));
      for (const livePath of livePaths) {
        addCheck(checks, {
          id: `sitemap:manifest:${livePath}`, category: 'route', target, url: sitemapUrl,
          ok: manifestPaths.has(livePath), expected: 'route has committed content expectation', actual: livePath,
          message: `published sitemap route is missing from smoke expectations: ${livePath}`,
        });
      }
    }
  }

  for (const route of routes) {
    const pageUrl = new URL(route.path, `${target}/`).toString();
    const result = await fetchWithRetry(pageUrl, { attempts, delayMs, timeoutMs });
    addCheck(checks, {
      id: `route:${route.path}:http`, category: 'route', target, url: pageUrl,
      ok: result.ok && result.status === 200, expected: 'HTTP 200', actual: result.status || result.error,
      message: 'published route did not return HTTP 200', classification: classifyFailure(result.status, result.error),
    });
    if (!result.ok) continue;
    const contentTypeOk = result.contentType.includes('text/html');
    addCheck(checks, {
      id: `route:${route.path}:content-type`, category: 'route', target, url: pageUrl,
      ok: contentTypeOk, expected: 'text/html', actual: result.contentType,
      message: 'published route returned non-HTML content',
    });
    const bodyText = normalize(result.body);
    const markerOk = !route.marker || bodyText.includes(route.marker);
    addCheck(checks, {
      id: `route:${route.path}:marker`, category: 'content', target, url: pageUrl,
      ok: markerOk, expected: route.marker || 'body is readable', actual: markerOk ? route.marker : bodyText.slice(0, 160),
      message: `expected content marker is missing: ${JSON.stringify(route.marker)}`,
    });
    const metadata = validateMetadata(checks, { html: result.body, pageUrl, route, canonicalOrigin, target });
    if (metadata.ogImage) assets.set(metadata.ogImage, { kind: 'image', source: pageUrl });
    for (const resource of extractResources(pageUrl, result.body)) {
      if (!assets.has(resource.url)) assets.set(resource.url, { ...resource, source: pageUrl });
    }
  }

  for (const [assetUrl, asset] of assets) {
    if (asset.invalid) {
      addCheck(checks, {
        id: `asset:${assetUrl}:url`, category: 'media', target, url: assetUrl,
        ok: false, expected: 'valid URL', actual: assetUrl, message: `invalid ${asset.kind} URL on ${asset.source}`,
      });
      continue;
    }
    const result = await fetchWithRetry(assetUrl, {
      attempts, delayMs, timeoutMs,
      headers: { Range: 'bytes=0-1023' },
      read: 'sample',
    });
    addCheck(checks, {
      id: `asset:${assetUrl}:http`, category: 'media', target, url: assetUrl,
      ok: result.ok, expected: 'HTTP 2xx', actual: result.status || result.error,
      message: `${asset.kind} asset is unreachable (linked from ${asset.source})`,
      classification: classifyFailure(result.status, result.error),
    });
    if (!result.ok) continue;
    const expectedType = expectedAssetType(asset.kind);
    addCheck(checks, {
      id: `asset:${assetUrl}:content-type`, category: 'media', target, url: assetUrl,
      ok: !expectedType || result.contentType.includes(expectedType), expected: expectedType || 'non-HTML media',
      actual: result.contentType, message: `${asset.kind} asset has the wrong content type`,
    });
    addCheck(checks, {
      id: `asset:${assetUrl}:non-empty`, category: 'media', target, url: assetUrl,
      ok: result.bytes > 0 || result.contentLength > 0, expected: 'at least one response byte',
      actual: { sampledBytes: result.bytes, contentLength: result.contentLength },
      message: `${asset.kind} asset is empty`,
    });
  }

  for (const pdf of pdfs) {
    const pdfUrl = new URL(pdf.path, `${target}/`).toString();
    const result = await fetchWithRetry(pdfUrl, { attempts, delayMs, timeoutMs, read: 'buffer' });
    addCheck(checks, {
      id: `pdf:${pdf.path}:http`, category: 'pdf', target, url: pdfUrl,
      ok: result.ok, expected: 'HTTP 2xx', actual: result.status || result.error,
      message: 'expected PDF is unreachable', classification: classifyFailure(result.status, result.error),
    });
    if (!result.ok) continue;
    addCheck(checks, {
      id: `pdf:${pdf.path}:content-type`, category: 'pdf', target, url: pdfUrl,
      ok: result.contentType.includes('application/pdf'), expected: 'application/pdf', actual: result.contentType,
      message: 'PDF URL returned the wrong content type',
    });
    addCheck(checks, {
      id: `pdf:${pdf.path}:non-empty`, category: 'pdf', target, url: pdfUrl,
      ok: result.bytes >= pdf.minimumBytes, expected: `at least ${pdf.minimumBytes} bytes`, actual: result.bytes,
      message: 'PDF is missing or unexpectedly small',
    });
    const extracted = extractPdfText(result.body);
    addCheck(checks, {
      id: `pdf:${pdf.path}:opens`, category: 'pdf', target, url: pdfUrl,
      ok: !extracted.error, expected: 'pdftotext opens document', actual: extracted.error || 'opened',
      message: `PDF could not be opened: ${extracted.error}`,
      classification: extracted.error === 'pdftotext is not installed' ? 'infrastructure' : 'content',
    });
    if (extracted.error) continue;
    for (const section of pdf.requiredSections) {
      addCheck(checks, {
        id: `pdf:${pdf.path}:section:${section}`, category: 'pdf', target, url: pdfUrl,
        ok: extracted.text.includes(section), expected: section,
        actual: extracted.text.includes(section) ? section : null,
        message: `PDF is missing expected section: ${JSON.stringify(section)}`,
      });
    }
  }

  const summary = summaryFor(checks);
  const failures = checks.filter(check => check.status === 'fail').map(check => ({
    url: check.url,
    message: check.message,
    classification: check.classification,
    checkId: check.id,
  }));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    target,
    outcome: summary.infrastructureFailures ? 'infrastructure_failure' : summary.contentFailures ? 'content_failure' : 'pass',
    summary,
    checks,
    failures,
    pagesChecked: routes.length,
    assetsChecked: [...assets.keys()],
  };
}

export function writeSmokeReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}
