# Article Visuals Project

10 deck-level visuals per published article, designed to walk a reader through the core concepts. Each visual should be clean enough to drop into a board deck, investor memo, or social thread.

## Scope

- 10 articles × 10 visuals = 100 images.
- Output directory: `public/articles/<slug>/images/`.
- Formats: 1280×720 landscape JPG for most; optional 1:1 square crops for social.
- Style: Lupine brand palette (warm paper `#faf9f6`, indigo `#3d4db3`, ink `#1a1a1a`, wash `#d9d8ff`).
- Mix: data charts (matplotlib), concept diagrams (SVG/Python), and AI-generated scene illustrations (MiniMax) when a chart can't carry the idea.

## Audience

Sophisticated materials, mechanical, and chemical engineers; climate-tech investors; board-level readers who want the story in one image.

## Success criteria

- Every visual is numbered and captioned.
- Every chart cites its source in the caption.
- No hallucinated numbers; use the article's own footnoted data or regenerate from credible public data.
- Each article's 10 visuals cover the full arc: hook, problem, mechanism, evidence, solution, scale, risk, partnership, economics, call to action.
