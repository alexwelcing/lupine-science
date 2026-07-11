# Social-share end-to-end QA report

Date: 2026-07-10
Task: `t_e4e5cf2f`
Verdict: **PASS after one in-scope mobile CSS fix; review required.**

## Scope and representative pages

- Standard article with omitted optional `Description` frontmatter and default social image: `/articles/the-order-is-right-the-size-is-wrong/`
- Article with a published narrated video, poster/VideoObject metadata, and default social image: `/articles/the-02-percent-synthesis-problem/`
- Generated-output scan: all 16 article pages, including all 3 pages with `VideoObject` metadata
- Desktop: 1280 × 900
- Mobile: 390 × 844
- Reduced motion: 390 × 844 with `prefers-reduced-motion: reduce`
- Browser: Google Chrome via Playwright Core 1.61.1, headless, served by `npm run dev` at `http://127.0.0.1:8080`

## Defect found and fixed

### Mobile fallback list remained visible and tray opened beside it

- Severity: High
- Category: responsive/accessibility
- Route: every article at widths <= 600 px
- Root cause: `public/components/share/share.css` set `.share-list { display: flex }`, overriding the server-rendered list's `hidden` attribute after mobile enhancement. The mobile root also used `flex-wrap: nowrap`, so the tray appeared beside the toggle rather than below it.
- Reproduction before fix: open an article at 390 px, activate Share, and observe two action sets with the tray constrained to the right side.
- Fix: add `.share-list[hidden] { display: none; }` and change the mobile root to `flex-wrap: wrap`.
- Verification after fix: exactly one visible action set; tray top is at or below toggle bottom; tray right edge stays within the root; Escape closes and restores focus.

## Acceptance results

| Area | Result | Evidence |
|---|---|---|
| Exact Bluesky/X/LinkedIn/email encoding | PASS | Exact href equality on both representative routes at all viewport/motion combinations |
| Canonical deep links | PASS | `.share-root[data-url]` equals `link[rel=canonical]`; generated scan passed on 16/16 article pages |
| Clipboard API success | PASS | Clipboard readback exactly matched canonical URL |
| Clipboard fallback | PASS | Forced missing `navigator.clipboard`; `execCommand('copy')` received exact canonical URL and temporary textarea was removed |
| OG/Twitter Cards | PASS | Required title, description, URL, image, dimensions/card tags found; missing optional description falls back to Scope |
| Article-video metadata | PASS | 3/3 published article videos have `VideoObject`; selected video article passed runtime checks |
| Privacy/network | PASS | Zero third-party HTTP(S) requests before or during disclosure/copy/keyboard interactions; no fetch/XHR/beacon/iframe/tracking pixel in component/output |
| Static SVG | PASS | Share icons are inline decorative SVG; no image or remote icon nodes in component |
| Desktop visual | PASS | Single in-flow row, no clipping or overlap, readable editorial styling |
| Mobile visual | PASS after fix | Single disclosure and full-width in-flow tray, no clipping/overlap, >=44 px targets |
| Keyboard | PASS | Enter opens; first action receives focus; Escape closes and returns focus to toggle |
| Reduced motion | PASS | Computed transition duration `0s`, animation name `none` |
| Console | PASS | No browser console errors across six route/viewport runs |

## Commands and results

- `npm test` — PASS, 60/60 tests
- `npm run lint` — PASS
- `npm run typecheck` — PASS (no TypeScript files; skipped by project script)
- `npm run build` — PASS, 16 article pages generated; sitemap 19 URLs; headers generated
- `npm run verify` — static verification PASS, overall command FAIL only on documented pre-existing budgets: two MP4 files above 3 MiB and fonts 787.8 KiB above 200 KiB
- `node /tmp/lupine-social-share-qa.mjs` — PASS, 6 route/viewport runs, 0 third-party requests, 0 console errors
- generated metadata/privacy scan — PASS, 16 pages and 3 VideoObject pages
- `git diff --check` — run in final verification

## Evidence

- Structured results: `docs/qa/social-share/results.json`
- Screenshots: `docs/qa/social-share/screenshots/`
  - `the-order-is-right-the-size-is-wrong-desktop.png`
  - `the-order-is-right-the-size-is-wrong-mobile.png`
  - `the-order-is-right-the-size-is-wrong-mobile-reduced.png`
  - `the-02-percent-synthesis-problem-desktop.png`
  - `the-02-percent-synthesis-problem-mobile.png`
  - `the-02-percent-synthesis-problem-mobile-reduced.png`

## Deferred unrelated items

The existing performance-budget failures for large video assets and fonts are outside this social-share QA scope and were already documented by the parent review. No additional social-share failures remain after the CSS fix.
