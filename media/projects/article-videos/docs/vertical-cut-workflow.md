# Vertical-cut workflow (16:9 → 9:16)

This is the production contract for making native 1080×1920 shorts/reels from the 1920×1080 Lupine Science article-video compositions. A vertical cut is a sibling editorial layout, not an automated center crop.

## Why center-cropping is prohibited

A 16:9 frame enlarged to cover 9:16 is scaled by 1.7778×. The vertical output then sees only 607.5 source pixels of the original 1920-pixel width: 31.64% of the frame. Claims, chart labels, sources, and marks outside that narrow center strip disappear.

Fitting the full landscape frame inside 1080 pixels is also not a deliverable: it produces a 1080×607.5 image with 1312.5 pixels of unused vertical space and makes the 48px landscape body token render at only 27px.

**Rule:** preserve the narrative timing and evidence, but recompose every scene on a native 1080×1920 canvas.

## Files and naming

Keep the approved landscape project unchanged. Create a sibling vertical project:

```text
articles/<article-slug>/
  landscape/
    index.html
    compositions/
  vertical/
    index.html
    compositions/
    VERTICAL-NOTES.md
    snapshots/
```

If an article currently has a single project directory, add `vertical/` beside it rather than converting the landscape files in place.

Use explicit vertical IDs so an assembled page never contains duplicate IDs:

- root: `<article-slug>-vertical`
- scene: `<article-slug>-sNN-vertical`
- reusable variant: `title-card-vertical`, `data-chart-vertical`, and so on

For a sub-composition, the host `data-composition-id`, the inner template root `data-composition-id`, and `window.__timelines["..."]` key must still match exactly.

## Vertical frame contract

The vertical root is a real fixed-size composition:

- `data-width="1080"`
- `data-height="1920"`
- `data-fps="30"`
- the same approved duration and cue boundaries as the source cut unless the editor intentionally changes the script
- CSS root width/height: `1080px` / `1920px`
- a full-bleed child owns the paper ground; do not rely on the root background

### Safe regions

Two nested safety regions apply:

1. **Technical title-safe:** x 54–1026, y 96–1824 (outer 5% excluded).
2. **Conservative social content-safe:** x 90–900, y 180–1536.

The social rectangle deliberately reserves:

- 90px on the left
- 180px on the right for platform action controls
- 180px at the top for device/platform chrome
- 384px at the bottom for account, description, CTA, and navigation overlays

Use the full technical safe area only for noncritical texture or marks. Headlines, values, chart labels, axes, legends, citations, lower thirds, and the logo must remain inside the conservative social rectangle.

Reserve x 90–900, y 1280–1536 for burned-in captions when enabled. Captions remain two lines maximum. Do not put a lower third, chart conclusion, or source beneath them. Platform-native captions may vary by destination; capture one platform proof before release if native captions are used.

## Typography and density

Do not multiply landscape sizes by 0.5625. Re-select the appropriate token for a narrow, in-feed frame.

Starting tokens at 1080×1920:

| Role | Vertical token | Constraint |
|---|---:|---|
| Display hero | 112–132px Newsreader | 4 lines maximum; prefer 2–3 |
| Headline | 88–104px Newsreader | 4 lines maximum |
| Subheadline | 64–76px Newsreader | 4 lines maximum |
| Body | 44–52px Newsreader | 5 short lines maximum |
| Mono label/data label | 30–36px IBM Plex Mono | wrap intentionally; never shrink below 30px |
| Primary stat | 144–180px IBM Plex Mono | one focal value |
| Captions | 48–56px Newsreader | 2 lines maximum |

Newsreader remains the human/assertion voice; IBM Plex Mono remains the evidence voice. Preserve the locked palette and local `@font-face` assets from `frame.md`.

A vertical scene still needs foreground evidence chrome, but fewer simultaneous items than landscape. Target one dominant claim plus 4–7 supporting elements. If copy does not fit, shorten or split the beat; do not reduce critical text below the table floors.

## Scene-by-scene reframing procedure

### 1. Lock the editorial source

Before editing, record in `vertical/VERTICAL-NOTES.md`:

- landscape source path and approval date
- narration/audio path
- duration, fps, and scene cue table
- the indispensable claim/evidence in each scene
- caption mode (burned-in, platform-native, or none)
- destination(s), because overlays differ

Do not change claims, numbers, units, citations, or narration merely to make layout easier. Escalate substantive copy edits.

### 2. Make a cue-preserving vertical skeleton

Copy the article project to `vertical/`, then change frame dimensions and composition IDs. Keep scene `data-start`, `data-duration`, and `data-track-index` values aligned with the approved landscape cut. Keep exactly one paused, synchronously registered timeline per composition.

Do not use CSS media queries to make one DOM serve both aspect ratios. The renderer has fixed dimensions, and scene-specific vertical hierarchy is easier to review and safer to maintain as an explicit sibling composition.

### 3. Assign every scene an adaptation mode

Choose one mode before changing CSS:

- **Reflow:** same elements, stacked vertically. Default for claim + evidence.
- **Focus:** one visual/stat becomes the hero; supporting evidence moves below it.
- **Split beat:** dense landscape comparison becomes two sequential vertical clips. Requires an intentional cue/script decision.
- **Windowed media:** portrait crop of photography/video using an authored focal point. Text remains separate from the media window.
- **Rebuild chart:** same data, redrawn axes/labels for portrait. Never scale a finished landscape chart bitmap.

