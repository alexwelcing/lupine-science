# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T08:44:04Z
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: **PASS** (exit 0)
- Coverage: 14 pages and 352 linked resources across one target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T084404Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded response size: 84,245 bytes
- Detected MIME type: `text/html`
- Leading bytes: `<!doctype html>`
- Result: **FAIL**

The live video URL resolves to the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required contract.

## Evidence

- `smoke.log` — repository smoke output
- `headers.txt` — live response headers
- `curl.txt` — curl status and content type
- `prefix.bin` — downloaded response
- `file-mime.txt` — signature-based MIME result
- `prefix-hex.txt` — leading response bytes
- `url.txt` — cache-busted request URL
