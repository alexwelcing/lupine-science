# Investing in the Trust Layer — live video QA

Timestamp: 2026-07-12T04:12:25Z

URL: https://lupine.science/videos/investing-in-the-trust-layer.mp4

## Results

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- Live video HTTP status: 200.
- Live video content type: **FAIL** — `text/html; charset=utf-8` (expected `video/mp4`).
- Downloaded body: 84,245 bytes and identified by `file` as an HTML document.
- `ffprobe`: FAIL — `moov atom not found`; body is not a valid MP4.
- Cache-busting query and `Accept: video/mp4` produced the same `200 text/html` response, confirming this is not a stale cache hit.
- Local expected asset exists at `public/videos/investing-in-the-trust-layer.mp4`, is identified as ISO Media/MP4, and is 3,813,568 bytes.

## Conclusion

The site-wide smoke test passes, but the required live video-link verification fails. Production is serving the HTML fallback for the MP4 path rather than the local MP4 asset. The production video asset/deployment routing must be corrected, then this QA task should be rerun.
