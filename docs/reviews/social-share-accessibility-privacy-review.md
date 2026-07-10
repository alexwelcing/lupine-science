# Social-share static accessibility and privacy review

Review scope: `public/components/share/`, its article integration, relevant global CSS/CSP, tests, and component documentation. Review method: static inspection only. No implementation code was modified.

Verdict: **Changes required.** Privacy posture is strong (first-party implementation, no tracking), but the shipped integration can leave users with no controls, and the mobile ARIA/focus model and Clipboard fallback have material accessibility defects.

## Findings (ordered by severity)

### Critical

- `public/_headers:12` — **The CSP blocks the first-party share module.** `script-src` contains only inline-script hashes and omits `'self'`; the allowed inline module imports `/components/share/share.mjs` at `scripts/build-articles.mjs:198-200`. Because the placeholder is empty (`scripts/build-articles.mjs:274-278`), CSP enforcement leaves no share controls at all. Permit the exact same-origin module (or bundle/hash an executable implementation) and retain usable server-rendered actions as a fallback.

### High

- `public/components/share/share.mjs:304-309` — **The widget is initialized twice.** The module auto-initializes itself, while the page also explicitly calls `initAllShareWidgets()` at `scripts/build-articles.mjs:219`; `initAllShareWidgets()` has no initialized guard at `public/components/share/share.mjs:295-301`. This appends duplicate controls/live regions and, on mobile, duplicate menu IDs and ambiguous `aria-controls` relationships. Use one initialization owner and make initialization idempotent.

- `public/components/share/share.mjs:169-179` — **The mobile UI mixes incompatible disclosure and ARIA menu patterns.** It exposes `aria-haspopup`, `role="menu"`, and `role="menuitem"` (`public/components/share/share.mjs:207-212`) while retaining ordinary links/buttons and forcing Tab/Shift+Tab to cycle inside the tray (`public/components/share/share.mjs:225-250`). This traps keyboard users and contradicts the documented regular-list disclosure model (`docs/social-share-component.md:52-56`). Prefer a disclosure button controlling a normal list, allow native Tab order, and keep Escape/focus return; alternatively implement the complete ARIA menu-button keyboard model with roving tabindex.

- `public/components/share/share.mjs:99-112` — **The Clipboard fallback loses focus and can reject instead of reporting failure.** It focuses a temporary textarea, removes it without restoring the previously focused control, and does not catch exceptions from `document.execCommand('copy')`, despite the documented boolean-return contract. The rejection bypasses the live-region failure announcement in callers (`public/components/share/share.mjs:193-203`, `264-272`). Save and restore focus in `finally`, catch fallback exceptions, and return `false` for every failure path.

- `public/components/share/share.mjs:193-204` — **Closing the mobile tray after Copy does not return focus to the toggle.** The focused Copy button is hidden when `closeTray()` sets the menu to hidden, leaving focus in an invalid/removed-from-navigation subtree (and the legacy Clipboard path can move it to the temporary textarea first). Return focus to the disclosure toggle whenever activation closes the tray.

- `scripts/build-articles.mjs:274-278` — **There is no semantic/no-JavaScript fallback.** The server emits an empty `role="group"`; all native links and the Copy button are created only after JavaScript executes. This makes the controls unavailable under CSP failure, blocked/failed scripts, or user-disabled JS. Server-render the share links/email action as a labelled list and progressively enhance Copy and the mobile disclosure.

### Medium

- `public/components/share/share.css:74-85` — **The custom focus indicator is too low contrast.** Native outlines are removed and replaced with `--share-focus`, which resolves to 24%-opacity indigo at `public/articles/styles.css:48`. Against the paper background this is approximately 1.45:1, below the 3:1 non-text contrast expectation for focus indication. Keep the browser outline or use an opaque, high-contrast focus color; use `:focus-visible` so hover and keyboard focus are not conflated.

