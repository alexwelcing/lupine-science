# Brand exploration — treatment

## Creative premise

Generate a controlled matrix of images around the three ownable motifs from the art direction:

1. **Shape of wrongness** — scattered error vectors resolving onto a luminous indigo ribbon.
2. **Bits → atoms** — pixels/glyphs dissolving into a crystalline lattice.
3. **Upstream cascade** — a single point of indigo light rippling through a sparse lattice.

Each motif gets 4 variants with controlled prompt mutations:
- `wide` (16:9, full-bleed atmosphere)
- `square` (1:1, focused composition)
- `dense` (more vectors/detail)
- `quiet` (more negative space)

## Style lock

Shared suffix for every prompt:

> Editorial scientific minimalism, warm off-white `#faf9f6` paper background, single indigo `#3d4db3` light/accent, near-duotone, generous negative space, calm and premium, no text, no people, no flowers, no neon, no glowing circuits, like a figure in a beautiful physics monograph, high detail toward the edges.

## Review mechanism

An HTML gallery (`renders/gallery.html`) displays every image with:
- Prompt snippet
- Variant label
- Score sliders for: palette, composition, on-brand, usable-as-hero
- A notes field
- A "regenerate" shortlist

The next loop will double down on the highest-rated variant/motif combinations.
