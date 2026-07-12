# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T21:22:39Z
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across 1 live target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (cache-busting query used)
- HTTP status: `200`
- Response Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded bytes: `84,245`
- File MIME detection: `text/html`
- SHA-256: `44418a2fb5fedba3222c0af377ebd379701cf5e24de9972b96a849d8787d4745`
- ffprobe: FAIL — invalid media data

## Verdict

FAIL. The repository smoke suite passes, but the required live video contract does not. The URL returns the site HTML fallback with HTTP 200 rather than an MP4 response. Release verification must remain blocked until the deployed endpoint serves `video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `url.txt`
- `headers.txt`
- `curl-metrics.txt`
- `response.bin`
