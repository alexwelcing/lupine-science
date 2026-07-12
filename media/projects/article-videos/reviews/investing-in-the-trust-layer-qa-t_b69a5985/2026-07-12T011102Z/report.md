# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T01:11:02Z

## Repository smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Stable video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

A cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File detection: `text/html`
- SHA-256: `4007fd5c48c5e7e470801a50c25b5e1915f63f636c665fa6c90848a50d87d1c5`
- ffprobe exit: `1` (not valid media)

The route still serves the site's HTML fallback rather than an MP4. This task cannot pass until the live deployment includes the video at the stable URL and serves it with `Content-Type: video/mp4`.

Raw evidence is stored alongside this report: `smoke.log`, `headers.txt`, `curl.txt`, `response.bin`, `file.txt`, `sha256.txt`, `ffprobe.txt`, and `exits.txt`.
