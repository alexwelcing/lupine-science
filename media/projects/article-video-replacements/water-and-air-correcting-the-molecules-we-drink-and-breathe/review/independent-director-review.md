# Independent rendered-candidate review

Candidate: `water-and-air-correcting-the-molecules-we-drink-and-breathe`

Decision: **PASS FOR OWNER REVIEW — NOT PUBLICATION-ELIGIBLE**

Exact reviewed MP4:

- SHA-256: `7d587757dbd9586a8a8531e873a2ee6278ed116086c6c88d8da08d4622cf978a`
- Bytes: `11411150`
- Duration: `131.520000s`
- Video: H.264, 1920×1080, 30 fps, yuv420p, bt709
- Audio: AAC, mono, 44.1 kHz

## Rendered-output verdict

Frames 01–37: PASS.

- Frames 05, 09, 13, 17, 21, 25, 29, and 33 are intentional exact-boundary dark cut frames. The preceding late frame and following early frame are populated for every boundary.
- Full decode covers all 3,946 frames.
- FFmpeg sustained-black detection found no black interval of 0.5 seconds or longer.
- No clipping, overlap, unreadable primary typography, broken diagram, or sustained blank scene was observed.
- Each scene retains one dominant proof and no more than three required visible relationships.
- Water and air sequences read as continuous mechanism strips rather than generic card grids.
- The branded material palette survives H.264 encoding without visible banding or neon drift: mineral black field, structural cream evidence, oxidized-copper correction, cool-blue water, lichen air, and evidence-red raw bias.
- Color remains redundant with labels, geometry, position, and motion; it does not encode unsupported magnitude, probability, or a fabricated heatmap.
- The blind record states `36`, `r = 0.906`, and `zero fitted parameters` without fabricating an underlying scatter plot.
- The measured-domain sequence visibly changes claim state from bounded to supported.
- The closing transfer sequence first shows LOW COORDINATION → water/air, then LOW COORDINATION → batteries/direct air capture. No frame shows more than two application branches.

## Audio and excluded evidence

Audio release gate: PASS.

- Integrated loudness: `-16.18 LUFS`
- True peak: `-2.74 dBTP`
- LRA: `2.4 LU`
- Speech rate: `131 wpm`
- Narration cues: `18`
- Long silence overlapping narration: none

The disputed theorem-count sentence is absent from both spoken narration and timed cue payloads. The final candidate audio was compared against an independently reconstructed copy of the verified source narration with `104.800–112.690s` removed:

- Decoded PCM correlation: `0.9997246518915432`
- Minimum required correlation: `0.99`
- Best alignment offset: `0` samples

## Integration and accessibility

PASS:

- Article references canonical MP4 and poster names.
- Video detail page uses native controls and `preload="none"`.
- No autoplay or loop.
- Poster-first display.
- Default English WebVTT captions.
- ARIA-described player and MP4/VTT downloads.
- 1920×1080 poster source and 1200×630 social crop both exist.
- Candidate is below both soft and hard file budgets.
- The exact palette is declared in `frame.md` and `production-contract.json`; all nine scenes declare semantic color roles and the strict HyperFrames contrast report has zero warnings.

## Unavailable evidence

The configured external `video_analyze` backend rejected video input with HTTP 400 because the active model does not support the `video_url` content type. This is recorded as unavailable, not a pass. It does not replace or weaken the successful full decode, 37-frame severe review, black-interval analysis, audio gate, or repaired fail-closed reviewer.

## Publication hold

This review does not authorize a public-media overwrite. The production contract remains `authored-private-candidate-only`, `eligibleForPublication=false`. Owner approval, feature-branch delivery, PR, CI, and reviewer-agent review remain mandatory before publication.
