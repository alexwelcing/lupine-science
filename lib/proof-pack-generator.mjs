import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProofPack, validateProofPackFiles } from '../scripts/validate-proofpack.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function digest(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function readOutputManifest(manifestPath, issues) {
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      issues.push('<root> must be a JSON object');
      return null;
    }
    return parsed;
  } catch (error) {
    issues.push(`<manifest> cannot be read as JSON: ${error.message}`);
    return null;
  }
}

function requireString(value, location, issues) {
  if (typeof value !== 'string' || value.length === 0) {
    issues.push(`${location} must be a non-empty string`);
    return false;
  }
  return true;
}

function requireDigest(value, location, issues) {
  if (!SHA256_PATTERN.test(value || '')) {
    issues.push(`${location} must be a lowercase SHA-256 digest`);
    return false;
  }
  return true;
}

function checkFile({ filePath, expectedDigest, expectedBytes, location }, issues) {
  if (!fs.existsSync(filePath)) {
    issues.push(`${location} is missing: ${filePath}`);
    return;
  }
  if (!fs.statSync(filePath).isFile()) {
    issues.push(`${location} is not a file: ${filePath}`);
    return;
  }
  if (requireDigest(expectedDigest, `${location}.sha256`, issues)) {
    const actualDigest = digest(filePath);
    if (actualDigest !== expectedDigest) {
      issues.push(`${location} digest mismatch: expected ${expectedDigest}, got ${actualDigest}`);
    }
  }
  if (expectedBytes !== undefined) {
    if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 1) {
      issues.push(`${location}.bytes must be a positive integer`);
    } else {
      const actualBytes = fs.statSync(filePath).size;
      if (actualBytes !== expectedBytes) {
        issues.push(`${location} byte-size mismatch: expected ${expectedBytes}, got ${actualBytes}`);
      }
    }
  }
}

function resolveRootPath(rootDir, relativePath, location, issues) {
  if (!requireString(relativePath, `${location}.path`, issues)) return null;
  const resolved = path.resolve(rootDir, relativePath);
  const relative = path.relative(rootDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    issues.push(`${location}.path escapes the repository root: ${relativePath}`);
    return null;
  }
  if (fs.existsSync(resolved)) {
    const realRoot = fs.realpathSync(rootDir);
    const realResolved = fs.realpathSync(resolved);
    const realRelative = path.relative(realRoot, realResolved);
    if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
      issues.push(`${location}.path resolves outside the repository root: ${relativePath}`);
      return null;
    }
  }
  return resolved;
}

function resolvePackPath(manifestPath, relativePath, location, issues) {
  const packDir = path.dirname(manifestPath);
  if (!requireString(relativePath, `${location}.path`, issues)) return null;
  const resolved = path.resolve(packDir, relativePath);
  const relative = path.relative(packDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    issues.push(`${location}.path escapes the proof-pack directory: ${relativePath}`);
    return null;
  }
  if (fs.existsSync(resolved)) {
    const realPackDir = fs.realpathSync(packDir);
    const realResolved = fs.realpathSync(resolved);
    const realRelative = path.relative(realPackDir, realResolved);
    if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
      issues.push(`${location}.path resolves outside the proof-pack directory: ${relativePath}`);
      return null;
    }
  }
  return resolved;
}

