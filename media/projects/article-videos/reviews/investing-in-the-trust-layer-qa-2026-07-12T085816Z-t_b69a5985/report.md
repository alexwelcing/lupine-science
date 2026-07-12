# Investing in the Trust Layer — live QA smoke verification

Tested: 2026-07-12T08:58:16Z  
Task: `t_b69a5985`  
Target: `https://lupine.science`

## Result: FAIL

The site-wide smoke suite passes, but the requested video endpoint does not serve MP4 media.

## Site smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

- Exit code: `0`
- Pages checked: `14`
- Linked resources checked: `352`
- Result: `PASS`

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T085816Z`

- HEAD status: `200`
- Content-Type: `text/html; charset=utf-8` — incorrect; expected `video/mp4`
- Range status: `206`
- First 16 response bytes: `3c 21 64 6f 63 74 79 70 65 20 68 74 6d 6c 3e 0a`
- Detected prefix type: `HTML document, ASCII text`
- Prefix decodes to `<!doctype html>`, confirming the response is the HTML fallback rather than MP4 media.

## Evidence

- `npm-smoke.log`
- `smoke-exit-code.txt`
- `head-headers.txt`
- `range-headers.txt`
- `prefix.bin`
- `verification.txt`
- `url.txt`

## Verdict

The acceptance condition is not met. `/videos/investing-in-the-trust-layer.mp4` returns HTTP 200, but its content type and payload are HTML, not MP4.
