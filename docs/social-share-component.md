# Lupine Science — Social-share component

A self-contained, same-origin share component for Lupine Science articles and the video index page. It is intentionally quiet: no third-party scripts, no share counts, no platform colors, and no sticky or floating behavior.

## Files

- `/public/components/share/share.mjs` — vanilla JS module that renders the action list and wires copy-to-clipboard.
- `/public/components/share/share.css` — styles for the inline desktop row and mobile disclosure tray.
- `/public/assets/icons/share/` contains the standalone static SVG set (`bluesky.svg`, `x.svg`, `linkedin.svg`, `copy-link.svg`, `email.svg`) and accessible markup examples in its `README.md`.
- `/public/components/share/share.mjs` inlines the same icon geometry so the interactive controls inherit `currentColor` without extra network requests.

## Usage

### Article pages

The article build script (`scripts/build-articles.mjs`) emits an enhanced root containing the complete fallback action list:

```html
<div class="share-root" data-url="https://lupine.science/articles/<slug>/" data-title="Article Title" role="group" aria-label="Share this article">
  <span class="share-label">Share</span>
  <ul class="share-list" role="list" aria-label="Share options">...</ul>
</div>
```

The page script imports the module and calls `initAllShareWidgets()` to hydrate every `.share-root` on the page.

### Other pages (e.g. `/videos/`)

Add the placeholder manually:

```html
<link rel="stylesheet" href="/components/share/share.css">
...
<div class="share-root" data-url="https://lupine.science/videos/" data-title="Videos — Lupine Science" role="group" aria-label="Share this page"></div>

<script type="module">
  import { initAllShareWidgets } from "/components/share/share.mjs";
  initAllShareWidgets();
</script>
```

## Actions

1. **Bluesky** — opens `https://bsky.app/intent/compose?text=<title>%20<url>`.
2. **X** — opens `https://twitter.com/intent/tweet?text=<title>&url=<url>`.
3. **LinkedIn** — opens `https://www.linkedin.com/sharing/share-offsite/?url=<url>`.
4. **Copy link** — copies the canonical URL to the clipboard, with a `textarea` + `execCommand` fallback for non-secure contexts or older browsers.
5. **Email** — opens a `mailto:` with the title as the subject and the URL as the body.

All external destinations use `target="_blank" rel="noopener noreferrer"`. Canonical URLs and titles are taken from the build output, not scraped from the page.

## Accessibility

- The root is a `role="group"` with an `aria-label`.
- Actions are plain links or a native `<button>`; no ARIA menu roles are used.
- The mobile disclosure button uses `aria-expanded` and `aria-controls`.
- Copy feedback is announced through a polite, atomic live region.
- `Escape` closes the mobile tray and returns focus to the disclosure button.

## No-JS fallback

Article builds server-render the complete action list, so social and email links remain usable if JavaScript fails. JavaScript enhances the copy action and replaces the list with a disclosure tray on mobile.

## Styling notes

- Uses existing Lupine CSS tokens: `--paper`, `--paper-deep`, `--ink-soft`, `--ink-faint`, `--rule`, `--indigo`, `--indigo-deep`, `--indigo-wash`, `--verified`, `--mono`, `--ease`.
- No platform brand colors or gradients.
- Desktop: inline labelled row after the article body.
- Mobile (`<=600px`): single disclosure button that expands into an in-flow vertical tray.
- Print: hidden, no reserved space.

## Tests

Run the component tests with the rest of the suite:

```bash
npm test
```

Tests cover URL encoding, each share-action URL, the clipboard fallback path, native labelled controls, mobile Escape/focus behavior, reduced-motion/focus styles, and the presence of Open Graph / Twitter Card / share-component tags in generated article pages.
