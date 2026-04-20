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
   * product page above with `?entity={slug}` appended.
   *
   * Set to true once the Gumroad product is live.
   */
  useGumroad: false,
  priceLabel: "$79 / year / entity",
  priceShort: "$79/yr",
  annualPriceUsd: 79,
  productName: "Score-Watch Alert",
} as const;
