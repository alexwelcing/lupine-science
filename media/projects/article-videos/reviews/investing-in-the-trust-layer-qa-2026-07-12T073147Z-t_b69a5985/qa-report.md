# Investing in the Trust Layer — live QA

- Task: `t_b69a5985`
- Checked: 2026-07-12 07:31–07:32 UTC
- Result: **BLOCKED / FAIL**

## Smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: exit code 0. The live smoke suite reported 14 pages and 352 linked resources passing.

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (queried with a cache-busting query parameter)

Observed:

- HTTP status: `200`
- `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- `file` detection: `text/html`
- `ffprobe`: failed with `Invalid data found when processing input`

The URL returns the site HTML fallback rather than an MP4, so the video-link acceptance criterion is not met even though the general smoke suite passes.

## Evidence

- `npm-run-smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `curl-result.txt`
- `video-headers.txt`
- `video-response.bin`
- `file-mime-type.txt`
- `ffprobe-error.txt`
- `sha256.txt`
