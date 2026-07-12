# Investing in the Trust Layer — live video QA

Timestamp: 2026-07-12T02:40:23Z
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: FAIL

- `npm run smoke`: PASS (exit 0; 14 pages and 352 linked resources).
- Direct cache-busted video request: HTTP 200.
- Expected content type: `video/mp4`.
- Actual content type: `text/html; charset=utf-8`.
- Downloaded body: 84,245 bytes; identified by `file` as an HTML document, not MP4.
- Redirects: 0.

The video-link acceptance criterion is not met. The smoke suite currently does not detect this wrong-content-type response because its linked-resource check only validates HTTP success.

Evidence is stored alongside this report: `smoke.log`, `video-curl.txt`, `video-headers.txt`, `video-response.bin`, `video-file.txt`, and `video-sha256.txt`.
