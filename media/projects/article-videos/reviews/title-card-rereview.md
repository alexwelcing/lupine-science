# Title-card component re-review

## Decision: REJECT — one P1 automation blocker remains

The three original visual/semantic failures are materially fixed. The exact 88-character title, exact 52-character deck, and combined stress fixtures are publication-quality: no overlap, clipping, title-safe breach, or caption-zone collision is visible, and strict layout inspection is clean. The restrained wash drift also resolves the frozen-hold defect without disturbing title readability, and the former render-debug chrome now carries article provenance.

One acceptance criterion is not yet met: the existing fixture inspection path does not discover or execute `compositions/title-card.motion.json`. The sidecar contains `keepsMoving`, and the pixels independently prove that the wash moves, but a deliberately broken `withinSelector` in that nested sidecar still lets `inspect --strict` exit 0. A root-level `index.motion.json` negative control fails correctly with `motion_selector_missing`. The liveness assertion therefore exists but is not currently an active regression gate for the QA fixtures.

## Review record

- Article/video: The 0.2% Synthesis Problem reusable title card
- Re-review ticket: `t_10c6f669`
- Source fix task: `t_7ef55867`
- Component: `compositions/title-card.html`
- Motion sidecar: `compositions/title-card.motion.json`
- QA fixtures: `components/title-card/fixtures/{default,long-title,long-deck,combined-worst-case}`
- Reviewer: reviewer profile
- Review date: 2026-07-10
- Lowest score: 6.5/10 (automated motion-regression coverage)
- P0 count: 0
- P1 count: 1
- Decision: `REJECT`

## Resolved blocker verification

### 1. Reusable copy safety — PASS, 9/10

- Declared limits are now title `88` and deck `52` in both the variable schema and runtime `copyLimits`.
- The long-title fixture uses exactly 88 characters; the long-deck fixture uses exactly 52 characters.
- All four fixtures independently pass:
  - lint: 0 errors, 0 warnings;
  - validate: no console errors; 34 text elements pass WCAG AA;
  - `inspect --strict`: 0 layout issues across 9 samples.
- Visual review of the exact-limit and combined frames confirms:
  - no title/episode, title/deck, or provenance/title collision;
  - no clipping or canvas overflow;
  - the deck remains above the caption reserve beginning at y=828;
  - title hierarchy remains comfortably readable at the 72px subheadline floor.
- Explicit unsupported-input controls fail clearly:
  - 89-character title: validation exit 1, `[title-card] title is 89 characters; the tested maximum is 88.`
  - 53-character deck: validation exit 1, `[title-card] deck is 53 characters; the tested maximum is 52.`
  - pathological but in-range 88-wide-character title: validation exit 1 with a concrete fit-box error and “shorten or rewrite it.”
  - pathological but in-range 52-wide-character deck: validation exit 1 with a concrete one-line fit-box error and “shorten or rewrite it.”

### 2. Frozen hold — VISUAL PASS, 9/10

Fresh 1920×1080 snapshots with all three local fonts loaded reproduce the persistent combined fixture exactly.

- 1.8s SHA-256: `b1f88a7360d2721b94bf6c9f4aad4c5a550f757c5688bcf13dffa8d694f6a636`
- 5.8s SHA-256: `999ec275d34a5a9058dbbbe5097c4d7229a78ffde9e63c91f193bd318371c712`
- ImageMagick absolute-error pixel count: `529156`

The same non-identical result holds for the long-title (`530027` differing pixels) and long-deck (`532357` differing pixels) fixtures. The wash drifts subtly while all copy remains stationary and readable.

### 3. Article provenance — PASS, 8.5/10

The generic `OPENING TRACE / 1920 × 1080 / 30 FPS` block is gone. The evidence column now binds `section`, `publicationDate`, `evidenceCount`, and `proofId` variables.

The default article values are traceable:

- headline: `The 0.2% Synthesis Problem`;
- publication date: `2026-07-09`, matching the article JSON-LD;
- evidence count: `11 SOURCES`, matching the article’s 11 footnote entries;
- provenance labels were verified and persisted by the director in the source-task handoff.

### 4. Brand and frame compliance — PASS, 9/10

- Visible colors remain within locked paper `#faf9f6`, ink `#1a1a1a`, and indigo `#3d4db3`, using alpha variants only.
- Newsreader and IBM Plex Mono are local and are the only type families.
- Exact-limit title remains at the published 72px subheadline floor; deck remains at the 48px body floor; mono evidence chrome remains 36px.
- Canonical mark, asymmetrical evidence trace, warm paper field, and proof-first metadata remain visually distinctive and publication-quality.

## Remaining release blocker

### P1 — `keepsMoving` is not executed by the existing fixture inspection path

**Criterion:** Re-review acceptance criterion 4; motion regression coverage  
**Evidence:** `compositions/title-card.motion.json:13`; fixture-level negative-control inspection  
**Score:** 6.5/10

The sidecar correctly declares:

- `kind: keepsMoving`
- `withinSelector: .title-card-wash`
- `maxStaticSec: 1.4`

However, each QA project mounts `compositions/title-card.html` as a nested sub-composition. Replacing the nested sidecar selector with `.definitely-missing` and running `npx hyperframes@0.7.48 inspect --strict` still exits 0. This proves that the current “all fixtures pass strict inspection” result does not execute the component sidecar.

Control: adding the same deliberately broken assertion as root `index.motion.json` makes inspection exit 1 with:

`motion_selector_missing .definitely-missing — matched no element in any sampled frame`

**Required fix:** make liveness an executable fixture-level gate. Add a root-discoverable `index.motion.json` (or an equivalent supported harness) to each QA fixture, targeting the mounted `.title-card-wash`, and ensure the fixture check script runs it. Verify both:

1. the real assertion passes; and
2. a temporary missing selector or frozen-wash negative control fails non-zero.

Do not change the successful ambient motion or visual layout.

## Technical command results

- Project `npm run check`: exit 0; lint 0 errors with 3 unrelated pre-existing `data-chart.html` warnings, validate clean with 34 WCAG-AA text elements, inspect 0 layout issues across 52 samples.
- Four QA fixtures: lint/validate/`inspect --strict` all exit 0 with zero fixture findings.
- Motion-discovery negative control: nested component sidecar exits 0 (failure of coverage); root `index.motion.json` exits 1 (expected control behavior).

## Re-review condition

Approve once the QA fixture path demonstrably executes the liveness assertion and its negative control fails. No further visual, copy-capacity, provenance, palette, or typography changes are requested.
