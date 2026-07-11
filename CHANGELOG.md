# Lupine Science Release Changelog

> Publication-quality changelog for the article-video expansion, proof packs, social sharing, and deployment pipeline.  Each entry maps to a completed kanban task and its verification state.

## Legend

- **Live** — merged to `main`, deployed to production, and verified from the live site.
- **Staged** — merged to `main` and passing CI, awaiting production deploy or live verification.
- **Merged** — code merged to `main` but not yet deployed/verified.
- **In Progress** — task is running or ready on the kanban board.
- **Blocked** — waiting on dependency, auth, review, or external service.

---

## Unreleased

### Platform & Pipeline
- [Staged] CI asset fix: added missing referenced public assets (`proof-pack.css`, `fonts/proof-unicode.ttf`, share icons, published video MP4s/posters) that caused the `Build site` static-link failure on run `29137772101`; `npm test`, `npm run build`, `node scripts/check-static.mjs` pass; CI run `29138006761` green.
- [Staged] Live smoke-test coverage extended to `<img src>`, `<img poster>`, and `<source srcset>` so missing card/hero/poster images are caught before the next deploy.
- [Staged] Full test suite committed: previously untracked tests for share component, Open Graph, public visual blockers, proof-pack policy, video-share integration, and deployment notifications are now in repo and run under `npm test`.
- [Merged] Article top-line metadata redesign: editorial kicker, accessible byline list, no audience label rendered; passes `npm test`, `npm run build`, `npm run lint`, `npm run verify`.\n- [Merged] Publication-quality visual audit of all 20 public pages (60 screenshots); 19 pages flagged with missing assets, CSP-blocked sharing, broken brand library, and a 780 px mobile overflow — findings at `docs/qa/public-pages-visual-audit/REPORT.md`.
- [Merged] PDF QA audit baseline: 71-page proof pack inspected for fonts/Unicode/margins; P0/P1 findings documented and routed to link-fix + PDF-optimization tasks.
- [Merged] Hermes provider fix: profiles now route through Anthropic `claude-fable-5` (Fable) with `zai`/`glm-5.2` fallback after OpenAI Codex (`gpt-5.6-sol`) hit rate limits and `kimi-coding` returned 404; added active swarm guard at `scripts/monitoring/hermes-swarm-guard.sh` and system health monitor at `scripts/monitoring/system-health.sh`.
- [Merged] CI: PR/push verification workflow with lint, typecheck, tests, static-link checks, proof-pack generation, and PDF verification.
- [In Progress] QA/infra audit wave: editorial visual QA, Core Web Vitals, WCAG 2.1 AA, cross-browser/device, pre-publication QA sign-off checklist.
- [Merged] Live URL smoke-test suite and deployment post-deploy gates in `.github/workflows/deploy.yml`.
- [Merged] Lighthouse SEO gate fix: footer mail links now carry `href="mailto:alex@lupinesci.com"`, article pages regenerated, footer links underlined; local Lighthouse CI passes all category assertions (performance ≥0.95, accessibility ≥0.95, best-practices ≥0.95, SEO ≥0.95).
- [Blocked] Production release blocked by missing `cement-concrete-and-the-weight-of-the-built-world.mp4` and 6.1 MB video exceeding 3 MB/min budget; fix task assigned to voice-engineer.\n- [Blocked] Visual audit blockers (missing assets, broken brand library, mobile overflow, CSP-blocked sharing); fix task assigned to web-integrator.
- [Merged] artdirector/reviewer profiles routed through OpenAI Codex (`gpt-5.6-sol`); Anthropic/Fable OAuth deferred per team direction.
- [Merged] Social share component (article/video pages, OG/Twitter cards, accessible controls).
- [Merged] Share component accessibility fix: desktop share list items now expose `role="listitem"` so Lighthouse's `aria-required-children` audit passes.
- [Merged] Social share release fix: CSP `script-src` now allows same-origin modules; server renders no-JS fallback links; module initialization is idempotent; mobile disclosure hides the fallback list; focus, contrast, touch-target, and reduced-motion issues addressed. Reports at `docs/reviews/social-share-accessibility-privacy-review.md` and `docs/reviews/social-share-interactive-test.md`.
- [Live] Social share consolidated review: merged static + interactive findings into `docs/reviews/social-share-consolidated-review.md` and `docs/qa/social-share/REPORT.md`; fixed mobile tray regression in `public/components/share/share.css`; `npm test`, `npm run lint`, `npm run build` all pass; deployed and verified from live site.
- [Live] Generalized per-article proof-pack pipeline: `scripts/build-proofpack.mjs` now supports `--all`, `--slug`, `--out-dir`, and `--consolidated`; produces a deterministic PDF + JSON manifest per eligible article; includes Unicode/font-embedding assertions, deterministic double-build checks, scientific-source validation, and integration tests. `npm run proofpack`, `npm run proofpack:all`, `npm run proofpack:validate`, and `npm run pdf:check` pass; deployed to production.
- [Live] Environmental expansion series beyond CO₂ now published: `beyond-carbon-the-error-geometry-of-environmental-materials`, `water-and-air-correcting-the-molecules-we-drink-and-breathe`, `methane-and-refrigerants-cutting-the-non-co2-climate-forcers`, `critical-minerals-pfas-and-the-remediation-imperative`, `cement-concrete-and-the-weight-of-the-built-world`. Article pages carry 10 inline data/figure images each, hero imagery, and share/download CTAs.
- [Staged] Landing page (`public/index.html`) redesigned with a dedicated "Climate partnerships series" feature block, six article cards with hero thumbnails, proof-pack download CTA, and an updated "From the notebook" column.
- [In Progress] 10-visual-deck brief and design system for every article.

