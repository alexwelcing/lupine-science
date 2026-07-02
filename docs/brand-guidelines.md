# Lupine Science — Brand Guidelines (pitch-ready)

> The source of truth for look, voice, and story when talking to investors, labs, and the public. Derived from `company-profile.md` and `art-direction.md`.

---

## 1. The idea in one breath

**Lupine Science is the trust layer for the age of AI-designed matter.**

AI is crossing from bits to atoms. Every prediction of matter still rests on interatomic potentials that are wrong in structured ways. Lupine measures that wrongness, proves it, corrects it, and makes the evidence inspectable.

---

## 2. Voice

| Attribute | Do | Don't |
|---|---|---|
| **Proof-first** | Lead with measured numbers and machine-checked claims. | "Revolutionary," "game-changing," hype adjectives. |
| **Confident, not arrogant** | State what is proven plainly; name what is still open. | Overclaim or hide uncertainty. |
| **Frontier-technical but legible** | Make a hard idea understandable to a smart non-expert. | Jargon-wall the reader. |
| **Category-defining** | Speak as the one creating "error geometry for interatomic potentials." | Sound like a generic simulation SaaS. |

**Preferred phrases:** error geometry · field evidence · science spine · claim lifecycle · inspectable evidence · lab-facing research corpus · MLIP Failure Geometry Audit · agentic research control plane.

**Retired phrases:** atom-logo framing · legacy Atlas labels · "materials organization" generics · unsupported claims that the science is settled.

---

## 3. Visual system

### Palette

| Token | Hex | Usage |
|---|---|---|
| **Paper** | `#faf9f6` | Dominant background. Warm, editorial, scientific monograph. |
| **Ink** | `#16171d` | Primary text. Near-black. |
| **Ink soft** | `#4c4e58` | Secondary text. |
| **Indigo** | `#3d4db3` | The only light source. Accent, links, data highlights. |
| **Indigo deep** | `#2e3a87` | Hover / emphasis. |
| **Ochre** | `#8a5e1f` | Rare third accent (caution, distinction). |
| **Verified** | `#3a8f5b` | Status badges only. |

**Rule:** every generated image is paper + indigo + ink. If it drifts, palette-lock it to a warm-white→indigo duotone.

### Typography

- **Headlines & body:** `Newsreader` (serif). Headlines are assertions; use italic emphasis for the emotional beat.
- **UI / labels / data:** `IBM Plex Mono` (monospace). Used for equations, status, and smallcaps labels.
- **Fallbacks:** Georgia / Times New Roman for serif; SF Mono / Cascadia Mono for mono.

### Mark

- Use the existing SVG mark (`public/lupine-science-mark.svg`) as the recurring corner element.
- The mark is an atom-orbit + petal system. Do not add flowers, literal lupine blooms, or photographic nature imagery.

---

## 4. The ownable hero motif: "the shape of wrongness"

The central, repeatable image is the **hyper-ribbon manifold**: scattered faint error vectors resolving onto a single luminous indigo ribbon on warm paper. It is the thesis made visible.

**Where it repeats:**
- Cover / OG image
- Site hero background
- Proof slide
- Moat / vision slides

**Secondary motifs:**
- **Bits → atoms:** pixels/glyphs dissolving into a crystalline lattice.
- **Error vectors aligning:** many near-parallel arrows collapsing to one direction.
- **Compounding geometry:** a crystal/flywheel growing outward.

**No-go visuals:** flowers, people, text baked into images, dark neon backgrounds, glowing-circuit AI tropes, stock 3D renders.

---

## 5. Narrative spine for pitches

1. **Inflection:** AI is leaving the screen and entering matter.
2. **Catch:** It is designing matter on predictions that are wrong.
3. **Insight:** The wrongness has a shape — a low-dimensional error geometry.
4. **Proof:** We mapped it, tested it across classical and foundation MLIPs, and machine-checked the map in Lean 4.
5. **Product:** A correction layer (floor) and a materials-IP discovery engine (ceiling).
6. **Moat:** Proof-grade rigor + self-refutation discipline + compounding manifold coverage.
7. **Vision:** The validation substrate for a real-world Replicator.

---

## 6. Fact lock (use exactly these numbers)

- **679 commits · 46 public research articles**
- **15 elements · ~900 classical potentials · 3 foundation MLIPs**
- **Participation ratio 1.05–2.05** on the joint error manifold
- **14/15 elements** preserve geometry classical → MLIP
- **Cross-MLIP cosine > 0.8** (same direction, different magnitude)
- **3 hypotheses self-refuted** and published
- **Lean 4 proof** of the projection law (0 sorry)

---

## 7. Surfaces and roles

| Surface | Role | URL |
|---|---|---|
| **Lupine Science** | Research program and public start page | https://lupine.science |
| **LUPI** | Browser-native WebGPU viewer for atomistic evidence | https://lupi.live |
| **Lupine Library** | Mobile-first human knowledge surface | https://library.lupine.science |
| **glim-think** | Agentic research control plane and ledger | https://glim-think-v1.aw-ab5.workers.dev |

---

## 8. Do / don't for generated media

- **Do** start every prompt with the shared style suffix: *editorial scientific minimalism, warm off-white `#faf9f6` paper background, single indigo `#3d4db3` light/accent, near-duotone, generous negative space, calm and premium, no text, no people, no flowers, no neon.*
- **Do** generate many variants and keep almost nothing — curation is the competence signal.
- **Don't** let images become the story. One idea + one image per slide.
- **Don't** put text in images. Newsreader handles all type.

---

## 9. Creative exploration workflow

For brand-vibe iteration we run a make → evaluate → mutate loop:

1. **Generate** a controlled matrix of stills across motifs and variants with `media/projects/brand-exploration/scripts/generate_matrix.py`.
2. **Review** in `media/projects/brand-exploration/renders/gallery.html` with palette / composition / on-brand / hero-usable scoring and a shortlist.
3. **Explore** live combinations in `media/projects/brand-exploration/renders/playground.html`: procedural hyper-ribbon overlaid with any still, tunable density, curve, opacity, and speed.
4. **Mutate** the shortlist into next-generation prompts with `scripts/mutate_prompts.py`.
5. **Regenerate** and repeat.

This keeps the human/agent feedback loop explicit and reusable for every visual campaign.

## 10. Content design system

For templates and components for articles, white papers, research guides, tutorials, proof packs, and reports, see:

- **Content design system:** `lupine-science/docs/content-design-system.md`
- **Article CSS:** `lupine-science/public/articles/styles.css`
- **Component reference:** `lupine-science/public/articles/components.html`
- **Markdown templates:** `lupine-science/articles/_templates/`

## 11. Production files

- **Brand narrative:** `lupine/docs/brand/narrative.md`
- **Market strategy:** `lupine/docs/brand/market-strategy.json`
- **Company profile:** `lupine/fundraise/company-profile.md`
- **Deck content:** `lupine/fundraise/lupine-science-deck.md`
- **Art direction:** `lupine/fundraise/art-direction.md`
- **Generated brand stills:** `lupine/fundraise/brand-assets/fal/`
- **This guideline:** `lupine-science/docs/brand-guidelines.md`
