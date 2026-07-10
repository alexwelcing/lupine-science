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
- [Merged] Article top-line metadata redesign: editorial kicker, accessible byline list, no audience label rendered; passes `npm test`, `npm run build`, `npm run lint`, `npm run verify`.\n- [Merged] Publication-quality visual audit of all 20 public pages (60 screenshots); 19 pages flagged with missing assets, CSP-blocked sharing, broken brand library, and a 780 px mobile overflow — findings at `docs/qa/public-pages-visual-audit/REPORT.md`.
- [Merged] PDF QA audit baseline: 71-page proof pack inspected for fonts/Unicode/margins; P0/P1 findings documented and routed to link-fix + PDF-optimization tasks.
- [Merged] Controlled Hermes dispatch loop: lowered concurrency to 6, profile session caps to 3, model fallback to `gpt-5.6-sol` → `kimi-k2.7-code` to clear runaway-swarm crashes; added load/memory monitor at `media/projects/laptop-performance/system-monitor.sh`.
- [Merged] CI: PR/push verification workflow with lint, typecheck, tests, static-link checks, proof-pack generation, and PDF verification.
- [In Progress] QA/infra audit wave: editorial visual QA, Core Web Vitals, WCAG 2.1 AA, cross-browser/device, pre-publication QA sign-off checklist.
- [Merged] Live URL smoke-test suite and deployment post-deploy gates in `.github/workflows/deploy.yml`.
- [Merged] Lighthouse SEO gate fix: footer mail links now carry `href="mailto:alex@lupinesci.com"`, article pages regenerated, footer links underlined; local Lighthouse CI passes all category assertions (performance ≥0.95, accessibility ≥0.95, best-practices ≥0.95, SEO ≥0.95).
- [Blocked] Production release blocked by missing `cement-concrete-and-the-weight-of-the-built-world.mp4` and 6.1 MB video exceeding 3 MB/min budget; fix task assigned to voice-engineer.\n- [Blocked] Visual audit blockers (missing assets, broken brand library, mobile overflow, CSP-blocked sharing); fix task assigned to web-integrator.
- [Merged] artdirector/reviewer profiles routed through OpenAI Codex (`gpt-5.6-sol`); Anthropic/Fable OAuth deferred per team direction.
- [Merged] Social share component (article/video pages, OG/Twitter cards, accessible controls).
- [Merged] Share component accessibility fix: desktop share list items now expose `role="listitem"` so Lighthouse's `aria-required-children` audit passes.
- [Blocked] Social share release blocker: CSP prevents controls from rendering and component double-initializes; fix task assigned to software-engineer.
- [In Progress] Downloadable proof packs per article (PDF, manifest, bibliography, UI, CI generation, golden-file diff tests).
- [In Progress] Environmental expansion series beyond CO₂ (methane/refrigerants, critical minerals/PFAS, water/air purification, cement/concrete).
- [In Progress] 10-visual-deck brief and design system for every article.

### Articles & Video
- [Live] Reusable video components: title-card, lower-third, transition-wipe, data-chart, logo-sting/outro.
- [Live] First full article video: Cement/Concrete.
- [Merged] Narration scripts + director approvals + TTS narration for: The 0.2% Synthesis Problem, A Field Not a Neural Net, Five Materials That Could Unlock 5–12 GtCO₂/Year, Beyond Carbon, From Predicted Crystal to Commercial Cell, Investing in the Trust Layer.
- [Merged] Storyboard / beat sheets for: The 0.2% Synthesis Problem, A Field Not a Neural Net, Five Materials That Could Unlock 5–12 GtCO₂/Year, From Predicted Crystal to Commercial Cell, Investing in the Trust Layer.
- [In Progress] HyperFrames compositions, kinetic titles, data/chart animations, transitions, renders, and frame reviews for the remaining article videos.
- [Staged] `a-field-not-a-neural-net`: director approved v2 for web; web-integrator publishing the approved 720p MP4 and article link, then QA smoke test.
- [In Progress] `the-02-percent-synthesis-problem` final render: frame review REJECT with P0=2/P1=3; P0 fix is now running at elevated priority, P1 fix queued behind it.
- [In Progress] HeyGen animation workflow and reviewer/director training.

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
