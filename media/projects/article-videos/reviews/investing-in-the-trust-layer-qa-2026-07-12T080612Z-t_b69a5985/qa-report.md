# Investing in the Trust Layer — production QA

- Task: `t_b69a5985`
- Checked at: `2026-07-12T08:06:12Z`
- Production base: `https://lupine.science`

## Smoke suite

Command: `npm run smoke`

Result: **PASS** (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: **FAIL**

A HEAD request returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)

A cache-busted range GET at `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T080612Z` confirmed this is not a HEAD-only discrepancy:

- HTTP status: `206`
- Content-Type: `text/html; charset=utf-8`
- Downloaded range: 4096 bytes
- Body MIME detected by `file`: `text/html`
- First 16 bytes (hex): `3c21646f63747970652068746d6c3e0a`
- Decoded prefix: `<!doctype html>`
- Reported complete response size: 84,055 bytes

Conclusion: the URL is reachable but serves an HTML fallback document rather than an MP4. The acceptance criterion “returns 200 with correct content-type” is not met. The smoke suite currently validates linked-resource reachability/status only, so it does not detect this MIME/body mismatch.