Record the mode and focal point for every scene in `VERTICAL-NOTES.md`.

### 4. Recompose by pattern

**Claim + evidence**

- Put the claim in the upper 35–45% of the social-safe area.
- Place the evidence/stat below it, connected by the indigo rule.
- Keep source/provenance immediately adjacent to the evidence, not at the physical frame bottom.

**Data chart**

- Prefer a tall plotting region and direct labels.
- Limit simultaneous series; use sequential emphasis when the landscape chart is dense.
- Move long category labels to a left rail or convert to horizontal bars.
- Keep all axes, units, highlighted values, and source text within x 90–900.
- Recalculate chart geometry for 1080×1920; do not apply a scale transform to the landscape chart.

**Comparison / two-column scene**

- Stack A then B, or use a timed A→B replacement in one fixed evidence field.
- Preserve a common baseline or scale so the comparison stays honest.
- Do not squeeze two landscape columns side by side.

**Title card**

- Stack episode label, headline, deck, and rule.
- Keep the mark above the bottom overlay reserve.
- Shorten the deck before shrinking the headline.

**Lower third**

- Rebuild as a compact upper-caption-band card, normally x 90–900 and y 1110–1260.
- If captions are active at y 1280–1536, the lower third must finish above y 1280.
- Keep role/source lines short enough for one or two deliberate wraps.

**Logo sting / outro**

- Center the identity group optically within y 360–1420, not the full physical canvas.
- Put CTA/URL above y 1536.
- Preserve the canonical mark aspect ratio and clear space; never crop or redraw it.

**Photography / generated media / avatar**

- Store a per-shot focal point as normalized `(x, y)` coordinates in `VERTICAL-NOTES.md`.
- Author the crop with `object-fit: cover` plus explicit `object-position`.
- Verify faces, hands, labels, instruments, and the subject of the narration at every sampled time.
- Never bake critical text into a crop-prone image.

### 5. Retarget motion, not just layout

Preserve the motion’s narrative function and cue time. Change travel vectors and distances for portrait:

- horizontal line wipes may become vertical only at a major section change; otherwise shorten their horizontal travel to the new width
- stagger order should follow top-to-bottom reading order
- chart builds remain causal: frame/axis → labels → marks → conclusion
- transformed elements stay block-level and explicitly sized
- keep all visual state seekable; no clocks, unseeded randomness, input state, async timeline construction, or infinite repeats

Do not nest or manually play sub-composition timelines. HyperFrames owns seeking and media playback.

## Critical-content audit

For each scene, answer **yes** to every item:

- Is the complete claim visible inside x 90–900, y 180–1536?
- Are every number, unit, axis, legend/direct label, and cited source visible?
- Is any meaning carried only by a landscape left/right position that no longer exists?
- Can the frame be understood with platform UI covering x 900–1080 and y 1536–1920?
- Do captions avoid lower thirds, conclusions, and source lines?
- Does the headline remain legible in a phone-size contact sheet?
- For cropped media, is the narrated subject visible throughout the shot?
- Are logo geometry, aspect ratio, and clear space intact?

A “no” requires reflow, rewriting within approved meaning, splitting the beat, or changing the focal crop. It must not be waived by reducing type below the floor.

## HyperFrames QA gate

Run from the vertical project directory:

```bash
npx hyperframes lint --json
npx hyperframes validate --json
npx hyperframes inspect --json
npx hyperframes snapshot --frames 9
```

For sub-compositions, also snapshot the midpoint of every mounted host (`data-start + data-duration / 2`) so the assembled mount path is exercised:

```bash
npx hyperframes snapshot --at <scene-midpoints>
```

Review the snapshots at full size and as a phone-size contact sheet. Add snapshots at all high-risk moments:

- end of every entrance
- peak chart/data state
- scene transitions
- longest dynamic title/caption value
- every media focal-point change
- final CTA/outro hold

Static tools do not prove that a frame survives social UI. Overlay the conservative content-safe rectangle during review (review-only; remove or disable it before delivery), and inspect every high-risk snapshot.

Then open Studio:

```bash
npx hyperframes preview
```

The editor/director must approve the vertical composition in Studio before rendering. After approval only:

```bash
npx hyperframes render --quality draft --output renders/<article-slug>-vertical-draft.mp4
# approved master
npx hyperframes render --quality high --output renders/<article-slug>-vertical-master.mp4
```

After a successful render, verify the file and stream metadata:

```bash
test -s renders/<article-slug>-vertical-master.mp4
ffprobe -v error -show_entries stream=width,height,r_frame_rate:format=duration \
  -of default=noprint_wrappers=1 renders/<article-slug>-vertical-master.mp4
```

The master must report 1080×1920, 30 fps, and the approved duration. Watch the encoded file once on a phone or in a 9:16 emulator with destination UI visible.

## Definition of done

A vertical cut is complete only when:

- landscape source remains unchanged
- native 1080×1920 composition exists with explicit vertical IDs
- `VERTICAL-NOTES.md` identifies adaptation mode and indispensable evidence per scene
- all critical content passes the conservative social-safe audit
- captions and lower thirds do not collide
- lint, validate, and inspect report zero errors
- assembled midpoint/high-risk snapshots are visually approved
- Studio review is approved before render
- the verified master is 1080×1920 at 30 fps with expected duration
- a final watch with target-platform UI finds no obscured critical text
