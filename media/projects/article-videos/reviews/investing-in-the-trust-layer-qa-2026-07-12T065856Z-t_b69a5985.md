# Investing in the Trust Layer — live QA verification

- Task: `t_b69a5985`
- Checked at: `2026-07-12T06:58:56Z`
- Result: **FAIL — video URL serves HTML instead of MP4**

## Site smoke suite

Command (from `/home/alex/Dev/lupine/lupine-science`):

`npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Video endpoint

URL:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T065856Z`

Full GET result:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84245` bytes
- Detected MIME type: `text/html`
- First 16 bytes (hex): `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)

A byte-range request made immediately before the full GET also returned `206 Partial Content` with `Content-Type: text/html; charset=utf-8`, confirming the response is the site's HTML fallback rather than MP4 media.

## Conclusion

The general smoke suite passes, and the requested path returns HTTP 200 for a full GET, but the required media verification fails because the payload and Content-Type are HTML. The MP4 is not currently available at the requested live URL.
