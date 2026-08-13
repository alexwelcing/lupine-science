// Shared text-quality analysis for OCR-based credibility gates.
//
// Used by the video reviewer (scripts/video-quality-reviewer.mjs) and the
// adversarial image auditor (scripts/review-images.mjs). The goal is to
// distinguish REAL words (dictionary, domain corpus, scientific tokens) from
// model-hallucinated gibberish that destroys credibility in a single frame.
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function tokenize(text) {
  return String(text)
    .replace(/[^a-zA-Z0-9\s\-]/g, ' ')
    .split(/\s+|-/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 3);
}

export async function loadDictionary() {
  try {
    const raw = await readFile('/usr/share/dict/words', 'utf8');
    return new Set(raw.split(/\r?\n/).map((w) => w.trim().toLowerCase()).filter(Boolean));
  } catch {
    return new Set();
  }
}

async function addJsonText(corpus, file, keys) {
  try {
    const data = JSON.parse(await readFile(file, 'utf8'));
    const walk = (node) => {
      if (typeof node === 'string') {
        for (const t of tokenize(node)) corpus.add(t);
      } else if (Array.isArray(node)) {
        node.forEach(walk);
      } else if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
          if (!keys || keys.includes(k)) walk(v);
        }
      }
    };
    walk(data);
  } catch {
    // ignore missing/unparseable manifests
  }
}

