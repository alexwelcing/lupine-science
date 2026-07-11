# Static share icons

Same-origin SVG assets for Bluesky, X, LinkedIn, copy link, and email. They contain no scripts, remote references, tracking pixels, fonts, or platform-colored styling. Each icon uses `currentColor` and inherits the surrounding control's color when embedded inline.

The files are decorative by default (`aria-hidden="true"` and `focusable="false"`). Put the accessible name on the interactive link or button so assistive technology announces one concise label.

## External share link

```html
<a
  href="https://bsky.app/intent/compose?text=Article%20title%20https%3A%2F%2Fexample.com%2Farticle%2F"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Share on Bluesky (opens in a new tab)"
>
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <!-- Copy the path from bluesky.svg here. -->
  </svg>
</a>
```

## Copy-link button with feedback

```html
<button type="button" aria-label="Copy link" aria-describedby="copy-status">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <!-- Copy the shapes from copy-link.svg here. -->
  </svg>
</button>
<span id="copy-status" role="status" aria-live="polite"></span>
```

Update the live region to `Link copied to clipboard` after a successful copy. Do not replace the button's accessible name with transient status text.

## External image variant

When the icon is loaded with `<img>`, keep its alternative text empty because the parent control supplies the name:

```html
<a href="mailto:?subject=Article%20title&amp;body=https%3A%2F%2Fexample.com%2Farticle%2F">
  <img src="/assets/icons/share/email.svg" alt="" width="24" height="24">
  <span>Share by email</span>
</a>
```

Note that an SVG loaded through `<img>` cannot inherit `currentColor`; use inline SVG when color inheritance is required.

## Standalone meaningful icon

If an icon must convey meaning without an enclosing labelled control, remove `aria-hidden`, add `role="img"`, and supply a unique title reference:

```html
<svg viewBox="0 0 24 24" role="img" aria-labelledby="linkedin-icon-title">
  <title id="linkedin-icon-title">LinkedIn</title>
  <!-- Copy the path from linkedin.svg here. -->
</svg>
```

Prefer the labelled-control patterns above for share actions. Preserve a visible keyboard focus indicator and a minimum 44 by 44 CSS-pixel target around each icon.
