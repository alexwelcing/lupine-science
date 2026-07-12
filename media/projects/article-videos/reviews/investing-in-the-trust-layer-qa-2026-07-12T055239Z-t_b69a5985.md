# Investing in the Trust Layer — QA smoke and video-link verification

Checked: 2026-07-12T05:52:39Z  
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: **PASS** (exit 0)
- Coverage: 14 pages and 352 linked resources
- Runner output: `All live smoke checks passed across 1 target(s).`

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busted request: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T055239Z`
- HTTP status: `200`
- Actual Content-Type: `text/html; charset=utf-8`
- Required Content-Type: `video/mp4`
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- First 16 bytes: `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)
- `ffprobe`: failed with `Invalid data found when processing input`

## Verdict

**FAIL / BLOCKED.** The smoke suite passes and the route returns HTTP 200, but the response is the site HTML fallback rather than an MP4 payload. The required direct-video content-type criterion is not met.
