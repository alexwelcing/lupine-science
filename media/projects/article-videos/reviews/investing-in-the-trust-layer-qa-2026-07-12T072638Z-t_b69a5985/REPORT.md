# Live QA report — Investing in the Trust Layer

- Task: `t_b69a5985`
- Tested: `2026-07-12T07:26:38Z`
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T072638Z`

## Smoke suite

`npm run smoke` passed with exit code 0:

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Video endpoint

The cache-busted request completed, but the endpoint is not serving MP4 media:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Download size: `84,245` bytes
- `file(1)`: `HTML document, Unicode text, UTF-8 text, with very long lines (753)`
- First 16 bytes: `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)
- SHA-256: `241c15b8f4e5ee15dce520a2b29e264f8508dccd2a38fdf7667d415fd5c2f0d1`

## Verdict

**FAIL / BLOCKED.** The site-wide smoke suite passes, and the requested URL returns HTTP 200, but it returns the HTML fallback document instead of an MP4 payload. The acceptance criterion requiring the correct video content type is not met.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `video-headers.txt`
- `video-response.bin`
- `curl-summary.txt`
- `curl-exit-code.txt`
- `file-type.txt`
- `prefix.txt`
- `sha256.txt`
