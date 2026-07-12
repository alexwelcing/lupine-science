# Investing in the Trust Layer — live QA smoke verification

Checked: 2026-07-12T04:59:25Z
Task: `t_b69a5985`
Target: `https://lupine.science`

## Result: BLOCKED / FAIL

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Required video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
Result: FAIL

Cache-busted HEAD response:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)

Cache-busted range GET (`bytes=0-65535`):

- HTTP status: `206`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `65,536` bytes
- Detected MIME type: `text/html`
- First 16 bytes: `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)
- `ffprobe`: invalid media

The route still serves the site's HTML fallback instead of an MP4. The HEAD request meets the HTTP 200 portion of the contract, but the MIME type and response body do not.

## Evidence

- `smoke.log`
- `head.txt`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `prefix-hex.txt`
- `ffprobe.txt`
