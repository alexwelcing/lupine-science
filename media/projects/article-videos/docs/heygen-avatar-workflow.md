# HeyGen avatar / talking-head workflow

Last verified: 2026-07-10

## Decision

For the Lupine Science “fast-talking California woman” presenter, start with:

- **Avatar:** a public/stock **Digital Twin** that supports `avatar_v`.
- **Engine:** **Avatar V** for the most natural human motion and lip-sync. If the selected look does not list `avatar_v` in `supported_api_engines`, use Avatar IV. Use Avatar IV for a photo/illustrated presenter.
- **Voice:** a public English female voice auditioned from its preview URL, or a designed voice described without naming or imitating a real person.
- **Voice direction:** “young adult American woman; West Coast conversational cadence; curious, warm, confident, articulate; energetic and fast without sounding rushed; clean science-explainer delivery.”
- **Starting settings:** `locale: en-US`, `speed: 1.18`, `pitch: 0`. Test 1.15, 1.18, and 1.22 on the same 20–30 second script before locking the voice.
- **Target pace:** approximately 185–205 spoken words per minute. Measure the rendered result; the speed multiplier is not itself a WPM guarantee.
- **Integration:** render short transparent WebM presenter segments when the avatar supports matting, then composite them over HyperFrames. Otherwise render 1080p MP4 against the approved paper color and crop/reframe in the composition.

Do not voice-clone or prompt for a soundalike of a living actor. The project README’s “Reese Witherspoon energy” should be translated into descriptive traits—quick, warm, articulate, upbeat—not identity imitation.

The shared storyboard template currently forbids people. Any avatar appearance therefore needs an explicit director exception to `frame.md`, ideally limited to a hook, transition, or outro rather than replacing the proof-first visual system.

## Local setup status

HeyGen CLI v0.3.0 is installed at:

```text
/home/alex/.local/bin/heygen
```

Make sure it is on `PATH`:

```bash
export PATH="$HOME/.local/bin:$PATH"
heygen --version
```

Authentication is intentionally not completed by automation because OAuth requires the account owner’s browser sign-in. Choose one billing path:

```bash
# Recommended for auditioning and creator-scale work.
# Charges the web-plan subscription/credit pool.
heygen auth login --oauth

# Recommended for production automation and higher concurrency.
# Charges the prepaid API USD wallet.
heygen auth login --api-key
```

Never put an API key in this repository. `HEYGEN_API_KEY` may be supplied through the shell or a secret manager and overrides stored credentials.

Verify setup:

```bash
heygen auth status
node /home/alex/.hermes/profiles/director/skills/media-use/scripts/resolve.mjs --doctor
```

## Cast the presenter

### 1. Shortlist avatars

```bash
heygen avatar list --ownership public --limit 20 --human
```

Inspect looks in the returned avatar groups. Shortlist three young-adult women with:

- natural medium-shot framing and direct eye line;
- restrained hands and shoulders, not sales-presenter gestures;
- a background that can be removed or cleanly keyed;
- `avatar_v` in `supported_api_engines` for the preferred route;
- enough headroom for both 16:9 and 9:16 crops.

Do not select from a name alone. Render the same proof script with each finalist.

### 2. Shortlist voices

```bash
heygen voice list \
  --type public \
  --engine starfish \
  --language English \
  --gender female \
  --limit 20 \
  --human
```

Play each `preview_audio_url`. Score the top five on a 1–5 scale for warmth, articulation, energy, naturalness at speed, and pronunciation of scientific terms. Keep the top three.

If the stock catalog misses the brief, use HeyGen’s voice-design endpoint/Studio with this non-imitative prompt:

> Young adult American woman with a subtle West Coast conversational cadence. Warm, curious, confident, and articulate. Energetic and fast, but never breathless or salesy. Clear consonants and steady authority for science explainers. Natural smile in the voice; neutral US English; no celebrity imitation.

### 3. Run a low-cost matrix

Use one 20–30 second script containing:

- a question or hook;
- one number;
- one scientific term;
- one comma-rich sentence;
- a deliberate short pause.

