# Investing in the Trust Layer — live QA

- Task: `t_b69a5985`
- Tested at: `2026-07-12T03:16:56Z`
- Result: **FAIL / BLOCKED**

## Smoke test

`npm run smoke` exited successfully:

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Video URL contract

Requested URL:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Observed response:

- HTTP status: `200`
- HTTP `Content-Type`: `text/html; charset=utf-8`
- Expected `Content-Type`: `video/mp4`
- Downloaded bytes: `84,245`
- Payload identification: HTML document / `text/html`
- SHA-256: `1ebc160a034381110cae093945a18c7310338107711df87dc3bc9c23f9cd0a29`
- `ffprobe`: rejected the payload as invalid media

The deployed article and video index both link to this exact MP4 path, so this is not a slug mismatch. The live host is serving its HTML fallback at the video URL rather than an MP4 asset.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `curl-summary.txt`
- `video-response.bin`
- `file-mime.txt`
- `url.txt`
- `timestamp.txt`
