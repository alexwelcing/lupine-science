# Lower-third component review

## Decision: REJECT

The default source and caption frames are legible, on-palette, and precisely placed, but the component is not publication-ready as a reusable series primitive. It accepts unbounded copy and silently clips it, the source layout intrudes 84px into the reserved caption zone, both modes become pixel-frozen after roughly one second, and the supplied motion sidecar neither covers caption mode nor asserts liveness. The trace is competent brand styling, but it currently appears as a local border reveal rather than the distinctive evidence-trace handoff specified by `frame.md`.

## Review record

- Article/video: reusable Lupine Science lower-third component
- Review ticket: `t_6e2d6fef`
- Source task: `t_5a4cb2c7`
- Component: `compositions/lower-third.html`
- Motion contract: `compositions/lower-third.motion.json`
- Review fixtures: `/home/alex/.hermes/kanban/boards/article-videos/workspaces/t_6e2d6fef/{source,caption,stress-source,stress-caption}`
- Frame evidence: each fixture's `snapshots/frame-00-at-0.1s.png` through `frame-05-at-5.8s.png`; sequence sheets at workspace root
- Reviewer: reviewer profile
- Review date: 2026-07-10
- Lowest score: 2/10 (unbounded-copy robustness)
- P0 count: 1
- P1 count: 4
- Decision: `REJECT`

## What succeeds

### Palette, type, and default safety — PASS, 8.5/10

- The component uses only locked paper, ink, indigo, and slate tokens: `#faf9f6`, `#1a1a1a`, `#3d4db3`, and `#6b7c8e`. The 0.96 paper alpha is allowed.
- Local Newsreader and IBM Plex Mono WOFF2 assets are declared; there is no network font dependency in the component.
- All visible default copy is at least 48px: source tag/detail 48px, source claim 58px, caption 50px. This exceeds the task's 48px floor and the frame system's 36px mono-label floor.
- The caption panel exactly matches the normative caption zone: x=192–1728 and y=828–954. The normal caption fixture remains readable and unclipped.
- The source panel remains inside title-safe and within the 1152px maximum width.
- Default source and caption fixtures both pass WCAG contrast validation with no console errors.

### Baseline hierarchy — PASS, 7.5/10

The default source frame has a clear three-level hierarchy: mono evidence tag, 58px Newsreader claim, then slate provenance. The evidence dot and registration tick add useful scientific chrome without adding a new hue. The caption is centered, restrained, and comfortably readable. Neither default mode visibly clips or collides with itself.

## Release blockers

### P0 — Unbounded variables silently destroy copy

**Criterion:** Input limits; typography; reusable-component integrity  
**Evidence:** `lower-third.html:4-9`, `lower-third.html:154-232`; stress fixtures and stress `inspect.json` reports  
**Score:** 2/10

The schema declares `tag`, `line`, and `detail` as unconstrained strings. There are no `maxLength` values, no mode-specific limits, and no runtime fit/overflow validation. Fixed one-line source rows and a fixed two-line caption box therefore advertise effectively unlimited input while supporting sharply finite capacity.

The independent source stress fixture produces visible tag/claim overlap and silently ellipsizes provenance. HyperFrames reports:

- `.source-line`: 3316px of text in a 772px box, 2544px right overflow;
- `.source-detail`: 2949px of text in a 772px box, 2177px right overflow;
- four persistent `clipped_text` / `text_box_overflow` errors.

The caption stress fixture silently discards more than half the narration. HyperFrames measures about 280px of text in a 118px box, reports 165–170px vertical overflow, and records three persistent layout errors. `validate` still exits cleanly because the component never throws a clear authoring error.

**Required fix:**

1. Add tested, mode-specific `maxLength` values to the variable schema. `line` cannot honestly share one universal limit because source mode is one line at 58px while caption mode allows two lines at 50px.
2. Validate non-empty strings and Unicode code-point lengths synchronously, with an explicit `[lower-third]` error that tells the animator to shorten unsupported copy.
3. After fonts are ready, verify `scrollWidth` / `scrollHeight` against each fixed box and fail clearly rather than relying on `overflow:hidden` or ellipsis for load-bearing copy.
4. Add boundary fixtures at every declared maximum and combined worst cases for source and caption modes; gate them with strict inspection.

### P1 — Source mode occupies the reserved caption zone

**Criterion:** Lower-third/caption collision safety  
**Evidence:** `lower-third.html:64-97`; `frame.md:29-41`, `frame.md:265-269`  
**Score:** 5/10

The source panel spans y=738–912. The caption reserve begins at y=828, so source mode occupies 84px of the protected caption zone. Removing the internal caption panel prevents the two component variants from overlapping each other, but it does not make source mode safe alongside a film's independent caption track. It instead makes the modes mutually exclusive by construction.

**Required fix:** Provide a compact source/name geometry that stays above y=828 whenever captions are enabled, or expose and enforce an explicit caption-presence contract with a tested compact variant. A reusable article-video lower third should not require producers to discover this collision in the final composite.

### P1 — Both modes pixel-freeze, and the sidecar cannot catch it

**Criterion:** Motion; static-slide rejection; motion assertions  
**Evidence:** `lower-third.html:293-366`, `lower-third.motion.json:1-8`; source/caption sequence sheets and liveness inspection  
**Score:** 4/10

All source tweens finish at about 1.05s and all caption tweens by about 0.90s. ImageMagick reports zero differing pixels between the 3.0s and 5.0s snapshots in both modes. When the missing liveness assertion is added to mounted QA fixtures, HyperFrames reports:

- source: `motion_frozen`, 1.1–6.0s (4.9s static);
- caption: `motion_frozen`, 0.9–6.0s (5.1s static).