- `public/components/share/share.mjs:240-249` — **The Tab handler can throw when no menu item is focused or the item set is empty.** With `index === -1`, Shift+Tab indexes past the array; with no items, modulo by zero yields an invalid index, followed by `.focus()` on `undefined`. Removing the Tab override as part of the disclosure-pattern fix avoids this failure.

- `public/components/share/share.css:112-125` — **The expanded tray is absolutely positioned over following content.** At the end of an article this can overlap the footer and make controls obscured or difficult to activate. It also contradicts the documented in-flow tray at `docs/social-share-component.md:67`. Keep the expanded list in normal flow.

- `public/components/share/share.mjs:257-261` — **Desktop initialization overwrites the article-specific accessible name.** The generated root is named “Share this article” at `scripts/build-articles.mjs:276`, but desktop JS changes it to “Share this page”; the mobile toggle is likewise hard-coded at `public/components/share/share.mjs:171`. Preserve the author-provided root label and derive contextual toggle/list names from it.

- `public/components/share/share.css:155-162` — **Reduced-motion support is incomplete in article pages.** The component disables transitions, but `.article a` at `public/articles/styles.css:120` has greater specificity than `.share-link`, so its 180 ms text-decoration transition still applies. Increase reduced-motion selector specificity or add an article-level reduced-motion rule. Also consider disabling global smooth scrolling at `public/articles/styles.css:60` for reduced-motion users.

- `public/components/share/share.css:48-64` — **Desktop/hybrid touch targets have no minimum 44 px size.** The 44 px minimum is limited to the `max-width: 600px` rules at `public/components/share/share.css:101-106` and `131-139`; a coarse pointer on a wider/hybrid display gets smaller controls. Apply a suitable minimum target size globally or under `(pointer: coarse)`.

### Low

- `public/components/share/share.mjs:149-150` — **Randomly generated IDs are not collision-proof.** A six-character `Math.random()` suffix can collide, which would invalidate `aria-controls`; duplicate initialization already makes ID relationships more fragile. Use a deterministic per-root counter/unique-ID mechanism and guard against an existing target ID.

- `docs/social-share-component.md:7-9` — **SVG documentation does not match the implementation.** The docs claim separate local SVG files, while icons are inline strings at `public/components/share/share.mjs:14-20`. Update the documentation so future privacy/accessibility reviews inspect the actual asset path.

## Verified passes

- `public/components/share/share.mjs:120-138` — Controls use native `<button type="button">` for Copy and native `<a>` elements for navigation before the mobile menu-role override; each has a clear accessible name.
- `public/components/share/share.mjs:158-161` — Copy status uses a polite, atomic live region; returned success/failure values are announced by both UI variants.
- `public/components/share/share.mjs:14-20` — Inline SVG icons are decorative and correctly use `aria-hidden="true"` and `focusable="false"`; the surrounding controls provide their names.
- `public/components/share/share.mjs:85-113` — A Clipboard API fallback exists, uses a temporary textarea, and removes it in `finally`; focus restoration and exception normalization remain findings above.
- `public/components/share/share.mjs:44-81` — External social actions are ordinary user-activated URLs. They use `target="_blank"` with `rel="noopener noreferrer"`, preventing opener access and suppressing the Referer header.
- `public/components/share/share.mjs:1-310` — No third-party JavaScript, SDK, tracking pixel, analytics call, share-count request, `fetch`, XHR, beacon, iframe, or dynamically loaded remote asset appears in the component. Third-party domains occur only in destination URLs activated by the user. The inline SVGs and component CSS/JS are first-party and create no third-party requests.
- `public/_headers:9-12` — Site policy further limits leakage with `strict-origin-when-cross-origin`, a restrictive Permissions Policy, `connect-src`, `img-src`, and `frame-src` inherited from `default-src 'none'`. Note that choosing a social-share link necessarily discloses the destination URL/title encoded in that link to the selected platform; no platform receives data before activation from this component.
