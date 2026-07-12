# Investing in the Trust Layer — live-link QA result

UTC verification run: 2026-07-11T21:35:00Z

## Result: FAIL

- `npm run smoke`: PASS (exit 0; 14 pages and 352 linked resources)
- Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Effective content type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- `file`: HTML document
- `ffprobe`: failed with `moov atom not found`; payload is not a playable MP4
- SHA-256: `a864c4a452d2c3ea1c36863726e80db8b53c7de9aaf7067d4b23df9ae1632c44`

The live route appears to return an HTML fallback page with a successful status rather than the requested video asset. The task's content-type acceptance criterion is therefore not met, despite the broad smoke suite passing.

Evidence is stored alongside this report: `npm-smoke.log`, `npm-smoke.exit`, `video-headers.txt`, `video-curl-summary.txt`, `video-curl.exit`, `video-file.txt`, `video-ffprobe.txt`, `video-sha256.txt`, and the downloaded response payload.
