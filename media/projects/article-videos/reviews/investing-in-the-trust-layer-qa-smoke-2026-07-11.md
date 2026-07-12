# Investing in the Trust Layer — live QA smoke test

Checked: 2026-07-11T20:27:23Z
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## `npm run smoke`

Run from `/home/alex/Dev/lupine/lupine-science`.

Result: PASS (exit code 0)

```text
Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Direct video endpoint verification

Result: FAIL

HEAD request:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Accept-Ranges: `bytes`

Range GET (`bytes=0-31`):

- HTTP status: `206`
- Content-Type: `text/html; charset=utf-8`
- First bytes (hex): `3c21646f63747970652068746d6c3e0a3c68746d6c206c616e673d22656e223e`
- Decoded prefix: `<!doctype html>\n<html lang="en">`
- HTML title: `Lupine Science — Unlocking the materials that build the future`

The live URL is serving the homepage HTML fallback rather than an MP4. The local source file does exist at `public/videos/investing-in-the-trust-layer.mp4`, so the observed failure is in the deployed artifact/routing rather than the source link being absent locally.

## QA conclusion

The general smoke suite passes, but the task acceptance criterion does not: `/videos/investing-in-the-trust-layer.mp4` does not return the correct media content type or MP4 bytes. The smoke suite currently treats any successful HTTP status as a valid linked resource and therefore does not detect this wrong-content response.
