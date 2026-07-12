# Investing in the Trust Layer — live QA verification

Task: `t_b69a5985`
Timestamp (UTC): `2026-07-12T08:11:25Z`

## `npm run smoke`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T081125Z`

Result: FAIL

- HEAD status: `200`
- HEAD `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Cache-busted range GET status: `206`
- Range GET `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded prefix MIME detected by `file`: `text/html`
- Redirects: `0`

The URL returns the site's HTML fallback rather than an MP4. The smoke suite passes because it validates linked-resource HTTP success, but the direct-video MIME contract remains unsatisfied.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `head-headers.txt`
- `head-result.txt`
- `headers.txt`
- `curl-result.txt`
- `prefix.bin`
- `prefix-mime.txt`
- `url.txt`
