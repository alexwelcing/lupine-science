# Investing in the Trust Layer — live QA smoke test

Tested: 2026-07-12T04:17:54Z
Target: https://lupine.science

## Result: BLOCKED / FAIL

### Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Exit code: 0

Output:

```text
> lupine-science@0.1.0 smoke
> node scripts/smoke-live.mjs

Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

### Required video URL

URL: https://lupine.science/videos/investing-in-the-trust-layer.mp4

HEAD response:

- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Content-Length: not provided on HEAD

Range GET (`bytes=0-15`) response:

- HTTP status: 206
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Content-Range: `bytes 0-15/84055`
- First 16 bytes (hex): `3c21646f63747970652068746d6c3e0a`
- Decoded prefix: `<!doctype html>\n`

The URL resolves to an HTML fallback document, not an MP4 file. The HTTP 200 requirement is met for HEAD, but the required media content type and file body are not.

### Link verification

The live `/videos/` index does not contain an `investing-in-the-trust-layer` link. The live article page also does not contain an MP4 source or download link for this slug. Existing video links on the live index cover other article slugs only.

### Conclusion

Do not approve this video deployment yet. Publish the MP4 at `/videos/investing-in-the-trust-layer.mp4` with `Content-Type: video/mp4`, add the intended live link, and rerun this QA check.
