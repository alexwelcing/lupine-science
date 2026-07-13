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
- [Staged] Brand asset + result graphic pack: curated brand stills metadata (`data/brand-asset-pack.json`); result-graphics schema and brand-compliant SVG builder (`data/result-graphics.json`, `scripts/build-result-graphics.mjs`); generated four publication-ready charts (`gwp-comparison.svg`, `climate-forcers-share.svg`, `synthesis-funnel.svg`, `lean-theorem-growth.svg`) with IPCC AR6 and internal build sources; gallery page at `/result-graphics/index.html` and design spec at `docs/result-graphic-pack.md`; `build:graphics` wired into `npm run build`; inserted GWP comparison and climate-forcers share charts into the Lupi HFC and Rhizo non-CO₂ articles with scientific captions; regenerated consolidated proof-pack PDF. Verification: `npm test` (74/74), `npm run build`, `npm run proofpack -- --consolidated`, `node scripts/check-pdf.mjs` pass; PR #16 drafted and queued behind pending production deploy run `29215145422`.
- [In Progress] Director monitoring and swarm-tuning pass: audited all 360 article-video kanban tasks; unblocked 56 tasks that were stuck on earlier `pid not alive` crashes under resource pressure; left 27 review-required tasks blocked. Fixed `scripts/swarm-dispatch-loop.sh` to parse `hermes kanban stats --json` from the correct `by_status` object so running/blocked/ready counts and throttling are accurate. Restarted the dispatch loop with 60-second ticks and max 4 spawns per tick while keeping load > 6.0 and memory > 80% guards. Diagnosed recurring 61-second `pid not alive` crashes as missing-profile-skill failures (`Unknown skill(s): media-use`, `talking-head-recut`, `embedded-captions`, and several `hyperframes-*` variants). Installed the missing skills for `researcher`, `visual-tester`, `artdirector`, `devops`, and `reviewer` profiles by symlinking `.claude/skills/` HyperFrames/media-use skills and copying `embedded-captions`/`talking-head-recut` from the `director` profile. Unblocked 25 recently crashed tasks to retry with the corrected skill set. Running laptop diagnostics (`scripts/monitoring/laptop-diagnostics.mjs`) and Hermes swarm guard (`scripts/monitoring/hermes-swarm-guard.sh`) every monitoring cycle; current state load <2, memory ~30%, 1–2 Hermes workers, GPU ~50°C.
- [Staged] External repo sync: pulled latest `lupi` (`alexwelcing/Lupi@0616bbd`) and `lupine-rhizo` (`alexwelcing/lupine-rhizo@e398f90`) updates into Lupine Science. Published two new articles: `rhizo-non-co2-climate-forcers-lean` and `lupi-hfc-refrigerant-research-payloads`. Added changelog entries and homepage cards under "From the notebook". Verification: `npm test` (74 tests), `npm run build`, `npm run verify` pass; production deploy and live smoke tests pending.
- [Live] Article metadata and citation QA pass: removed `Type: article` and `Audience:` from all article source markdowns; renamed `Scope` → `Deck` and `Description` → `Summary`; updated `scripts/build-articles.mjs` to default article kickers to "Research note" and to prefer Deck/Summary while keeping legacy aliases; regenerated all article pages and index. Replaced self-citing "Lupine Science, *Strategic Discovery Plan*" footnotes and captions in the climate/environmental series with direct links to the [open Lean 4 library](https://library.lupine.science) and [source repository](https://github.com/alexwelcing/lupine-rhizo). Fixed PDF Unicode rendering by adding the static `Proof Unicode` face to `public/articles/styles.css` and swapping the print path away from the variable Newsreader Type-3 font. Verification: `npm test` (74 tests), `npm run build`, `npm run proofpack`, `npm run pdf:check` pass; production deploy `29149057152` approved and live smoke tests pass; pre-existing perf-budget overages on videos/homepage/fonts remain under separate tracking.
- [Live] CI asset fix: added missing referenced public assets (`proof-pack.css`, `fonts/proof-unicode.ttf`, share icons, published video MP4s/posters) that caused the `Build site` static-link failure on run `29137772101`; `npm test`, `npm run build`, `node scripts/check-static.mjs` pass; CI run `29138006761` green; production deploy `29138487024` and live smoke tests pass.
- [Live] Live smoke-test coverage extended to `<img src>`, `<img poster>`, and `<source srcset>` so missing card/hero/poster images are caught before the next deploy.
- [Live] Full test suite committed: previously untracked tests for share component, Open Graph, public visual blockers, proof-pack policy, video-share integration, and deployment notifications are now in repo and run under `npm test`.
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
- [Live] Landing page (`public/index.html`) redesigned with a dedicated "Climate partnerships series" feature block, six article cards with hero thumbnails, proof-pack download CTA, and an updated "From the notebook" column; deployed in `29138487024` and verified from `https://lupine.science/`.
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
- [Live] Synced climate-series articles with latest `lupine-rhizo` formalization: corrected theorem counts to the current build state (51 modules, 190 build-locked theorems, 427 theorem declarations, ~640 declarations, zero `sorry`); updated `Validation.ClimateSeries.proof_pack_inventory_floor` and the `lupine_distill.odf.climate_series` Python mirror to match; added the production-wired certificate gates (field-domain, ranking-inversion, barrier conservatism) to `a-field-not-a-neural-net`; added the new rocksalt/halide anchor layout to `five-materials-for-5-to-12-gtco2-year`; rebuilt consolidated proof pack and static site. Verification: `lake build` green (3,661 jobs, 0 `sorry`) in `lupine-rhizo`; `python -m pytest python/tests/` passes (55 tests) in `lupine-rhizo`; `npm test` passes (74 tests), `npm run build`, and `npm run proofpack:all -- --consolidated` pass in `lupine-science`; production deploy `29142607181` approved and live smoke tests pass; pre-existing perf-budget overages on videos/homepage/fonts remain under separate tracking.
- [Merged] Laptop performance monitoring: `npm run monitor:laptop` added to crontab every 15 minutes; `scripts/monitoring/hermes-swarm-guard.sh` runs every minute to cull runaway Hermes workers under load/memory pressure. Fixed cron `PATH` so the diagnostics script actually executes (was failing with `npm: not found`); current snapshot shows 28% memory, 17% swap, zero Hermes workers, zero zombies.
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
