# Investing in the Trust Layer — live QA smoke verification

Timestamp: 2026-07-12T04:14:43Z
Task: `t_b69a5985`
Result: **FAIL**

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

- Exit code: 0
- 14 pages checked
- 352 linked resources checked
- Result: PASS

## Required video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T041443Z-t_b69a5985`

Expected:

- HTTP 200
- `Content-Type: video/mp4`
- Valid MP4 payload

Actual:

- HTTP 200
- `Content-Type: text/html; charset=utf-8`
- 84,245-byte HTML payload (`file` reports `text/html`)
- `ffprobe` exit code 1 (invalid media payload)

## Verdict

The production smoke suite passes, but the video-link acceptance criterion is not met. The endpoint still resolves to the site's HTML fallback instead of serving an MP4.

## Evidence

- `curl.txt`
- `headers.txt`
- `response.bin`
- `file-mime.txt`
- `ffprobe.txt`
- `sha256.txt`
- `status.txt`
- `url.txt`
