#!/usr/bin/env node
// Offscreen renderer for the WebGPU ribbon tier (public/assets/ribbon-gpu.js).
//
// SwiftShader in sandboxed containers executes WebGPU work correctly but
// crashes on canvas *presentation*, so page screenshots can never show the
// GPU tier here. This harness renders the real WGSL to an offscreen texture
// with the real benchmark uniforms, reads the pixels back, composites them
// over the paper ground, and writes PNGs — true visual evidence of what a
// real GPU will draw, one focus state per frame.
//
// Usage: node scripts/dev/render-ribbon-gpu.mjs [outDir] [--time seconds]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import { chromiumExecutablePath } from '../lib/chromium-executable.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2]
  : path.join(process.env.SCRATCH || '/tmp', 'lupine-ribbon-gpu');
const timeIdx = process.argv.indexOf('--time');
const TIME = timeIdx > -1 ? Number(process.argv[timeIdx + 1]) : 6.0;

const W = 1440, H = 900;
const PAPER = [250, 249, 246];

// the same focus table as index.html — keep in sync by eye; the values are art
const FOCUS = {
  objective:    { converge: 0.55, ribbon: 0.92, vector: 0.5,  ledger: 0.35, ochre: 0.0 },
  manifold:     { converge: 0.96, ribbon: 1.0,  vector: 0.16, ledger: 0.22, ochre: 0.0 },
  errorvectors: { converge: 0.40, ribbon: 0.5,  vector: 1.0,  ledger: 0.18, ochre: 0.0 },
  ledger:       { converge: 0.7,  ribbon: 0.82, vector: 0.28, ledger: 1.0,  ochre: 1.0 },
};

const moduleSrc = fs.readFileSync(path.join(ROOT, 'public/assets/ribbon-gpu.js'), 'utf8');
const wgsl = moduleSrc.match(/const WGSL = \/\* wgsl \*\/ `([\s\S]*?)`;\n/)?.[1];
if (!wgsl) { console.error('could not extract WGSL from ribbon-gpu.js'); process.exit(1); }
const bench = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/benchmark_manifold.json'), 'utf8'));

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: chromiumExecutablePath(),
  args: ['--no-sandbox', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan'],
});
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
// navigator.gpu needs a secure context; localhost qualifies, about:blank doesn't
const BASE = process.env.BASE_URL || 'http://localhost:8080';
await page.goto(`${BASE}/404.html`);

