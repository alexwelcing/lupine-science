import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { PDFDocument, PDFName } from 'pdf-lib';

const MIN_SLIDES = 12;
const MAX_SLIDES = 14;
const VIEWPORT = { width: 1280, height: 720 };
const PDF_WIDTH_POINTS = 960;
const PDF_HEIGHT_POINTS = 540;
const FIXED_DATE = new Date('2026-07-28T00:00:00.000Z');

const MIME = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.ttf', 'font/ttf'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function assertInputPaths({ htmlPath, pdfPath }) {
  if (!htmlPath) throw new Error('htmlPath is required');
  if (!pdfPath) throw new Error('pdfPath is required');
  if (!fs.existsSync(htmlPath)) throw new Error(`deck HTML does not exist: ${htmlPath}`);
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function startStaticServer(htmlPath, webRoot) {
  const root = webRoot ? path.resolve(webRoot) : path.dirname(path.resolve(htmlPath));
  const entry = path.resolve(htmlPath);
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const candidate = path.resolve(root, `.${pathname}`);
      if (!isInside(root, candidate)) {
        response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' }).end('forbidden');
        return;
      }
      let file = candidate;
      if (pathname === '/__deck__.html') file = entry;
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('not found');
        return;
      }
      const body = fs.readFileSync(file);
      response.writeHead(200, {
        'content-length': body.length,
        'content-type': MIME.get(path.extname(file).toLowerCase()) || 'application/octet-stream',
      });
      response.end(body);
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}/__deck__.html` });
    });
  });
}

function isAllowedRuntimeUrl(rawUrl, allowedOrigin) {
  const url = new URL(rawUrl);
  if (url.protocol === 'data:' || url.protocol === 'blob:') return true;
  return url.origin === allowedOrigin;
}

async function inspectRenderedDeck(page, slideSelector) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.allSettled([...document.images].map((image) => image.decode())));
  return page.evaluate(({ selector, minimum, maximum }) => {
    const slides = [...document.querySelectorAll(selector)];
    const overflowIssues = [];
    const overlapIssues = [];
    for (const [index, slide] of slides.entries()) {
      const candidates = [slide, ...slide.querySelectorAll('*')];
      for (const element of candidates) {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const horizontal = element.scrollWidth > element.clientWidth + 1;
        const vertical = element.scrollHeight > element.clientHeight + 1;
        if (!horizontal && !vertical) continue;
        const label = element === slide
          ? 'slide'
          : `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.className && typeof element.className === 'string' ? `.${element.className.trim().replace(/\s+/g, '.')}` : ''}`;
        overflowIssues.push(`slide ${index + 1}: ${label} (${element.scrollWidth}x${element.scrollHeight} > ${element.clientWidth}x${element.clientHeight})`);
      }
      const asset = slide.querySelector('.deck-asset');
      if (asset) {
        const assetRect = asset.getBoundingClientRect();
        const assetStyle = getComputedStyle(asset);
        const assetZ = Number.parseInt(assetStyle.zIndex, 10) || 0;
        for (const element of slide.querySelectorAll('[data-fit]')) {
          const elementStyle = getComputedStyle(element);
          const elementZ = Number.parseInt(elementStyle.zIndex, 10) || 0;
          const assetPaintsLater = elementZ < assetZ || (elementZ === assetZ && Boolean(element.compareDocumentPosition(asset) & Node.DOCUMENT_POSITION_FOLLOWING));
          if (!assetPaintsLater) continue;
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          const textRects = [];
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(walker.currentNode);
            textRects.push(...range.getClientRects());
          }
          for (const textRect of textRects) {
            const width = Math.max(0, Math.min(textRect.right, assetRect.right) - Math.max(textRect.left, assetRect.left));
            const height = Math.max(0, Math.min(textRect.bottom, assetRect.bottom) - Math.max(textRect.top, assetRect.top));
            if (width <= 1 || height <= 1) continue;
            overlapIssues.push(`slide ${index + 1}: ${element.tagName.toLowerCase()}[data-fit] with ${asset.tagName.toLowerCase()}.deck-asset (${Math.round(width)}x${Math.round(height)})`);
            break;
          }
        }
      }
    }
    return {
      slideCount: slides.length,
      slideCountValid: slides.length >= minimum && slides.length <= maximum,
      overflowIssues,
      overlapIssues,
    };
  }, { selector: slideSelector, minimum: MIN_SLIDES, maximum: MAX_SLIDES });
}

async function inspectHtml({ htmlPath, slideSelector = '.slide', webRoot }) {
  assertInputPaths({ htmlPath, pdfPath: 'not-used' });
  const { server, url } = await startStaticServer(htmlPath, webRoot);
  const allowedOrigin = new URL(url).origin;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    const externalRequests = [];
    await page.route('**/*', (route) => {
      const requestUrl = route.request().url();
      if (isAllowedRuntimeUrl(requestUrl, allowedOrigin)) {
        route.continue();
      } else {
        externalRequests.push(requestUrl);
        route.abort('internetdisconnected');
      }
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    const geometry = await inspectRenderedDeck(page, slideSelector);
    return { browser, page, server, externalRequests, ...geometry };
  } catch (error) {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    throw error;
  }
}

function assertBrowserChecks(report) {
  if (!report.slideCountValid) {
    throw new Error(`slide count ${report.slideCount} is outside allowed range ${MIN_SLIDES}-${MAX_SLIDES}`);
  }
  if (report.externalRequests.length) {
    throw new Error(`external runtime request detected: ${report.externalRequests.join(', ')}`);
  }
  if (report.overflowIssues.length) {
    throw new Error(`overflow detected on ${report.overflowIssues.join('; ')}`);
  }
  if (report.overlapIssues.length) {
    throw new Error(`overlap detected on ${report.overlapIssues.join('; ')}`);
  }
}

async function closeInspection(report) {
  await report.page.close();
  await report.browser.close();
  await new Promise((resolve) => report.server.close(resolve));
}

async function normalizePdf(pdfPath) {
  const document = await PDFDocument.load(fs.readFileSync(pdfPath), { updateMetadata: false });
  document.setTitle('Lupine Science Venture Deck');
  document.setAuthor('Lupine Science');
  document.setSubject('Deterministic 16:9 venture presentation');
  document.setCreator('scripts/venture-deck-tools.mjs');
  document.setProducer('scripts/venture-deck-tools.mjs');
  document.setCreationDate(FIXED_DATE);
  document.setModificationDate(FIXED_DATE);
  try {
    const trailer = document.context.trailer;
    if (trailer?.get(PDFName.of('ID'))) trailer.set(PDFName.of('ID'), document.context.obj([]));
  } catch {
    // pdf-lib does not expose a trailer for every supported PDF structure.
  }
  fs.writeFileSync(pdfPath, await document.save({ useObjectStreams: false, updateMetadata: false }));
  return document.getPageCount();
}

function assertPdfPageSize(document) {
  const badPage = document.getPages().findIndex((page) => {
    const { width, height } = page.getSize();
    return Math.abs(width - PDF_WIDTH_POINTS) > 1 || Math.abs(height - PDF_HEIGHT_POINTS) > 1;
  });
  if (badPage >= 0) throw new Error(`PDF page ${badPage + 1} is not 16:9 (${PDF_WIDTH_POINTS}x${PDF_HEIGHT_POINTS}pt)`);
}

export async function renderDeckPdf({ htmlPath, pdfPath, slideSelector = '.slide', webRoot }) {
  assertInputPaths({ htmlPath, pdfPath });
  const report = await inspectHtml({ htmlPath, slideSelector, webRoot });
  try {
    assertBrowserChecks(report);
    fs.mkdirSync(path.dirname(path.resolve(pdfPath)), { recursive: true });
    await report.page.emulateMedia({ media: 'print' });
    await report.page.pdf({
      path: pdfPath,
      width: '13.333333in',
      height: '7.5in',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
      preferCSSPageSize: false,
      tagged: false,
    });
  } finally {
    await closeInspection(report);
  }
  const pageCount = await normalizePdf(pdfPath);
  if (pageCount !== report.slideCount) {
    fs.rmSync(pdfPath, { force: true });
    throw new Error(`PDF page count ${pageCount} does not match slide count ${report.slideCount}`);
  }
  const document = await PDFDocument.load(fs.readFileSync(pdfPath));
  assertPdfPageSize(document);
  return {
    slideCount: report.slideCount,
    pageCount,
    externalRequests: report.externalRequests,
    overflowIssues: report.overflowIssues,
    overlapIssues: report.overlapIssues,
    pdfPath,
  };
}

export async function validateDeckArtifacts({ htmlPath, pdfPath, slideSelector = '.slide', webRoot }) {
  assertInputPaths({ htmlPath, pdfPath });
  if (!fs.existsSync(pdfPath)) throw new Error(`deck PDF does not exist: ${pdfPath}`);
  const report = await inspectHtml({ htmlPath, slideSelector, webRoot });
  try {
    assertBrowserChecks(report);
  } finally {
    await closeInspection(report);
  }
  const document = await PDFDocument.load(fs.readFileSync(pdfPath));
  const pageCount = document.getPageCount();
  if (pageCount !== report.slideCount) {
    throw new Error(`PDF page count ${pageCount} does not match slide count ${report.slideCount}`);
  }
  assertPdfPageSize(document);
  return {
    slideCount: report.slideCount,
    pageCount,
    externalRequests: report.externalRequests,
    overflowIssues: report.overflowIssues,
    overlapIssues: report.overlapIssues,
    pdfPath,
  };
}

export function validateClosureCertification({ baseline, aggregate, evidence }) {
  const errors = [];
  const children = Array.isArray(aggregate?.child_manifests) ? aggregate.child_manifests : [];
  const assets = Array.isArray(aggregate?.assets) ? aggregate.assets : [];
  const outputHashes = assets.map((asset) => asset.output_sha256);

  if (baseline?.images?.accepted !== 33 || baseline?.videos?.accepted !== 5) {
    errors.push('baseline certification must contain 33 accepted stills and five separately accepted films');
  }
  if (aggregate?.mechanical_status !== 'pass' || aggregate?.composition_status !== 'pass') {
    errors.push('aggregate mechanical and composition certification status must pass');
  }
  if (aggregate?.asset_count !== 67 || aggregate?.unique_asset_id_count !== 67 || aggregate?.unique_output_sha256_count !== 67 || assets.length !== 67) {
    errors.push('aggregate certification must contain 67 unique replacement stills');
  }
  if (children.length !== 9 || children.reduce((sum, child) => sum + child.asset_count, 0) !== 67) {
    errors.push('child certification groups must reconcile as nine groups and 67 assets');
  }
  if (children.some((child) => child.mechanical_status !== 'pass' || child.composition_status !== 'pass' || child.composition_review_manifest_matches_current !== true || !child.composition_review_task)) {
    errors.push('every child certification status and independent composition review must pass');
  }
  if (assets.some((asset) => asset.mechanical_status !== 'pass' || asset.composition_status !== 'pass' || !asset.composition_review_task)) {
    errors.push('every per-asset mechanical and composition certification status must pass');
  }
  if (new Set(outputHashes).size !== 67 || outputHashes.some((hash) => typeof hash !== 'string' || hash.length !== 64)) {
    errors.push('all 67 certified outputs must have unique SHA-256 values');
  }
  const claim = evidence?.claims?.['C-STILL-CLOSURE-01'];
  if (claim?.claim !== '33 certified baseline stills + 67 independently certified Wave-4 replacements = 100/100 unique still slots.' || claim?.closure_gate_task !== 't_c2a1f8e3' || claim?.films_outside_denominator !== 5) {
    errors.push('evidence manifest closure claim is missing or incorrectly scoped');
  }
  return errors;
}
