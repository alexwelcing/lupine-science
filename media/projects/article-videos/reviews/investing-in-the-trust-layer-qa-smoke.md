# Investing in the Trust Layer — live QA smoke

Checked: 2026-07-11T15:47:51Z

## Repository smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- File-signature detection: `text/html`
- Response SHA-256: `37ae89e550b688009e919b4f104c11ae024c43934e5e699a00f58a625f4496d9`
- `ffprobe` rejected the response with `Invalid data found when processing input`
- CDN response: `CF-Cache-Status: REVALIDATED`
- A second request with a unique query string plus `Cache-Control: no-cache` also returned HTTP 200, `text/html; charset=utf-8`, 84,245 bytes, and `CF-Cache-Status: MISS`; this rules out a stale Cloudflare cache entry.

The live route currently returns the site's HTML fallback rather than the MP4. A `200` status alone is therefore a false positive.

### Recheck — 2026-07-11T15:50:18Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A cache-busting direct request with `Cache-Control: no-cache` still failed the video contract: HTTP 200, `Content-Type: text/html; charset=utf-8`, 84,245 bytes, `CF-Cache-Status: MISS`, and SHA-256 `52371cec9709ca31bb107588a28156c13bc82d42fe5a1d69a69b9ce1edb435c8`. `file` detected `text/html`, and `ffprobe` exited 1 with `Invalid data found when processing input`.

### Recheck — 2026-07-11T15:52:30Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). An independent cache-busting direct request with `Cache-Control: no-cache` still failed the required video contract: HTTP 200, `Content-Type: text/html; charset=utf-8`, 84,245 bytes, `CF-Cache-Status: MISS`, and SHA-256 `3837eff3101fdb81368b0de1d946a84f7415cdbb8edfd6cbc66047f69f079a4a`. `file` detected `text/html`; `ffprobe` exited 1 with `moov atom not found` / `Invalid data found when processing input`.

### Recheck — 2026-07-11T15:55:12Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A fresh cache-busting direct request with `Cache-Control: no-cache` still failed the video contract: HTTP 200, `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `a8a6e2bb8e5838d879fcc0eb0023a18d7a46b15959ea7af7d24aeca666e0cc46`. `file` detected an HTML document and `ffprobe` exited 1 with `Invalid data found when processing input`. The response headers from this request are saved in `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.

### Recheck — 2026-07-11T15:57:56Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A new cache-busting direct request with `Cache-Control: no-cache` still failed the required video contract: HTTP 200, `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `539f895ac90f60aad43444371989a9a92090e82936fb0b28f5fa9ef02e77f15b`. `file` detected an HTML document and `ffprobe` rejected the response as invalid media. The latest headers and smoke output are saved alongside this report.

### Recheck — 2026-07-11T16:01:02Z

The repository smoke suite passed (14 pages, 352 linked resources, exit 0). A cache-busting direct request with `Cache-Control: no-cache` still failed the required video contract: HTTP 200, `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `689dc1c48edc26cad051dab3d90a81810584b8a9a888e7a5b4061fb931aafb3c`. `file` detected an HTML document and `ffprobe` exited 1 with `Invalid data found when processing input`. Current response headers are saved in `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.

### Recheck — 2026-07-11T16:03:29Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A fresh cache-busting request with `Cache-Control: no-cache` returned HTTP 200 but still failed the required video contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `db81d2d9dc561b5e7b4389535b4e11dfef5cfd9e58874fb5619bca53ced2cc98`. `file` detected an HTML document; `ffprobe` rejected it with `moov atom not found` / `Invalid data found when processing input`. Latest smoke output and response headers are saved alongside this report.

### Recheck — 2026-07-11T16:05:39Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A fresh cache-busting request with `Cache-Control: no-cache` returned HTTP 200 but still failed the required video contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `b3e89323fd5b7bc7d059785991c7c74250738bf3ad2b8dc847d3b0577db5436b`. `file` detected `text/html`, and `ffprobe` exited 1 with `Invalid data found when processing input`. Current smoke output and response headers are saved in `reviews/investing-in-the-trust-layer-smoke-latest.log` and `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.

### Recheck — 2026-07-11T16:07:41Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A cache-busting direct request with `Cache-Control: no-cache` returned HTTP 200 but failed the required video contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, `CF-Cache-Status: MISS`, and SHA-256 `b88c096cb44bea842997b4f59f976c905f16d53abcb6b592b2191b7323236acb`. `file` detected `text/html`, and `ffprobe` exited 1 with `Invalid data found when processing input`. Current smoke output and response headers are saved in `reviews/investing-in-the-trust-layer-smoke-latest.log` and `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.

