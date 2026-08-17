# Midwest 2076 — 100-image brand library

Status: production authorized; feature branch only until owner merge/deploy approval
Repository: `lupine-science`
Public surface: `/brand-assets/`

## Deliverable

A 100-image source-free speculative-worldbuilding library organized as ten asset classes with ten controlled variations each. The system depicts future Midwestern material culture rather than specific molecules.

## Asset classes

1. Inland Climate Works
2. Prairie Machine Commons
3. Lake Effect Foundry
4. Civic Futures
5. Regional Logistics
6. Thermal Energy Commons
7. Material Workshops
8. Atmospheric Habitats
9. Scientific Instruments
10. Material Studies

## Prompt method

Every prompt explicitly controls:

- civic or material function;
- inland geography and seasonal weather;
- material palette and joints;
- maintenance, wear, residue, and access;
- camera/composition;
- anti-tropes and prohibited pseudo-technical authority;
- classification as speculative artwork rather than evidence.

Variation comes from subject and function first, then atmosphere, composition, palette, and aspect ratio. This avoids treating palette changes as distinct concepts.

## Production contract

- Endpoint: `fal-ai/recraft/v4.1/pro/text-to-image`
- Requests: 100
- Reviewed conservative allowance: $0.21 per image
- Conservative generation allowance: $21.00
- If the provider rejects, changes pricing semantics, or omits required output, fail closed for that cell and preserve its missing state.
- Exact billing must remain `null` unless returned by the provider.
- Keep provider originals out of the public page payload.
- Publish optimized 1600px WebP masters plus lightweight thumbnails.
- Store request ID, exact prompt, prompt digest, output digest, dimensions, and QA state.

## Classification

> Speculative worldbuilding artwork informed by materials culture. Not a forecast, architectural proposal, engineering design, scientific reference, simulation result, or evidence of a real deployment.

## Publication gate

Build, lint, typecheck, test, verify, browser QA, PR, CI, and reviewer-agent review are required. Do not merge or deploy without owner approval after review.
