# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T05:22:54Z  
Task: `t_b69a5985`

## Smoke suite

PASS — `npm run smoke` exited 0.

- Target: `https://lupine.science`
- Pages: 14
- Linked resources: 352

## Video route

FAIL — `https://lupine.science/videos/investing-in-the-trust-layer.mp4` does not return the correct MP4 content type or payload.

- HEAD status: `200`
- HEAD `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Range status: `206`
- Range `Content-Type`: `text/html; charset=utf-8`
- First bytes decode as `<!doctype html>`, confirming the response is HTML rather than an MP4 (`ftyp` signature expected near the start).

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `headers.txt`
- `head-verification.txt`
- `range-headers.txt`
- `range-verification.txt`
- `mp4-prefix.bin`
