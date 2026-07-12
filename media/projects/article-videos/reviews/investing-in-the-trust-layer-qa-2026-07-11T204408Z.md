# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T20:44:08Z
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video endpoint

Result: FAIL

- HEAD final status: `200`
- HEAD Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Range GET status: `206`
- Range GET Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Response identification: HTML document
- First 32 bytes: `3c21646f63747970652068746d6c3e0a3c68746d6c206c616e673d22656e223e`
- Decoded prefix: `<!doctype html>\n<html lang="en">`
- `ffprobe`: FAIL

## Conclusion

The general production smoke suite passes, but the task acceptance criterion does not. The live `/videos/investing-in-the-trust-layer.mp4` route returns HTTP 200 for HEAD but serves homepage HTML rather than MP4 media. The deployment artifact or route still needs correction, and the smoke suite does not currently reject wrong-content successful responses.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T204408Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T204408Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T204408Z-range-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T204408Z-range.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T204408Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T204408Z-verification.txt`
