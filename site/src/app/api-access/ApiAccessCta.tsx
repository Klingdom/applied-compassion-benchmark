"use client";

import Button from "@/components/ui/Button";
import { GUMROAD, API_ACCESS } from "@/data/gumroad";

/**
 * Pro API CTA that respects the API_ACCESS.useGumroad flag.
 * When false: routes to contact-sales (coming soon posture).
 * When true: routes to Gumroad product with api_access_click tracking.
 */
export default function ApiAccessCta() {
  if (API_ACCESS.useGumroad) {
    return (
      <Button
        href={GUMROAD.apiAccess}
        variant="primary"
        external
        trackAs="api_access_click"
        full
      >
        Get Pro API access
      </Button>
    );
  }

  return (
    <Button
      href="/contact-sales?product=api-access"
      full
    >
      Contact us — coming soon
    </Button>
  );
}
