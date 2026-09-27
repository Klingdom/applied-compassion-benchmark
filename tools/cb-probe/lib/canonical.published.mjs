// lib/canonical.published.mjs
//
// GENERATED FILE — DO NOT EDIT. Regenerate with scripts/vendor-canonical.mjs.
//
// The published variant of lib/canonical.mjs. Identical export surface, reading
// the vendored copies under lib/vendor/ instead of reaching across the package
// boundary into the repository. `prepack` swaps this in so the tarball is
// self-contained; inside the repository lib/canonical.mjs is used instead and
// the real modules are imported directly.

export {
  computeCompositeFromDimensions,
  getBand,
  DIMENSION_CODES,
  BAND_ORDER,
  BAND_RANGES,
  METHODOLOGY_VERSION,
} from "./vendor/scoring.mjs";

export {
  computeItemTrialVariance,
  mean,
  bootstrapCompositeUncertainty,
  createSeededRng,
  THRESHOLDS,
} from "./vendor/evaluation-statistics.mjs";

export { DIMENSIONS_MAP } from "./vendor/task-bank-validator.mjs";