### Recheck — 2026-07-11T16:10:11Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A fresh cache-busting direct request with `Cache-Control: no-cache` returned HTTP 200 but failed the required video contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `b473d4cf948c339ca0c9f2daaaceb5fb40889d6dc9831cbe877b010d48b1aaff`. `file` detected `text/html`; `ffprobe` rejected the response with `moov atom not found` / `Invalid data found when processing input`. Current smoke output and response headers are saved in `reviews/investing-in-the-trust-layer-smoke-latest.log` and `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.

### Recheck — 2026-07-11T16:12:41Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A cache-busting direct request with `Cache-Control: no-cache` returned HTTP 200 but failed the required video contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `6f575759af672a1d7737e7aa1e601c65430b78ffed930b40425b4c59ccf44165`. `file` detected `text/html`; `ffprobe` rejected the response with `moov atom not found` / `Invalid data found when processing input`. Current smoke output and response headers are saved in `reviews/investing-in-the-trust-layer-smoke-latest.log` and `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.

### Recheck — 2026-07-11T16:17:02Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A fresh cache-busting direct request with `Cache-Control: no-cache` returned HTTP 200 but failed the required video contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, `CF-Cache-Status: MISS`, and SHA-256 `a9afddb8ab9081c68d800a7ec75c62f4488e42605ffc3fa88a5f2e6e2c924fe7`. `file` detected `text/html`; `ffprobe` exited 1 with `Invalid data found when processing input`. Current smoke output and response headers are saved alongside this report.

### Recheck — 2026-07-11T16:20:27Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A cache-busting request to `https://lupine.science/videos/investing-in-the-trust-layer.mp4` with `Cache-Control: no-cache` returned HTTP 200 but failed the required media contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, `CF-Cache-Status: MISS`, and SHA-256 `e3a24cdc8057c7ad6b5f558a60276377f0f71e2e9f06c2dfa0c1fcb9614b2e54`. `file` detected `text/html`; `ffprobe` exited 1 with `Invalid data found when processing input`. Current response headers and validation details are saved in `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.

## Local publish artifact

Path: `public/videos/investing-in-the-trust-layer.mp4`

- Size: `3,813,568` bytes
- Detected container: ISO Media / MP4
- ffprobe format: `mov,mp4,m4a,3gp,3g2,mj2`
- Duration: `117.034` seconds
- SHA-256: `bf44a1a5ea76b63acc51423276268de42dc12000d94c5b07f0ef9985bdb97e49`
- Git state at check time: untracked

## Required follow-up

Publish the local MP4 as part of the site deployment, then repeat the direct URL check and require both HTTP 200 and `Content-Type: video/mp4` (plus MP4 signature validation) before release approval.

### Recheck — 2026-07-11T16:23:18Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A cache-busting request to `https://lupine.science/videos/investing-in-the-trust-layer.mp4` with `Cache-Control: no-cache` and `Accept: video/mp4` returned HTTP 200 but still failed the required media contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `68fa5c77064a517c9c03af51df29064ef70b2321cf1c0e0b396289203bd3aed9`. `file` detected `text/html`, and `ffprobe` rejected the response as invalid media. Current smoke output and response headers are saved in `reviews/investing-in-the-trust-layer-smoke-latest.log` and `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.

### Recheck — 2026-07-11T16:25:53Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A fresh cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned HTTP 200 but failed the required media contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `3ca905df7c666d356a77dd544d3a84279b02d9a729d677f6cba660424cb8cb61`. `file` detected `text/html`; `ffprobe` exited 1 with `moov atom not found` / `Invalid data found when processing input`. Current smoke output and response headers are saved alongside this report.

### Recheck — 2026-07-11T16:36:30Z

The repository smoke suite passed again (14 pages, 352 linked resources, exit 0). A fresh cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned HTTP 200 but failed the required media contract: `Content-Type: text/html; charset=utf-8`, 84,245 bytes, and SHA-256 `08e84199d20f44dcccac30f5a87c8987cf4f6648fb43c3ce5d7b4b8e3f6f38a2`. `file` detected an HTML document and `ffprobe` exited 1 with `Invalid data found when processing input`. Current evidence is saved in `reviews/investing-in-the-trust-layer-smoke-latest.log` and `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.
