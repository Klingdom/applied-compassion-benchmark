/**
 * Shared constants for the nonprofit-alt site (site/src/app/nonprofit-alt/*).
 *
 * This module is the single source of truth for the donation model so Wave 1
 * components (DonateCTA, SupportTiers) and Wave 2 page builders never
 * re-declare tier pricing or the independence firewall copy in more than one
 * place. See docs/NONPROFIT_ALT_PAGES_BRIEF_2026-07-12.md for the model this
 * file implements.
 *
 * ZERO-TOUCH: this file must never import the commercial payment-link data
 * module used by the paid site (site/src/data/g-u-m-r-o-a-d.ts).
 */

/**
 * Placeholder support destination — an internal route, NOT a live payment
 * processor link. Replace with a real donation URL (Stripe Checkout,
 * Every.org, a fiscal sponsor's donate page, etc.) once one exists. Never
 * point this at Gumroad — the nonprofit-alt site removes the commercial
 * funnel entirely and replaces it with this donation/support surface.
 */
export const SUPPORT_URL = "/nonprofit-alt/support";

/**
 * REQUIRED wherever a donate CTA appears (brief: "Donation / support model").
 * This is the strongest existing independence assurance on the site,
 * reframed for supporters instead of paying entities. Reuse this string
 * verbatim — do not paraphrase it per-page.
 */
export const INDEPENDENCE_FIREWALL_LINE =
  "The assessment pipeline is a separate technical plane with no access to supporter records, payment data, or any commercial system. Support is gratitude, not influence — entities never pay for inclusion, score changes, or suppression of findings.";

/**
 * Tax-deductibility status is unconfirmed as of this build. Use neutral
 * "support" / "contribute" language everywhere in donation copy, and surface
 * this note near tier pricing rather than asserting deductibility.
 */
export const TAX_STATUS_NOTE =
  'TODO: confirm tax-deductible status before publishing final donation copy. Until confirmed, all donation copy uses neutral "support" / "contribute" language rather than asserting tax deductibility.';

export type SupportCadence = "monthly" | "one-time";

export interface SupportTier {
  id: "supporter" | "sustainer" | "benefactor" | "custom";
  name: string;
  amount: string;
  cadence: SupportCadence;
  cadenceLabel: string;
  /** Impact-framed description — what the gift funds, not a feature unlock. */
  impact: string;
}

/**
 * Monthly + one-time/custom donation tiers, framed by impact rather than by
 * unlocked features (brief: "keeps the daily research free and citable").
 * Reused on the home page and the support page (Wave 2).
 */
export const SUPPORT_TIERS: SupportTier[] = [
  {
    id: "supporter",
    name: "Supporter",
    amount: "$5",
    cadence: "monthly",
    cadenceLabel: "/month",
    impact: "Keeps one day of the Daily Briefing free and citable for every reader.",
  },
  {
    id: "sustainer",
    name: "Sustainer",
    amount: "$10",
    cadence: "monthly",
    cadenceLabel: "/month",
    impact: "Funds a week of evidence review on a Critical-band country or company.",
  },
  {
    id: "benefactor",
    name: "Benefactor",
    amount: "$25",
    cadence: "monthly",
    cadenceLabel: "/month",
    impact: "Sustains a month of ongoing monitoring across an entire index family.",
  },
  {
    id: "custom",
    name: "One-time or custom",
    amount: "Any amount",
    cadence: "one-time",
    cadenceLabel: "one-time",
    impact: "Gives exactly what you choose, once — no recurring commitment.",
  },
];

/** Institutional / grant-facing funder path — surfaced on the support page. */
export const FUNDER_CONTACT_NOTE =
  "Foundations and institutional funders: reach out to discuss grants and mission-aligned partnerships — no entity payments, ever, in exchange for scores.";
