# Article Video Series — HyperFrames + Narration

Turn every Lupine Science article into a short, narrated motion video built with [HyperFrames](https://github.com/heygen-com/hyperframes). Each video animates the article’s 10 deck-level visuals, driven by a fast-talking 20s California woman narrator (Reese Witherspoon energy).

## Output format

- **Landscape**: 1920×1080, 30 fps, MP4 (article page / YouTube / LinkedIn).
- **Vertical cut**: 1080×1920, 30 fps, MP4 (shorts / reels / TikTok).
- **Audio**: WAV/MP3 narration + optional ambient bed.
- **Captions**: WebVTT / SRT burn-in optional.

## Voice

- Persona: fast-talking, curious, confident 20s California woman.
- Reference: Reese Witherspoon’s cadence — quick, warm, articulate.
- TTS engine: Edge TTS (Microsoft Azure) or HeyGen voice API if credentials available.
- Placeholder: `en-US-AnaNeural` or similar until final voice is cast.

## Visual style

- Bring the static article visuals to life with HyperFrames seekable animations.
- Default runtime: GSAP timelines registered on `window.__timelines`.
- Use Lupine brand palette: warm paper `#faf9f6`, indigo `#3d4db3`, ink `#1a1a1a`.
- Keep text large and readable (video-safe margins).

## Website integration strategy

Because heavy autoplay video hurts the reading experience and page performance, videos live **outside** the article body:

- A subtle "Watch the 2-min narrated version" link near the article byline opens a lightbox/player overlay.
- Videos are hosted on a CDN path (`/videos/<slug>/`) and lazy-loaded only when the user clicks.
- Each article gets a `<link rel="alternate" type="video/mp4" ...>` in the head for discovery.
- A dedicated `/videos/` index page lists the whole series.

## Hermes team roles

| Role | Responsibility | Agent profile |
|------|----------------|---------------|
| Director (you) | Final creative decisions, approve scripts and cuts | — |
| Scriptwriter | Condense each article into a 90–120 sec narration script | researcher |
| Animator | Build HyperFrames compositions and animate visuals | media-director |
| Voice engineer | Generate TTS, mix audio, produce final WAV/MP3 | coder |
| Web integrator | Add video links, player overlay, `/videos/` index | coder |
| QA | Verify renders, captions, website perf | coder |
