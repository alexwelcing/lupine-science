# Cross-browser and device compatibility QA

Date: 2026-07-10  
Task: `t_58171dde`  
Target: local static site at `http://127.0.0.1:8080`  
Result: **FAIL — material cross-browser/responsive defects remain, and native Safari/iOS/Android coverage was unavailable.**

## Scope

The audit inventoried and exercised 22 public HTML pages: home, articles index, 16 article pages, videos, brand assets, one-pager, and article-components. Each executed profile checked HTTP status, title/H1 and font state, broken images, horizontal overflow, media state, local navigation links, keyboard focus, representative button interaction, console errors, page exceptions, failed requests, and a viewport screenshot.

Raw evidence: `results.json`. Browser/device matrix: `browser-device-matrix.csv`. Screenshots: `screenshots/`.

## Coverage — execution must not be overstated

| Profile | Execution | Pages | Result |
|---|---|---:|---|
| Google Chrome 150 desktop, 1440×900 | Native Linux Chrome binary | 22/22 | Executed |
| Firefox 151 desktop, 1440×900 | Playwright-managed real Firefox engine on Linux | 22/22 | Executed |
| Safari desktop | Playwright WebKit 26.5 on Linux only | 0/22 | Blocked at launch by missing WebKit host dependencies; no native macOS Safari |
| Mobile Safari, iPhone 13 | Playwright WebKit device emulation only | 0/22 | Blocked at launch with desktop WebKit; no iOS hardware/native Safari |
| Android Chrome, Pixel 7 | Pixel viewport, touch and user-agent emulation in native Linux Chrome | 22/22 | Executed; no Android hardware |

No BrowserStack/Sauce Labs credentials or Apple/Android hardware were available. Therefore this report makes **no claim of native macOS Safari, iOS Safari, or Android Chrome coverage**. The installed Firefox 152 Snap was identified, but Playwright's patched Firefox 151 build was used for reliable automation.

## Aggregate evidence

- 66/66 executed page/profile navigations returned HTTP 200.
- 66 screenshots were captured: one for every executed page/profile pair.
- 59/66 runs emitted at least one console or request failure.
- 61 console errors and 40 failed-request events were recorded; no page exceptions were recorded.
- First keyboard Tab focus was visible on all 66 executed combinations.
- Homepage evidence-term interaction changed `aria-pressed` to `true` in Chrome desktop, Firefox desktop, and emulated Android Chrome.
- Firefox desktop showed no horizontal overflow on any page. Chrome desktop and Pixel emulation exposed the defects below.

## Prioritized findings

### P1 — First-party article sharing is blocked in Chrome and Firefox by CSP

The site CSP rejects `/components/share/share.mjs`. Across executed profiles this produced 34 Chrome-style CSP console errors, 34 failed requests, and Firefox CSP errors on article routes. Sharing behavior is therefore unavailable rather than merely visually degraded.

Reproduce: open `/articles/` or any article and inspect the console/share controls.  
Action: permit the self-hosted module in `script-src` or bundle/hash it consistently, then add an interaction assertion under the deployed CSP.

### P1 — Severe mobile horizontal overflow in “From Fantasy Frameworks…”

At Pixel 7 emulation, `/articles/from-fantasy-frameworks-to-makeable-materials/` exceeded the viewport by **758 px**. Native desktop Chrome also overflowed by **70 px**. Firefox desktop did not overflow, making this a concrete engine/viewport compatibility difference.

Evidence: `screenshots/android-chrome-emulated--article-from-fantasy-frameworks-to-makeable-materials.png` and `screenshots/chrome-desktop-native--article-from-fantasy-frameworks-to-makeable-materials.png`.  
Action: constrain code/content blocks and apply safe wrapping to long URLs/citations; add an assertion that `scrollWidth <= clientWidth` at mobile and desktop breakpoints.

### P1 — One-pager is not responsive at Pixel dimensions

`/one-pager.html` exceeded the emulated Pixel 7 viewport by **404 px** while neither desktop engine overflowed. This makes a large portion of the page horizontally off-canvas on a common mobile width.

Evidence: `screenshots/android-chrome-emulated--one-pager.png`.  
Action: add a mobile layout instead of preserving the fixed presentation canvas, or explicitly mark the asset print/desktop-only and remove it from mobile public navigation.

### P1 — Missing media/images remain browser-visible

Six executed page/profile runs contained broken `<img>` elements, accompanied by four generic 404 console errors. The detailed missing URLs are retained per run in `results.json`. The `why-lupine-science` hero video also produced two aborted-request events in Chrome-family execution; this is not classified as a confirmed 404 but warrants media playback verification after asset fixes.

Action: validate every local image/poster source at build time and add explicit `video.readyState`/playback checks for public videos.

### P2 — External typography is blocked by CSP

The Google Fonts stylesheet on brand assets and one-pager is rejected by `style-src 'self' 'unsafe-inline'` in Chrome and Firefox, producing four Chrome-style CSP errors/failures plus Firefox equivalents. Rendering falls back by browser and OS, so typography is not deterministic across platforms.

Action: self-host the intended fonts or remove the external request; verify computed font families in each engine.

## Navigation, interactions, and keyboard

All audited routes returned 200 in the three executed profiles. Local link inventories are recorded in `results.json`. The first Tab stop was visible on all executed combinations, and the homepage equation control worked across both desktop engines and Android emulation. This is a smoke check, not a full WCAG keyboard audit: focus order through every control, external destinations, clipboard/share behavior, and native mobile gestures still require dedicated testing.

## Release recommendation

Do not sign off cross-browser/device compatibility yet. Fix the P1 CSP, overflow, and asset defects; rerun the three automated profiles; then complete native Safari on macOS, iOS Safari, and Android Chrome on real devices or a credentialed device farm. Safari-family results must remain marked untested until that run exists.
