# Indigo-line transition review

## Decision: REJECT

The default 0.4-second demo is visually clean and recognizably Lupine Science, but the deliverable is not publication-ready as a reusable series signature. The isolated transition fails HyperFrames validation because its declared italic font file is missing; the helper breaks its own nonzero `at` option with a pre-transition scene inversion and hard jump; and the final “resolution” is a crossfade between two unrelated lines rather than one evidence trace becoming the lower-third rule. These are release blockers, not polish requests.

## Review record

- Article/video: Lupine Science shared article-video transition system
- Review ticket: `t_da887793`
- Deliverable: `media/projects/article-videos/compositions/transition-wipe.html`
- Governing spec: `media/projects/article-videos/frame.md`
- Checklist: `media/projects/article-videos/ARTICLE_VIDEO_REVIEW_CHECKLIST.md`
- Reviewer: Hermes `reviewer`
- Review date: 2026-07-10
- Evidence: isolated 1920×1080 snapshots at 0.0, 0.1, 0.2, 0.3, 0.39, and 0.4 seconds; 13-point 30 fps repeatability grid; delayed-`at` fixture at 0.0–0.9 seconds
- HyperFrames CLI: 0.7.49
- Lowest score: 3/10 (reusable helper behavior)
- P0 count: 1
- P1 count: 3
- Decision: `REJECT`

## Gate summary

| Criterion | Score | Result |
| --- | ---: | --- |
| 12-frame timing, determinism, seek safety | 5/10 | FAIL |
| Resolution into lower-third rule at y=738 | 6/10 | FAIL |
| Locked palette and local fonts | 6/10 | FAIL |
| Collision, clipping, overlap | 9/10 | PASS for the default demo |
| Reusable helper API and documentation | 3/10 | FAIL |
| HyperFrames lint / validate / inspect | 6/10 | FAIL |
| Signature quality | 6/10 | FAIL |

## Release-blocking findings

### P0 — The reusable `at` option reverses the scene before the transition and hard-jumps at the handoff

**Location:** `compositions/transition-wipe.html:334-357`

The public helper advertises `at`, but its initial states are installed with `timeline.set(..., config.at)`. Before a nonzero `at`, the incoming scene remains in its authored state at `x: 0` and sits above the outgoing scene because it has `z-index: 2`. At `at`, the helper abruptly moves the incoming scene to `x: -1920`, revealing the outgoing scene, and only then begins the wipe.

An isolated fixture using the helper exactly as exposed—`addIndigoLineWipe(timeline, { at: 0.5 })`—showed:

- 0.00, 0.25, and 0.49 s: the **incoming** scene is fully visible.
- 0.50 s: the frame hard-jumps to the **outgoing** scene.
- 0.50–0.90 s: the intended wipe then runs.

This makes the helper unusable at an ordinary later position in a film and violates the HyperFrames rule against delayed `set` initialization for later-scene clips.

**Required fix:** Establish reusable initial state synchronously at timeline time 0 (or in authored CSS) and make the transition tween begin at `at`. Add an automated fixture that invokes the helper at a nonzero timestamp, seeks both forward and backward across the boundary, and asserts: outgoing visible before `at`, no discontinuity at `at`, incoming visible after `at + duration`.

### P1 — Isolated HyperFrames validation fails because the local italic font is missing

**Location:** `compositions/transition-wipe.html:16-21`, used at `:175-178`

The file declares `fonts/newsreader-italic-var.woff2`, and the incoming emphasized word uses italic Newsreader, but that WOFF2 file is absent from `compositions/fonts/`. It exists only at `assets/brand/newsreader-italic-var.woff2`. The browser synthesizes a fallback italic instead of using the locked local asset.

Isolated command results:

- `npx hyperframes lint` — PASS, 0 errors, 0 warnings.
- `npx hyperframes validate` — **FAIL**, 2 errors:
  - `404 loading fonts/newsreader-italic-var.woff2`
  - `Failed to load fonts/newsreader-italic-var.woff2: net::ERR_ABORTED`
- `npx hyperframes inspect --samples 15` — PASS, 0 errors, 0 warnings.

The earlier project-level validate result is not evidence for this component: it loaded the six-second assembled `index.html` title card rather than the standalone 0.4-second transition. Isolating the deliverable exposes the missing asset.

**Required fix:** Copy the canonical italic WOFF2 into `compositions/fonts/` (or use a correct local relative path), then rerun validate on an isolated project whose `index.html` is this transition. Require all four declared faces to load.

### P1 — The vertical trace does not actually resolve into the horizontal rule

**Location:** `compositions/transition-wipe.html:347-404`

