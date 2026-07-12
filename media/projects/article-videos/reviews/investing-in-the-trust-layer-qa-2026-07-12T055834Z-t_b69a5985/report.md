# Investing in the Trust Layer — QA smoke verification

Run: 2026-07-12 05:58:34 UTC  
Task: `t_b69a5985`  
Target: `https://lupine.science`  
Video: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T055834Z`

## Result: FAIL

- `npm run smoke`: PASS (exit 0) — 14 pages and 352 linked resources; all live smoke checks passed.
- Video HTTP status: PASS — `200`.
- Video content type: FAIL — `text/html; charset=utf-8` (expected `video/mp4`).
- Downloaded payload: FAIL — 84,245 bytes, detected as `text/html`.
- `ffprobe`: FAIL — invalid data, confirming the response is not an MP4.
- Redirects: 0.

The generic live smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` resolves to the site's HTML fallback instead of an MP4 object. The acceptance criterion is not met; deploy the video or correct the route, then rerun QA.
