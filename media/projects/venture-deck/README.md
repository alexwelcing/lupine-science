# Venture deck render tooling

The deck PDF is rendered by Playwright at a fixed 16:9 page size and normalized with fixed PDF metadata. The renderer and validator permit only loopback HTTP requests; any attempted external runtime request fails the command. Both commands also require 12–14 `.slide` elements, reject basic element/slide overflow, and require the PDF page count to match the slide count.

From the repository root, the canonical final build and validation commands are:

```sh
npm run venture:build
npm run venture:validate
```

`node scripts/build-venture-deck.mjs` is the direct canonical entry point. The historical default `node media/projects/venture-deck/build-deck.mjs` is deprecated and now delegates to that same canonical builder, producing the same project/public PDF pair and build manifest. It no longer has an independent final-build path.

The fixed output is:

```text
media/projects/venture-deck/lupine-science-venture-deck.pdf
```

Local absolute asset URLs are served only from `public/`; the scripts do not require or permit internet access. The project-local wrapper remains available only as a fixture renderer for an explicit HTML/PDF pair. `--html` and `--pdf` are both required in fixture mode; partial fixture arguments are rejected before any canonical artifact can be touched:

```sh
node media/projects/venture-deck/build-deck.mjs --html path/to/deck.html --pdf path/to/deck.pdf --web-root path/to/local-assets
node media/projects/venture-deck/validate-deck.mjs --html path/to/deck.html --pdf path/to/deck.pdf --web-root path/to/local-assets
```

Run the offline fixture self-tests (these do not render the final deck) with:

```sh
node --test tests/render/venture-deck-tooling.test.mjs
```

The self-tests cover a valid 12-slide build, slide-count rejection, overflow rejection, external-request rejection, PDF/slide page-count mismatch rejection, precise still-closure scoping, and canonical PDF/build-manifest parity across every supported final build entry point.
