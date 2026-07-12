# Investing in the Trust Layer — live QA smoke

Timestamp: 2026-07-11T19:47:05Z
Target: https://lupine.science/videos/investing-in-the-trust-layer.mp4
Result: BLOCKED

## Smoke suite

Command: `npm run smoke`
Exit code: 0
Result: `PASS: 14 pages and 352 linked resources`; `All live smoke checks passed across 1 target(s).`

## Direct video verification

- HTTP status: 200
- Response Content-Type: `text/html; charset=utf-8`
- Detected body MIME type: `text/html`
- Downloaded size: 84,245 bytes
- `ffprobe`: failed with `Invalid data found when processing input`

Expected Content-Type: `video/mp4`.

The stable video URL resolves to the site's HTML fallback rather than an MP4. The smoke suite currently checks linked-resource reachability but does not validate media MIME type, so its pass does not establish a valid video deployment.

Evidence:
- `investing-in-the-trust-layer-qa-2026-07-11T194705Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T194705Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T194705Z-response.bin`
