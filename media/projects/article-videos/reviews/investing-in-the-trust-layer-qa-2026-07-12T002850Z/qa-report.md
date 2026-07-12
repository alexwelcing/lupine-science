# Investing in the Trust Layer — live video QA

Tested: 2026-07-12T00:28:50Z
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Smoke suite

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Direct video verification

A cache-busting GET with `Range: bytes=0-1048575` returned:

- HTTP status: `206` (the origin honored the range; a non-range request previously returned 200)
- Content-Type: `text/html; charset=utf-8` — incorrect for MP4
- Downloaded bytes: `84055`
- `file` identification: HTML document, not ISO Media/MP4

Conclusion: the requested acceptance criterion is not met. The route resolves to an HTML page/fallback rather than the MP4 asset. The smoke suite currently treats any 2xx response as healthy and does not validate linked-resource media type, so it produces a false pass for this route.

Evidence:

- `video-headers.txt`
- `curl-result.txt`
- `video-prefix.bin`
- `file-result.txt`
