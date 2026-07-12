# Investing in the Trust Layer — production QA

Tested: 2026-07-12 02:54–02:55 UTC
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: FAIL

- `npm run smoke`: PASS (exit 0; 14 pages and 352 linked resources).
- Direct cache-busted video request: HTTP 200, but `Content-Type: text/html; charset=utf-8`.
- Downloaded response: 84,245 bytes, detected as an HTML document.
- `ffprobe`: failed with `Invalid data found when processing input`.
- Therefore the required MP4 endpoint does not currently serve video content despite returning 200.

## Local source sanity check

`public/videos/investing-in-the-trust-layer.mp4` is a valid MP4:

- SHA-256: `bf44a1a5ea76b63acc51423276268de42dc12000d94c5b07f0ef9985bdb97e49`
- Duration: 117.034 seconds
- Size: 3,813,568 bytes
- Format: `mov,mp4,m4a,3gp,3g2,mj2`

This indicates a deployment/routing issue rather than a corrupt local source asset. The generic smoke suite currently checks only HTTP success for linked resources, so the HTML fallback response passes it.

## Evidence

- `npm-smoke.log`
- `npm-smoke-exit.txt`
- `video-check.txt`
- `video-headers.txt`
- `video-file-type.txt`
- `video-ffprobe.txt`
- `video-response.bin`
