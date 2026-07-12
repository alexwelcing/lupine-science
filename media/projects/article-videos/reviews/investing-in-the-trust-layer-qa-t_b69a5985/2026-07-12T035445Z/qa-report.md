# Investing in the Trust Layer — production smoke verification

Timestamp: 2026-07-12T03:54:45Z
Task: `t_b69a5985`
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: BLOCKED

- `npm run smoke`: PASS (exit 0), covering 14 pages and 352 linked resources.
- Exact video URL HEAD: HTTP 200, but `Content-Type: text/html; charset=utf-8` (expected `video/mp4`).
- Exact video URL ranged GET: HTTP 206, but `Content-Type: text/html; charset=utf-8`; reported total size is 84,055 bytes, consistent with an HTML fallback rather than the expected MP4.
- Cache-busted ranged GET: also HTTP 206 with `Content-Type: text/html; charset=utf-8` and `cf-cache-status: MISS`, so this is not only stale edge cache.

The required MIME-type criterion is not met. The live smoke suite currently checks resource reachability/status but does not validate video MIME types, which explains why it passes this broken deployment state.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-check.txt`
- `video-headers.txt`
- `exact-get-check.txt`
- `exact-get-headers.txt`
- `cache-busted-get-check.txt`
- `cache-busted-get-headers.txt`
