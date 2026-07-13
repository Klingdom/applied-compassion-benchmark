import Callout from "@/components/ui/Callout";
import Button from "@/components/ui/Button";
import SupportTiers from "./SupportTiers";
import {
  SUPPORT_URL,
  INDEPENDENCE_FIREWALL_LINE,
  TAX_STATUS_NOTE,
} from "./constants";

interface DonateCTAProps {
  heading?: string;
  description?: string;
  /** Render the four SupportTiers cards inline. Default true. Set false for
   *  a compact CTA (e.g. end of a long page) that just links to /support. */
  showTiers?: boolean;
  className?: string;
}

/**
 * DonateCTA — reusable support call-to-action. Always renders the REQUIRED
 * independence firewall line (brief §"Donation / support model"). Uses the
 * single SUPPORT_URL constant — never a live payment link.
 *
 * Reused on the home page and every Wave 2 page that needs a donate surface
 * (support, about, methodology, contact).
 */
export default function DonateCTA({
  heading = "Fund independent measurement of institutional compassion",
  description = "Support keeps the Daily Briefing free, the indexes open, and the methodology public — for every reader, every weekday.",
  showTiers = true,
  className = "",
}: DonateCTAProps) {
  return (
    <Callout className={className}>
      <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] mb-2">{heading}</h2>
      <p className="text-muted max-w-[820px] mb-4">{description}</p>

      {showTiers && (
        <div className="mb-5">
          <SupportTiers />
        </div>
      )}

      <div className="flex gap-3 flex-wrap mb-4">
        <Button href={SUPPORT_URL} variant="primary">
          Support the benchmark &rarr;
        </Button>
        <Button href="/nonprofit-alt/about">How we&apos;re funded</Button>
      </div>

      {/* REQUIRED independence firewall line — reuse verbatim, every surface */}
      <p className="text-muted text-[0.85rem] border-t border-line pt-3">
        {INDEPENDENCE_FIREWALL_LINE}
      </p>
      <p className="text-[rgba(148,163,184,0.55)] text-[0.72rem] mt-2">
        {TAX_STATUS_NOTE}
      </p>
    </Callout>
  );
}