The supplied sidecar has only three source-mode assertions. It has no `keepsMoving`, no caption selectors, no caption ordering, and no caption in-frame assertion. Because the gallery `index.html` currently mounts only `title-card.html`, the project-level `inspect` result does not exercise this lower third at all.

**Required fix:** Add restrained, finite, seek-safe visual evolution during the hold while keeping the words still for reading. Add separate mounted source/caption QA fixtures with mode-appropriate `appearsBy`, `before`, `staysInFrame`, and `keepsMoving` assertions. Do not claim caption coverage from a sidecar whose selectors only exist in source mode.

### P1 — The evidence trace is a border reveal, not yet a signature handoff

**Criterion:** Indigo evidence trace; visual distinctiveness  
**Evidence:** `lower-third.html:104-152`, `lower-third.html:298-365`; 0.1s/0.5s/1.0s/3.0s sequence sheets  
**Score:** 6/10

The 4px indigo line draws left-to-right and becomes the panel's top rule, which is clean and on-brand. But it begins and ends inside the lower-third panel; it does not visibly arrive from the outgoing scene, carry a datum, or transform into the rule. In caption mode, the short left/right rules appear as disconnected decorative dashes. The motion reads as a polished fade/slide package rather than the frame system's evidence trace crossing the paper and resolving causally into incoming structure.

**Required fix:** Author the lower third to accept the shared 12-frame line handoff: the incoming line should have a visible origin or cursor, land on the panel, and resolve into the final rule/tick geometry before copy appears. The trace should explain why the provenance is appearing, not merely decorate it.

### P1 — Generic unprefixed root ID violates the assembly contract

**Criterion:** HyperFrames reusable-component correctness  
**Evidence:** `lower-third.html:54-62`, `lower-third.html:254-262`, `lower-third.html:287-291`  
**Score:** 6/10

The template uses `id="root"` and global `document.querySelector("#root")`. HyperFrames' composition contract requires IDs to be unique across the assembled page and prefixed within sub-compositions. A generic root selector is fragile when the gallery grows or the component is mounted more than once.

**Required fix:** Use a composition-prefixed identifier and scope all DOM queries to the mounted composition root rather than the first global `#root` match. Add a multi-mount fixture if repeated lower thirds are an intended production use.

## Automated verification

### Project-level commands

- `npx hyperframes lint --json`: 0 errors; one unrelated `composition_file_too_large` warning in `data-chart.html`.
- `npx hyperframes validate --json`: 0 runtime errors and 0 contrast failures.
- `npx hyperframes inspect --json --samples 15`: 0 issues, but the gallery mounts only the title card, so this is not evidence for lower-third modes.

### Mounted lower-third fixtures

- Normal source and caption: lint 0 errors/0 warnings; validate 0 runtime/contrast failures; baseline layout inspection clean.
- Source stress: 4 layout errors plus off-canvas informational findings.
- Caption stress: 3 layout errors plus off-canvas informational findings.
- Required liveness inspection: one `motion_frozen` error in each mode.
- Pixel comparison: 3.0s and 5.0s are exactly identical in each mode (0 differing pixels).

The optional animation-map helper was not used as evidence: its isolated bootstrap failed to register the mounted sub-composition timeline and emitted a zero-tween map, which the HyperFrames animation skill explicitly treats as an invalid audit. Snapshot seeking and `inspect` did register and animate the component correctly.

## Applicable checklist scores

| Criterion | Score | Result |
|---|---:|---|
| Palette and brand fidelity | 9/10 | PASS |
| Default typography and contrast | 9/10 | PASS |
| Default hierarchy and composition | 7.5/10 | PASS |
| Caption-zone placement | 9/10 | PASS |
| Source/caption coexistence safety | 5/10 | FAIL (P1) |
| Entrance choreography | 7/10 | PASS, minimum bar only |
| Evidence-trace distinctiveness | 6/10 | FAIL (P1) |
| Sustained motion / no static slide | 4/10 | FAIL (P1) |
| Reusable copy robustness | 2/10 | FAIL (P0) |
| Motion-sidecar coverage | 4/10 | FAIL (P1) |
| HyperFrames component integration | 6/10 | FAIL (P1) |

Audio, full-film narrative arc, final H.264 encode, WebVTT synchronization, cue-point extraction, identity in the first/final two seconds, and director sign-off are not applicable to this isolated component review.

## Brilliant improvement to try

Turn the rule into a **provenance stylus**. Let a tiny indigo measurement cursor arrive from the outgoing chart/claim anchor, draw the 12-frame rule, drop one perpendicular registration tick at the exact point where the source label begins, then make one slow finite pass along the rule during the hold. As the cursor passes, the source metadata resolves in its wake; in caption mode, it splits once at center and becomes the two flanking caption rules. This gives both modes one causal motion grammar, makes the shared transition physically continuous, and prevents pixel freeze without moving the words.

## Re-review acceptance criteria

- Tested `maxLength` values are declared for every string variable, and boundary/worst-case fixtures pass without clipping, overlap, ellipsis of required copy, or font sizes below the published floor.
- Unsupported copy fails clearly before render rather than silently degrading.
- A source lower third can coexist with the reserved caption zone, or a caption-presence contract and compact source variant are explicit and tested.
- Source and caption 3.0s/5.0s frames are not pixel-identical while text remains stable and readable.
- Mode-specific motion assertions, including liveness, pass for mounted source and caption fixtures.
- The indigo trace visibly accepts the shared scene handoff and causally resolves into rule/tick geometry.
- Root IDs/selectors comply with the sub-composition assembly contract.
- `lint`, `validate`, and strict `inspect` pass on the actual lower-third gallery fixtures, not only on another mounted component.
