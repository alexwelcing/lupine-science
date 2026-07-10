# Social-share consolidated accessibility & privacy review

**Date:** 2026-07-10  
**Scope:** `public/components/share/`, `scripts/build-articles.mjs`, `public/_headers`, `public/articles/styles.css`  
**Method:** Static code review + interactive Playwright audit + automated test regression run  
**Inputs:**
- `docs/reviews/social-share-accessibility-privacy-review.md` (static findings)
- `docs/reviews/social-share-interactive-test.md` (interactive findings)

**Final verdict:** **PASS with deferred items.** All critical and high-severity findings are resolved in the current implementation. Two low-severity items (deterministic IDs, brand-library font budget) are deferred with rationale and tracked separately. The component contains **zero third-party JavaScript, tracking pixels, share-count requests, or analytics beacons.**

---

## 1. How the inputs were merged

The static review identified 1 critical, 5 high, 6 medium, and 2 low issues. The interactive review identified 1 critical and 1 high issue. After de-duplication, the combined set is:

| # | Severity | Topic | Source | Status |
|---|----------|-------|--------|--------|
| 1 | Critical | CSP blocks same-origin share module | static + interactive | **Fixed** |
| 2 | High | Duplicate initialization / no idempotency guard | static | **Fixed** |
| 3 | High | Mobile disclosure duplicates server-rendered list | interactive | **Fixed** |
| 4 | High | Mobile ARIA/focus model mixes menu/disclosure patterns | static | **Fixed** |
| 5 | High | Clipboard fallback loses focus / swallows errors | static | **Fixed** |
| 6 | High | Mobile tray does not return focus to toggle on close | static + interactive | **Fixed** |
| 7 | High | No semantic/no-JS fallback | static | **Fixed** |
| 8 | Medium | Focus indicator low contrast | static | **Fixed** |
| 9 | Medium | Tab handler can throw on empty/missing focus | static | **Fixed** (Tab override removed) |
| 10 | Medium | Tray positioned absolutely over content | static | **Fixed** (now `position: static`) |
| 11 | Medium | Desktop overwrites article-specific accessible name | static | **Fixed** |
| 12 | Medium | Reduced-motion incomplete on article links | static | **Fixed** |
| 13 | Medium | Coarse-pointer touch targets not guaranteed on desktop | static | **Fixed** |
| 14 | Low | Random IDs not collision-proof | static | **Deferred** |
| 15 | Low | SVG docs do not match inline implementation | static | **Deferred** |
| 16 | — | Font perf budget exceeded | `npm run verify` | **Pre-existing / tracked separately** |

---

## 2. Evidence of fixes

### 2.1 CSP allows same-origin module (`public/_headers`)

The generated CSP now includes `'self'` in `script-src`:

```
script-src 'self' 'sha256-…' 'sha256-…';
```

Live verification on `https://lupine.science/articles/the-02-percent-synthesis-problem/` shows the share module loads without CSP errors. The inline module import hash is still present for browsers that enforce it.

### 2.2 Idempotent initialization (`public/components/share/share.mjs:156`)

```js
export function initShare(root, { url, title }) {
  if (!root || !url || root.dataset.shareInitialized === 'true') return;
  root.dataset.shareInitialized = 'true';
  …
}
```

Calling `initAllShareWidgets()` after DOMContentLoaded, plus the auto-initialization guard, prevents duplicate controls and duplicate live regions.

### 2.3 Mobile disclosure hides server list (`public/components/share/share.mjs:173-176`)

```js
if (isMobile) {
  if (existingList) existingList.hidden = true;
  …
}
```

Playwright no longer observes duplicate controls at 390 px; the mobile Tab sequence is exactly five tray actions plus the toggle, not eleven.

### 2.4 Disclosure pattern, not ARIA menu (`public/components/share/share.mjs:178-249`)

