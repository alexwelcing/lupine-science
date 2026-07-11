# [Claim-led title]

<!--
Create a sibling `<article-slug>.proofpack.json` manifest conforming to
`schemas/proof-pack.schema.json`, then run:

  npm run proofpack:validate -- path/to/<article-slug>.proofpack.json

Bibliography entries must follow docs/scientific-source-policy.md. Internal
Lupine artifacts belong under Methodology/Audit links, not in the bibliography
as evidence.
-->

> **Type:** proof-pack
> **Version:** 1.0
> **Document ID:** LS-PP-YYYY-NNN
> **Published:** YYYY-MM-DD
> **Evidence cutoff:** YYYY-MM-DD
> **Author:** [Name]
> **Institution:** Lupine Science
> **Editorial reviewer:** [Name / role — required before release]
> **Canonical article:** https://lupine.science/articles/[slug]/
> **Evidence status:** Draft / Reviewed / Verified / Refuted / Open

<p class="lead">One paragraph stating the question, the decision-relevant result, and why it matters. Preserve uncertainty.</p>

## Executive summary

<div class="callout claim">
  <strong>Claim.</strong> State the exact, falsifiable claim and its scope.
</div>

- **Evidence:** What was measured or sourced.
- **Method:** How the result was produced.
- **Finding:** The decision-relevant number or relationship.
- **Boundary:** What the evidence does not establish.
- **Verdict:** Supported / refuted / open, with confidence wording.

## Key figures

<figure>
  <img src="[repository-local-path]" alt="[Chart type, compared variables, and primary takeaway.]">
  <figcaption><strong>Figure 1.</strong> [Interpretive caption.] <span class="figure-source">Source: [citation or artifact].</span></figcaption>
</figure>

<!-- Repeat only for decision-relevant figures. Preserve complete axes, legends,
     units, labels, and annotations; never crop a chart to improve composition. -->

## Data table

| Measure (unit) | Value | Source / uncertainty |
|---|---:|---|
| [Metric] | [Value] | [Citation and qualification] |

## Methodology note

- **Unit of analysis:** [Material, model, experiment, literature record, etc.]
- **Inputs:** [Datasets and date/version identifiers]
- **Transformations:** [Calculations, normalization, exclusions]
- **Validation:** [Checks or comparison baseline]
- **Known limitations:** [Failure modes and unresolved uncertainty]
- **Reproduction:** [Repository-local code/notebook/ledger path]

## Author and institution credits

- **Author:** [Name, role]
- **Institution:** Lupine Science
- **Editorial review:** [Name, role]
- **Data and figure provenance:** [Names / organizations]
- **Contact:** [Public contact route]

## Bibliography

Use independent scientific sources only. Peer-reviewed sources require a DOI;
agency and institution sources require an approved official domain. Give each
source a stable ID in the JSON manifest. Policy exceptions remain visible
warnings and require publication review.

1. [Author/organization]. *Title.* Publisher/journal, year. DOI or durable URL.
2. [Continue in order of first citation.]

## Audit links

- [Dataset](https://…)
- [Analysis / code](https://…)
- [Archived figure manifest](https://…)
- [Ledger or review record](https://…)

---

### Required Unicode and embedded-font QA

This exact string must render and round-trip through `pdftotext`:

`CO₂ · CH₄ · GtCO₂/year · en dash – · em dash — · “curly quotes” · α β γ Δ μ σ ∑ ∂ ≈ ≤ ≥ ± × · José García · Zoë Šimůnková · François L’Écuyer`

The PDF must embed repository-local, Unicode-capable Newsreader and IBM Plex Mono
subsets with ToUnicode maps. Runtime network fonts and system-font fallback are not
permitted. See `docs/proof-pack-design.md` and `public/proof-pack.css`.