Render only the best 2 avatars × 2 voices at one speed, then test speed only on the winning pair. This avoids paying for a full Cartesian sweep.

Acceptance gate:

- no visible mouth lag, phoneme smearing, or jump at pauses;
- no clipped consonants at the selected speed;
- scientific words match the pronunciation glossary;
- body motion feels editorial rather than promotional;
- the 9:16 crop preserves eyes, chin, and essential gestures;
- pace measures 185–205 WPM without sounding rushed.

## Lip-sync pipelines

### Pipeline A — script to avatar video (recommended default)

1. Finalize the narration text and pronunciation rewrites.
2. Send `script`, `voice_id`, `voice_settings`, and `avatar_id` to `POST /v3/videos` (or `heygen video create`).
3. HeyGen synthesizes speech and renders the avatar against that speech, so mouth timing and audio share the same source.
4. Poll until complete, then download `video_url` and the automatically returned `subtitle_url`.
5. Inspect sync at 0.5× around plosives, scientific terms, and pauses.
6. Composite the video in HyperFrames; keep the sidecar SRT as the caption timing source.

Use the supplied helper:

```bash
scripts/heygen-avatar-video.sh \
  --avatar '<avatar-look-id>' \
  --voice '<voice-id>' \
  --script ./articles/example/narration.txt \
  --speed 1.18 \
  --engine avatar_v \
  --format mp4 \
  --out ./renders/heygen-proof
```

For a no-charge request check before authentication or rendering, append `--dry-run`; the helper writes and prints the exact JSON it would submit.

For a transparent presenter layer, use `--format webm`. This only works for avatar looks with matting support; WebM applies background removal automatically and rejects a separate background setting.

### Pipeline B — locked audio to avatar video (best for exact pacing)

Use this when the voice engineer has already approved a final WAV/MP3, when word timing must match an existing storyboard, or when external TTS is preferred.

1. Generate and master the final narration first.
2. Upload it with `heygen asset upload` and capture the returned asset ID.
3. Create the avatar video with `audio_asset_id` instead of `script`/`voice_id`.
4. HeyGen lip-syncs the avatar to the exact uploaded waveform.
5. Download and verify as above.

The API also accepts a direct public `audio_url`. The URL must be publicly fetchable and point directly to the media file. Do not expose private narration through a permanent public bucket; use a short-lived signed URL or upload it as a HeyGen asset.

`script`, `audio_url`, and `audio_asset_id` are mutually exclusive.

### Pipeline C — replace speech on existing footage

For a pre-existing talking-head video, use the dedicated HeyGen lipsync command/API rather than `POST /v3/videos`:

```bash
heygen lipsync --help
```

The self-serve API price is $2.00/min for Speed lipsync and $4.00/min for Precision lipsync. Use Speed for drafts; reserve Precision for the approved final if side-by-side inspection shows a meaningful improvement.

## Request shape

The helper generates this request without writing credentials:

```json
{
  "type": "avatar",
  "avatar_id": "<avatar-look-id>",
  "title": "Lupine Science avatar proof",
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "output_format": "mp4",
  "script": "Approved narration text",
  "voice_id": "<voice-id>",
  "voice_settings": {
    "speed": 1.18,
    "pitch": 0,
    "volume": 1,
    "locale": "en-US"
  },
  "caption": {
    "file_format": "srt"
  },
  "engine": {
    "type": "avatar_v"
  }
}
```

Use an `Idempotency-Key` with direct HTTP integrations so a retry does not create and bill a duplicate render. HeyGen replays the original response for a matching key within 24 hours.

## Cost per finished minute

Prices below were read from HeyGen’s official API and web-plan pricing on 2026-07-10. Recheck before budgeting; provider prices and plan credits can change.

### API key / prepaid USD wallet

