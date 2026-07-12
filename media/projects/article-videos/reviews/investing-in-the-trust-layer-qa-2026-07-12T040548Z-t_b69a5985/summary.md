# Investing in the Trust Layer — live QA

- Task: `t_b69a5985`
- Checked at: `2026-07-12T04:05:48Z` (UTC)
- Slug: `investing-in-the-trust-layer`
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T040548Z`

## Smoke test

`npm run smoke` passed with exit code 0:

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Direct video verification

The endpoint did not serve an MP4:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected a video type such as `video/mp4`)
- Download size: 84,245 bytes
- Redirects: 0
- `file`: HTML document
- `ffprobe`: invalid data, exit code 1

Conclusion: the general live smoke suite passes, but the requested video-link verification fails because the route returns the HTML fallback with status 200 rather than MP4 media.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