export async function buildDomainCorpus() {
  const corpus = new Set();
  const addText = (text) => {
    for (const t of tokenize(text)) corpus.add(t);
  };

  // Article prose is the primary domain vocabulary.
  try {
    const sources = (await readdir(path.join(ROOT, 'articles'))).filter((f) => f.endsWith('.md'));
    for (const f of sources) {
      addText(await readFile(path.join(ROOT, 'articles', f), 'utf8'));
    }
  } catch {
    // ignore
  }

  // Captions + narration.
  try {
    const vtts = (await readdir(path.join(ROOT, 'public', 'videos'))).filter((f) => f.endsWith('.vtt'));
    for (const f of vtts) {
      addText(await readFile(path.join(ROOT, 'public', 'videos', f), 'utf8'));
    }
  } catch {
    // ignore
  }

  // Chart labels and captions from generated image manifests.
  const articlesDir = path.join(ROOT, 'public', 'articles');
  if (existsSync(articlesDir)) {
    for (const entry of await readdir(articlesDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      await addJsonText(corpus, path.join(articlesDir, entry.name, 'images', 'manifest.json'), null);
    }
  }

  // Result graphics + poster + motion manifests (titles, axis labels, sources).
  await addJsonText(corpus, path.join(ROOT, 'data', 'result-graphics.json'), null);
  await addJsonText(corpus, path.join(ROOT, 'data', 'video-posters.json'), null);
  try {
    const motionDir = path.join(ROOT, 'data', 'video-motion');
    for (const f of await readdir(motionDir)) {
      if (f.endsWith('.json')) await addJsonText(corpus, path.join(motionDir, f), null);
    }
  } catch {
    // ignore
  }

  // Common scientific / Lupine terms that may not appear in the sources above.
  const extra = [
    'combinatorial', 'ranking', 'linkers', 'candidates', 'asymmetry', 'metastability',
    'inversion', 'defect', 'bulk', 'hydrated', 'amorphous', 'networks', 'priorities',
    'buried', 'breakthroughs', 'predicted', 'structure', 'working', 'material',
    'error-field', 'observables', 'runtime', 'build-locked', 'machine-learning',
    'deepmind', 'clean-air', 'low-carbon', 'coordination-specific', 'materials-limited',
    'single-atom', 'sorbents', 'sorbent', 'metal-organic', 'kinetically', 'ai-generated',
    'mofs', 'makeability', 'interatomic', 'near-quantum', 'defect-family', 'gigatonnes',
    'anthropogenic', 'calcination', 'feedstock', 'clean-energy', 'extractants',
    'nanograms', 'gigatons', 'cobalt-free', 'energy-hungry', 'haber-bosch', 'lead-free',
    'near-term', 'low-warming', 'atomistic', 'carbon-hydrogen', 'thirty-six',
    'synthesizability', 'milli-electronvolts', 'fifty-fold', 'density-functional',
    'enthalpies', 'coupling-aware', 'two-thirds', 'machine-learned', 'machine-checked',
    'recomputes', 'shortlists', 'web-native', 'browser-native', 'webgl', 'webgpu',
    'handoffs', 'handoff', 'lithium-manganese-rich', 'atomic-layer', 'nitrous',
    'hydrofluorocarbon', 'hexafluoride', 'non-co', 'thirty-five', 'under-coordinated',
    'first-shell', 'blind', 'prediction', 'surface', 'coordination', 'vacancy',
    'constraint', 'correction', 'force', 'measured', 'spline', 'anchor', 'local',
    'python', 'compiled', 'overlay', 'refrigerant', 'refrigerants', 'kigali',
    'amendment', 'hydrofluorocarbons', 'thermophysical', 'inspectable', 'trajectories',
    'payloads', 'telemetry', 'glyphs', 'impostors', 'colormaps', 'lammps', 'brick',
    'lod', 'bond', 'dissociation', 'energy', 'organic', 'common', 'source', 'smart',
    'kirk-othmer', 'encyclopedia', 'chemical', 'technology', 'wiley', 'npj', 'comput',
    'mater', 'deng', 'ipcc', 'wgi', 'table', 'sections', 'maginn', 'simulation',
    'cement', 'concrete', 'built', 'world', 'factory', 'kiln', 'smoke', 'emissions',
    'trust', 'layer', 'investing', 'verification', 'evidence', 'claim', 'network',
    'gtco₂', 'gtco2', 'gtco', 'non-co₂', 'non-co2', 'nonco2', 'non-co', 'lupi', 'lupi.live', 'lupilive',
    'mace', 'macempa', 'macempao', 'chgnet', 'mattersim', 'orbv', 'sevennet', 'equiformer',
    'ashrae', 'velders', 'scrivener', 'habert', 'gnome', 'mattergen', 'a-lab', 'alab',
    'desalination', 'sorbent-cost', 'halocarbons', 'clinker', 'clinkers', 'perovskites',
    'gtcoyear', 'ieagcca', 'gmlg', 'mday',
  ];
  for (const t of extra) corpus.add(t);
  return corpus;
}

export function hasVowel(token) {
  return /[aeiouy]/.test(token);
}

const UNIT_TOKENS = new Set([
  'kjmol', 'kcalmol', 'mscm', 'mahg', 'whkg', 'macm', 'mmolg', 'm3day',
  'gtco', 'gtcoe', 'tco', 'mtco', 'ngl', 'ugl', 'mgl', 'gl', 'wt', 'at',
  'mev', 'ev', 'bev', 'jmol', 'wm', 'kwh', 'mwh', 'gwh', 'twh', 'gpa',
  'mpa', 'kpa', 'hpa', 'ppm', 'ppb', 'ppt', 'gwp', 'odp', 'cop', 'rmse',
  'mae', 'std', 'ci', 'df', 'sscc',
]);

export function isScientificToken(token) {
  if (/\d/.test(token)) return true; // data labels: r=0.906, $270B/year, Ni(110), R-1234yf, MACE-MP-0
  if (/^\d+(\.\d+)?$/.test(token)) return true;
  if (/^(mg|na|cl|ca|fe|al|si|ti|cu|li|k|s|p|n|o|c|h|f)[0-9]*$/.test(token)) return true;
  if (UNIT_TOKENS.has(token)) return true;
  return false;
}

export function trainBigramModel(words) {
  const counts = new Map();
  const totals = new Map();
  for (const word of words) {
    if (word.length < 3) continue;
    const chars = ['^', ...word.split(''), '$'];
    for (let i = 0; i < chars.length - 1; i++) {
      const a = chars[i];
      const b = chars[i + 1];
      totals.set(a, (totals.get(a) || 0) + 1);
      const key = `${a}:${b}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return { counts, totals };
}

export function bigramScore(token, model) {
  if (token.length < 3) return 0;
  const chars = ['^', ...token.split(''), '$'];
  let logSum = 0;
  let n = 0;
  for (let i = 0; i < chars.length - 1; i++) {
    const a = chars[i];
    const b = chars[i + 1];
    const total = model.totals.get(a) || 0;
    const count = model.counts.get(`${a}:${b}`) || 0;
    if (total === 0) return -Infinity;
    const p = (count + 0.5) / (total + 26);
    logSum += Math.log(p);
    n++;
  }
  return n ? logSum / n : 0;
}

/**
 * Classify OCR words. Returns tokens that look like hallucinated gibberish:
 * unknown to the dictionary and domain corpus, with a pathological character
 * distribution (low bigram score, no vowel, or repeated chunks), or very low
 * OCR confidence.
 */
export function findSuspectWords(words, dictionary, corpus, bigram) {
  const unknown = [];
  for (const { text, confidence } of words) {
    // Tesseract uses zero confidence for non-text geometry it could not
    // recognize. Treating those guesses as words turns pipes/icons into P0s.
    if (Number.isFinite(confidence) && confidence <= 0) continue;
    const raw = String(text).toLowerCase();
    const hyphenated = raw.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const clean = hyphenated.replace(/-/g, '');
    if (clean.length < 4) continue;
    if (isScientificToken(clean)) continue;
    if (dictionary.has(clean) || corpus.has(clean)) continue;
    // Hyphenated compounds ("clean-energy", "CO2-cured") match on the joined
    // form or when every part is known.
    if (hyphenated.includes('-')) {
      if (dictionary.has(hyphenated) || corpus.has(hyphenated)) continue;
      const parts = hyphenated.split('-').filter((p) => p.length >= 2);
      if (parts.length >= 2 && parts.every((p) => dictionary.has(p) || corpus.has(p) || isScientificToken(p))) continue;
      if (parts.some((p) => p.length >= 3 && (dictionary.has(p) || corpus.has(p)))) continue;
    }
    const score = bigramScore(clean, bigram);
    const isNonsense = score < -4.5 || !hasVowel(clean) || /(.{2,})\1/.test(clean);
    const lowConfidence = confidence !== undefined && confidence < 60;
    if (isNonsense || lowConfidence) {
      unknown.push({ word: text, clean, score: Number(score.toFixed(2)), confidence });
    }
  }
  return unknown;
}
