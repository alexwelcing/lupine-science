// film-listing.mjs — which article films are listed on /videos/, embedded in
// their article and offered to crawlers. Kept apart from build-articles.mjs so
// tests can read the list without running the build.
//
// Films that stay off /videos/, the sitemap and every article page. Their
// narration (public/videos/<slug>.vtt) names organisations as partners, states
// a correction capability our own results contradict (Round 4, July 2026), pitches
// funding, or quotes a result without the qualifiers its evidence page carries.
// The files stay in public/videos/ (unlinked) so a re-cut can replace them;
// films of Archived articles are unlisted automatically.
export const UNLISTED_FILMS = new Map([
  ['investing-in-the-trust-layer', 'pitches a budget and frames the work as an investment'],
  ['from-predicted-crystal-to-commercial-cell', 'presents a partner chain and runtime barrier correction as working'],
  ['five-materials-for-5-to-12-gtco2-year', 'states 5–12 GtCO₂/year and barrier correction as outcomes'],
  ['beyond-carbon-the-error-geometry-of-environmental-materials', 'claims one correction layer improves discovery across seven areas'],
  ['water-and-air-correcting-the-molecules-we-drink-and-breathe', 'claims corrected binding and barrier energies overturn rankings'],
  ['methane-and-refrigerants-cutting-the-non-co2-climate-forcers', 'presents corrected barriers as a working capability'],
  ['critical-minerals-pfas-and-the-remediation-imperative', 'claims corrected barriers and binding energies rank candidates'],
  ['cement-concrete-and-the-weight-of-the-built-world', 'presents Lean theorems as separating supported predictions'],
  ['the-02-percent-synthesis-problem', 'presents runtime correction as producing a trustworthy ranked list'],
  ['from-fantasy-frameworks-to-makeable-materials', 'promises proof-checked makeability for frameworks'],
  ['why-lupine-science', 'says current potentials can replace quantum screening and promises makeability'],
  ['lupi-hfc-refrigerant-research-payloads', 'claims the correction recovers trustworthy barriers and lifetimes'],
  ['why-lupi', 'describes makeability certificates that do not exist'],
  ['the-order-is-right-the-size-is-wrong', 'treats Lean checks as sealing every claim and promises several-fold error reduction'],
  ['a-smooth-environment-resolved-error-field', 'quotes r = 0.906 without its permutation null and per-model scope'],
]);

export function filmListed(slug, status) {
  return status !== 'Archived' && !UNLISTED_FILMS.has(slug);
}

