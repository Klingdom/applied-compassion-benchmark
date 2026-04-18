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
