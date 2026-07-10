# Hermes Team Assignment — Article Video Series

## Director
- **Role:** Executive decision-maker, final script/audio/animation approval.
- **You:** Provide the Reese Witherspoon-style voice direction and the “website integration” constraint.

## Scriptwriter (researcher profile)
- **Tasks:**
  - Distill each article into a 90–120 sec narration script.
  - Match the fast-talking Cali-woman persona.
  - Mark visual cues for each beat (which of the 10 images appears when).
- **Deliverables:** `scripts/<slug>.txt` and `scripts/<slug>-cues.json`.

## Animator (media-director profile)
- **Tasks:**
  - Build HyperFrames compositions (`compositions/<slug>/index.html`).
  - Animate the article’s 10 visuals with GSAP.
  - Ensure deterministic, seek-safe timelines.
- **Deliverables:** Composition HTML, `window.__timelines` registration, lint/validate pass.

## Voice engineer (coder profile)
- **Tasks:**
  - Generate TTS audio for each script (Edge TTS or HeyGen API).
  - Mix narration with optional ambient bed.
  - Export WAV/MP3 and produce word-level transcript if possible.
- **Deliverables:** `audio/<slug>-narration.wav`, `audio/<slug>-bgm.wav` (optional).

## Web integrator (coder profile)
- **Tasks:**
  - Create `/videos/` index page.
  - Add "Watch narrated version" links to articles.
  - Implement lazy video lightbox and `<link rel="alternate">` tags.
  - Publish the native caption track, semantic transcript, poster alt text, and accessible player/link name required by the [accessibility policy](docs/accessibility-requirements.md).
- **Deliverables:** HTML/JS/CSS updates in lupine-science.

## QA (coder profile)
- **Tasks:**
  - Render each composition and inspect MP4.
  - Check the final web encode against the [accessibility policy](docs/accessibility-requirements.md), including captions, transcript, poster alt text, and keyboard access.
  - Check audio sync and website perf budgets.
  - Run `npm run verify` and `npm run smoke`.

## Workflow

Render artifacts follow the [file naming and versioning convention](docs/file-naming-and-versioning.md). Create each video's append-only changelog from [the changelog template](templates/video-changelog-template.md).

1. Director green-lights article priority order.
2. Scriptwriter delivers script + cues.
3. Voice engineer produces narration audio.
4. Animator builds composition against audio duration.
5. QA renders and reviews.
6. Web integrator publishes links.
7. Director signs off.

## High-leverage design and research tasks

Flagship scenes, reusable visual systems, consequential research conclusions, and high-cost architecture choices use the [Sol–Fable challenge loop](process/task-instructions.md) before implementation is considered approved. Start from the [copy-ready task template](process/challenge-loop-task-template.md): Sol (`animator`) proposes and clears detailed requirements; Fable (`artdirector` / `reviewer`) sets and protects the bar; the director intervenes only on deadlock, contradiction, or material scope/risk change. Completion summaries must include the template's `feedback` field.
