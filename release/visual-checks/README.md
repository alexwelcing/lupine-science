# Publication visual checks

Deterministic Playwright visual regression checks for publication components, rendered video frames, and R3F scenes.

## Commands

- `npm test` — unit tests for manifest validation, determinism, baseline policy, scene checks, and gate reports.
- `npm run visual:test` — run checks in `visual/manifest.json` against approved baselines.
- `npm run visual:ci` — the same gate with CI behavior enabled.
- `npm run visual:selftest` — start the included deterministic fixture and test component, video-frame, and scene checks.
- `VISUAL_APPROVE_BASELINES=reviewed npm run visual:update` — explicitly regenerate baselines after reviewing all intended visual changes.
- `VISUAL_APPROVE_BASELINES=reviewed npm run visual:selftest:update` — regenerate only the included self-test baselines.

`visual:update` intentionally refuses to run unless `VISUAL_APPROVE_BASELINES=reviewed` is present. Baseline PNG changes must be reviewed like source changes; inspect the image diff and the corresponding publication change before approval. CI must never set the acknowledgement variable or run an update command.

## Manifest

Set `VISUAL_MANIFEST=/repo/path/manifest.json` to use another manifest. All checks require unique `id`, `kind`, and `url` values. Supported kinds:

- `page`: captures the full viewport.
- `component`: captures `selector`.
- `video-frame`: pauses the HTML media element at `timeSeconds` and captures `selector` after the seek completes.
- `r3f`: calls the page's scene probe, validates it, attaches the scene JSON, then captures the page or `selector`.

Manifest-level `seed`, `epochMs`, and `viewport` values fix random numbers, time, device scale, locale, timezone, animation behavior, and rendering dimensions. Each check defaults to zero differing pixels. A check may explicitly set `threshold` (maximum differing-pixel ratio) or `maxDiffPixels` only when a reviewed use case requires tolerance.

A page containing 3D content must expose a fail-closed probe:

```js
globalThis.__LUPINE_VISUAL_SCENE__ = () => ({
  objectNames: ['MainCamera', 'Crystal'],
  objectCount: 2,
  camera: { type: 'PerspectiveCamera', position: [0, 0, 5] }
});
```

Use `scene.requiredObjects`, `scene.minObjectCount`, and `scene.cameraType` in the check. A missing or malformed probe fails the check rather than silently accepting only the canvas pixels.

## Gate output

Every run writes:

- `visual-results/visual-gate.json` — schema-versioned overall status, counts, and pass/fail/error data per check.
- `visual-results/visual-gate.junit.xml` — JUnit XML for CI test ingestion.
- `visual-results/artifacts/` — actual, expected, diff, trace, and failure screenshots when Playwright detects a mismatch.

A CI gate consumes the process exit code and `visual-gate.json.passed`. The JSON and JUnit summaries deliberately omit wall-clock timestamps and durations so identical inputs produce byte-identical gate output.

## Reproducibility and corruption check

Run `npm run visual:selftest` twice and compare the two gate files byte-for-byte. To verify the negative path, copy one baseline, replace pixels in the working copy, run the self-test and confirm a non-zero exit plus a failed check in JSON, then restore the exact approved baseline. Never run the update command as the corruption test because that approves the corrupted image.
