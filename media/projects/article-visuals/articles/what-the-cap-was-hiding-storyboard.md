# Storyboard: What the Cap Was Hiding

**Slug:** `what-the-cap-was-hiding`
**Output prefix:** `what-the-cap-was-hiding-`

## Article core narrative

A preregistered Round-4 trial asked whether a theorem-licensed correction to universal machine-learned interatomic potentials would transfer to held-out materials. It failed. Reopening the algebra rather than the conclusion showed why: the gate deciding which corrections were licensed compared `|b − 1|` against a calibration spread with a `b ≥ 0.5` floor, and a single identity — `b²(r−1)² − (r−b)² = r(b−1)(r(1+b) − 2b)` — proves that dividing by a bias `b` improves a case if and only if the ratio `r` lies on the far side of the harmonic mean `H(b) = 2b/(1+b)` from 1. No hull, no spread, no cap. Every gate in the implementation was a conservative proxy for that one comparison. Of the 66 cases the cap refused, 34 were inside the calibration hull and 32 of those would have been improved by the very bias that was refused. The gate was not protecting the result; it was discarding it. Two further defects surfaced the same way: the perovskite confirmatory test could not have reached significance in principle (a two-sided exact sign test on 4 observations bottoms out at p = 0.125 against α = 0.10), and a proposed escape statistic turned out to measure panel bookkeeping rather than physics.

---

## 00 — Hero

- **Filename:** `hero`
- **Title:** The gate that discarded what it was meant to protect
- **Type:** generated-image
- **Single idea:** A conservative gate rejects most of what passes it, and the rejected material is indistinguishable from what it let through.
- **Why this image:** The article's finding is not that the correction was wrong but that the *gate* was a lossy proxy — it refused 66 of 94 possible cases, and 32 of those refusals were provably improvable. The visual must make "refused material identical to accepted material" legible without a chart or any text.
- **Generation method:** MiniMax `image-01` via `~/.hermes/skills/lupine-media-director/scripts/minimax_client.py image`
- **Aspect:** 16:9
- **Prompt (verbatim, includes the mandated brand suffix):**

  > A laboratory specimen-sorting bench: a narrow mechanical gate with an adjustable aperture plate stands across a shallow track of small flat metal test coupons; most coupons are diverted into a wide reject tray at one side while only a few continue toward a compact measurement rig. The rejected coupons are identical in size and finish to the accepted ones. The aperture plate is the single indigo element. editorial scientific minimalism, warm off-white `#faf9f6` paper background, single indigo `#3d4db3` light/accent, near-duotone, generous negative space, calm and premium, no text, no people, no flowers, no neon.

- **Caption (shipped):** A dense field of refused cases banked against a single indigo gate, and the three that were let through continuing across open paper.
- **Status:** shipped as `candidate-v4`. Four candidates were generated; the first three were rejected. Assessment below.

## Candidates and why v4 won

Palette measured programmatically against the brand targets (background → `#faf9f6`, accent → `#3d4db3`); assets in `assets/what-the-cap-was-hiding/`.

| Candidate | bg | bg→paper | accent | acc sat | warmth | Verdict |
|---|---|---|---|---|---|---|
| v1 | `#ececec` | 22 | `#0676f3` | 237 | 0 | **reject** — accent twice brand saturation, neutral-grey background, reads as product photography; gate reads as a decorative acrylic block |
| v2 | `#dbeaf0` | 35 | `#508dab` | 91 | −21 | **reject** — drifted cool blue-grey, no indigo accent, clearly a 3D render (a brand-law no-go), no legible gate or tray |
| v3 | `#e9eef2` | 21 | `#527c8a` | 56 | −9 | **reject** — best composition of the three, but **pseudo-text glyph artifacts on the tray coupons** (hard ban), no indigo accent, cool cast |
| **v4** | `#fefef2` | **8** | `#0a3273` | 105 | +12 | **ship** — warm paper, line-art register, single deep-indigo accent, zero text artifacts (verified at 3× zoom on both the dense field and the three passed rectangles) |

Brand indigo saturation for reference is 118; paper warmth (R−B) is +4.

**The lesson that produced v4.** v1–v3 asked for *photographic laboratory scenes*. The house register is **editorial line-art illustration on warm paper** — see `scripts/generate-brand-assets-minimax.mjs`, whose `STYLE` constant is the authoritative brand prompt block and is far more emphatic than the brand-law suffix alone: *"ABSOLUTELY NO text, no letters, no numbers, no typography, no words, no captions, no labels anywhere in the image"*, plus explicit bans on glossy 3D renders and chrome. Use that `STYLE` string for any future article hero. v4 is `SUBJECT + STYLE`.

**Honest limitation.** The intent was that refused and accepted shapes be visibly *identical*. In v4 the refused mass reads as dense tally strokes while the three that passed are clean rectangles, so "indistinguishable from what was let through" is only partly carried by the image; the caption therefore does not claim it. A future pass could tighten this.

**Calibration note.** The approved brand corpus does not hit `#3d4db3` exactly either — the closest curated wide assets score accents at `#3a60bc`, `#2a5fb3`, `#1f67b7`. v4's accent sits in the same family, so it was not held to a stricter standard than accepted house assets.

## Provenance

Generated assets must remain traceable to prompt and source (`conventions/brand-law.md`). Model: MiniMax **`image-01`** (not "M3") via `~/.hermes/skills/lupine-media-director/scripts/minimax_client.py image`, authenticating from `~/.hermes/auth.json`. Regenerate v4 with `SUBJECT + STYLE` where `SUBJECT` is:

> a narrow indigo slot standing upright across the centre of the frame; to its left a dense crowded field of many identical small blank ink rectangles pressed together, unable to pass; to its right only three of the same blank rectangles continuing freely across vast empty paper; the rectangles on both sides drawn identically to show that what was refused is indistinguishable from what was let through, sparse precise line art on warm paper

and `STYLE` is the `STYLE` constant from `scripts/generate-brand-assets-minimax.mjs`.

Derivatives (`hero.webp`, `hero.avif`) come from `scripts/build-media.mjs`, which resizes to width 1600. **That script currently crashes in this environment** — `ModuleNotFoundError: No module named 'imageio_ffmpeg'`, raised in its video section before images are reached. Pre-existing and unrelated to this asset. The hero is registered in its `PICTURES` list so derivatives generate once that dependency is installed; until then the built page references `hero.jpg` only, with no broken `webp`/`avif` references.
