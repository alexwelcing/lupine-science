# Article Video Final Delivery Specification

Status: Required for every published article video

## Delivery package

Each video ships as one self-contained directory:

```text
renders/<article-slug>/final/
├── <article-slug>-1080p.mp4
├── <article-slug>-720p-web.mp4
├── <article-slug>-poster.jpg
├── <article-slug>.en.vtt
└── <article-slug>-transcript.txt
```

Use the canonical lowercase article slug. Do not add version labels such as `final`, `latest`, or dates to filenames; versioning belongs in source control and release records.

## Required artifacts

### 1. 1080p master MP4

Filename: `<article-slug>-1080p.mp4`

- Container: MP4
- Video: H.264/AVC, High profile, yuv420p
- Dimensions: 1920 × 1080, square pixels
- Frame rate: preserve the approved composition frame rate; constant frame rate
- Scan: progressive
- Audio: AAC-LC, stereo, 48 kHz, 192 kb/s target
- Web playback: `faststart` metadata enabled
- Content: exact director-approved picture, captions excluded from the image unless a burned-in-caption edition is separately requested

This is the high-quality publication/archive master. It has no fixed size ceiling.

Reference encode:

```bash
ffmpeg -i approved-source.mov \
  -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart \
  <article-slug>-1080p.mp4
```

### 2. 720p web MP4

Filename: `<article-slug>-720p-web.mp4`

- Container: MP4
- Video: H.264/AVC, High profile, yuv420p
- Dimensions: 1280 × 720, square pixels
- Frame rate: same constant frame rate and duration as the 1080p master
- Scan: progressive
- Audio: AAC-LC, stereo, 48 kHz, 128 kb/s target
- Web playback: `faststart` metadata enabled
- Hard size ceiling: **3,000,000 bytes per minute of program duration**

Size acceptance formula:

```text
maximum bytes = ceiling(duration_seconds × 3,000,000 / 60)
```

The ceiling is decimal MB, not MiB. For example, a 120-second video may be no larger than 6,000,000 bytes. Measure actual file bytes and actual media duration with `stat` and `ffprobe`; do not use timeline estimates.

Start with CRF 28. If the file exceeds the ceiling, use constrained two-pass encoding so the final combined bitrate fits. Reserve 128 kb/s for audio and calculate the available video bitrate from the duration and byte ceiling. Never satisfy the limit by changing playback speed, trimming approved content, dropping audio, or reducing below 1280 × 720.

Reference first-pass encode:

```bash
ffmpeg -i <article-slug>-1080p.mp4 \
  -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p \
  -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
  -c:a aac -b:a 128k -ar 48000 -ac 2 -movflags +faststart \
  <article-slug>-720p-web.mp4
```

### 3. Poster JPG

Filename: `<article-slug>-poster.jpg`

- Format: baseline or progressive JPEG; RGB/sRGB (not CMYK)
- Dimensions: 1920 × 1080 (16:9)
- Orientation metadata: normalized; image must display correctly without EXIF rotation
- Content: approved representative frame or designed poster, free of transient animation states, subtitles, player controls, and unintended letterboxing
- Text: title-safe and legible at mobile thumbnail size
- Accessibility: descriptive poster alt text must be supplied in the publication metadata/release record; it is not embedded in the filename

### 4. WebVTT captions

Filename: `<article-slug>.en.vtt`

- UTF-8 plain text beginning with `WEBVTT`
- Language suffix uses a valid BCP 47 tag; replace `.en` for other languages
- Cue times are monotonic, non-negative, within media duration, and do not overlap unless overlap is intentional and reviewed
- Captions include spoken dialogue and meaningful non-speech audio where needed for equivalent understanding
- No speaker names, scientific terms, proper nouns, units, or punctuation may be left unreviewed
- Timing must be checked against the final 720p web MP4, not an intermediate render

### 5. Transcript TXT

Filename: `<article-slug>-transcript.txt`

- UTF-8 plain text with Unix or Windows line endings
- Human-readable prose in presentation order
- Includes all spoken content and bracketed descriptions of essential non-speech audio
- Matches the approved final edit and caption wording for names, scientific terms, numbers, and units
- Contains no VTT timestamps or cue markup

## Cross-artifact consistency

All five artifacts must represent the same approved edit.

- The two MP4 files have matching start, end, frame rate, audio program, and duration. A codec-induced duration difference of up to one video frame is acceptable.
- VTT final cue ends at or before the web MP4 duration.
- Transcript wording agrees with captions; line wrapping may differ.
- Poster belongs to the delivered video and has approved alt text recorded alongside publication metadata.

## Release validation

Run these checks from the package directory and retain the output in the release record.

```bash
# Streams, codecs, dimensions, frame rate, duration, pixel format, sample rate
for video in <article-slug>-1080p.mp4 <article-slug>-720p-web.mp4; do
  ffprobe -v error -show_entries \
    format=filename,duration,size:stream=index,codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,sample_rate,channels \
    -of json "$video"
done

# Exact web size budget (prints PASS or FAIL)
web=<article-slug>-720p-web.mp4
bytes=$(stat -c %s "$web")
duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$web")
max=$(python3 -c 'import math,sys; print(math.ceil(float(sys.argv[1])*3000000/60))' "$duration")
[ "$bytes" -le "$max" ] && echo "PASS: $bytes <= $max bytes" || { echo "FAIL: $bytes > $max bytes"; exit 1; }

# Poster format and dimensions
identify -format '%m %w %h %[colorspace]\n' <article-slug>-poster.jpg

# Caption header and text encodings
sed -n '1p' <article-slug>.en.vtt
test "$(sed -n '1p' <article-slug>.en.vtt | tr -d '\r')" = 'WEBVTT'
file --mime <article-slug>.en.vtt <article-slug>-transcript.txt
```

Also perform these human checks:

- Watch the 1080p master completely with sound.
- Spot-check the 720p file at the opening, every scene transition, the densest-motion section, and the ending for compression damage.
- Watch the 720p file once with captions enabled to verify sync, line breaks, spelling, and safe placement.
- Read the transcript against the final audio.
- Inspect the poster at full size and as a small thumbnail.

## Sign-off checklist

A package is ready only when every item is true:

- [ ] 1080p MP4 meets the master specification and matches director approval.
- [ ] 720p MP4 is 1280 × 720 and at or below the calculated 3,000,000 bytes/minute ceiling.
- [ ] Both MP4s are progressive H.264/yuv420p with AAC audio and `faststart`.
- [ ] Durations and content match within one frame.
- [ ] Poster is approved 1920 × 1080 RGB JPEG and alt text is recorded.
- [ ] WebVTT validates, is spell-checked, and is synchronized to the final web MP4.
- [ ] Transcript is clean UTF-8 text and matches the final program.
- [ ] Automated probe output and human QC results are attached to the release record.
- [ ] All five files use the canonical slug and exact filenames defined above.
