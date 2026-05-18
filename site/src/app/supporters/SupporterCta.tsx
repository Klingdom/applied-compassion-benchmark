"use client";

import Button from "@/components/ui/Button";
import { GUMROAD, SUPPORTER } from "@/data/gumroad";

interface Props {
  /** Compact mode: single button, no extra text. */
  compact?: boolean;
}

/**
 * Supporter CTA that respects the SUPPORTER.useGumroad flag.
 * When false: routes to /contact-sales?product=supporter.
 * When true: routes to Gumroad product with supporter_click tracking.
 */
export default function SupporterCta({ compact = false }: Props) {
  if (SUPPORTER.useGumroad) {
    return (
      <div className={compact ? "" : "flex flex-wrap gap-3 items-center"}>
        <Button
          href={GUMROAD.supporterMonthly}
          variant="primary"
          external
          trackAs="supporter_click"
          trackData={{ source: compact ? "tier-card" : "hero" }}
          full={compact}
        >
          Become a supporter
        </Button>
        {!compact && (
          <span className="text-muted text-[0.92rem]">
            $5 / $10 / $25 per month. Cancel anytime.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={compact ? "" : "flex flex-wrap gap-3 items-center"}>
      <Button
        href="/contact-sales?product=supporter"
        variant="primary"
        full={compact}
      >
        Become a supporter
      </Button>
      {!compact && (
        <span className="text-muted text-[0.92rem]">
          $5 / $10 / $25 per month. Cancel anytime.
        </span>
      )}
    </div>
  );
}
