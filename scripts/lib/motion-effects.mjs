// ffmpeg filter-graph builders for turning static article visuals into
// motion-rich 1920×1080 clips.  Keeps everything deterministic and reviewable.

import path from 'node:path';

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

export function secondsToFrames(s) {
  return Math.round(s * FPS);
}

export function toFilterTime(frames) {
  // ffmpeg trim/xfade expect seconds, not a rational expression.
  return (frames / FPS).toFixed(3);
}

// Scale an input image to fill WIDTH×HEIGHT while preserving aspect ratio,
// then crop/pad to exact output size.  Returns a crop expression.
export function coverCrop(inputW, inputH) {
  const scale = Math.max(WIDTH / inputW, HEIGHT / inputH);
  const scaledW = inputW * scale;
  const scaledH = inputH * scale;
  const cropX = (scaledW - WIDTH) / 2;
  const cropY = (scaledH - HEIGHT) / 2;
  return `crop=${WIDTH}:${HEIGHT}:${cropX}:${cropY}`;
}

// Build a zoompan expression for a Ken Burns move.
// start/end are objects with { x, y, z } where x,y are center offsets in px
// and z is zoom factor (1.0 = no zoom).
export function kenBurnsExpr(durationSec, start, end) {
  const frames = secondsToFrames(durationSec);
  const sx = start.x ?? 0;
  const sy = start.y ?? 0;
  const sz = start.z ?? 1;
  const ex = end.x ?? 0;
  const ey = end.y ?? 0;
  const ez = end.z ?? 1;
  // zoompan works in terms of output width/height and zoom.
  const dx = ex - sx;
  const dy = ey - sy;
  const dz = ez - sz;
  return {
    zoom: `zoom=${sz}+(${dz})*on/${frames}:x='${sx}+(${dx})*on/${frames}':y='${sy}+(${dy})*on/${frames}'`,
    duration: frames,
  };
}

// Common Ken Burns presets (all relative to 1920×1080 center).
export const KENBURNS = {
  'slow-zoom-in': { start: { z: 1.0 }, end: { z: 1.08 } },
  'slow-zoom-out': { start: { z: 1.08 }, end: { z: 1.0 } },
  'pan-right': { start: { x: -80, z: 1.04 }, end: { x: 80, z: 1.04 } },
  'pan-left': { start: { x: 80, z: 1.04 }, end: { x: -80, z: 1.04 } },
  'pan-up': { start: { y: 60, z: 1.04 }, end: { y: -60, z: 1.04 } },
  'pan-down': { start: { y: -60, z: 1.04 }, end: { y: 60, z: 1.04 } },
  'drift': { start: { x: -40, y: 30, z: 1.02 }, end: { x: 40, y: -30, z: 1.06 } },
};

