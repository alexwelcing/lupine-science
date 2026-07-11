# Article-video accessibility requirements

Status: required release policy
Applies to: every Lupine Science article video and its poster image

A video is not publishable until its caption file, transcript, and poster alt text meet this policy and are available at the same time as the video. These are release artifacts, not optional enhancements.

## Required deliverables

For a video identified by `<slug>`, publication must include:

- `captions/<slug>.vtt` — English WebVTT captions for all spoken words and meaningful audio.
- `transcripts/<slug>.md` — a readable English transcript.
- Poster alt text stored in the publishing page or content metadata; it must not exist only in an image filename or production note.

Use stable public URLs. A replacement video must trigger re-validation of all three deliverables.

## WebVTT captions

### Content

- Caption every spoken word, including off-screen speech.
- Identify a speaker when the identity is not visually obvious or when speakers change; use a concise label such as `NARRATOR:`.
- Include meaningful non-speech audio that affects understanding, in square brackets, such as `[soft music]`, `[alarm]`, or `[laughter]`. Do not caption decorative audio that adds no information.
- Preserve the meaning, technical terms, names, units, and numbers in the approved narration. Do not paraphrase scientific claims.
- Use sentence case and readable punctuation. Spell-check the complete file.
- Do not use captions to add information absent from the audio.

### Timing and readability

- Each cue must start when its audio begins and end when it ends, without overlapping another cue.
- Keep captions on screen long enough to read; target 1–7 seconds per cue and a comfortable reading speed of no more than 20 characters per second. Re-segment rather than omit content.
- Prefer one or two lines per cue, about 42 characters or fewer per line. Break at natural phrase boundaries; do not separate an article from its noun, a name, a number from its unit, or a preposition from its phrase.
- Remove gaps of less than 100 ms between adjacent cues when they cause flicker.
- Captions must remain synchronized after the final web encode, not merely against a draft render.

### File and player integration

- The file must begin with `WEBVTT`, use UTF-8, and contain valid monotonically increasing timestamps.
- Publish captions through a native text track, for example `<track kind="captions" srclang="en" label="English" ...>`. Burned-in text alone does not satisfy this requirement.
- The player must expose the caption track to keyboard and assistive-technology users and allow captions to be enabled. Captions must not cover essential labels, charts, source notes, or calls to action.
- If the video autoplays muted, captions must be enabled by default. Otherwise, preserve the user's caption preference where the player supports it.

## Transcript

- Provide a transcript adjacent to the video or through a clearly named `Transcript` link that works without JavaScript.
- Include all spoken content in reading order and the same meaningful non-speech information required in captions.
- Include speaker labels when needed for comprehension.
- Include concise descriptions of essential visual information that is not conveyed in the audio, such as a chart's key conclusion, important on-screen text, or an action necessary to understand the narration. Mark these consistently, for example `Visual:`.
- Use semantic headings, paragraphs, and lists. The transcript must be selectable text, not an image, PDF-only attachment, or caption-file download offered as a substitute.
- Keep the transcript consistent with the published cut. Correcting narration, timing, claims, names, numbers, or visuals requires updating the transcript before republishing.

## Poster-image alt text

- Every poster `<img>` must have an `alt` attribute. The publishing metadata must contain the intended alt text before integration.
- Describe the poster's purpose and essential visual information in context, usually in one concise sentence. Mention meaningful on-image text when nearby page text does not already provide it.
- Do not begin with “image of” or repeat the article/video title and surrounding link text unnecessarily.
- Do not use the filename, generic text such as “video thumbnail,” keyword lists, or production directions.
- If the poster is inside a link whose accessible name already states the video's title and purpose, use `alt=""` when the poster is purely decorative. The link itself must still have a clear accessible name, such as `Watch narrated video: <title>`.
- Do not use an empty `alt` when the poster communicates unique scientific information or visible text not available nearby.

Example for an informative poster:

> Molecular structures arranged over an indigo error-field map, with the question “Can materials learn from their environment?”

## Publication QA gate

The reviewer must verify the artifacts against the final web encode and published page:

- [ ] A UTF-8 `.vtt` file exists, parses as WebVTT, and is attached as an English `captions` track.
- [ ] Every spoken word and meaningful sound is represented accurately.
- [ ] Cue order, duration, line breaks, and reading speed are acceptable; spot checks at the start, middle, end, and every edit point are synchronized.
- [ ] Captions can be enabled with keyboard-only controls and do not obscure essential visuals at common desktop and mobile sizes.
- [ ] A clearly labelled transcript is available as semantic HTML/text without requiring JavaScript.
- [ ] The transcript matches the final cut and describes essential visual-only information.
- [ ] The poster has context-appropriate alt text, or a documented empty alt when it is truly redundant/decorative.
- [ ] The video's link/player has an accessible name independent of the poster image.

Any missing artifact, invalid caption track, materially inaccurate or unsynchronized text, inaccessible transcript, or missing/inappropriate poster alt text is a release blocker.

## Ownership

- Script/voice production supplies the approved spoken-word text and pronunciation corrections.
- Video production updates caption timing against the final encode.
- Web integration publishes the `<track>`, transcript, poster alt text, and accessible player/link name.
- QA verifies the final public experience and records pass/fail evidence in the article-video review.

This policy operationalizes WCAG guidance for prerecorded captions (1.2.2), audio description or media alternatives (1.2.3/1.2.5 as applicable), text alternatives (1.1.1), and keyboard/accessibility support for controls (2.1.1 and 4.1.2). Conformance to this project policy does not by itself establish whole-page WCAG conformance.
