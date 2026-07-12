# Lupine Science article videos

This project turns Lupine Science articles into 90–120 second narrated motion films built with HyperFrames. The publication target is a 1920×1080, 30 fps H.264 MP4 with synchronized WebVTT captions; optional vertical cuts are 1080×1920. Videos are lazy-loaded outside the article body through the site video index and article player.

The quality bar is a designed short film, not a slide deck with voice-over. Read [`frame.md`](frame.md) for the visual system and [`REVIEW_FRAMEWORK.md`](REVIEW_FRAMEWORK.md) before production work.

## Start here

Prerequisites:

- Node.js and npm
- `ffmpeg` and `ffprobe`
- Hermes Agent for team/profile workflows
- A Chromium-compatible browser for HyperFrames preview and inspection

From the repository root:

```bash
cd media/projects/article-videos
npm install
npm run check
```

`npm run check` validates every reusable component. Individual episode projects keep their own HyperFrames scripts and do not share a root dependency install.

Before taking production work:

1. Read [`TEAM.md`](TEAM.md), [`frame.md`](frame.md), and [`REVIEW_FRAMEWORK.md`](REVIEW_FRAMEWORK.md).
2. Read the article source, approved narration, cue sheet, and storyboard for the assigned slug.
3. Confirm your Hermes profile with `hermes profile show <profile>`.
4. Load the relevant workflow skill before editing a composition.
5. Work in the assigned article/component directory; keep generated media under `renders/`, review evidence under `reviews/`, and source assets under `assets/`.

Reviewer and director profiles must also complete the blind calibration in [`training/onboarding-runbook.md`](training/onboarding-runbook.md) before production review.

## Install or refresh HyperFrames skills

Start every HyperFrames task with the `hyperframes` router skill. Install or refresh the common production skills with:

```bash
npx --yes hyperframes@0.7.48 skills update \
  hyperframes \
  hyperframes-core \
  hyperframes-animation \
  hyperframes-keyframes \
  hyperframes-creative \
  hyperframes-cli \
  media-use
```

Use `npx --yes hyperframes@0.7.48 skills update <name>` for one missing skill, or omit names to refresh the core set plus skills already installed. Restart the agent session after installing skills so they are discoverable. Reviewer/director skill revisions are tracked in [`training/profile-skill-manifests.md`](training/profile-skill-manifests.md).

## Team and ownership

| Work | Hermes profile | Owns |
|---|---|---|
| Direction | `director` | Priority, script/storyboard gates, final sign-off, escalation |
| Script | `scriptwriter` | 90–120 second narration and cue sheet |
| Animation | `animator` | Seek-safe HyperFrames composition and deterministic evidence |
| Art direction | `artdirector` | Concept bar and high-leverage design critique |
| Voice/audio | `voice-engineer` / `audio-engineer` | Narration, timing, mix, and masters |
| Independent review | `reviewer` | Binary gates, frame scores, P0/P1 findings, re-review |
| Technical QA | `qa` / `visual-tester` | Render, caption, media, and browser checks |
| Publishing | `web-integrator` | Player, video index, article integration, deployment handoff |

The full deliverable contract is in [`TEAM.md`](TEAM.md). Do not self-approve: implementers provide evidence and a separate reviewer records the verdict.

## Preview, check, and render

Run episode commands from the episode project directory, for example:

```bash
cd prototype-01-the-02-percent-synthesis-problem

npm run dev       # long-running local preview server
npm run check     # HyperFrames lint + validate + inspect
npm run render    # render the episode MP4
npm run publish   # optional; publish only when assigned
```

The episode scripts pin HyperFrames `0.7.48`. Keep the preview server running in a background terminal. Always run `npm run check` before rendering and preserve its output with the review evidence.

Reusable components are validated from this project root:

```bash
npm run check          # validate every component and fixture
npm run snapshot       # regenerate component snapshots
npm run vreg           # compare snapshots with approved baselines
```

Only run `npm run vreg:update` after the reviewer has approved an intentional baseline change.

After rendering, verify the actual file rather than trusting the command exit:

```bash
ffprobe -v error -show_entries \
  stream=codec_name,width,height,r_frame_rate \
  -show_entries format=duration,size \
  -of json renders/<versioned-render>.mp4
sha256sum renders/<versioned-render>.mp4
```

Record an immutable/versioned path, byte size, timestamp, and SHA-256 in the review ticket. Never submit an ambiguous `latest.mp4` for sign-off.

