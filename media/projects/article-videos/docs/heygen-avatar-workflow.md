# Robot presenter / synthetic voice workflow

Last verified: 2026-07-12

## Decision

The Lupine Science article videos use a **soothing, clear technical robot** presenter rather than a human talking head. The default voice is generated with Edge TTS and composited directly into HyperFrames; no human avatar is required. A synthetic robot avatar may be added later only as a director-approved experiment.

- **Default voice engine:** Edge TTS (`en-US-SteffanNeural`).
- **Voice direction:** calm, precise, warmly neutral, and articulate—like a research instrument that has learned to explain itself. No slang, vocal fry, sales energy, or celebrity imitation.
- **Starting settings:** `rate: -10%`, `pitch: 0`. Test -5%, -10%, and -15% on the same 20–30 second script before locking the voice.
- **Target pace:** approximately 145–160 spoken words per minute. Measure the rendered result; the rate multiplier is not itself a WPM guarantee.
- **Integration:** generate narration audio locally with Edge TTS, normalize to -16 LUFS-I, and wire it into the HyperFrames composition. The visuals carry the motion; there is no human presenter layer by default.

Do not voice-clone or prompt for a soundalike of a living actor. The previous “Reese Witherspoon energy” direction is deprecated.

The shared storyboard template forbids people. Any future human or humanoid avatar appearance needs an explicit director exception to `frame.md` and must be reviewed against the robot-voice brief before it can replace the proof-first visual system.

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

## Cast the robot voice

### 1. Shortlist Edge TTS robot voices

```bash
source .venv-tts/bin/activate
edge-tts --list-voices | grep -iE "en-US"
```

Audition the default `en-US-SteffanNeural` and at least two alternatives such as `en-US-EricNeural` and `en-US-ChristopherNeural`. Score each on a 1–5 scale for:

- clarity of scientific terms and numbers;
- calm, non-salesy neutrality;
- absence of vocal fry or breathiness;
- consistency at the target rate (`-10%` default);
- robot-like precision without sounding hostile or monotone.

Keep the top two as backup voices.

If the Edge catalog misses the brief, use HeyGen’s voice-design endpoint/Studio with this non-imitative prompt:

> A soothing, clear technical robot voice. Calm, precise, warmly neutral, and articulate. Steady pace with clean consonants and measured authority for science explainers. Neutral US English; no human celebrity imitation; no sales energy.

### 2. Run a low-cost audition matrix

Use one 20–30 second script containing:

- a question or hook;
- one number;
- one scientific term;
- one comma-rich sentence;
- a deliberate short pause.

Render the default voice at -5%, -10%, and -15% rate. Render the top backup at -10%. This avoids paying for a full Cartesian sweep.

Acceptance gate:

- scientific words match the pronunciation glossary;
- numbers and units are unambiguous;
- no clipped consonants at the selected rate;
- pace measures 145–160 WPM without sounding dragged;
- silence boundaries are clean enough for downstream caption alignment.

## Lip-sync pipelines

### Pipeline 0 — Edge TTS robot voice to WAV master (default)

1. Finalize the narration text and pronunciation rewrites in `narration-tts-input.txt`.
2. Run the shared narration generator:

   ```bash
   scripts/generate-narration.sh \
     --project ./the-02-percent-synthesis-problem \
     --input narration-tts-input.txt \
     --output narration
   ```

3. The script writes `narration-raw.mp3`, `narration-raw.vtt`, and a loudness-normalized `narration-final.wav` at -16 LUFS-I, 48 kHz mono.
4. Use the VTT sentence boundaries as the timing source for the transcript/caption pipeline.
5. Composite the WAV into the HyperFrames composition; the visuals carry all motion.

### Pipeline A — script to avatar video (optional avatar experiment)

Use this only if the director explicitly approves a synthetic robot avatar. Otherwise skip to Pipeline 0.

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
  --speed 1.0 \
  --engine avatar_v \
  --format mp4 \
  --out ./renders/heygen-proof
```

For a no-charge request check before authentication or rendering, append `--dry-run`; the helper writes and prints the exact JSON it would submit.

For a transparent presenter layer, use `--format webm`. This only works for avatar looks with matting support; WebM applies background removal automatically and rejects a separate background setting.

### Pipeline B — locked audio to avatar video (best for exact pacing)

Use this when a final robot-voice WAV has already been approved and you only need an avatar lip-sync layer.

1. Generate and master the final narration first (Pipeline 0).
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

For the optional avatar route, the helper generates this request without writing credentials:

```json
{
  "type": "avatar",
  "avatar_id": "<avatar-look-id>",
  "title": "Lupine Science robot presenter proof",
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "output_format": "mp4",
  "script": "Approved narration text",
  "voice_id": "<voice-id>",
  "voice_settings": {
    "speed": 1.0,
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

1. Lock the Edge TTS voice name, rate, pitch, and target WPM in the article’s production notes.
2. Keep script text and pronunciation rewrites in version control; never store credentials or temporary signed URLs.
3. Render one low-cost audio proof with `scripts/generate-narration.sh --proof` and obtain director approval.
4. Render the final narration WAV and generate the transcript/caption pipeline.
5. Render final landscape HyperFrames output.
6. Render a separate 9:16 output only if vertical distribution is required.
7. Keep the frozen output under the article-video project's `renders/` tree and record its relative path, SHA-256, byte size, voice name, rate, pitch, render date, and HyperFrames version in the article's production notes.
8. Verify duration with `ffprobe`, run `scripts/audio-qa.sh` on the final narration, and confirm caption sync against the rendered MP4.

## Sources

Official sources, accessed 2026-07-10:

- HeyGen API self-serve pricing: https://developers.heygen.com/docs/pricing
- Create Video API (`POST /v3/videos`): https://developers.heygen.com/reference/create-video
- HeyGen voices overview and voice settings: https://developers.heygen.com/docs/voices/overview
- HeyGen web/Studio plans and credit rates: https://www.heygen.com/pricing
- Avatar V overview: https://developers.heygen.com/avatar-v
- HeyGen CLI authentication model: `heygen auth status` help text from CLI v0.3.0
