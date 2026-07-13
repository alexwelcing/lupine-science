// Public programmatic API for deterministic, offline per-article proof packs.
// Importing this module never executes the command-line interface.
export {
  generateProofPack,
  listEligibleArticles,
} from '../scripts/build-proofpack.mjs';
