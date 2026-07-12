# Investing in the Trust Layer — live QA

Checked: 2026-07-11T19:24:30Z
Target: https://lupine.science/videos/investing-in-the-trust-layer.mp4

## Smoke suite

Command: `npm run smoke`
Result: PASS (exit 0)
Output: 14 pages and 352 linked resources passed.

## Direct video contract

HEAD request:
- Status: 200
- Content-Type: `text/html; charset=utf-8` (FAIL; expected `video/mp4`)

Range GET (`Range: bytes=0-31`, `Accept: video/mp4`):
- Status: 206
- Content-Type: `text/html; charset=utf-8`
- Content-Range: `bytes 0-31/84055`
- First bytes: `<!doctype html>\n<html lang="en">`

## Verdict

BLOCKED / FAIL. The live path exists but serves the site's HTML fallback rather than an MP4. The smoke suite currently checks linked-resource HTTP success only, so it reports a false pass for this media URL. The task's required `200` plus correct video content type is not satisfied.
