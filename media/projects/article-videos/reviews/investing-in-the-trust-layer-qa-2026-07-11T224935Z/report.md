# Investing in the Trust Layer — live QA

Timestamp: 2026-07-11T22:49:35Z

## Smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video verification

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Response size: 84,245 bytes
- Local MIME identification: HTML document
- First bytes: `<!doctype html>`
- `ffprobe`: failed with `moov atom not found` / invalid media

The live route is returning the site's HTML fallback with HTTP 200 rather than the requested MP4. The task's required status/content-type contract is therefore not met.

Evidence:

- `headers.txt` — complete response headers
- `response.mp4` — response body (HTML despite extension)
