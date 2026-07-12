# Investing in the Trust Layer — live video QA

Checked: 2026-07-12 00:41:02 UTC

## Result: FAIL

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T004102Z`
- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Detected MIME type: `text/html`
- `ffprobe`: FAIL — `Invalid data found when processing input`
- Cloudflare cache status: `MISS`, confirming this was a fresh origin response rather than a stale cached object.

The required video-link contract is not satisfied. The route returns the site's HTML fallback with status 200, not an MP4. Publish the approved video at `public/videos/investing-in-the-trust-layer.mp4` (or correct the deployment routing), then rerun this QA task.
