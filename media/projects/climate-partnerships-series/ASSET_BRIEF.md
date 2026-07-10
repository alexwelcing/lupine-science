# Climate Partnerships Series — Asset Brief

## Brand constraints (from `/home/alex/Dev/lupine/lupine-science/docs/brand-guidelines.md`)

- **Palette:** Paper `#faf9f6`, Ink `#16171d`, Indigo `#3d4db3`, Indigo deep `#2e3a87`, Ochre `#8a5e1f` (rare), Verified `#3a8f5b` (badges only).
- **Typography:** Newsreader (serif) for headlines and body; IBM Plex Mono for labels, equations, status.
- **Mark:** Use `public/lupine-science-mark.svg` as the recurring corner element.
- **Shared style suffix for generated images:** *editorial scientific minimalism, warm off-white `#faf9f6` paper background, single indigo `#3d4db3` light/accent, near-duotone, generous negative space, calm and premium, no text, no people, no flowers, no neon, no glowing circuits, like a figure in a beautiful physics monograph, high detail toward the edges.*
- **No-go visuals:** flowers, people, text baked into images, dark neon backgrounds, glowing-circuit AI tropes, stock 3D renders.

## Existing motifs inventory

| Variant set | Motifs available | Best use |
|---|---|---|
| **v2–v5** | `shape-of-wrongness` (wide / square / dense / quiet), `bits-to-atoms` (wide / square / dense / quiet), `upstream-cascade` (wide / square / dense / quiet) | Hero backgrounds, OG images, cover slides. Wide variants for article heroes; square for social cards. |
| **v6** | `shape-of-wrongness`, `error-vector-alignment`, `calibration-grid` | Article 1 and Article 5; proof slides. |
| **v7** | `error-vector-alignment`, `calibration-grid` (no `shape-of-wrongness`) | Article 2 field-diagram hero; calibration-grid for proof slides. |
| **v8** | `constellation-threads`, `folded-light`, `ink-wash`, `moire-circles`, `particle-ribbon`, `scale-shards`, `shadow-geometry` | Article 3 constellation/threads hero; `folded-light` for Article 2; `ink-wash` as a soft alternative for Article 5. |
| **v9** | `atomic-ring`, `bond-angle`, `calibration-cross`, `convergence-star`, `coordinate-axis`, `divergence-burst`, `error-tick` | Technical spot illustrations, subheaders, proof-pack figures. Circle/square/wide crops available. |
| **v10** | `crystalline-form`, `diffraction`, `field-gradient`, `interference`, `isosurface`, `lattice-defect`, `meander-pattern` | Article 2 (`field-gradient`, `isosurface`), Article 4 (`crystalline-form`, `lattice-defect`), technical diagrams. Quiet/square/wide crops available. |

## Per-article asset plan

### Article 1: The 0.2% Synthesis Problem

- **Hero asset:** `shape-of-wrongness_wide_v6` first choice; if too abstract, generate a new wide variant emphasizing a thin indigo ribbon emerging from scattered error vectors, with the 0.2% idea suggested by composition (no text).
- **Social card:** `shape-of-wrongness_square_v6` or v5.
- **Inline figures (optional):**
  - `error-tick_circle_v9` for the GNoME funnel annotation.
  - `calibration-cross_square_v9` for the A-Lab critique marker.
- **Prompt seed (if generating):** *A wide minimalist scientific diagram on warm paper: dozens of faint indigo error-vector arrows scatter across the left side and converge onto one luminous indigo ribbon at the right, symbolizing 0.2% of candidates surviving validation. Near-duotone, generous negative space, no text, no people, no flowers, no neon.*

### Article 2: A Field, Not a Neural Net

- **Hero asset:** `field-gradient_wide_v10` first choice; alternatively `folded-light_wide_v8` for a softer field reading.
- **Social card:** `field-gradient_square_v10`.
- **Inline figures (optional):**
  - `isosurface_quiet_v10` for the coordination-number field concept.
  - `bond-angle_circle_v9` for the anchor-observable triad (100, 111, Evac).
  - `calibration-grid_quiet_v6` for the Lean verification layer.