export function validateProofPackOutput(manifestPath, { rootDir = ROOT } = {}) {
  const issues = [];
  const resolvedRoot = path.resolve(rootDir);
  const resolvedManifest = path.resolve(manifestPath);
  const manifest = readOutputManifest(resolvedManifest, issues);
  if (!manifest) return issues;

  if (manifest.schemaVersion !== '1.0.0') issues.push('schemaVersion must equal "1.0.0"');
  if (!/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(manifest.generatedAt || '')) {
    issues.push('generatedAt must be the deterministic article date at 00:00:00.000Z');
  }
  if (manifest.build?.mode !== 'per-article') issues.push('build.mode must equal "per-article"');
  requireString(manifest.build?.slug, 'build.slug', issues);
  if (manifest.build?.script !== 'scripts/build-proofpack.mjs') {
    issues.push('build.script must equal "scripts/build-proofpack.mjs"');
  }
  if (typeof manifest.build?.slug === 'string') {
    const expectedManifestName = `${manifest.build.slug}.proofpack.json`;
    if (path.basename(resolvedManifest) !== expectedManifestName) {
      issues.push(`output manifest filename must match build.slug: expected ${expectedManifestName}`);
    }
    const expectedPdfName = `${manifest.build.slug}.proofpack.pdf`;
    if (manifest.output?.pdf?.path !== expectedPdfName) {
      issues.push(`output.pdf.path must match build.slug: expected ${expectedPdfName}`);
    }
  }

  const inputManifest = manifest.inputs?.manifest;
  const inputManifestPath = resolveRootPath(resolvedRoot, inputManifest?.path, 'inputs.manifest', issues);
  const declaredSlug = manifest.build?.slug;
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(declaredSlug || '') && inputManifestPath) {
    const expectedManifestPath = path.join(
      resolvedRoot,
      'public',
      'articles',
      declaredSlug,
      `${declaredSlug}.proofpack.json`
    );
    if (inputManifestPath !== expectedManifestPath) {
      issues.push(`inputs.manifest.path must identify the declared slug: expected ${path.relative(resolvedRoot, expectedManifestPath)}`);
    }
  }
  let sourceManifest = null;
  if (inputManifestPath) {
    checkFile({
      filePath: inputManifestPath,
      expectedDigest: inputManifest?.sha256,
      location: 'inputs.manifest',
    }, issues);
    if (fs.existsSync(inputManifestPath) && fs.statSync(inputManifestPath).isFile()) {
      try {
        sourceManifest = JSON.parse(fs.readFileSync(inputManifestPath, 'utf8'));
      } catch (error) {
        issues.push(`inputs.manifest cannot be read as JSON: ${error.message}`);
      }
    }
  }
  if (sourceManifest?.metadata) {
    const expectedDate = `${sourceManifest.metadata.date}T00:00:00.000Z`;
    if (manifest.generatedAt !== expectedDate) {
      issues.push(`generatedAt must match inputs.manifest metadata.date: expected ${expectedDate}`);
    }
    if (manifest.build?.slug !== sourceManifest.metadata.slug) {
      issues.push(`build.slug must match inputs.manifest metadata.slug: expected ${sourceManifest.metadata.slug}`);
    }
  }
  if (sourceManifest && inputManifestPath) {
    const sourceIssues = [
      ...validateProofPack(sourceManifest),
      ...validateProofPackFiles(sourceManifest, inputManifestPath),
    ];
    issues.push(...sourceIssues.map((issue) => `inputs.manifest: ${issue.message}`));
  }

  const articleHtml = manifest.inputs?.articleHtml;
  const articleHtmlPath = resolveRootPath(resolvedRoot, articleHtml?.path, 'inputs.articleHtml', issues);
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(declaredSlug || '') && articleHtmlPath) {
    const expectedArticlePath = path.join(resolvedRoot, 'public', 'articles', declaredSlug, 'index.html');
    if (articleHtmlPath !== expectedArticlePath) {
      issues.push(`inputs.articleHtml.path must identify the declared slug: expected ${path.relative(resolvedRoot, expectedArticlePath)}`);
    }
  }
  if (articleHtmlPath) {
    checkFile({
      filePath: articleHtmlPath,
      expectedDigest: articleHtml?.sha256,
      location: 'inputs.articleHtml',
    }, issues);
  }

  const figures = manifest.inputs?.figures;
  if (!figures || typeof figures !== 'object' || Array.isArray(figures)) {
    issues.push('inputs.figures must be an object of article-relative paths and SHA-256 digests');
  } else if (inputManifestPath) {
    const articleDir = path.dirname(inputManifestPath);
    const expectedFigurePaths = new Set(
      Array.isArray(sourceManifest?.figures)
        ? sourceManifest.figures.map((figure) => figure?.path).filter(Boolean)
        : []
    );
    for (const figurePath of expectedFigurePaths) {
      if (!Object.hasOwn(figures, figurePath)) {
        issues.push(`inputs.figures[${figurePath}] is required by inputs.manifest`);
      }
    }
    for (const figurePath of Object.keys(figures)) {
      if (!expectedFigurePaths.has(figurePath)) {
        issues.push(`inputs.figures[${figurePath}] is not declared by inputs.manifest`);
      }
    }
    for (const [figurePath, expectedDigest] of Object.entries(figures)) {
      const resolvedFigure = path.resolve(articleDir, figurePath);
      const relative = path.relative(articleDir, resolvedFigure);
      const location = `inputs.figures[${figurePath}]`;
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        issues.push(`${location} escapes the article directory`);
        continue;
      }
      if (fs.existsSync(resolvedFigure)) {
        const realArticleDir = fs.realpathSync(articleDir);
        const realFigure = fs.realpathSync(resolvedFigure);
        const realRelative = path.relative(realArticleDir, realFigure);
        if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
          issues.push(`${location} resolves outside the article directory`);
          continue;
        }
      }
      checkFile({ filePath: resolvedFigure, expectedDigest, location }, issues);
    }
  }

  const pdf = manifest.output?.pdf;
  const pdfPath = resolvePackPath(resolvedManifest, pdf?.path, 'output.pdf', issues);
  if (pdfPath) {
    checkFile({
      filePath: pdfPath,
      expectedDigest: pdf?.sha256,
      expectedBytes: pdf?.bytes,
      location: 'output.pdf',
    }, issues);
  }
  return issues;
}

export function assertValidProofPackOutput(manifestPath, options) {
  const issues = validateProofPackOutput(manifestPath, options);
  if (issues.length) {
    throw new Error(`proof-pack output validation failed for ${manifestPath}:\n- ${issues.join('\n- ')}`);
  }
}

export {
  generateProofPack,
  listEligibleArticles,
} from '../scripts/build-proofpack.mjs';
export { validateProofPack, validateProofPackFiles };
