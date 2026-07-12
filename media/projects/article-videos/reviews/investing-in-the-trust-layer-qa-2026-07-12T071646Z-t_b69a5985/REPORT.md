# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T07:16:46Z
Task: `t_b69a5985`
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: BLOCKED / FAIL

- `npm run smoke`: PASS (exit 0)
  - 14 pages checked
  - 352 linked resources checked
- Direct video request: FAIL acceptance criteria
  - HTTP status: `200`
  - Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
  - Download size: 84,245 bytes
  - `file` identification: HTML document, not MP4

The source tree contains a valid local MP4 at `public/videos/investing-in-the-trust-layer.mp4` (3,813,568 bytes), and generated pages link to the expected slug. Production appears not to contain the asset; the host's HTML fallback is returned with status 200.

## Evidence

- `npm-smoke.log`
- `video-headers.txt`
- `curl-summary.txt`
- `file-identification.txt`
- `exit-codes.txt`
- `investing-in-the-trust-layer.mp4` (captured production response; despite suffix, this is HTML)

## Required follow-up

Deploy/synchronize `public/videos/investing-in-the-trust-layer.mp4` to production, then rerun this QA and require both HTTP 200 and `Content-Type: video/mp4`.
