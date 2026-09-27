// lib/canonical.mjs
//
// THE ONE PLACE THAT KNOWS WHERE THE CANONICAL SCORER LIVES.
//
// cb-probe's central claim is that its composite is computed by the same
// function that scores every country, company and city on compassionbenchmark
// .com — imported unmodified, never reimplemented. Four modules used to reach
// across the package boundary independently with `../../../site/scripts/lib/…`,
// which meant four places to get wrong and four places to update.
//
// Now there is one. Everything else in cb-probe imports from here.
//
// WHY THIS MATTERS FOR PUBLISHING
//   Those relative paths escape the package directory, so `npm pack` produces a
//   tarball whose imports resolve to nothing. Making cb-probe installable means
//   shipping a copy of the canonical modules — and a copy is exactly what this
//   design has spent weeks avoiding, because a copy drifts and a drifted copy
//   silently falsifies the claim above.
//
//   The resolution: this file is swapped for `canonical.published.mjs` at pack
//   time, which reads vendored copies under `lib/vendor/`, and
//   `test:canonical-not-drifted` asserts those copies are byte-identical to the
//   repo sources. Drift becomes a failing test rather than a silent lie. In the
//   repository — where all our own runs happen — the real modules are used
//   directly and there is no copy in the path at all.

export {
  computeCompositeFromDimensions,
  getBand,
  DIMENSION_CODES,
  BAND_ORDER,
  BAND_RANGES,
  METHODOLOGY_VERSION,
} from "../../../site/scripts/lib/scoring.mjs";

export {
  computeItemTrialVariance,
  mean,
  bootstrapCompositeUncertainty,
  createSeededRng,
  THRESHOLDS,
} from "../../../site/scripts/lib/evaluation-statistics.mjs";

export { DIMENSIONS_MAP } from "../../../site/scripts/lib/task-bank-validator.mjs";