// Build an ffmpeg filter chain for a single scene.
// scene = { image, duration, effect, transitionOut?, text? }
// Returns args for ffmpeg -filter_complex plus metadata for concatenation.
export function buildSceneFilter(scene, index, totalScenes) {
  const duration = scene.duration ?? 5;
  const frames = secondsToFrames(duration);
  const effectName = scene.effect ?? 'slow-zoom-in';
  const effect = KENBURNS[effectName] || KENBURNS['slow-zoom-in'];
  const kb = kenBurnsExpr(duration, effect.start, effect.end);

  const filters = [];
  // loop image for duration, scale to 1920x1080 cover crop, then ken burns
  filters.push(`loop=loop=${frames - 1}:size=1`);
  // Force TV-range output so the final encode reports yuv420p, not yuvj420p.
  filters.push(`scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase:out_range=tv`);
  filters.push(coverCrop(WIDTH, HEIGHT)); // re-crop after scale (noop if exact)
  filters.push(`zoompan=${kb.zoom}:d=${kb.duration}:s=${WIDTH}x${HEIGHT}:fps=${FPS}`);
  filters.push(`trim=duration=${toFilterTime(frames)}`);
  filters.push(`setpts=PTS-STARTPTS`);
  filters.push('format=yuv420p');

  // Fade in at scene start
  const fadeInFrames = Math.min(FPS, Math.floor(frames / 4));
  filters.push(`fade=t=in:st=0:d=${toFilterTime(fadeInFrames)}`);

  // Optional text overlay
  if (scene.text) {
    const textLines = Array.isArray(scene.text) ? scene.text : [scene.text];
    const safeLines = textLines
      .map((l) => l.replace(/:/g, '\\:').replace(/'/g, "\\\\'").replace(/,/g, '\\,'));
    const lineExpr = safeLines.join('\\n');
    const yPos = scene.textY ?? HEIGHT - 140;
    // ffmpeg drawtext boxcolor does not accept CSS rgba(); use 0xRRGGBB@alpha.
    const boxColor = (scene.boxColor || '0x161d1d@0.45')
      .replace(/:/g, '\\:')
      .replace(/,/g, '\\,');
    filters.push(
      `drawtext=fontfile=${scene.fontFile || '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'}:` +
      `text='${lineExpr}':fontcolor=${scene.textColor || '#faf9f6'}:` +
      `fontsize=${scene.fontSize || 36}:x=(w-text_w)/2:y=${yPos}:` +
      `box=1:boxcolor=${boxColor}:boxborderw=12:` +
      `line_spacing=8:alpha='if(lt(t,0.3),0,if(lt(t,0.7),(t-0.3)/0.4,1))'`
    );
  }

  // Transition out if not the last scene
  const hasTransition = index < totalScenes - 1;
  const transitionFrames = hasTransition ? Math.min(Math.floor(FPS * 0.6), Math.floor(frames / 5)) : 0;
  if (hasTransition && transitionFrames > 0) {
    filters.push(`fade=t=out:st=${toFilterTime(frames - transitionFrames)}:d=${toFilterTime(transitionFrames)}`);
  }

  return {
    filter: `[${index}:v]${filters.join(',')}[v${index}]`,
    outputPad: `[v${index}]`,
    duration,
    transitionFrames,
  };
}

// Build a crossfade transition between consecutive scenes.
export function buildCrossfade(index, sceneA, sceneB) {
  const f = Math.min(sceneA.transitionFrames, sceneB.transitionFrames);
  if (f <= 0) return null;
  const duration = toFilterTime(f);
  return `[v${index}]fade=t=out:st=${toFilterTime(secondsToFrames(sceneA.duration) - f)}:d=${duration}[va${index}];` +
    `[v${index + 1}]fade=t=in:st=0:d=${duration}[vb${index}];` +
    `[va${index}][vb${index}]overlay=(W-w)/2:(H-h)/2:enable='between(t,0,${duration})'[x${index}]`;
}

// Build the complete concat filter graph for a list of scene filter outputs.
// Uses crossfade between scenes when transitionFrames > 0, otherwise concat.
export function buildConcatFilter(sceneOutputs) {
  const n = sceneOutputs.length;
  if (n === 0) return '';
  if (n === 1) return `${sceneOutputs[0].outputPad}format=yuv420p[outv]`;

  // Chain clips with crossfade overlaps.  currentDuration tracks the running
  // length of `current`; each new clip starts currentDuration - overlap seconds
  // in, so the output grows by (nextDuration - overlap).
  let current = sceneOutputs[0].outputPad;
  let currentDuration = sceneOutputs[0].duration;
  let graph = '';
  for (let i = 0; i < n - 1; i++) {
    const a = sceneOutputs[i];
    const b = sceneOutputs[i + 1];
    const f = Math.min(a.transitionFrames, b.transitionFrames);
    if (f > 0) {
      const overlap = toFilterTime(f);
      const offset = toFilterTime(Math.max(0, secondsToFrames(currentDuration) - f));
      graph += `${current}[v${i + 1}]xfade=transition=fade:duration=${overlap}:offset=${offset}[x${i}];`;
      current = `[x${i}]`;
      currentDuration += b.duration - f / FPS;
    } else {
      graph += `${current}[v${i + 1}]concat=n=2:v=1:a=0[c${i}];`;
      current = `[c${i}]`;
      currentDuration += b.duration;
    }
  }
  graph += `${current}format=yuv420p[outv]`;
  return graph;
}
