import type { Metadata } from "next";
import ThankYouClient from "./ThankYouClient";

/**
 * Static thank-you page — Gumroad post-purchase redirect target.
 *
 * noindex: this page has no standalone discovery value and should not
 * appear in search results.
 */
export const metadata: Metadata = {
  title: "Purchase Confirmed — Compassion Benchmark",
  description: "Your purchase is confirmed. Welcome email on its way.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <ThankYouClient />;
}
