# Static share icons

Same-origin SVG assets for X, LinkedIn, and email. They contain no scripts, remote references, tracking pixels, fonts, or platform-colored styling. Each icon uses `currentColor` and inherits the surrounding control's color when embedded inline.

The files are decorative by default (`aria-hidden="true"` and `focusable="false"`). Put the accessible name on the interactive link so assistive technology announces one concise label.

## External share link

```html
<a
  href="https://twitter.com/intent/tweet?text=Article%20title&url=https%3A%2F%2Fexample.com%2Farticle%2F"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Share on X (opens in a new tab)"
>
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <!-- Copy the path from x.svg here. -->
  </svg>
</a>
```

```html
<a
  href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fexample.com%2Farticle%2F"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Share on LinkedIn (opens in a new tab)"
>
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <!-- Copy the path from linkedin.svg here. -->
  </svg>
</a>
```

```html
<a href="mailto:?subject=Article%20title&amp;body=Article%20title%0A%0Ahttps%3A%2F%2Fexample.com%2Farticle%2F" aria-label="Share by email">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <!-- Copy the path from email.svg here. -->
  </svg>
  <span>Share by email</span>
</a>
```

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
