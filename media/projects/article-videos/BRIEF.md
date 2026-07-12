# Article Video Brief

## Narration script formula

Each article becomes a 90–120 second video with this arc:

1. **Hook (0–8 sec)** — The surprising claim or stakes.
2. **Problem (8–25 sec)** — Why the status quo fails.
3. **Mechanism (25–45 sec)** — Lupine’s correction/verification method in one motion.
4. **Evidence (45–60 sec)** — The number or visual proof.
5. **Scale / payoff (60–85 sec)** — Market or climate impact.
6. **CTA (85–95 sec)** — Read the full article or download the proof pack.

## Visual pacing

- One visual per beat; animate the chart/data into view.
- Use consistent transitions: subtle slide + fade, indigo accent strokes, occasional field-line reveals.
- Avoid tiny text: on-screen labels should be ≥48 px at 1080p.

## Voice direction

- Voice: `en-US-SteffanNeural` via Edge TTS (soothing, clear technical robot).
- Pace: ~145–160 words per minute (deliberate and legible; slower than the previous fast-talking direction).
- Tone: calm, precise, warmly neutral—like a research instrument that has learned to explain itself. No slang, no vocal fry, no sales energy.
- No jargon without a one-word translation.

## Technical constraints

- HyperFrames composition must be deterministic: no `Math.random`, no `Date.now`, no `repeat: -1`.
- All animations use a single paused GSAP timeline on `window.__timelines`.
- Media files are local relative paths; no hot-linked assets.
- Renders happen via `npx hyperframes render` (or local FFmpeg fallback).
