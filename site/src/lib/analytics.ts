/**
 * Lightweight client-side analytics helper for Umami.
 *
 * Umami is loaded by the root layout from /u/script.js and exposes
 * `window.umami.track(name, data)` once loaded.
 *
 * `trackEvent` is SSR-safe (no-op on the server) and fault-tolerant
 * (swallows errors if umami is unavailable or blocked by an ad blocker).
 *
 * All event names should be snake_case and stable — they become permanent
 * identifiers in the Umami dashboard.
 */

import { GUMROAD } from "@/data/gumroad";

// Module augmentation so `window.umami` is typed where it's used.
declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => void;
    };
  }
}

export function trackEvent(
  name: string,
  data?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.umami?.track(name, data);
  } catch {
    // Swallow: analytics must never break user flows.
  }
}

/**
 * Named event helpers — these are the canonical event names for the PRD §1.9
 * tracking requirements. Calling these helpers instead of `trackEvent`
 * directly keeps event names in one place and prevents typo drift.
 *
 * score_watch_click    — already fired via Button trackAs= on entity pages
 * score_watch_signup   — synonym; kept for dashboard backward compat
 * purchase_confirmed   — fired on /thank-you page mount
 * badge_embed_copy     — fired when entity-page embed snippet is copied
 * supporter_click      — fired on supporter CTA click
 * api_access_click     — fired on API access CTA click
 */
export const EVENTS = {
  SCORE_WATCH_CLICK: "score_watch_click",
  SCORE_WATCH_SIGNUP: "score_watch_signup",
  PURCHASE_CONFIRMED: "purchase_confirmed",
  BADGE_EMBED_COPY: "badge_embed_copy",
  SUPPORTER_CLICK: "supporter_click",
  API_ACCESS_CLICK: "api_access_click",
  // Wave C instrumentation
  BRIEFING_READ_DEPTH: "briefing_read_depth",
  BRIEFING_CITATION_COPIED: "briefing_citation_copied",
  BRIEFING_SECTION_NAV: "briefing_section_nav",
  // Wave G0: OWID attribution flywheel — fires when a chart citation is copied
  EMBED_CITED: "embed_cited",
  // Wave G1.1: entity-page peer/neighbour discovery block clicks
  PEER_CLICK: "peer_click",
  READ_NEXT: "read_next",
} as const;

/**
 * Reverse-lookup a Gumroad URL to its product key (e.g. "fortune500Index").
 * Returns null for any non-Gumroad URL.
 */
const GUMROAD_PRODUCT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(GUMROAD).map(([key, url]) => [url, key]),
);

export function gumroadProductFromUrl(
  url: string | undefined,
): string | null {
  if (!url) return null;
  return GUMROAD_PRODUCT_MAP[url] ?? null;
}