- **Prompt seed (if generating):** *A wide minimalist scientific figure on warm paper: a smooth indigo scalar field gradient flowing over a sparse crystalline lattice, with three small calibration nodes where the field is measured. Near-duotone, generous negative space, no text, no people, no flowers, no neon.*

### Article 3: Five Materials That Could Unlock 5–12 GtCO₂/Year

- **Hero asset:** `constellation-threads_wide_v8` extended with five nodes, or generate a new composite: five faint lattice glyphs arranged horizontally across the lower third of a wide frame, connected by a single indigo thread.
- **Social card:** `constellation-threads_square_v8` or custom square crop of the five-node composite.
- **Inline figures (optional):**
  - `crystalline-form_square_v10` for battery materials.
  - `lattice-defect_square_v10` for defect-mediated properties.
  - `moire-circles_quiet_v8` for the aggregate impact figure.
- **Prompt seed (if generating):** *A wide minimalist scientific network on warm paper: five small, distinct crystalline glyphs spaced evenly across the frame, linked by one luminous indigo thread that arcs through the center. Near-duotone, generous negative space, no text, no people, no flowers, no neon.*

### Article 4: From Predicted Crystal to Commercial Cell

- **Hero asset:** `bits-to-atoms_wide_v5` or generate a new wide variant showing a lattice fragment on the left dissolving into a simplified cell/pack silhouette on the right, connected by an indigo thread.
- **Social card:** `bits-to-atoms_square_v5` or custom square crop.
- **Inline figures (optional):**
  - `coordinate-axis_circle_v9` for the pipeline map.
  - `atomic-ring_circle_v9` for partner-network nodes.
  - `upstream-cascade_wide_v4` for the value-chain cascade.
- **Prompt seed (if generating):** *A wide minimalist scientific diagram on warm paper: on the left, a fragment of a crystal lattice; on the right, a clean geometric battery cell silhouette; a single luminous indigo thread connects them through generous negative space. Near-duotone, no text, no people, no flowers, no neon.*

### Article 5: Investing in the Trust Layer

- **Hero asset:** `error-vector-alignment_quiet_v6` first choice; alternatively `ink-wash_wide_v8` for a more contemplative close.
- **Social card:** `error-vector-alignment_square_v6`.
- **Inline figures (optional):**
  - `convergence-star_circle_v9` for the three-pillar diagram.
  - `diffraction_quiet_v10` for the moat-deepens-with-use idea.
  - `meander-pattern_quiet_v10` as a subtle closing texture.
- **Prompt seed (if generating):** *A wide minimalist scientific figure on warm paper: many faint indigo error-vector arrows initially scattered at the left gradually align into one decisive direction at the right, converging toward a single luminous indigo point. Near-duotone, generous negative space, no text, no people, no flowers, no neon.*

## Cross-cutting assets

### Series landing page

- **Hero background:** `shape-of-wrongness_wide_v6` or the Article 1 generated wide variant.
- **Thumbnail grid:** one square crop per article (reuse each article's social card).
- **Mark:** `public/lupine-science-mark.svg` in the top-right corner.

### Social thread

- One card per article: reuse the square hero/social asset.
- Thread opener card: `shape-of-wrongness_square_v6` with text overlay applied by CSS/Newsreader, not baked into the image.
- Thread closer card: `error-vector-alignment_square_v6`.

### Proof-pack formatting

- Use `calibration-grid_quiet_v6` or `calibration-cross_square_v9` as a cover texture.
- Inline claim badges use Verified `#3a8f5b` on IBM Plex Mono.
- Source citations use IBM Plex Mono smallcaps.

## New motifs to generate

| Motif | Purpose | Status |
|---|---|---|
| `five-nodes-constellation` | Article 3 hero and series landing page thumbnail | Backlog |
| `crystal-to-cell-thread` | Article 4 hero | Backlog |
| `error-vectors-converge` | Article 5 hero alternative | Backlog |

All new generations must follow the shared style suffix and be reviewed through the `media/projects/brand-exploration/renders/gallery.html` scoring rubric (palette, composition, on-brand, usable-as-hero).