### Articles & Video
- [Live] Reusable video components: title-card, lower-third, transition-wipe, data-chart, logo-sting/outro.
- [Live] First full article video: Cement/Concrete.
- [Merged] Narration scripts + director approvals + TTS narration for: The 0.2% Synthesis Problem, A Field Not a Neural Net, Five Materials That Could Unlock 5–12 GtCO₂/Year, Beyond Carbon, From Predicted Crystal to Commercial Cell, Investing in the Trust Layer.
- [Merged] Storyboard / beat sheets for: The 0.2% Synthesis Problem, A Field Not a Neural Net, Five Materials That Could Unlock 5–12 GtCO₂/Year, From Predicted Crystal to Commercial Cell, Investing in the Trust Layer.
- [In Progress] HyperFrames compositions, kinetic titles, data/chart animations, transitions, renders, and frame reviews for the remaining article videos.
- [Live] `a-field-not-a-neural-net`: director-approved 720p MP4 and poster are now served from `https://lupine.science/videos/`, article page links to the narrated version with `VideoObject` schema, and live smoke tests pass.
- [Live] `the-02-percent-synthesis-problem`: P0/P1 fixes approved by independent re-review (t_b2172012), 720p web encode (1.53 MB/min) and WebVTT captions generated, article page links to the narrated version with `VideoObject` schema, production deploy and live smoke test passed.
- [Live] `methane-and-refrigerants-cutting-the-non-co2-climate-forcers`: HyperFrames composition, kinetic titles, data/chart animations, transitions, and logo sting completed; P0/P1 frame fixes approved by re-review (t_cb9b51d5); audio normalized to −16 LUFS and WebVTT captions added; 720p web encode (1.81 MB/min) under budget; director approved for web; article page and `/videos/` index wired with `VideoObject` schema; production deploy and live smoke test passed (MP4 served as `video/mp4`, 4,211,492 bytes).
- [In Progress] HeyGen animation workflow and reviewer/director training.
- [Merged] Director profile routed to Anthropic `claude-fable-5` (Fable); voice-engineer/reviewer/animator remain on OpenAI Codex `gpt-5.6-sol` (Sol) so the two models can set/clear each other's bars.
- [Merged] `critical-minerals-pfas-and-the-remediation-imperative`: director final-render review rejected the initial publish because the mastered narration overgeneralized the EPA 4 ng/L threshold ('capture molecules') and storyboard timing notes were inconsistent. The premature web publish was reverted (commit 64bcbf2) before it reached production.
- [Merged] `critical-minerals-pfas-and-the-remediation-imperative`: script, spoken transcript, and TTS input updated to qualify the claim as 'capture PFOA and PFOS down to the EPA limit: four nanograms per liter each'; storyboard transition/overlap math and outro fade timing reconciled (commit 3e19116).
- [Live] `critical-minerals-pfas-and-the-remediation-imperative`: kanban tasks t_f41bb201 (voice-engineer, Sol) → t_db727c15 (animator, Sol) completed; corrected narration and re-render published and live; director re-review t_22b978c8 is running.
- [Merged] Laptop performance monitoring: `npm run monitor:laptop` added to crontab every 15 minutes; `scripts/monitoring/hermes-swarm-guard.sh` runs every minute to cull runaway Hermes workers under load/memory pressure.
- [Blocked] `cement-concrete-and-the-weight-of-the-built-world` and related ready pipeline tasks scheduled in Hermes until the rejected 16:11 narration is replaced with an approved 300–340-word script and regenerated audio/timing.

---

## 2026-07-11 — Critical Minerals / PFAS corrected video republish

**Status:** Live on production.

- [Live] `critical-minerals-pfas-and-the-remediation-imperative`: corrected narration master regenerated (t_f41bb201, Sol), 1080p review and 720p web MP4 re-rendered (t_db727c15, Sol), director re-review approved (t_22b978c8, Fable), `/videos/` index card and article `VideoObject` schema + "Watch the narrated version" link wired, WebVTT captions and 5-second poster published. Verification: `npm run lint && npm test && npm run build` pass; CI run `29136155243`; production deploy `29136333070`; live smoke tests pass; `HEAD https://lupine.science/videos/critical-minerals-pfas-and-the-remediation-imperative.mp4` returns HTTP 200 `content-type: video/mp4`, 5,697,028 bytes, 1280×720, 114.517s.
- [Live] Article top-line metadata redesign and OG `video.other` handling for published article videos now deployed; passes `npm test`, `npm run build`, `npm run lint`, and live smoke.

---

## 2026-07-10 — Director pass: recover the swarm and restart production

**Status:** Infrastructure-only release; no production deploy.

- Re-routed every Hermes profile to `gpt-5.6-sol` (OpenAI Codex OAuth) with `kimi-k2.7-code` fallback, replacing the exhausted `zai`/`anthropic` API-key paths that were causing task crashes.
- Lowered `max_concurrent_sessions` to 3 in base + all profile configs to eliminate the `5/5 active session limit` crashes.
- Reset `consecutive_failures` and unblocked 228 crashed tasks.
- Restarted the dispatch loop with `max_running=6`, `failure_limit=4`, and 60-second interval.
- Started the first post-recovery wave with the QA/infra audit tasks that gate the remaining website work.

---

## How to update this file

When a kanban task completes, add a line under the correct release section using the status markers above.  When a release goes live, rename `Unreleased` to the deploy date and move any `Live` items into it.