const results = await page.evaluate(async ({ wgsl, bench, FOCUS, W, H, TIME }) => {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return { err: 'no adapter' };
  const device = await adapter.requestDevice();
  const errs = [];
  device.onuncapturederror = (e) => errs.push(e.error && e.error.message);
  const module = device.createShaderModule({ code: wgsl });
  const info = await module.getCompilationInfo();
  const compileErrors = info.messages.filter((m) => m.type === 'error')
    .map((m) => `L${m.lineNum}: ${m.message}`);
  if (compileErrors.length) return { err: 'wgsl', compileErrors };

  const format = 'rgba8unorm';
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: {
      module, entryPoint: 'fs',
      targets: [{ format, blend: {
        color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
        alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
      } }],
    },
    primitive: { topology: 'triangle-list' },
  });
  const ubuf = device.createBuffer({ size: 336, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const bind = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: ubuf } }],
  });
  const tex = device.createTexture({
    size: [W, H], format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });
  const bytesPerRow = Math.ceil((W * 4) / 256) * 256;
  const rbuf = device.createBuffer({ size: bytesPerRow * H, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

  // mirror of the module's data prep (process() + proj3)
  const hyp = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  const pots = bench.map((r) => {
    const eig = (r.eigenvalues || []).filter((e) => e > 1e-9);
    return {
      thin: eig.length > 1 ? Math.sqrt(eig[1] / eig[0]) : 0.12,
      pr: r.effective_dimensionality,
      r2: r.log_r_squared,
      var1: (r.cumulative_variance && r.cumulative_variance[0]) || 0,
      pc1: r.eigenvectors[0],
    };
  });
  const P3 = [
    [0.6325, 0.4472, 0.4472, 0.3162, 0.3162],
    [-0.5, 0.7246, -0.1863, -0.3727, 0.2236],
    [0.3162, -0.2236, -0.7454, 0.2236, 0.4472],
  ];
  const proj3 = (v) => {
    const o = [0, 0, 0];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) o[r] += P3[r][c] * (v[c] || 0);
    const n = Math.hypot(o[0], o[1], o[2]) || 1;
    return [o[0] / n, o[1] / n, o[2] / n];
  };
  const meanThin = pots.reduce((s, p) => s + p.thin, 0) / pots.length;

  const frames = {};
  for (const [name, f] of Object.entries(FOCUS)) {
    const u = new Float32Array(84);
    u[0] = W; u[1] = H; u[2] = 1; u[3] = TIME;
    u[4] = f.converge; u[5] = f.ribbon; u[6] = f.vector; u[7] = f.ledger;
    u[8] = f.ochre; u[9] = 0; u[10] = 0; u[11] = 0;
    u[12] = W * 0.36; u[13] = H * 0.28; u[14] = W * 0.78; u[15] = H * 0.94;
    u[16] = 0; u[17] = 0.95; u[18] = meanThin; u[19] = 0.06;
    for (let i = 0; i < 4; i++) {
      const p = pots[i % pots.length];
      const o = 20 + i * 4;
      u[o] = p.thin; u[o + 1] = p.pr; u[o + 2] = p.r2; u[o + 3] = p.var1;
      const e = proj3(p.pc1);
      const q = 36 + i * 4;
      u[q] = e[0]; u[q + 1] = e[1]; u[q + 2] = e[2]; u[q + 3] = i - 1.5;
    }
    device.queue.writeBuffer(ubuf, 0, u);
    const enc = device.createCommandEncoder();
    const pass = enc.beginRenderPass({
      colorAttachments: [{ view: tex.createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }],
    });
    pass.setPipeline(pipeline); pass.setBindGroup(0, bind); pass.draw(3); pass.end();
    enc.copyTextureToBuffer({ texture: tex }, { buffer: rbuf, bytesPerRow }, [W, H]);
    device.queue.submit([enc.finish()]);
    await rbuf.mapAsync(GPUMapMode.READ);
    frames[name] = Array.from(new Uint8Array(rbuf.getMappedRange()));
    rbuf.unmap();
  }
  return { frames, bytesPerRow, errs };
}, { wgsl, bench, FOCUS, W, H, TIME });

await browser.close();

if (results.err) {
  console.error('render failed:', results.err, results.compileErrors || '');
  process.exit(1);
}
if (results.errs.length) {
  console.error('uncaptured GPU errors:');
  for (const e of results.errs) console.error('  ' + e);
  process.exit(1);
}

let nonEmpty = 0;
for (const [name, data] of Object.entries(results.frames)) {
  const png = new PNG({ width: W, height: H });
  let lit = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const s = y * results.bytesPerRow + x * 4;
      const d = (y * W + x) * 4;
      const a = data[s + 3] / 255;
      if (a > 0.004) lit++;
      // premultiplied source over opaque paper (clamped — a hot pixel must
      // read as white, not wrap around the byte)
      png.data[d] = Math.min(255, Math.round(data[s] + PAPER[0] * (1 - a)));
      png.data[d + 1] = Math.min(255, Math.round(data[s + 1] + PAPER[1] * (1 - a)));
      png.data[d + 2] = Math.min(255, Math.round(data[s + 2] + PAPER[2] * (1 - a)));
      png.data[d + 3] = 255;
    }
  }
  const file = path.join(OUT, `ribbon-gpu--${name}.png`);
  fs.writeFileSync(file, PNG.sync.write(png));
  const pct = ((lit / (W * H)) * 100).toFixed(1);
  if (lit > W * H * 0.01) nonEmpty++;
  console.log(`  ✓ ${name.padEnd(14)} ${pct.padStart(5)}% of pixels lit → ${file}`);
}
if (!nonEmpty) { console.error('all frames empty — the shader drew nothing'); process.exit(1); }
console.log(`\n${nonEmpty}/${Object.keys(results.frames).length} focus states render.`);
