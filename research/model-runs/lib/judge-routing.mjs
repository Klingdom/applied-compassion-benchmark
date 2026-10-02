// research/model-runs/lib/judge-routing.mjs
//
// Routing for a run whose JUDGE set is explicit and disjoint from its SUBJECT set (pilot-2026-10-02, section 4).
// The first pilot's routeResponses (judge-batches.mjs) is untouched; this is the generalisation for the case
// "judges are not the subjects".
//
// Rules, each enforced here AND re-checked by checkRouting (which the builder and the tests both call):
//   - every response gets exactly `perResponse` distinct judges;
//   - a judge is eligible for a subject's reply only if it is not that subject and not of that subject's FAMILY;
//   - an unknown family fails closed.
// Balance. The unit of assignment is a PAIR of eligible judges. For one reply the pair is chosen by, in order:
//   1. fewest uses within the same (subject, item) cell   -> each item gets every pair about equally per subject
//   2. fewest uses within the subject                      -> per-subject pair counts stay within 1 of each other
//   3. fewest uses within the item (across subjects)       -> an item's pair use is balanced across subjects
//   4. fewest uses overall, then a seeded coin.
// With 3 judges a judge's load is N minus the use of the one pair that excludes it, so (2) puts every judge's load
// for every subject within 1 of equal.

import { refuse, shuffle } from "./common.mjs";

export function judgePairs(judges, perResponse = 2) {
  if (perResponse !== 2) refuse("pair routing is built for exactly 2 judges per response");
  const sorted = [...judges].sort();
  const out = [];
  for (let i = 0; i < sorted.length; i += 1) for (let j = i + 1; j < sorted.length; j += 1) out.push([sorted[i], sorted[j]]);
  return out;
}

export function eligibleJudges({ subject, judges, familyOf }) {
  if (!(subject in familyOf)) refuse(`no family recorded for subject "${subject}"; failing closed`);
  return judges.filter((j) => {
    if (!(j in familyOf)) refuse(`no family recorded for judge "${j}"; failing closed`);
    return j !== subject && familyOf[j] !== familyOf[subject];
  });
}

/**
 * @param {{subject: string, item_id: string}[]} responses
 * @param {{judges: string[], familyOf: Record<string,string>, perResponse?: number}} cfg
 * @param {() => number} rng
 * @returns {string[][]} sorted judge pair per response, same order as `responses`
 */
export function routeToJudgeSet(responses, { judges, familyOf, perResponse = 2 }, rng) {
  const routes = new Array(responses.length);
  const cells = new Map(); // "subject|item" -> indices
  const subjects = [];
  responses.forEach((r, i) => {
    if (!subjects.includes(r.subject)) subjects.push(r.subject);
    const k = `${r.subject}|${r.item_id}`;
    if (!cells.has(k)) cells.set(k, []);
    cells.get(k).push(i);
  });

  const useCell = new Map();
  const useSubject = new Map();
  const useItem = new Map();
  const useAll = new Map();
  const get = (m, k) => m.get(k) ?? 0;
  const bump = (m, k) => m.set(k, get(m, k) + 1);

  for (const subject of subjects) {
    const eligible = eligibleJudges({ subject, judges, familyOf });
    if (eligible.length < perResponse) refuse(`subject ${subject} has ${eligible.length} eligible judge(s), need ${perResponse}`);
    const pairs = judgePairs(eligible, perResponse);
    const cellKeys = shuffle([...cells.keys()].filter((k) => k.startsWith(`${subject}|`)), rng);
    for (const ck of cellKeys) {
      for (const index of shuffle(cells.get(ck), rng)) {
        const item = responses[index].item_id;
        const score = (p) => {
          const id = p.join("+");
          return [get(useCell, `${ck}|${id}`), get(useSubject, `${subject}|${id}`), get(useItem, `${item}|${id}`), get(useAll, id)];
        };
        const cmp = (a, b) => {
          for (let t = 0; t < a.length; t += 1) if (a[t] !== b[t]) return a[t] - b[t];
          return 0;
        };
        const scored = pairs.map((p) => ({ p, s: score(p) }));
        const best = scored.reduce((m, x) => (cmp(x.s, m) < 0 ? x.s : m), scored[0].s);
        const tied = scored.filter((x) => cmp(x.s, best) === 0).map((x) => x.p);
        const pick = shuffle(tied, rng)[0];
        const id = pick.join("+");
        bump(useCell, `${ck}|${id}`);
        bump(useSubject, `${subject}|${id}`);
        bump(useItem, `${item}|${id}`);
        bump(useAll, id);
        routes[index] = pick.slice();
      }
    }
  }
  const problems = checkRouting({ responses, routes, judges, familyOf, perResponse });
  if (problems.length > 0) refuse(`internal routing check failed:\n  ${problems.slice(0, 8).join("\n  ")}`);
  return routes;
}

/**
 * Independent re-check of a routing. Returns a list of problems (empty = fine). Used by the builder on its own
 * output and by tests, including on deliberately broken routings (negative controls).
 */
export function checkRouting({ responses, routes, judges, familyOf, perResponse = 2 }) {
  const problems = [];
  if (!Array.isArray(routes) || routes.length !== responses.length) return [`routes has ${routes?.length} entries for ${responses.length} responses`];
  const judgeSet = new Set(judges);
  routes.forEach((r, i) => {
    const subject = responses[i].subject;
    if (!Array.isArray(r) || r.length !== perResponse) problems.push(`response ${i}: ${JSON.stringify(r)} is not ${perResponse} judges`);
    else if (new Set(r).size !== perResponse) problems.push(`response ${i}: duplicate judge in ${JSON.stringify(r)}`);
    for (const j of r ?? []) {
      if (!judgeSet.has(j)) problems.push(`response ${i}: ${j} is not in the judge set`);
      if (j === subject) problems.push(`response ${i}: routed to its own subject ${subject}`);
      if (familyOf[j] === undefined || familyOf[subject] === undefined) problems.push(`response ${i}: family unknown for ${j} or ${subject}`);
      else if (familyOf[j] === familyOf[subject]) problems.push(`response ${i}: ${j} is of the same family (${familyOf[j]}) as subject ${subject}`);
    }
  });
  return problems;
}

/** Balance figures for a routing, for the dry run, the key and the tests. */
export function routingStats({ responses, routes }) {
  const perSubjectJudge = {};
  const perSubjectPair = {};
  const perItemPair = {};
  const pairs = {};
  routes.forEach((r, i) => {
    const { subject, item_id: item } = responses[i];
    const pair = r.slice().sort().join("+");
    perSubjectPair[subject] ??= {};
    perSubjectPair[subject][pair] = (perSubjectPair[subject][pair] ?? 0) + 1;
    perItemPair[item] ??= {};
    perItemPair[item][pair] = (perItemPair[item][pair] ?? 0) + 1;
    pairs[pair] = (pairs[pair] ?? 0) + 1;
    perSubjectJudge[subject] ??= {};
    for (const j of r) perSubjectJudge[subject][j] = (perSubjectJudge[subject][j] ?? 0) + 1;
  });
  return { perSubjectJudge, perSubjectPair, perItemPair, pairs };
}
