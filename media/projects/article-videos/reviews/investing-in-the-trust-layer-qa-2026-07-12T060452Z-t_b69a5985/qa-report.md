# Investing in the Trust Layer — live QA smoke verification

- Task: `t_b69a5985`
- Run time: 2026-07-12 06:04–06:05 UTC
- Production target: `https://lupine.science`
- Video URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T060452Z`
- Overall result: **FAIL**

## Smoke suite

`npm run smoke` completed successfully (exit code 0):

- 14 pages passed
- 352 linked resources passed
- 1 production target passed

Full output: `npm-smoke.log`

## Direct video verification

The URL returned HTTP 200, but did not return MP4 media:

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Detected MIME type: `text/html`
- Download size: 84,245 bytes
- Redirects: 0
- `ffprobe`: failed with `Invalid data found when processing input`

The acceptance criterion is therefore not met. The production route appears to serve the site's HTML fallback instead of the checked-in video asset. The local asset exists at `public/videos/investing-in-the-trust-layer.mp4`, so deployment/static asset publication should be investigated.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit-code.txt`
- `headers.txt`
- `curl-summary.txt`
- `detected-mime.txt`
- `file-size.txt`
- `ffprobe.txt`
- `response.bin`
- `url.txt`
