// WebGPU tier of the hyper-ribbon hero. Hand-written WGSL, no libraries.
//
// The 2D canvas renderer in index.html stays the source of truth for every
// data glyph (MOF-5 crystal, orbital shells, alignment comets, ledger dots).
// This module renders only what 2D cannot: the manifold itself as volumetric
// light — four translucent sheets, one per reference potential, each oriented
// by its real first eigenvector and sized by its real eigenvalue ratio, almost
// but not exactly coplanar. That near-miss IS the result on the page.
//
// Contract with index.html (the `bridge` argument):
//   canvas, getData(), getTargets(), getZones(), getStage(), claim(), onLost()
// Any failure, at any point, calls onLost() (or never claims) and the 2D
// renderer keeps the stage. This file must never be the reason the hero is dark.

"use strict";

const WGSL = /* wgsl */ `
struct U {
  res: vec4f,               // w, h (css px), dpr, time
  focusA: vec4f,            // converge, ribbon, vector, ledger
  focusB: vec4f,            // ochre, spectrum, fan, matter
  stage: vec4f,             // x0, y0, x1, y1 (css px)
  misc: vec4f,              // zoneCount, breath, meanThin, yaw
  pot: array<vec4f, 4>,     // per potential: thin, pr, r2, var1
  pc1: array<vec4f, 4>,     // projected 3D first eigenvector, w = offset sign
  zones: array<vec4f, 8>,   // text-avoid rects: l, t, r, b (css px)
}
@group(0) @binding(0) var<uniform> u: U;

const IND = vec3f(0.2392, 0.3020, 0.7020);   // 61,77,179 — the same indigo
const OCH = vec3f(0.6588, 0.4667, 0.1686);   // 168,119,43 — the same ochre
const FEATHER = 36.0;

fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 345.45));
  q += dot(q, q + 34.345);
  return fract(q.x * q.y);
}
fn noise2(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p);
  let s = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
}

// the same spine as the 2D renderer, in css-pixel space
fn spineY(sx: f32, t: f32) -> f32 {
  let uu = sx / u.res.x;
  let amp = u.res.y * (0.16 + 0.07 * u.focusA.y);
  return u.res.y * 0.42
    + sin(uu * 3.0 + t * 0.16) * amp
    + sin(uu * 6.1 - t * 0.1) * amp * 0.32;
}

// 1 in clear paper, feathering to 0 inside any type zone (port of clearAt)
fn zoneMask(px: vec2f) -> f32 {
  var f = 1.0;
  let n = u32(u.misc.x);
  for (var i = 0u; i < 8u; i++) {
    if (i >= n) { break; }
    let z = u.zones[i];
    let dx = max(max(z.x - px.x, 0.0), px.x - z.z);
    let dy = max(max(z.y - px.y, 0.0), px.y - z.w);
    if (dx == 0.0 && dy == 0.0) { return 0.0; }
    let d = sqrt(dx * dx + dy * dy);
    if (d < FEATHER) { f = min(f, d / FEATHER); }
  }
  return f;
}

// signed distance (in spine-relative screen units, /h) from a point on the
// ray to sheet i, plus the sheet's local luminance shaping
fn sheetField(i: u32, sx: f32, syn: f32, z: f32, t: f32) -> f32 {
  let p = u.pot[i]; let e = u.pc1[i];
  let conv = u.focusA.x;
  // vertical separation: each model's own error direction pushes its sheet
  // off the consensus surface; "converge" collapses the family to one
  let sep = e.w * (0.055 + 0.11 * abs(e.y)) * (1.0 - 0.85 * conv);
  // tilt out of coplanarity along x and depth, from the real eigenvector
  let tilt = e.x * 0.10 * (1.0 - 0.6 * conv) * (sx / u.res.x - 0.55)
           + e.z * 0.06 * (1.0 - 0.6 * conv) * (z - 2.4);
  // ripple: rougher error surfaces (higher participation ratio) shimmer more
  let rip = (p.y - 1.0) * 0.016 * sin(sx * 0.011 + t * 0.5 + f32(i) * 1.7)
                        * sin(z * 2.3 - t * 0.23);
  return syn - sep - tilt - rip;
}

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  let xy = vec2f(f32((vi << 1u) & 2u), f32(vi & 2u));
  return vec4f(xy * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fs(@builtin(position) frag: vec4f) -> @location(0) vec4f {
  let px = frag.xy / u.res.z;                     // css px (res.z carries dpr)
  let w = u.res.x; let h = u.res.y; let t = u.res.w;
  let mask = zoneMask(px);
  if (mask <= 0.004) { return vec4f(0.0); }
  let breath = u.misc.y;
  let ribbon = u.focusA.y;

  // ray through this pixel; slow ambient yaw gives the sheets true parallax
  let H = h;                                       // vertical fov anchor
  var rd = normalize(vec3f((px.x - w * 0.5) / H, (px.y - h * 0.5) / H, 1.0));
  let yaw = u.misc.w;
  let cy = cos(yaw); let sy = sin(yaw);
  rd = vec3f(rd.x * cy + rd.z * sy, rd.y, -rd.x * sy + rd.z * cy);

  // volumetric march through the sheet family, front to back
  var acc = vec3f(0.0);
  var alpha = 0.0;
  let jitter = hash21(px + vec2f(t * 7.13, 0.0)) * 0.14;
  let steps = 15;
  for (var k = 0; k < steps; k++) {
    if (alpha > 0.94) { break; }
    let ft = (f32(k) + jitter) / f32(steps);
    let z = mix(1.35, 3.7, ft);
    let q = rd * (z / rd.z);
    let sx = q.x / q.z * H + w * 0.5;               // screen-anchored
    let syp = q.y / q.z * H + h * 0.5;
    let syn = (syp - spineY(sx, t)) / h;            // spine-relative
    if (sx < -40.0 || sx > w + 40.0) { continue; }
    let depthFade = 1.0 - abs(z - 2.5) / 1.5;       // sheets live mid-band
    for (var i = 0u; i < 4u; i++) {
      let p = u.pot[i];
      let f = sheetField(i, sx, syn, z, t);
      let halfW = 0.006 + 0.036 * p.x;              // real thinness -> width
      let af = abs(f) / halfW;
      if (af > 1.0) { continue; }
      // fine parallel filaments inside each sheet — the "many wrong
      // simulations" texture, now living on a curved surface
      let stria = 0.60 + 0.40 * cos(f / halfW * 12.566);
      let body = (1.0 - af) * (1.0 - af) * stria;
      let core = smoothstep(0.14, 0.0, af) * 0.5;
      // luminance earned by fit quality (r2) and the ribbon focus
      let lum = (0.18 + 0.72 * p.z) * (0.35 + 0.65 * ribbon) * breath * depthFade;
      // per-step optical density: airy, paper-calm — never a solid band
      var sigma = (body * 0.105 + core * 0.070) * lum;
      // ochre glints riding the top edge while the ledger is in focus
      let och = u.focusB.x;
      var tint = IND;
      if (och > 0.02 && f < 0.0 && af > 0.55) {
        let cell = floor(vec2f(sx * 0.055, f32(i) + floor(t * 1.4)));
        let spark = step(0.96, hash21(cell));
        tint = mix(IND, OCH, spark * och * 0.85);
        sigma += spark * och * 0.020 * (1.0 - af) * depthFade;
      }
      acc += tint * sigma * (1.0 - alpha);
      alpha += sigma * (1.0 - alpha);
    }
    // drifting indigo fog hugging the sheet family (error-vector focus).
    // isotropic in screen px — anisotropic noise cells read as smudges
    let vec_ = u.focusA.z;
    if (vec_ > 0.02) {
      let n = noise2(vec2f(sx * 0.012 + t * 24.0, syp * 0.012 + z * 4.0));
      let band = smoothstep(0.20, 0.02, abs(syn));
      let fog = smoothstep(0.58, 1.0, n) * band * vec_ * 0.006 * breath;
      acc += IND * fog * (1.0 - alpha);
      alpha += fog * 1.2 * (1.0 - alpha);
    }
  }

  // focal bloom: the one indigo light source, seated over the clear window
  let fx = (u.stage.x + u.stage.z) * 0.5;
  let fy = spineY(fx, t);
  let dd = distance(px, vec2f(fx, fy)) / (min(w, h) * 0.34);
  let bloom = exp(-dd * dd * 3.0) * 0.085 * ribbon * breath;
  acc += IND * bloom;
  alpha += bloom * 0.9;

  let a = clamp(alpha, 0.0, 0.62) * mask;
  return vec4f(acc * mask, a);
}
`;

