// research/model-runs/lib/paired-bootstrap.mjs
//
// The item-resampling bootstrap used by bin/analyze-pilot.mjs, moved here VERBATIM (same generator, same draw order,
// same arithmetic) so that arm comparisons can be tested on a synthetic run. bin/analyze-pilot.mjs output for the
// first pilot and pilot-2026-10-02 is byte-identical before and after the move (tests/analyze-pilot.test.mjs).
//
// No scoring arithmetic lives here: the composite is a function passed in by the caller (the canonical
// computeCompositeFromDimensions, imported by analyze-pilot.mjs). This file resamples and subtracts.

/**
 * Items are resampled WITHIN dimension, and the same draw is used for every subject (paired).
 * @param {object} p
 * @param {string[]} p.subjects
 * @param {string[]} p.items
 * @param {Record<string,string>} p.dimOf        item -> dimension code
 * @param {Record<string,number>} p.im           `${subject}|${item}` -> item mean rating
 * @param {string[]} p.dims
 * @param {number} p.seed
 * @param {number} p.B                           replicates
 * @param {(dimensionMeans: Record<string,number>) => number} p.comp   canonical composite
 */
export function pairedBootstrap({ subjects, items, dimOf, im, dims, seed: seed0, B, comp }) {
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  let seed = seed0;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const byDim = Object.fromEntries(dims.map((d) => [d, items.filter((i) => dimOf[i] === d)]));
  const boots = Object.fromEntries(subjects.map((s) => [s, []]));
  const dimBoots = Object.fromEntries(subjects.map((s) => [s, Object.fromEntries(dims.map((d) => [d, []]))]));
  for (let b = 0; b < B; b++) {
    const pick = Object.fromEntries(dims.map((d) => [d, byDim[d].map(() => byDim[d][Math.floor(rnd() * byDim[d].length)])]));
    for (const s of subjects) {
      const dm = Object.fromEntries(dims.map((d) => [d, mean(pick[d].map((i) => im[`${s}|${i}`]))]));
      for (const k of dims) dimBoots[s][k].push(dm[k]);
      boots[s].push(comp(dm));
    }
  }
  return { byDim, boots, dimBoots };
}

/**
 * Pre-registered comparisons (run-config `comparisons`), listed in config order and oriented a minus b, from the SAME
 * paired replicates as every other difference in the analysis.
 * @param {{a:string,b:string,kind:string}[]} comparisons
 * @param {Record<string, number[]>} boots
 * @param {Record<string, number>} composites     point composites, already rounded as published
 * @param {(xs:number[]) => [number, number]} ci
 * @param {(x:number) => number} r1
 */
export function pairedComparisons({ comparisons, boots, composites, ci, r1 }) {
  return comparisons.map((cmp) => {
    if (!boots[cmp.a] || !boots[cmp.b]) throw new Error(`comparison ${cmp.a} vs ${cmp.b}: not subjects of this run`);
    const [lo, hi] = ci(boots[cmp.a].map((v, k) => v - boots[cmp.b][k]));
    return {
      a: cmp.a,
      b: cmp.b,
      kind: cmp.kind,
      difference: r1(composites[cmp.a] - composites[cmp.b]),
      interval95: [lo, hi],
      separated: lo > 0 || hi < 0,
    };
  });
}
