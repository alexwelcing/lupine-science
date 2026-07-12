# Investing in the Trust Layer — live video QA

- Timestamp (UTC): `2026-07-12T03:46:49Z`
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- `npm run smoke`: PASS — 14 pages and 352 linked resources
- Video endpoint: FAIL — HTTP 200 returns `Content-Type: text/html; charset=utf-8`, not `video/mp4`
- Downloaded body: 84,245-byte HTML document
- `ffprobe`: FAIL — `moov atom not found`; invalid media data
- Exact-URL HEAD retry: HTTP 200, `text/html; charset=utf-8`
- Exact-URL range retry: HTTP 206, `text/html; charset=utf-8`; body begins `<!doctype html>`

Conclusion: the general live-site smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` is currently routed to the HTML fallback and does not satisfy the required video-link check.

Evidence in this directory:
- `curl.txt`, `headers.txt`, `video.mp4`, `file.txt`, `sha256.txt`
- `exact-url-range-headers.txt`, `exact-url-range-prefix.bin`
