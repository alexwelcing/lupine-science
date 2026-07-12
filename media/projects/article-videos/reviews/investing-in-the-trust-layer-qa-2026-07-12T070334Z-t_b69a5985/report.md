# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T07:03:34Z
Task: `t_b69a5985`
Target: `https://lupine.science`

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T070334Z`
Result: FAIL

A cache-busting request with `Accept: video/mp4` and `Cache-Control: no-cache` returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected file MIME type: `text/html`
- SHA-256: `6d4616857fb49ca0b5d1b382b61c44664e3820fd92f4e23799e2539dde47330a`
- `ffprobe`: exit 1; payload is not valid media

The endpoint currently serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video-link contract.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `video-response.bin`
- `curl-summary.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe-error.txt`
- `result.env`
