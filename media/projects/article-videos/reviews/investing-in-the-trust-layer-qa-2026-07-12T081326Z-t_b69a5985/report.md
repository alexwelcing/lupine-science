# Investing in the Trust Layer — QA verification

Task: `t_b69a5985`
Timestamp (UTC): `2026-07-12T08:13:26Z`

## Smoke suite

PASS — `npm run smoke` exited 0.

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T081326Z`

FAIL — the requested MP4 is not being served.

- Cache-busted range GET status: `206` (the task requires `200`)
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded response prefix detected as `text/html`
- Redirects: `0`
- Response size for requested range: 4096 bytes

The endpoint is serving the site's HTML fallback rather than an MP4. The smoke suite passes because it validates linked-resource HTTP success, but the direct video status/MIME acceptance criterion remains unsatisfied.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `headers.txt`
- `curl-result.txt`
- `prefix.bin`
- `prefix-mime.txt`
- `url.txt`
