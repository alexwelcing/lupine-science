# Investing in the Trust Layer — live QA

- Task: `t_b69a5985`
- Checked: `2026-07-12T04:50:19Z`
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T045019Z`

## Result: FAIL

- `npm run smoke`: PASS (`14 pages and 352 linked resources`)
- Video HTTP status: `200`
- Video response content type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: `84245` bytes
- Redirects: `0`
- `file` identification: HTML document, not MP4

The live route currently falls back to an HTML page while returning HTTP 200. The video asset or route must be deployed/fixed before this QA task can pass.

## Evidence

- `smoke.log`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `file.txt`
- `response.bin`
- `exit-codes.txt`