## Review and release gates

Every release passes four gates:

1. **Script:** director approves narration and beat sheet.
2. **Storyboard:** director approves visual sequence and timing.
3. **Frame review:** reviewer checks the exact draft; every applicable binary criterion passes, every representative frame scores at least 7/10, and no P0/P1 remains open.
4. **Director sign-off:** director watches the exact final 1080p render at 100% with audio and records `APPROVE`, `REJECT`, or `HOLD` against its hash.

Extract review evidence every five seconds and at every cue start:

```bash
./scripts/extract-review-frames.sh \
  --cue-file path/to/captions.vtt \
  --output reviews/<slug>/<render-version>/frames \
  renders/<versioned-render>.mp4
```

Copy [`ARTICLE_VIDEO_REVIEW_CHECKLIST.md`](ARTICLE_VIDEO_REVIEW_CHECKLIST.md) into the article review record. Findings must include timestamp/frame, criterion ID, observable evidence, severity (`P0` or `P1`), required fix, and required re-review proof. A new render is a new review object: re-check every prior blocker, then sample the full render for regressions.

Release requires all of the following:

- 1920×1080, 30 fps, H.264 final render
- web encode no larger than 3 MB per minute
- successful HyperFrames lint, validate, and inspect output
- synchronized, spell-checked WebVTT captions
- reviewer `PASS` with no open P0/P1
- explicit director approval against the exact final render hash

Before publishing, run the [video hosting guardrail](docs/video-hosting.md). It records the `/videos/` URL contract, checks Cloudflare Pages' 25 MiB per-asset ceiling, and documents the production R2/custom-domain cutover when an encode outgrows Pages.

## Escalation path

| Situation | Escalate to | Action |
|---|---|---|
| Missing source, credentials, approved script/storyboard, or inaccessible render | `director` | Put the task in `blocked`; name the missing input and owner. Do not invent or substitute evidence. |
| HyperFrames/tooling or deterministic-render failure | `qa`, then `software-engineer` if unresolved | Attach the failing command, complete output, source revision, and smallest reproduction. |
| Visual craft, hierarchy, or brand disagreement | `artdirector` / `reviewer` | Cite the conflicting `frame.md` or review criterion and attach frame evidence. |
| Open P0/P1 after a revision | `reviewer` | Keep the release blocked and request a versioned re-render plus proof for each issue ID. |
| Contradictory requirements, material scope/cost/risk change, deadlock, or three Fable `REVISE` verdicts | `director` | Stop the Sol–Fable loop and request a recorded decision or override with rationale and residual risk. |
| Publication/deployment issue | `web-integrator`, then `devops` | Keep the release unpublished; attach URL, environment, checks, and rollback impact. |

High-leverage visual systems and consequential design decisions must use the [`Sol–Fable challenge loop`](process/task-instructions.md) and its [`copy-ready task template`](process/challenge-loop-task-template.md). Sol (`animator`) proposes and implements; Fable (`artdirector`/`reviewer`) sets and protects the bar; only the director arbitrates.

## Project map

- `assets/` — shared local brand, font, image, and audio sources
- `components/` — reusable compositions, fixtures, snapshots, and visual regression tests
- `compositions/` — canonical reusable HyperFrames source
- `prototype-*` / `article-video-prototype/` — episode composition projects
- `renders/` — versioned media outputs (inside each project where applicable)
- `reviews/` — review records and immutable evidence
- `scripts/` — review and production helpers
- `templates/` — storyboard and task templates
- `training/` — reviewer/director calibration material
- `docs/` and `process/` — specialist workflows and challenge-loop policy

## Core visual and audio constraints

- Lupine warm paper `#faf9f6`, indigo `#3d4db3`, and ink `#1a1a1a`; use the extended palette only as defined in `frame.md`.
- Lupine Newsreader and IBM Plex Mono only; body text is at least 48 px and labels/data callouts at least 36 px at 1080p.
- No critical content in the outer 5% title-safe margin.
- Timelines are deterministic and seek-safe: no network fetches, `Date.now()`, or `Math.random()` at render time.
- Narration voice is the configured technical-robot voice (`en-US-SteffanNeural` via Edge TTS by default); see `voice-config.json`.
- Narration remains intelligible; any music bed sits at least 12 dB below narration.
- Motion must reveal or explain the evidence. Static-slide scenes and arbitrary motion are release blockers.