The mobile toggle uses `aria-expanded` + `aria-controls` over a plain `<ul>` list. Native Tab order is preserved; Escape closes the tray and returns focus to the toggle. No `role="menu"` / `role="menuitem"` / roving-tabindex overrides remain.

### 2.5 Clipboard fallback focus & error handling (`public/components/share/share.mjs:90-128`)

- `previousActive` is saved before any focus move.
- A `finally` block removes the temporary textarea and restores focus.
- All exception paths return `false`, so callers announce failure via the live region.
- The function accepts an explicit `{ document, navigator }` context for testing in jsdom.

### 2.6 Server-rendered fallback (`scripts/build-articles.mjs:273-291`)

Each article now ships a `<ul class="share-list">` of native links/email/copy buttons inside `<div class="share-root" … role="group" aria-label="Share this article">`. The component progressively enhances the Copy button and hides the list on mobile; if JS fails, the fallback row is still usable.

### 2.7 Visible focus indicator (`public/components/share/share.css:87-92`)

```css
.share-link:focus-visible,
.share-btn:focus-visible,
.share-toggle:focus-visible {
  outline: 2px solid var(--share-focus);
  outline-offset: 2px;
}
```

The focus ring uses the indigo brand color and meets the 3:1 non-text contrast expectation.

### 2.8 Reduced-motion (`public/components/share/share.css:159-170`)

```css
@media (prefers-reduced-motion: reduce) {
  .share-link, .share-btn, .share-toggle, .share-menu,
  .article .share-link, .article .share-btn, .article .share-toggle {
    transition: none !important;
    animation: none !important;
  }
}
```

Playwright confirms computed `transition-duration: 0s` and `animation-name: none` under reduced motion.

### 2.9 Touch targets (`public/components/share/share.css:54-55`)

All actionable elements use `min-width: 44px; min-height: 44px;`. Mobile tray actions measure 54–68 px high.

---

## 3. Verification run

```bash
npm run lint      # PASS
npm test          # PASS (50/50)
npm run build     # PASS
npm run smoke     # PASS (live: https://lupine.science)
```

Live smoke test executed after production deploy confirms the share widget loads, the CSP no longer blocks `share.mjs`, and the article page serves the expected video/VTT assets with correct `Content-Type` headers.

---

## 4. Deferred / separate items

### 4.1 Deterministic unique IDs

The current implementation uses a six-character `Math.random()` suffix for root IDs. The collision risk is low in a single-article context, but a deterministic counter would be more robust. **Deferred** because the idempotency guard already prevents duplicate roots from being enhanced twice, and changing the ID strategy carries no user-facing improvement today.

### 4.2 Component documentation

`docs/social-share-component.md` references separate local SVG files while the implementation uses inline SVG strings. **Deferred** because the docs are not user-facing and the inline approach is preferred for privacy (no extra HTTP requests).

### 4.3 Performance budget

`npm run verify` reports pre-existing overshoots on `/videos/a-field-not-a-neural-net.mp4`, `/videos/five-materials-for-5-to-12-gtco2-year.mp4`, and total font payload. These are outside the share-component scope and are tracked by the video-encoding and brand-library kanban tasks.

---

## 5. Privacy verdict

**PASS.** Inspection of `public/components/share/share.mjs`, `share.css`, and the article build output confirms:

- No third-party `<script>`, `<iframe>`, tracking pixel `<img>`, or dynamically loaded remote asset.
- No `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, or `performance.mark`/analytics calls.
- No share-count or engagement endpoint.
- Destination URLs encode the article URL/title; the platform receives data only when the user activates a link.
- CSP, Permissions-Policy, and Referrer-Policy further restrict leakage.

---

## 6. Sign-off

Consolidated review completed. All critical/high accessibility defects are resolved and verified by automated tests and live smoke checks. Safe fixes were applied in `public/components/share/share.mjs` (clipboard context/focus handling) and the report is committed to `docs/reviews/social-share-consolidated-review.md`.
