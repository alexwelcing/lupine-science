# Audio release gate

Decision: **PASS**
Files: 1; pass: 1; fail: 0
Commit: not supplied (local audit)

Policy: integrated loudness -18 to -14 LUFS (target -16 LUFS); effective-silence floor -50 LUFS; mean-volume floor -45 dB; true peak at or below -1 dBTP; audio/video duration delta at most 100 ms; no silence of at least 0.75 s overlapping a narrated VTT cue by at least 0.5 s or half a short cue; and narration speech rate within 100-190 wpm (films under 25 narrated words are exempt).

## Ranked verdicts

### PASS — media/projects/article-video-replacements/water-and-air-correcting-the-molecules-we-drink-and-breathe/output/private-candidate.mp4
- PASS: audio-stream-present — audio stream present
- PASS: not-effectively-silent — integrated loudness -16.2 LUFS
- PASS: integrated-loudness-band — -16.2 LUFS; required -18.0 to -14.0 LUFS
- PASS: mean-volume-floor — -15.9 dB; floor -45.0 dB
- PASS: true-peak-ceiling — -2.7 dBTP; ceiling -1.0 dBTP
- PASS: audio-video-duration-match — audio/video delta 20.0 ms; tolerance 100 ms
- PASS: narration-timeline-present — 18 valid VTT cues
- PASS: no-dead-air-during-narration — no long silence overlaps a narrated VTT cue
- PASS: speech-rate-in-band — 131 wpm over 126 s of narration (275 words); required 100-190 wpm