The final three frames start a separate horizontal `scaleX` reveal from x=96 while the vertical travelling trace is near the right side and independently fades out. At 0.30 s, the snapshot visibly contains a long horizontal rule growing from the left and a disconnected vertical trace near the right edge. There is no shared joint, path, anchor, or continuous geometry. The result reads as “one line disappears while another appears,” not the frame-system promise that the evidence trace “resolves into a rule.”

The endpoint geometry itself is correct: at exactly 0.4 s, exact-indigo pixels occupy x=96–1823 on y=738 (1728 px), matching `frame.md`. The failure is the causal handoff into that endpoint.

**Required fix:** Make the two strokes one continuous construction. The horizontal rule should share a visible junction with the moving trace throughout the final phase; the trace should collapse into that junction rather than crossfade independently.

### P1 — Runtime and pixel repeatability are not yet robust enough for the deterministic contract

**Location:** `compositions/transition-wipe.html:7`, plus final trace/wash tween at `:396-404`

GSAP is loaded from jsDelivr. A render-time network dependency is prohibited by the HyperFrames deterministic contract and makes cold/offline rendering contingent on external availability and version delivery. Vendor or reference the project-local runtime instead.

Repeat snapshots at the five principal anchors (0.0, 0.1, 0.2, 0.3, 0.4 s) were byte-identical. However, a repeated 13-point 30 fps grid produced two non-identical frames: frame 8 differed in 11 pixels within a one-pixel column, and frame 11 differed in 191 pixels within a one-pixel column. Both variances occur on composited edge geometry. They are visually tiny, but byte-exact repeatability is not clean across the complete wipe.

**Required fix:** Remove the network runtime, then add a deterministic frame-grid test that renders all 12 transition frames twice in fresh browser contexts and pixel-compares them. Stabilize subpixel positions/opacity or capture synchronization until the grid is identical.

## Passing evidence

### Default visual layout — PASS

The default snapshots at start, midpoint, late phase, and exact endpoint show no unintended text collision, clipping, or off-canvas critical content. Mid-wipe overlap is intentional and legible: the incoming scene occludes the outgoing scene behind a crisp moving indigo boundary. The final scene is clean, correctly framed, and has a clear hierarchy.

### Frame system and palette — PASS except for font delivery

Visible CSS colors stay within the locked palette: paper `#faf9f6`, ink `#1a1a1a`, indigo `#3d4db3`, slate `#6b7c8e`, and permitted indigo alpha variants. Typography roles correctly assign Newsreader to claims and IBM Plex Mono to evidence chrome. Published sizes and contrast pass; isolated validation reported zero contrast failures. The missing italic asset prevents the overall font gate from passing.

### Duration and endpoint — PASS

The composition declares 1920×1080, 30 fps, and 0.4 seconds: exactly 12 frames by the frame-system duration convention. The exact 0.4-second frame resolves to the incoming scene with the 4 px indigo rule at y=738, x=96–1824 exclusive, as specified.

## Helper API review

The API has useful selector overrides, a duration parameter, a chainable return value, and a concise purpose comment. It is not sufficiently documented or guarded for a reusable series primitive:

- No parameter contract documents required GSAP version, accepted selector/element types, coordinate assumptions, or caller-owned initial state.
- `options` is not defaulted explicitly and no validation reports missing targets or invalid duration.
- Motion constants `-1920` and `96` are hard-coded rather than named/documented frame-system constants.
- Global IDs and `window.addIndigoLineWipe` make multiple instances collision-prone.
- No fixture exercises selector overrides, multiple instances, a nonzero `at`, backward seeking, or missing elements.

After fixing initial-state timing, document a small contract with inputs, assumptions, postconditions, and one nonzero-`at` example. A reusable helper should fail loudly on missing targets and should support scoped elements or a root container rather than page-global IDs.

## One brilliant improvement

Turn the wipe into a literal **measured evidence trail**: as the vertical survey trace crosses the frame, let it leave a 4 px horizontal line behind it precisely at y=738. During the final three frames, contract the vertical trace from both ends into the live junction at `(currentX, 738)` while the measured trail completes to x=1824. The last remnant of the moving trace then becomes the final pixel of the lower-third rule—one continuous causal gesture, not a dissolve. This would make the transition unmistakably Lupine Science and materially stronger as a repeatable series signature.

## Re-review acceptance criteria

1. Isolated `lint`, `validate`, and 15-sample `inspect` all report zero errors and zero warnings.
2. All four local WOFF2 faces load; no font 404 or synthesized italic remains.
3. No network URL is required at render time.
4. A helper call with `at > 0` shows outgoing before the boundary, has no boundary jump, and is seek-safe in both directions.
5. Two fresh renders of every transition frame are pixel-identical.
6. Start/mid/end snapshots remain collision- and clipping-free.
7. The moving trace maintains a continuous geometric relationship to the y=738 rule during the final three frames.
8. Public helper options and assumptions are documented and covered by a reusable fixture.
