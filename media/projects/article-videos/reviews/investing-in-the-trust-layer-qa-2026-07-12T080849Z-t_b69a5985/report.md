# Investing in the Trust Layer — live QA verification

Task: `t_b69a5985`
Timestamp (UTC): `2026-07-12T08:08:49Z`

## `npm run smoke`

Result: PASS (exit code 0)

```text
Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Direct video contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

- Plain HEAD: HTTP `200`
- Plain HEAD `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Cache-busted range GET: HTTP `206`
- Range GET `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded prefix MIME detected by `file`: `text/html`
- Response size advertised by `Content-Range`: `84055` bytes
- Redirects: `0`

The smoke suite currently treats any successful linked-resource HTTP status as a pass and does not validate the video MIME type, so its green result does not satisfy the task's direct-video acceptance criterion.

## Evidence

- `headers.txt` — range GET response headers
- `prefix.bin` — first 4096 response bytes
- `prefix-mime.txt` — MIME detection result
- `result.txt` — curl status/content-type metrics
- `url.txt` — cache-busted request URL
