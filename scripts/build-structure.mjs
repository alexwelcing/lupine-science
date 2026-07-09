#!/usr/bin/env node
// Builds public/data/mof5_structure.json from the published MOF-5 crystal
// structure: COD entry 1516287 (Fm-3m, a = 25.8247 Å; J. Phys. Chem. C 114,
// 16181 (2010), doi:10.1021/jp103212z — structure first reported by Li,
// Eddaoudi, O'Keeffe & Yaghi, Nature 402, 276 (1999)).
//
// Expands the asymmetric unit through the space-group operators, keeps one
// cavity's worth of framework (8 Zn₄O nodes + the 12 BDC linkers joining
// them), computes bonds from covalent radii, and writes cartesian
// coordinates the homepage canvas renders directly.
//
// Usage: node scripts/build-structure.mjs [path/to/mof5.cif]
// Re-run only if the source CIF changes; the JSON is committed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CIF = process.argv[2] || path.join(ROOT, 'scratch', 'mof5.cif');
const OUT = path.join(ROOT, 'public', 'data', 'mof5_structure.json');

const text = fs.readFileSync(CIF, 'utf8');

// cell length (cubic)
const A = parseFloat(text.match(/_cell_length_a\s+([\d.]+)/)[1]);

// symmetry operators
const symBlock = text.split('_symmetry_equiv_pos_as_xyz')[1];
const ops = [];
for (const line of symBlock.split('\n').slice(1)) {
  const m = line.trim().match(/^'([^']+)'$/);
  if (!m) { if (ops.length) break; else continue; }
  ops.push(m[1].split(',').map((expr) => compile(expr.trim())));
}
function compile(expr) {
  // turns "x+1/2" / "-y" / "z" into a function of [x,y,z]
  return (v) => {
    let s = expr.replace(/x/g, `(${v[0]})`).replace(/y/g, `(${v[1]})`).replace(/z/g, `(${v[2]})`);
    // eslint-disable-next-line no-new-func
    return Function(`return ${s}`)();
  };
}

// asymmetric unit
const atomBlock = text.match(/_atom_site_refinement_flags\s*\n([\s\S]*?)\n\s*loop_/);
const asym = [];
for (const line of atomBlock[1].split('\n')) {
  const f = line.trim().split(/\s+/);
  if (f.length < 5 || f[0].startsWith('_')) continue;
  asym.push({ el: f[1], f: [parseFloat(f[2]), parseFloat(f[3]), parseFloat(f[4])] });
}

// expand: apply ops, wrap into [0,1), dedupe
const mod1 = (x) => ((x % 1) + 1) % 1;
const seen = new Map();
for (const a of asym) {
  for (const op of ops) {
    const p = op.map((fn) => mod1(fn(a.f)));
    const key = `${a.el}:${p.map((x) => x.toFixed(4)).join(',')}`;
    if (!seen.has(key)) seen.set(key, { el: a.el, f: p });
  }
}

// one cavity: framework content of the fractional cube [1/4, 3/4]^3,
// padded so corner clusters and edge linkers arrive whole. Consider ±1
// translations so the cube is filled from neighbouring cells too.
const PAD = 0.075;
const atoms = [];
for (const { el, f } of seen.values()) {
  for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) for (const dz of [-1, 0, 1]) {
    const p = [f[0] + dx, f[1] + dy, f[2] + dz];
    if (p.every((x) => x >= 0.25 - PAD && x <= 0.75 + PAD)) {
      atoms.push({ el, xyz: p.map((x) => +(x * A).toFixed(3)) });
    }
  }
}

// bonds from covalent radii
const RADII = { Zn: 1.22, O: 0.66, C: 0.76, H: 0.31 };
const bonds = [];
for (let i = 0; i < atoms.length; i++) {
  for (let j = i + 1; j < atoms.length; j++) {
    const a = atoms[i], b = atoms[j];
    const lim = (RADII[a.el] || 0.8) + (RADII[b.el] || 0.8) + 0.45;
    const d2 = (a.xyz[0] - b.xyz[0]) ** 2 + (a.xyz[1] - b.xyz[1]) ** 2 + (a.xyz[2] - b.xyz[2]) ** 2;
    if (d2 < lim * lim && d2 > 0.25) bonds.push([i, j]);
  }
}

// drop atoms that arrived with no bonds (stray cube-boundary fragments)
const degree = new Array(atoms.length).fill(0);
for (const [i, j] of bonds) { degree[i]++; degree[j]++; }
const keep = atoms.map((a, i) => degree[i] > 0);
const remap = new Map();
const finalAtoms = [];
atoms.forEach((a, i) => { if (keep[i]) { remap.set(i, finalAtoms.length); finalAtoms.push(a); } });
const finalBonds = bonds.map(([i, j]) => [remap.get(i), remap.get(j)]);

// center on the cavity midpoint
const c = A * 0.5;
for (const a of finalAtoms) a.xyz = a.xyz.map((x) => +(x - c).toFixed(3));

const counts = {};
for (const a of finalAtoms) counts[a.el] = (counts[a.el] || 0) + 1;

const out = {
  name: 'MOF-5 (IRMOF-1)',
  formula: 'Zn4O(BDC)3 · one cavity fragment',
  source: 'COD 1516287 — J. Phys. Chem. C 114, 16181 (2010), doi:10.1021/jp103212z. Structure: Li, Eddaoudi, O’Keeffe & Yaghi, Nature 402, 276–279 (1999).',
  license: 'Crystallography Open Database — public domain',
  cell_a_angstrom: A,
  atom_count: finalAtoms.length,
  element_counts: counts,
  elements: finalAtoms.map((a) => a.el),
  positions: finalAtoms.map((a) => a.xyz),
  bonds: finalBonds,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`${OUT}: ${finalAtoms.length} atoms (${Object.entries(counts).map(([k, v]) => `${k}${v}`).join(' ')}), ${finalBonds.length} bonds, ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
