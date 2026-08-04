# Core Web Vitals performance audit — 2026-07-10

## Scope and method

Audited the local production-shaped static server (`npm run dev`, `public/_headers` enabled) with Lighthouse 13.4.0 in its default mobile throttling profile. The same three URLs were measured immediately before and after the changes, using Google Chrome in headless mode:

- `/`
- `/articles/`
- `/articles/a-field-not-a-neural-net/`

Lighthouse cannot measure field INP without real user interactions. Total Blocking Time (TBT) and the long-task trace are used here as the laboratory responsiveness proxy. Production CrUX/RUM data is still required to claim field CWV pass/fail.

## Before / after

| Page | Perf score | FCP | LCP | TBT (INP proxy) | CLS | Speed Index |
|---|---:|---:|---:|---:|---:|---:|
| Home — before | 65 | 1,365 ms | 3,001 ms | 3,304 ms | 0.0268 | 1,525 ms |
| Home — after | **95** | 1,388 ms | **2,852 ms** | **25 ms** | 0.0268 | **1,388 ms** |
| Articles — before | 87 | 1,956 ms | 3,829 ms | 0 ms | 0.0222 | 1,956 ms |
| Articles — after | 87 | 1,953 ms | 3,827 ms | 0 ms | 0.0222 | 1,953 ms |
| Sample article — before | 80 | 2,782 ms | 4,507 ms | 0 ms | 0.0355 | 2,782 ms |
| Sample article — after | 80 | 2,779 ms | 4,504 ms | 0 ms | 0.0355 | 2,779 ms |

The homepage change removes 3,279 ms of lab blocking time (99.2%) and raises the Lighthouse performance score by 30 points. CLS remains comfortably under the 0.1 “good” threshold on all three routes. The article routes have no blocking-time problem; their remaining mobile LCP is primarily throttled render-blocking CSS and oversized 1280 px raster assets.

Raw Lighthouse JSON is retained in the task workspace under `lighthouse/before-*.json` and `lighthouse/after-*.json`.

## Changes

1. **Canvas / responsiveness**
   - The homepage’s computational canvas now draws at a maximum of about 30 fps on larger screens rather than consuming every animation frame.
   - At the mobile breakpoint and for reduced-motion users it renders a static frame, eliminating recurring long tasks on constrained devices while preserving the visual.
   - The static canvas redraws once when its asynchronously loaded structure data arrives.

2. **Article-index LCP discovery**
   - The first article-card image is emitted as eager and `fetchpriority="high"`; all later thumbnails remain lazy.
   - This removes Lighthouse’s LCP-discovery warning for the first card without making the whole image grid eager.

## Resource audit

### Images

- Article hero images have explicit `width` and `height`, preventing intrinsic-size layout shifts.
- The article hero is eager/high-priority; body figures are lazy/async.
- The index grid lazily loads all thumbnails except its first LCP candidate.
- Remaining opportunity: generate 400/640/960 px AVIF/WebP variants and real `srcset`/`sizes`. Lighthouse estimates approximately 172 KiB savings on the sample article and 275 KiB on the article index under its mobile viewport.

### Video

- Article hero videos use `preload="none"`, explicit dimensions, and poster images. Narrated versions are user-initiated links, so MP4 payloads are not on the critical rendering path.
- Four published MP4s currently exceed the repository’s 3 MiB single-video budget (about 3.9–5.5 MiB). They do not affect LCP because they are not cold-loaded, but should be re-encoded before treating `npm run verify` as green.

### Fonts

- Fonts are self-hosted WOFF2 with `font-display: swap`; critical Newsreader and IBM Plex Mono faces are preloaded.
- Metric-adjusted fallback faces limit font-swap layout movement.
- The measured homepage cold transfer includes 216.5 KiB of fonts; the sample article includes 272.9 KiB because KaTeX adds math fonts. The complete `public/fonts` directory is 787.8 KiB and exceeds the static 200 KiB directory budget, although not every file is loaded per page.

### Third-party requests

- No third-party framework, analytics, advertising, or font request is on the render path.
- The homepage makes one non-render-blocking GitHub API request for the public commit ledger (about 4.2 KiB in the measured run) and caches it in `sessionStorage` for ten minutes.

## Verification

Passed:

- `npm run build`
- `npm run lint`
- `npm run typecheck` (no TypeScript files; skipped by the project script)
- Focused regression suite: 34/34 tests passed (`article-metadata`, `public-visual-blockers`, and `share-component`)
- Post-change Lighthouse collection completed for all three routes

Known pre-existing/full-tree budget failures from `npm run verify`:

- `/videos/` cold-transfer budget: 587.8 KiB > 420 KiB
- Four MP4s exceed 3 MiB
- `public/fonts/` total: 787.8 KiB > 200 KiB

The static correctness stage of `npm run verify` passed; only the listed performance budgets failed.

## Follow-up recommendations

1. Add responsive 400/640/960 px AVIF/WebP derivatives during article build and emit `srcset` + `sizes`.
2. Split or conditionally load article/share/KaTeX CSS to reduce mobile render blocking.
3. Re-encode the four oversized narrated MP4s to the documented 3 MiB target or revise the budget if quality requirements make that target invalid.
4. Separate “shipped font corpus” from “per-route font transfer” budgets, then subset the KaTeX and proof-pack-only fonts.
5. Add production RUM for LCP, INP, and CLS; lab TBT is not a substitute for real-user INP.
