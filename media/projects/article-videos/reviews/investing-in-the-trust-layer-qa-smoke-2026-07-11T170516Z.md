# Investing in the Trust Layer — QA smoke recheck

Checked at: 2026-07-11T17:05:16Z

## Result

- `npm run smoke`: **PASS** (exit 0)
  - 14 pages
  - 352 linked resources
- Direct video URL: **FAIL**
  - URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T170516Z`
  - HTTP status: 200
  - `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
  - `CF-Cache-Status`: `MISS`
  - Downloaded size: 84,245 bytes
  - Detected MIME: `text/html`
  - `ffprobe`: exit 1 (`Invalid data found when processing input`)

## Conclusion

The general live-site smoke suite passes, but the required `/videos/investing-in-the-trust-layer.mp4` media contract does not. The endpoint serves the site's HTML fallback rather than an MP4. The video must be deployed to that exact public path before QA approval.

## Evidence

- `investing-in-the-trust-layer-smoke-2026-07-11T170516Z.log`
- `investing-in-the-trust-layer-video-headers-2026-07-11T170516Z.txt`
