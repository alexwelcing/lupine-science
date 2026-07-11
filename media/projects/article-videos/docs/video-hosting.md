# Video hosting and CDN path

## Decision

Keep the current public index and current small encodes on Cloudflare Pages at `/videos/`. Move media objects to Cloudflare R2 behind `https://media.lupine.science/videos/` when a final video exceeds the Pages per-asset limit, or when independent media releases are worth the additional infrastructure.

This is a staged decision, not a volume-based emergency. As of 2026-07-10, `public/videos/` contains one 2.92 MiB MP4 and is 3.2 MiB including its index and poster. Cloudflare Pages allows 20,000 files on Free (100,000 on paid plans) and limits each site asset to 25 MiB. Cloudflare documents no smaller aggregate byte cap for a Pages site. Ten target episodes at the project's release budget of no more than 3 MB/minute remain comfortably under the per-file ceiling.

Authoritative references:

- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Use R2 as static asset storage with Pages](https://developers.cloudflare.com/pages/tutorials/use-r2-as-static-asset-storage-for-pages/)
- [R2 public buckets and custom domains](https://developers.cloudflare.com/r2/buckets/public-buckets/)

## Stable URL contract

- Page/index: `https://lupine.science/videos/`
- Current Pages-hosted object: `https://lupine.science/videos/<slug>.mp4`
- R2 production object: `https://media.lupine.science/videos/<slug>.mp4`
- Poster/captions may use the same R2 prefix when an episode migrates.

Do not use an `r2.dev` hostname in published pages. Cloudflare describes it as a non-production endpoint and may throttle it. A custom domain enables cache, WAF, access controls, and analytics.

Object names are immutable release paths. Prefer `<slug>-<content-hash-prefix>.mp4` for replacements; do not silently replace a cached final under the same key.

## Pages guardrail

Run from the repository root before deployment:

```bash
node media/projects/article-videos/scripts/check-video-hosting.mjs public/videos
```

The command exits 1 if any video exceeds 25 MiB. Aggregate volume is reported for capacity planning but is not treated as a Pages failure condition.

## R2 provisioning (one-time, requires Cloudflare credentials)

1. Create a production bucket, for example `lupine-science-videos`.
2. Connect `media.lupine.science` as the bucket custom domain in the Cloudflare dashboard. Keep `r2.dev` disabled for production.
3. Configure a cache rule for `media.lupine.science/videos/*`. Uploaded release objects already carry `Cache-Control: public, max-age=31536000, immutable`.
4. Configure CORS only if a player fetches media through JavaScript. Plain `<video src>` playback from the public site does not require JavaScript-readable cross-origin responses. If needed, allow only `https://lupine.science` and the methods `GET` and `HEAD`.
5. Give CI a narrowly scoped R2 object-write token and account ID. Keep values in repository/environment secrets, never in source.

Example provisioning command after authentication:

```bash
npx --yes wrangler@latest r2 bucket create lupine-science-videos
```

The custom-domain association is intentionally an operator step because it changes live DNS and needs the owning Cloudflare account and zone.

## Publish and verify an R2 object

```bash
export VIDEO_R2_BUCKET=lupine-science-videos
export VIDEO_CDN_BASE_URL=https://media.lupine.science
# CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID come from the secret store.

media/projects/article-videos/scripts/publish-video-r2.sh \
  path/to/final.mp4 \
  videos/<slug>-<hash>.mp4
```

The helper refuses to overwrite an existing key by default, sets content type and immutable caching metadata, and issues a HEAD request to the custom-domain URL after upload. Confirm the response includes the expected status, content type, content length, cache control, and byte-range support.

## Cutover checklist

1. Upload the MP4, poster, and VTT under the stable R2 prefix.
2. Verify `HEAD` and a byte range request:
   `curl -fsSI -H 'Range: bytes=0-1023' "$URL"` (expect `206` for the range request).
3. Update the video index and article link to the absolute `https://media.lupine.science/videos/...` URL.
4. Update the site's CSP `media-src` and `img-src` directives to allow `https://media.lupine.science` before cutover.
5. Run the static checks, preview deployment, and live smoke tests.
6. Keep the former Pages object for one release window; remove it only after production verification and rollback expiry.

## Rollback

Revert links to the prior `/videos/<slug>.mp4` Pages asset while it remains available. R2 uploads are additive and do not alter the Pages deployment, so a failed media cutover does not require deleting the R2 object. Never delete the previous object until all published links and caches have aged past the rollback window.
