import Card from "@/components/ui/Card";
import { SUPPORT_TIERS } from "./constants";

/**
 * SupportTiers — the four donation tier cards (Supporter $5/mo · Sustainer
 * $10/mo · Benefactor $25/mo · one-time/custom). Reused on the home page
 * (inside DonateCTA) and the /nonprofit-alt/support page (Wave 2).
 *
 * Tiers are framed by impact ("what your gift funds"), not by unlocked
 * features — there is nothing to unlock; the research is free either way.
 */
export default function SupportTiers({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {SUPPORT_TIERS.map((tier) => (
        <Card key={tier.id} variant={tier.id === "sustainer" ? "featured" : "default"}>
          <span className="font-bold text-text block mb-2">{tier.name}</span>
          <p className="mb-1.5">
            <span className="text-[1.5rem] font-extrabold leading-none">{tier.amount}</span>
            <span className="text-muted text-[0.8rem] font-semibold ml-1.5">
              {tier.cadenceLabel}
            </span>
          </p>
          <p className="text-muted text-[0.85rem] leading-relaxed">{tier.impact}</p>
        </Card>
      ))}
    </div>
  );
}
