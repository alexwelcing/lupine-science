# QA smoke test — Investing in the Trust Layer

Tested: 2026-07-12 06:56 UTC
Target: https://lupine.science
Task: t_b69a5985

## Site smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T065610Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded response size: 84,245 bytes
- `file(1)` identifies the payload as an HTML document
- First 32 bytes begin `3c 21 64 6f 63 74 79 70 65`, i.e. `<!doctype`, not an MP4 `ftyp` signature
- A range request also returned HTTP 200 HTML rather than MP4 media
- Initial Cloudflare cache status was `MISS`

## Verdict

BLOCKED / FAIL. The general live smoke suite passes, and the requested path returns HTTP 200, but it serves the site's HTML fallback rather than MP4 content. The required correct content type and media payload are not present.

Supporting evidence is stored alongside this report: `npm-run-smoke.log`, `smoke-exit-code.txt`, `headers.txt`, `range-headers.txt`, `curl-summary.txt`, `prefix.bin`, `prefix-hex.txt`, and `file-prefix.txt`.