| Route | Official rate | Cost per output minute | 30s proof | 90s video | 120s video |
|---|---:|---:|---:|---:|---:|
| Avatar V — Digital Twin | $0.0667/sec | **$4.00** | $2.00 | $6.00 | $8.00 |
| Avatar IV — Digital Twin or Studio Avatar | $0.0667/sec | **$4.00** | $2.00 | $6.00 | $8.00 |
| Avatar IV — Photo Avatar | $0.0500/sec | **$3.00** | $1.50 | $4.50 | $6.00 |
| Avatar III — Digital Twin or Studio Avatar | $0.0167/sec | **$1.00** | $0.50 | $1.50 | $2.00 |
| Avatar III — Photo Avatar | $0.0433/sec | **$2.60** | $1.30 | $3.90 | $5.20 |
| Standalone Starfish TTS | $0.000667/sec | **$0.04** | $0.02 | $0.06 | $0.08 |
| Lipsync — Speed | $0.0333/sec | **$2.00** | $1.00 | $3.00 | $4.00 |
| Lipsync — Precision | $0.0667/sec | **$4.00** | $2.00 | $6.00 | $8.00 |

Values are rounded to cents. Avatar video billing already covers the avatar render from its chosen input; do not add standalone TTS unless speech was generated through the separate TTS endpoint.

### Studio / OAuth web-plan credits

Current individual plans advertise:

- Free: $0, three videos/month, up to one minute each, with limited Avatar IV access.
- Creator: $29/month for 600 credits.
- Pro: $49/month for 1,000 credits.
- Avatar III Studio video: 3 credits/min.
- Avatar IV or V Studio video: 20 credits/min.

Effective cost if the full monthly allocation is used:

| Plan | Engine | Included-minute equivalent | Effective cost/min |
|---|---|---:|---:|
| Creator, $29 / 600 credits | Avatar IV/V at 20 credits/min | 30 min | **$0.97/min** |
| Creator, $29 / 600 credits | Avatar III at 3 credits/min | 200 min | **$0.15/min** |
| Pro, $49 / 1,000 credits | Avatar IV/V at 20 credits/min | 50 min | **$0.98/min** |
| Pro, $49 / 1,000 credits | Avatar III at 3 credits/min | 333.3 min | **$0.15/min** |

These are allocation-normalized costs, not pay-as-you-go charges. Actual cost per used minute is higher when credits expire or remain unused. Monthly Creator credits roll over one additional month; annual-plan credits accumulate until annual renewal, subject to HeyGen’s current rollover rules.

### Recommended budget

Use Studio/OAuth while casting because it is materially cheaper when subscription credits are available. For a production API-key route, budget **$4.00 per final minute** for Avatar V plus one 30-second proof per new avatar/voice combination. A 90-second final with two 30-second proofs is about **$10.00** on the API wallet (2 × $2 proofs + $6 final), excluding discarded retries.

## Production handoff

1. Lock the avatar look ID, voice ID, engine, locale, and speed in the article’s production notes.
2. Keep script text and pronunciation rewrites in version control; never store credentials or temporary signed URLs.
3. Render one low-cost proof and obtain director approval.
4. Render final landscape output.
5. Render a separate 9:16 output rather than center-cropping if the avatar framing or gestures do not survive.
6. Download the video and SRT immediately; returned asset URLs may be presigned and temporary.
7. Keep the frozen output under the article-video project's `renders/heygen/` tree and record its relative path, HeyGen video ID, avatar look ID, voice ID, engine, and render date in the article's production notes. The current media-use resolver does not expose a `video` ledger type, so do not pass `--type video` to it.
8. Verify duration with `ffprobe`, inspect lip-sync at normal and half speed, then composite and loudness-normalize the final program.

## Sources

Official sources, accessed 2026-07-10:

- HeyGen API self-serve pricing: https://developers.heygen.com/docs/pricing
- Create Video API (`POST /v3/videos`): https://developers.heygen.com/reference/create-video
- HeyGen voices overview and voice settings: https://developers.heygen.com/docs/voices/overview
- HeyGen web/Studio plans and credit rates: https://www.heygen.com/pricing
- Avatar V overview: https://developers.heygen.com/avatar-v
- HeyGen CLI authentication model: `heygen auth status` help text from CLI v0.3.0
