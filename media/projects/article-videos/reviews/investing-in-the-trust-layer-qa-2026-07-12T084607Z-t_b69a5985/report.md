# Investing in the Trust Layer — live QA

Tested: 2026-07-12T08:46:07Z
Task: `t_b69a5985`

## Smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T084607Z`

Result: FAIL

- HEAD status: `200`
- HEAD Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Range GET status: `206`
- Range GET Content-Type: `text/html; charset=utf-8`
- Payload identified by `file`: HTML document, Unicode text, UTF-8 text
- First bytes: `<!doctype html>`

## Verdict

The site smoke suite passes and the video URL returns HTTP 200, but the endpoint serves the HTML fallback instead of MP4 media. The required content-type criterion is not met.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `head-headers.txt`
- `head-result.txt`
- `range-headers.txt`
- `range-result.txt`
- `prefix.bin`
- `prefix-hex.txt`
- `file.txt`
- `url.txt`
