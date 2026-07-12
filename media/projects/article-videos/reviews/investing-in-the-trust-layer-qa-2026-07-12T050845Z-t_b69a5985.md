# Investing in the Trust Layer — QA smoke verification

Tested: 2026-07-12T05:08:45Z
Task: `t_b69a5985`
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: BLOCKED / FAIL

### Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Exit code: 0

```text
> lupine-science@0.1.0 smoke
> node scripts/smoke-live.mjs

Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

### Required video URL

HEAD response:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`

Range GET (`bytes=0-15`) response:

- HTTP status: `206`
- Content-Type: `text/html; charset=utf-8`
- Content-Range: `bytes 0-15/84055`
- First 16 bytes: `3c 21 64 6f 63 74 79 70 65 20 68 74 6d 6c 3e 0a`
- Decoded prefix: `<!doctype html>\n`
- Detected MIME type: `text/html`

## Conclusion

The repository smoke suite passes, and HEAD returns HTTP 200, but the required URL serves the site's HTML fallback rather than an MP4. The task cannot pass until the file is deployed at the requested path with `Content-Type: video/mp4`.