export async function start(bridge) {
  const canvas = bridge.canvas;
  let device;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return;
    device = await adapter.requestDevice();
  } catch {
    return;                       // 2D keeps the stage, silently
  }

  const context = canvas.getContext("webgpu");
  if (!context) { device.destroy(); return; }
  const format = navigator.gpu.getPreferredCanvasFormat();

  let dead = false;
  const die = () => {
    if (dead) return;
    dead = true;
    try { bridge.onLost(); } catch {}
    cancelAnimationFrame(raf);
    try { device.destroy(); } catch {}
  };
  device.lost.then(() => { if (!dead) { console.error("ribbon-gpu: device lost"); die(); } });
  device.onuncapturederror = (e) => {
    console.error("ribbon-gpu:", e.error && e.error.message);
    die();
  };

  const module = device.createShaderModule({ code: WGSL });
  const info = await module.getCompilationInfo();
  if (info.messages.some((m) => m.type === "error")) {
    for (const m of info.messages) console.error("ribbon-gpu wgsl:", m.message);
    die(); return;
  }

  const UNIFORM_FLOATS = 84;      // 5 + 4 + 4 + 8 vec4s
  const uarr = new Float32Array(UNIFORM_FLOATS);
  const ubuf = device.createBuffer({
    size: uarr.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module, entryPoint: "vs" },
    fragment: {
      module, entryPoint: "fs",
      targets: [{
        format,
        blend: {
          color: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
          alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
        },
      }],
    },
    primitive: { topology: "triangle-list" },
  });
  const bind = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: ubuf } }],
  });

  // fixed 5D -> 3D projection of each potential's first eigenvector; rows are
  // orthonormal, so real angular structure survives the projection
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

  let resolutionScale = 1.0;
  let w = 0, h = 0, dpr = 1;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2) * resolutionScale;
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    context.configure({ device, format, alphaMode: "premultiplied" });
  }
  resize();
  addEventListener("resize", resize, { passive: true });

  // the module runs its own interpolation toward the shared focus targets, so
  // equation clicks steer both layers identically without cross-talk
  const cur = { ...bridge.getTargets() };

  let raf = 0, t0 = 0, lastPaint = 0, frames = 0;
  let paused = false, hidden = false, still = false;
  const deltas = [];

  function uniforms(time) {
    const tgt = bridge.getTargets();
    for (const k in cur) cur[k] += (tgt[k] - cur[k]) * 0.045;
    const M = bridge.getData();
    const stage = bridge.getStage();
    const zones = bridge.getZones();
    uarr[0] = w; uarr[1] = h; uarr[2] = dpr; uarr[3] = time;
    uarr[4] = cur.converge; uarr[5] = cur.ribbon; uarr[6] = cur.vector; uarr[7] = cur.ledger;
    uarr[8] = cur.ochre; uarr[9] = cur.spectrum; uarr[10] = cur.fan; uarr[11] = cur.matter;
    uarr[12] = stage.x0; uarr[13] = stage.y0; uarr[14] = stage.x1; uarr[15] = stage.y1;
    uarr[16] = Math.min(zones.length, 8);
    uarr[17] = 0.88 + 0.12 * Math.sin(time * 0.55);      // breath, as in 2D
    uarr[18] = M.meanThin;
    uarr[19] = 0.10 * Math.sin(time * 0.045);            // ambient yaw
    for (let i = 0; i < 4; i++) {
      const p = M.pots[i % M.pots.length] || { thin: 0.3, pr: 1.5, r2: 0.9, var1: 0.7, pc1: [1, 0, 0, 0, 0] };
      const o = 20 + i * 4;
      uarr[o] = p.thin; uarr[o + 1] = p.pr; uarr[o + 2] = p.r2; uarr[o + 3] = p.var1;
      const e = proj3(p.pc1);
      const q = 36 + i * 4;
      uarr[q] = e[0]; uarr[q + 1] = e[1]; uarr[q + 2] = e[2];
      uarr[q + 3] = i - 1.5;                             // offset sign/order
    }
    for (let i = 0; i < 8; i++) {
      const z = zones[i], o = 52 + i * 4;
      if (z) { uarr[o] = z.l; uarr[o + 1] = z.t; uarr[o + 2] = z.r; uarr[o + 3] = z.bo; }
      else { uarr[o] = 0; uarr[o + 1] = 0; uarr[o + 2] = 0; uarr[o + 3] = 0; }
    }
    // frag derives css px as frag.xy / dpr — res.z must be the exact ratio
    uarr[2] = canvas.width / Math.max(1, w);
  }

  function frame(ts) {
    if (dead) return;
    if (lastPaint && ts - lastPaint < 32) { raf = requestAnimationFrame(frame); return; }
    if (lastPaint) {
      deltas.push(ts - lastPaint);
      if (deltas.length > 90) {
        const mean = deltas.reduce((s, x) => s + x, 0) / deltas.length;
        deltas.length = 0;
        // a machine that chose this tier but can't hold the ambient cap first
        // renders smaller, then bows out entirely — degraded beats janky
        if (mean > 48) {
          if (resolutionScale > 0.56) { resolutionScale -= 0.22; resize(); }
          else { die(); return; }
        }
      }
    }
    lastPaint = ts;
    if (!t0) t0 = ts;
    try {
      uniforms((ts - t0) / 1000);
      device.queue.writeBuffer(ubuf, 0, uarr);
      const enc = device.createCommandEncoder();
      const pass = enc.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear", storeOp: "store",
        }],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bind);
      pass.draw(3);
      pass.end();
      device.queue.submit([enc.finish()]);
    } catch (e) {
      console.error("ribbon-gpu:", e && e.message);
      die(); return;
    }
    frames++;
    if (frames === 2) {
      // reveal only once the queue confirms real presented work — a backend
      // that accepts submits but cannot present must never claim the ribbon
      device.queue.onSubmittedWorkDone().then(() => {
        if (dead) return;
        canvas.dataset.live = "";
        canvas.style.opacity = "1";
        setTimeout(() => { if (!dead) bridge.claim(); }, 950);
      }).catch(() => die());
    }
    if (!still) raf = requestAnimationFrame(frame);
  }

  const stop = () => { cancelAnimationFrame(raf); lastPaint = 0; };
  const run = () => { if (!dead && !paused && !hidden && !still) { stop(); raf = requestAnimationFrame(frame); } };
  document.addEventListener("visibilitychange", () => { hidden = document.hidden; hidden ? stop() : run(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => {
      paused = es.some((e) => !e.isIntersecting);
      paused ? stop() : run();
    }).observe(canvas);
  }
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
    // honor a mid-session switch the way the 2D tier does: one final still
    still = e.matches;
    still ? stop() : run();
    if (still && !dead) raf = requestAnimationFrame(frame);
  });

  raf = requestAnimationFrame(frame);
}
