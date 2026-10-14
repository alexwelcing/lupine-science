import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function publicFile(publicPath, publicRoot) {
  if (typeof publicPath !== 'string' || !publicPath.startsWith('/')) {
    throw new Error(`public path must start with /: ${publicPath}`);
  }
  const root = path.resolve(publicRoot);
  const file = path.resolve(root, `.${publicPath}`);
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`public path escapes public root: ${publicPath}`);
  }
  return file;
}

function verifyDigest(record, publicRoot, pathField, digestField) {
  const publicPath = record[pathField];
  const file = publicFile(publicPath, publicRoot);
  if (!fs.existsSync(file)) throw new Error(`missing public asset: ${publicPath}`);
  const metadata = fs.lstatSync(file);
  if (metadata.isSymbolicLink() || !metadata.isFile()) {
    throw new Error(`public asset must be a regular file, not a symlink: ${publicPath}`);
  }
  const realRoot = fs.realpathSync(publicRoot);
  const realFile = fs.realpathSync(file);
  const realRelative = path.relative(realRoot, realFile);
  if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
    throw new Error(`public asset resolves outside public root: ${publicPath}`);
  }
  const expected = record[digestField];
  if (!expected) throw new Error(`missing digest for ${record.id} ${digestField}`);
  const actual = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (actual !== expected) {
    throw new Error(`digest mismatch for ${record.id} ${pathField}: expected ${expected}, got ${actual}`);
  }
}

export function verifyAcceptedRecord(record, publicRoot) {
  verifyDigest(record, publicRoot, 'publicMasterPath', 'outputSha256');
  verifyDigest(record, publicRoot, 'publicThumbPath', 'thumbSha256');
}