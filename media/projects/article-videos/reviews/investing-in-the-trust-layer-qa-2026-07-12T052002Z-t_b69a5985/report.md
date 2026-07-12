# Investing in the Trust Layer — live QA

Verified: 2026-07-12T05:20:02Z
Task: `t_b69a5985`

## Result

**BLOCKED / FAIL** — the production smoke suite passes, but the required direct video URL does not serve an MP4.

## Smoke suite

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

Evidence: `smoke.log`, `smoke-exit.txt`

## Direct video route

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T052033Z`

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Downloaded size: 84,245 bytes
- Detected file type: HTML document
- `ffprobe`: invalid media data
- SHA-256: `996c014e183042d4ed702cdea720a7dd143814d75077693a817cda4ea148c81d`

Expected:

- HTTP status: `200`
- Content-Type: `video/mp4`
- Valid MP4 payload

The route currently resolves to the site HTML fallback rather than the requested video asset. The task acceptance criteria are therefore not met.

Evidence: `url.txt`, `headers.txt`, `curl-metrics.txt`, `curl-exit.txt`, `response.bin`, `file.txt`, `ffprobe.txt`, `sha256.txt`
