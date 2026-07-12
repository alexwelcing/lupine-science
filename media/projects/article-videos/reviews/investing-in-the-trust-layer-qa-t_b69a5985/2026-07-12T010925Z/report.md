# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T01:09:25Z

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
- File detection: HTML document
- SHA-256: `abe1df7e3ada1becacff438acaf93e121a3f9f08485488cd44e068afaef745d8`
- ffprobe exit: `1` (not valid media)

The live route serves the site's HTML fallback rather than the MP4. The task cannot pass until the MP4 is included in the live deployment and served with `Content-Type: video/mp4`.

Raw evidence is stored alongside this report: `smoke.log`, `headers.txt`, `curl.txt`, `response.bin`, `file.txt`, `sha256.txt`, and `ffprobe.txt`.
