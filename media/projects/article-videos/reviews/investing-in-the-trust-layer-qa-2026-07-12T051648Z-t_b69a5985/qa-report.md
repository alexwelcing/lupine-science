# Investing in the Trust Layer — live QA

- Task: `t_b69a5985`
- Tested: 2026-07-12 05:16–05:17 UTC
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T051723Z`

## Result: FAIL

`npm run smoke` passed (14 pages, 352 linked resources), but the required direct video verification failed.

- HEAD: HTTP 200, `content-type: text/html; charset=utf-8`
- Range GET (`bytes=0-4095`): HTTP 206, `content-type: text/html; charset=utf-8`
- Downloaded range detected by `file` as `text/html`
- Reported full response length: 84,055 bytes

The path exists but serves the site's HTML fallback rather than an MP4. The smoke suite currently checks linked-resource reachability only (`response.ok`) and therefore does not reject an incorrect media content type.

## Evidence

- `npm-smoke.log`
- `npm-smoke-exit-code.txt`
- `head-headers.txt`
- `head-summary.txt`
- `get-range-headers.txt`
- `get-range-summary.txt`
- `get-range.bin`
- `get-range-mime.txt`
- `get-range-sha256.txt`
- `curl-exit-codes.txt`
- `url.txt`
