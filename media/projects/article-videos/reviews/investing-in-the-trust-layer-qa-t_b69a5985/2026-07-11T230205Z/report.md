# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:02:05Z

## Repository smoke

- Command: `npm run smoke`
- Result: PASS (exit 0)
- Scope: 14 pages and 352 linked resources

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T230205Z`
- HTTP status: 200
- Response Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- File MIME detection: `text/html`
- SHA-256: `3e499ef2ef985aafea59da3901e60ed711fa83a264e13dcaea72c16fe84805ec`
- Cloudflare cache status: MISS
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The smoke suite passes, but the required `/videos/investing-in-the-trust-layer.mp4` contract does not. The live endpoint returns the site's HTML fallback rather than an MP4. Because this cache-busting request was a Cloudflare MISS, the result is not explained by stale cached content.

Evidence is stored beside this report: `npm-smoke.log`, `headers.txt`, `curl.txt`, `file.txt`, `sha256.txt`, `ffprobe.txt`, `url.txt`, and `response.bin`.
