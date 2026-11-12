// film-listing.mjs — which article films are listed on /videos/, embedded in
// their article and offered to crawlers. Kept apart from build-articles.mjs so
// tests can read the list without running the build.
//
import fs from 'node:fs';
import path from 'node:path';
import { documentStatus } from './discovery.mjs';

// Films that stay off /videos/, the sitemap and every article page while their
// files remain in public/videos/ (for example, while a re-cut is prepared).
// Films of Archived articles are unlisted automatically.
//
// The four 2026-07-27 campaign brand films were unlisted on 2026-11-12. Their
// soundtrack is music only (no narration) and their .vtt files hold animator
// direction notes, not captions. Captions transcribing their on-screen text
// were not written because that text states things our record does not
// support; a re-cut needs new on-screen text and a WebVTT track with a
// [Music] cue and the on-screen text.
export const UNLISTED_FILMS = new Map([
  ['an-order-of-effort', 'on-screen text presents Tier-1 runtime correction as live work ("Work where the license is live"), although Round 4 failed it, and says machine-checked limits prevent unsupported correction'],
  ['the-materials-we-test-against', 'on-screen text lists "partner synthesis" in the evidence chain'],
  ['the-savings-stack', 'on-screen text labels the projected 72.4% saving "measured value"'],
  ['the-trust-layer', 'on-screen text says "No uncontracted partners are named" and "Primary investment article is Draft", and offers correction "where licensed"'],
]);

// Films removed from public/videos/ on 2026-11-12 (git history keeps them).
// Their narration (public/videos/<slug>.vtt) — or, for the un-narrated
// z1-union-debrief cut, its on-screen text — named organisations as partners,
// pitched a budget, or stated a correction or verification capability our own
// results do not support (Round 4, July 2026; Lean checks arithmetic, not
// physics or reference data). The build refuses to publish a film under any of
// these slugs: a re-cut needs new, qualified narration and removal from this list.
export const RETIRED_FILMS = new Map([
  ['investing-in-the-trust-layer', 'pitched a 36-month budget and presented runtime correction as working'],
  ['from-predicted-crystal-to-commercial-cell', 'named a partner chain (an automaker’s cell line, "different partners") and presented runtime correction as working'],
  ['five-materials-for-5-to-12-gtco2-year', 'stated 5–12 GtCO₂/year and barrier correction as outcomes'],
  ['beyond-carbon-the-error-geometry-of-environmental-materials', 'claimed one correction layer improves discovery across seven areas'],
  ['water-and-air-correcting-the-molecules-we-drink-and-breathe', 'claimed corrected binding and barrier energies overturn rankings'],
  ['methane-and-refrigerants-cutting-the-non-co2-climate-forcers', 'presented corrected barriers as a working capability'],
  ['critical-minerals-pfas-and-the-remediation-imperative', 'claimed corrected barriers and binding energies rank candidates'],
  ['cement-concrete-and-the-weight-of-the-built-world', 'presented Lean theorems as separating supported predictions'],
  ['the-02-percent-synthesis-problem', 'presented runtime correction as producing better-ranked candidates'],
  ['from-fantasy-frameworks-to-makeable-materials', 'promised machine-checkable makeability certificates and a lab-tethered loop'],
  ['why-lupine-science', 'said current potentials can replace quantum screening and promised makeability certificates'],
  ['lupi-hfc-refrigerant-research-payloads', 'claimed the correction recovers trustworthy barriers and lifetimes'],
  ['why-lupi', 'described makeability certificates that do not exist'],
  ['the-order-is-right-the-size-is-wrong', 'said every claim is sealed as a Lean theorem and promised several-fold error reduction'],
  ['a-smooth-environment-resolved-error-field', 'said the Lean proof kernel locks the data and presented run-time correction as a general method'],
  ['a-field-not-a-neural-net', 'said Lean proofs check every quantitative claim and certify boundaries'],
  ['rhizo-non-co2-climate-forcers-lean', 'presented a verification layer that separates supported claims and certificate gates'],
  ['z1-union-debrief', 'showed the pilot as a same-engine "strong win" with "70% fewer DFT evaluations" and "Proof keeps the score"; its preregistered accuracy gate failed'],
]);

export function filmListed(slug, status) {
  return status !== 'Archived' && !UNLISTED_FILMS.has(slug) && !RETIRED_FILMS.has(slug);
}

// Slugs of the films listed right now: a film in <videosDir> whose article in
// <articlesDir> is listable under filmListed(). While this is empty the site
// has no film to show, so builders drop the "Videos" nav item, the /videos/
// sitemap entry and the llms.txt "Films" line, and mark /videos/ noindex.
export function listedFilmSlugs({ articlesDir, videosDir }) {
  if (!fs.existsSync(videosDir)) return [];
  return fs.readdirSync(videosDir)
    .filter((name) => name.endsWith('.mp4'))
    .map((name) => name.replace(/\.mp4$/, ''))
    .filter((slug) => {
      const source = path.join(articlesDir, `${slug}.md`);
      if (!fs.existsSync(source)) return false;
      const status = fs.readFileSync(source, 'utf8').match(/^> \*\*Status:\*\*\s*(.+?)\s*$/m)?.[1];
      return filmListed(slug, documentStatus(status));
    })
    .sort();
}
