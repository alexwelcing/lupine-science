# Lupine Science data chart

`compositions/data-chart.html` is a seek-safe HyperFrames sub-composition for one categorical series rendered as bars, a line, or points. All modes preserve the same proof-first frame: source and claim first, baseline/axes second, labels third, evidence marks fourth, and a direct conclusion last. The 4px indigo entrance line resolves into the chart baseline, extending the series transition language into the evidence itself.

## Mount it

```html
<div
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-variable-values='{"dataJson":"{\"type\":\"bar\",\"kicker\":\"FINDING 04 · OBSERVED\",\"title\":\"Validation rises with each evidence gate\",\"unit\":\"%\",\"source\":\"LUPINE SCIENCE · TABLE 04\",\"conclusion\":\"The field gate carries the strongest measured signal.\",\"accent\":\"sage\",\"highlightIndex\":4,\"decimals\":0,\"series\":[{\"label\":\"SCREEN\",\"value\":18},{\"label\":\"MODEL\",\"value\":31},{\"label\":\"BENCH\",\"value\":47},{\"label\":\"PILOT\",\"value\":64},{\"label\":\"FIELD\",\"value\":82}]}"}'
  data-start="0"
  data-duration="6"
  data-track-index="1"
  data-width="1920"
  data-height="1080"
></div>
```

The host `data-composition-id` must remain `data-chart`, exactly matching the inner composition and timeline key. The component’s static root duration is six seconds. Keep the host duration at six seconds unless the parent deliberately trims the hold.

For a top-level render, pass the same string through HyperFrames variables:

```bash
npx hyperframes render --variables-file chart-variables.json --strict-variables
```

`chart-variables.json` uses the declaration shape expected by the component:

```json
{
  "dataJson": "{\"type\":\"line\",\"kicker\":\"SERIES 02 · MEASURED\",\"title\":\"Observed error falls across validation rounds\",\"unit\":\"%\",\"source\":\"LUPINE SCIENCE · BENCH SERIES\",\"conclusion\":\"The largest reduction arrives after physical validation.\",\"accent\":\"amber\",\"highlightIndex\":4,\"decimals\":1,\"series\":[{\"label\":\"R1\",\"value\":18.4},{\"label\":\"R2\",\"value\":15.2},{\"label\":\"R3\",\"value\":11.7},{\"label\":\"R4\",\"value\":8.3},{\"label\":\"R5\",\"value\":5.1}]}"
}
```

## Data schema

| Field | Required | Contract |
|---|---:|---|
| `type` | yes | `bar`, `line`, or `points` |
| `kicker` | yes | Evidence label, 1–44 characters |
| `title` | yes | One claim, 1–64 characters |
| `unit` | no | Appended to values, up to 8 characters |
| `source` | yes | Provenance, 1–48 characters |
| `conclusion` | yes | Direct readout, 1–76 characters |
| `accent` | no | `indigo`, `amber`, `sage`, `slate`, or `rose`; defaults to indigo |
| `highlightIndex` | no | Zero-based observation to emphasize; defaults to the last |
| `decimals` | no | `0`, `1`, or `2`; defaults to `0` |
| `series` | yes | 2–8 `{ "label": string, "value": finite number }` observations; labels are limited to 10 characters |

The palette is name-based on purpose: arbitrary colors are rejected so a chart cannot escape the locked Lupine palette. Indigo remains the primary series; one selected observation may use the semantic accent. Bars support signed values and grow away from the computed zero baseline. Line and point modes pad their measured range rather than implying a zero baseline.

## Authoring guidance

- Use bars for categorical magnitude, a line for an ordered trend, and points when the observation-to-observation connection would imply unsupported continuity.
- Supply real sourced values. The built-in data is demonstration content only.
- Write the conclusion as the sentence the motion proves; do not use a detached legend.
- The evidence field ends at y=720 and the conclusion occupies y=738–822, leaving the caption reserve beginning at y=828 untouched.
- Keep the same mode and visual space across related stats. Change chart type only when the evidence relationship changes.

## Verify

From `components/data-chart/`:

```bash
npm run check
npm run snapshot
```

The check refreshes real copies of the canonical component and assets into the bar, line, and point fixtures, then runs HyperFrames lint, validate, and strict inspect on every mode.
