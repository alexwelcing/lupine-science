# Social-share interactive test

Date: 2026-07-10

Verdict: **FAIL — changes required.** The component implementation passes its isolated desktop interaction checks, but the shipped `npm run dev` response blocks that implementation with CSP. When CSP is removed to exercise the mobile implementation, it exposes duplicate controls.

## Test setup

- Article: `http://localhost:8080/articles/the-trust-layer/`
- Shipped server: `npm run dev` (serves `public/` and enforces `public/_headers`)
- Isolation server: `python3 -m http.server 8081 --directory public` (used only to exercise the component after the shipped CSP blocked it)
- Browser: Google Chrome via Playwright Core 1.61.1, headless
- Desktop viewport: 1280 × 900
- Mobile viewport: 390 × 844
- Reduced motion: Playwright `reducedMotion: "reduce"`
- Contrast: axe-core `color-contrast` rule scoped to `.share-root`
- Network: Playwright request listener; same-origin document/CSS/JS requests excluded, every other HTTP(S) request treated as third-party

## Findings (ordered by severity)

### Critical

- `public/_headers:12` — **The shipped CSP blocks `/components/share/share.mjs`, leaving Copy inert and preventing all mobile-tray behavior.** On the `npm run dev` server Chrome reported: `Loading the script 'http://localhost:8080/components/share/share.mjs' violates ... script-src ... The action has been blocked.` Playwright observed no `data-share-initialized`, zero `.share-live` regions, and no response after activating Copy. The server-rendered destination links remain usable, but Copy, live announcements, mobile disclosure, `aria-expanded`, Escape handling, and focus restoration do not exist in the shipped runtime. Add an appropriate same-origin module policy (or ship a CSP-compatible bundled/hashed executable) and retain the fallback links.

### High

- `public/components/share/share.mjs:167-187` — **Mobile enhancement leaves the server-rendered `.share-list` visible and appends a second set of five controls in `.share-menu`.** At 390 px Playwright found the original five controls plus the disclosure toggle plus five tray controls. Tab therefore traverses duplicate actions, and the expanded layout visibly overlaps/crowds two copies of every destination. Remove or transform the existing list when constructing the mobile disclosure rather than appending a parallel list. Evidence: `docs/reviews/screenshots/social-share-interactive/mobile-tray-open.png`.

## Acceptance-criteria results

- **Keyboard Tab reaches all controls: conditional pass / shipped failure.** With CSP removed, desktop Tab reached Bluesky, X, LinkedIn, Copy, and Email in order. The mobile tray's five actions were also reachable in order, but the duplicate server-rendered actions produce an incorrect 11-control mobile tab sequence. Under shipped CSP there is no disclosure control.
- **Enter/Space activation: conditional pass / shipped failure.** With CSP removed, Enter activated a native share link; Space activated Copy; Enter and Space each opened the native mobile disclosure button. (Space is not expected to activate native links.) Under shipped CSP Copy has no handler and the disclosure is never created.
- **Mobile tray opens/closes and updates `aria-expanded`: conditional pass / shipped failure.** In isolation, Enter/Space changed `aria-expanded` from `false` to `true`, removed `hidden`, and focused the first action; closing restored `aria-expanded="false"` and `hidden`. The shipped CSP prevents tray creation.
- **Escape closes and restores focus: conditional pass / shipped failure.** In isolation, Escape set `aria-expanded="false"`, restored `hidden`, and returned focus to the toggle named “Share this article.” The shipped CSP prevents tray creation.
- **Copy announces through `aria-live`: conditional pass / shipped failure.** In isolation, Space on Copy wrote `https://lupine.science/articles/the-trust-layer/` to the clipboard and the polite atomic live region contained `Link copied to clipboard`. The shipped CSP creates no live region and Copy is inert.
- **Reduced motion suppresses animation: pass in isolation.** At `prefers-reduced-motion: reduce`, the toggle computed `transition-duration: 0s`, `transition-property: none`, `animation-name: none`, and `animation-duration: 0s`; the open tray also computed zero transition/animation duration. Evidence: `docs/reviews/screenshots/social-share-interactive/mobile-reduced-motion.png`.
- **Touch targets are at least 44 px: pass for measured controls.** Desktop controls were exactly 44 px high (widths 114.09–192.39 px). Open mobile tray actions were 54–68.09 px high and 126.30 px wide. The duplicate-control defect remains independently blocking.
- **Color contrast: pass.** axe-core reported zero `color-contrast` violations in the desktop share component.
- **Zero third-party network requests on interaction: pass for non-navigation interactions.** Playwright recorded zero third-party HTTP(S) requests while tabbing, opening/closing the tray, pressing Escape, activating Copy, and testing reduced motion. Activating a destination link was intercepted to verify keyboard click dispatch without intentionally navigating to that third party; selecting a social destination is expected to contact that chosen platform.

## Screenshots

- Desktop share row: `/home/alex/Dev/lupine/lupine-science/docs/reviews/screenshots/social-share-interactive/desktop-share.png`
- Mobile expanded tray showing duplicate controls: `/home/alex/Dev/lupine/lupine-science/docs/reviews/screenshots/social-share-interactive/mobile-tray-open.png`
- Mobile expanded tray under reduced motion: `/home/alex/Dev/lupine/lupine-science/docs/reviews/screenshots/social-share-interactive/mobile-reduced-motion.png`

## Raw evidence

The Playwright run wrote raw structured results to `/tmp/lupine-share-audit-results.json` and its reusable test driver to `/tmp/lupine-share-audit.mjs`. These temporary files are supplementary; the report and screenshots above are stored in the repository.
