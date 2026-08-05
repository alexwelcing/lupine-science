import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const INVENTORY_PATH = path.join(REPO_ROOT, 'public', 'data', 'lean_count.json');

const SURFACES = [
  {
    file: path.join(REPO_ROOT, 'public', 'index.html'),
    marker: /(<strong id="lean-count">)[^<]*(<\/strong>)/,
  },
  {
    file: path.join(REPO_ROOT, 'public', 'brand-assets', 'deck-dark-sample.html'),
    marker: /(<strong data-lean-count>)[^<]*(<\/strong>)/,
  },
  {
    file: path.join(REPO_ROOT, 'public', 'presentations', 'climate-investor-value', 'index.html'),
    marker: /(<strong data-lean-count>)[^<]*(<\/strong>)/,
  },
];

export function hydrateLeanCount(count) {
  if (!Number.isSafeInteger(count) || count < 1) throw new Error('invalid Lean theorem count');

  for (const surface of SURFACES) {
    const source = fs.readFileSync(surface.file, 'utf8');
    if (!surface.marker.test(source)) {
      throw new Error(`theorem-count fallback marker not found in ${path.relative(REPO_ROOT, surface.file)}`);
    }
    fs.writeFileSync(surface.file, source.replace(surface.marker, `$1${count}$2`));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
  hydrateLeanCount(inventory.count);
  console.log(`hydrate-lean-count: wrote ${inventory.count} to ${SURFACES.length} static fallback surfaces`);
}
