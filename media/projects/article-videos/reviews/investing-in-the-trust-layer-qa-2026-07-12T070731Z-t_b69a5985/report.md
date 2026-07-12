# Investing in the Trust Layer — live QA verification

- Task: `t_b69a5985`
- Checked at: `2026-07-12T07:07:31Z`
- Result: **FAIL — video URL serves HTML instead of MP4**

## Site smoke suite

Command run from `/home/alex/Dev/lupine/lupine-science`:

`npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Video endpoint

URL:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T070731Z`

Full GET result:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84245` bytes
- Detected MIME type: `text/html`
- First 16 bytes (hex): `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)
- Redirects: `0`

## Conclusion

The general live smoke suite passes, and the requested path returns HTTP 200, but the required video-link verification fails. The response is the site's HTML fallback rather than MP4 media, so the endpoint does not have the correct Content-Type or payload.

Raw evidence is stored alongside this report: `smoke.log`, `headers.txt`, `curl.txt`, `response.bin`, `detected-mime.txt`, `prefix-hex.txt`, `url.txt`, and `result.env`.
