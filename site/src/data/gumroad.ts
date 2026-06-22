export const GUMROAD = {
  countriesIndex: "https://compassionbenchmark.gumroad.com/l/apkzde",
  fortune500Index: "https://compassionbenchmark.gumroad.com/l/qydju",
  aiLabsIndex: "https://compassionbenchmark.gumroad.com/l/eagls",
  roboticsIndex: "https://compassionbenchmark.gumroad.com/l/jxnqb",
  globalCitiesIndex: "https://compassionbenchmark.gumroad.com/l/mxhakr",
  /**
   * Score-Watch Alert subscription. TODO: create Gumroad product and paste
   * the real URL. Until then, `SCORE_WATCH.useGumroad` is false and the
   * entity-scoped CTA routes through `/contact-sales?product=score-watch`
   * for manual fulfillment. Flip `useGumroad` to true once the product
   * exists and the URL is pasted here.
   */
  scoreWatch: "https://compassionbenchmark.gumroad.com/l/TODO-score-watch",
  /**
   * U.S. Cities Index download. TODO: create Gumroad product and paste the
   * real URL. Until then, `US_CITIES_INDEX.useGumroad` is false and the card
   * routes through `/contact-sales?product=us-cities-index`. Flip
   * `useGumroad` to true once the product exists.
   */
  usCitiesIndex: "https://compassionbenchmark.gumroad.com/l/TODO-us-cities",
  /**
   * U.S. States Index download. TODO: create Gumroad product and paste the
   * real URL. Until then, `US_STATES_INDEX.useGumroad` is false and the card
   * routes through `/contact-sales?product=us-states-index`. Flip
   * `useGumroad` to true once the product exists.
   */
  usStatesIndex: "https://compassionbenchmark.gumroad.com/l/TODO-us-states",
  /**
   * Supporter / tip tier monthly subscription. TODO: create Gumroad product
   * and paste the real URL. Until then, `SUPPORTER.useGumroad` is false and
   * the CTA routes through `/contact-sales?product=supporter`. Flip
   * `useGumroad` to true once the product exists.
   */
  supporterMonthly: "https://compassionbenchmark.gumroad.com/l/TODO-supporter",
  /**
   * Pro API access subscription. TODO: create Gumroad product and paste the
   * real URL. Until then, `API_ACCESS.useGumroad` is false and the CTA
   * routes through `/contact-sales?product=api-access`. Flip `useGumroad`
   * to true once the product exists.
   */
  apiAccess: "https://compassionbenchmark.gumroad.com/l/TODO-api",
  /**
   * Universities Index download. TODO: create Gumroad product and paste the
   * real URL. Until then, `UNIVERSITIES_INDEX.useGumroad` is false and the card
   * routes through `/contact-sales?product=universities-index`. Flip
   * `useGumroad` to true once the product exists.
   */
  universitiesIndex: "https://compassionbenchmark.gumroad.com/l/TODO-universities",
} as const;

/**
 * Score-Watch Alert product configuration — kept in one place so the
 * marketing, entity pages, and fulfillment pathway all read from the
 * same source of truth.
 */
export const SCORE_WATCH = {
  /**
   * When false, the Subscribe button routes to /contact-sales with prefilled
   * parameters for manual fulfillment. When true, it routes to the Gumroad
   * product page above with `?entity={slug}&index={indexSlug}` appended.
   *
   * Set to true once the Gumroad product is live.
   */
  useGumroad: false,
  priceLabel: "$79 / year / entity",
  priceShort: "$79/yr",
  annualPriceUsd: 79,
  productName: "Score-Watch Alert",
} as const;

/**
 * U.S. Cities Index product configuration. Flip `useGumroad` to true once
 * the Gumroad product exists and the URL is pasted into `GUMROAD.usCitiesIndex`.
 */
export const US_CITIES_INDEX = {
  useGumroad: false,
  priceLabel: "$195",
  productName: "U.S. Cities Index",
} as const;

/**
 * U.S. States Index product configuration. Flip `useGumroad` to true once
 * the Gumroad product exists and the URL is pasted into `GUMROAD.usStatesIndex`.
 */
export const US_STATES_INDEX = {
  useGumroad: false,
  priceLabel: "$195",
  productName: "U.S. States Index",
} as const;

/**
 * Supporter / tip tier configuration. Flip `useGumroad` to true once the
 * Gumroad product exists and the URL is pasted into `GUMROAD.supporterMonthly`.
 */
export const SUPPORTER = {
  useGumroad: false,
  productName: "Supporter",
} as const;

/**
 * Pro API access configuration. Flip `useGumroad` to true once the Gumroad
 * product exists and the URL is pasted into `GUMROAD.apiAccess`.
 */
export const API_ACCESS = {
  useGumroad: false,
  productName: "Pro API Access",
} as const;

/**
 * Universities Index product configuration. Flip `useGumroad` to true once
 * the Gumroad product exists and the URL is pasted into `GUMROAD.universitiesIndex`.
 */
export const UNIVERSITIES_INDEX = {
  useGumroad: false,
  priceLabel: "$195",
  productName: "Universities Index",
} as const;

/**
 * Institutional booking link — used by all institutional CTAs on /pricing.
 *
 * TODO: replace with the real Calendly URL once booked, e.g.
 *   https://calendly.com/<handle>/data-walkthrough
 *
 * Until then this routes to the contact-sales page so no CTA is ever broken.
 */
export const BOOKING_URL = "/contact-sales?product=institutional";

/**
 * Build the canonical Score-Watch Gumroad checkout URL for a specific entity.
 *
 * Appends `?entity={slug}&index={indexSlug}&name={encodedName}` to the
 * Gumroad product URL. The Worker reads `url_params[entity]` and
 * `url_params[index]` from the Gumroad webhook payload (§3.7 of the
 * Architecture doc).
 *
 * Only call this when `SCORE_WATCH.useGumroad === true`.
 */
export function buildScoreWatchUrl(
  slug: string,
  indexSlug: string,
  name: string,
): string {
  return `${GUMROAD.scoreWatch}?entity=${encodeURIComponent(slug)}&index=${encodeURIComponent(indexSlug)}&name=${encodeURIComponent(name)}`;
}
