/**
 * integrationPremiumExamples.ts — shared worked examples for the integration
 * premium diagram.
 *
 * Single source consumed by IntegrationPremiumDiagram.tsx and
 * scripts/test-method-claims.mjs, so the diagram's numbers and the mechanical
 * drift gate can never disagree.
 *
 * Every (base, premium, composite) triple here is computed from a concrete
 * 8-dimension profile against computeCompositeFromDimensions
 * (scripts/lib/scoring.mjs) — see each `profile` field. The reachable
 * premium set for 8 dimensions bounded [0, 5] is exactly
 * {0, 1.5, 2, 3, 4, 4.5, 6, 8, 10}; `premium` here must always be one of
 * those values (test-method-claims.mjs asserts this).
 */

export interface IntegrationPremiumExample {
  label: string;
  desc: string;
  /** The 8 dimension-score inputs (AWR, EMP, ACT, EQU, BND, ACC, SYS, INT order) that produce base/premium/composite below. */
  profile: [number, number, number, number, number, number, number, number];
  base: number;
  premium: number;
  composite: number;
  premiumColor: string;
  note: string;
}

export const EXAMPLES: IntegrationPremiumExample[] = [
  {
    label: "Balanced high",
    desc: "All 8 dims at 4.0 → σ=0",
    profile: [4, 4, 4, 4, 4, 4, 4, 4],
    base: 75,
    premium: 10,
    composite: 85,
    premiumColor: "#7dd3fc",
    note: "Full premium",
  },
  {
    label: "Typical",
    desc: "5 dims at 4.5, 3 dims at 0.5 → σ≈1.94",
    profile: [4.5, 4.5, 4.5, 4.5, 4.5, 0.5, 0.5, 0.5],
    base: 50,
    premium: 3,
    composite: 53,
    premiumColor: "#86efac",
    note: "Reduced premium",
  },
  {
    label: "Half-and-half",
    desc: "4 dims at 4.0, 4 dims at 0.4 → σ=1.8",
    profile: [4, 4, 4, 4, 0.4, 0.4, 0.4, 0.4],
    base: 30,
    premium: 1.5,
    composite: 31.5,
    premiumColor: "#fb923c",
    note: "Minimal premium",
  },
] as const;
