import Link from "next/link";
import LogoMark from "@/components/ui/LogoMark";
import { INDEX_REGISTRY } from "@/data/indexRegistry";
import { SUPPORT_URL, INDEPENDENCE_FIREWALL_LINE } from "./constants";

/**
 * NonprofitFooter — 3 link groups per the build brief: Indexes · Research &
 * Data · Support & About. No commercial links (no pricing, services,
 * enterprise, data-licenses, advisory, certified-assessments, api-access,
 * contact-sales).
 *
 * The Indexes group links to the real, existing index pages (/countries,
 * /fortune-500, etc.) — those pages are the neutral published-data surface
 * shared by both the commercial and nonprofit framings; only the
 * sales-oriented pages are replaced under /nonprofit-alt. Counts/labels are
 * sourced from the canonical INDEX_REGISTRY, never hand-typed.
 */
export default function NonprofitFooter() {
  const researchAndData = [
    { label: "Daily Briefing", href: "/nonprofit-alt/updates" },
    { label: "Methodology", href: "/nonprofit-alt/methodology" },
    { label: "Research Program", href: "/nonprofit-alt/research" },
    { label: "Open Data", href: "/data" },
  ];

  const supportAndAbout = [
    { label: "Support the Benchmark", href: SUPPORT_URL },
    { label: "About", href: "/nonprofit-alt/about" },
    { label: "Contact", href: "/nonprofit-alt/contact" },
    { label: "Free Tools", href: "/nonprofit-alt/tools" },
  ];

  return (
    <footer className="mt-[34px] pt-[38px] pb-[50px] border-t border-line text-muted">
      <div className="w-[min(1280px,calc(100%-32px))] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px]">
        <div className="bg-gradient-to-b from-[rgba(255,255,255,0.045)] to-[rgba(255,255,255,0.02)] border border-line rounded-[22px] p-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
          <h3 className="text-text text-[1.08rem] font-bold mb-2.5 flex items-center gap-2">
            <LogoMark size={22} variant="mono" />
            <span>
              <span className="text-[--color-text]">Compassion </span>
              <span className="text-[#3b82f6] font-[600] tracking-[0.02em]">Benchmark</span>
            </span>
          </h3>
          <p className="text-muted mb-3">
            An independent nonprofit measuring how institutions recognize,
            respond to, and reduce suffering — free, public, and evidence-based.
          </p>
          <p className="text-muted text-[0.88rem] mb-4 border-l-2 border-[rgba(125,211,252,0.3)] pl-3">
            {INDEPENDENCE_FIREWALL_LINE}
          </p>
          <div className="border-t border-line pt-3.5">
            <Link
              href={SUPPORT_URL}
              className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-[12px] bg-gradient-to-br from-accent to-accent-2 text-[#07111f] font-bold text-[0.92rem]"
            >
              Support independent measurement
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <h4 className="text-text text-[0.95rem] font-bold mb-2.5">Indexes</h4>
            {INDEX_REGISTRY.map((entry) => (
              <Link
                key={entry.indexRoute}
                href={entry.indexRoute}
                className="block text-muted hover:text-text mb-2 text-[0.94rem]"
              >
                {entry.navLabel}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="text-text text-[0.95rem] font-bold mb-2.5">
              Research &amp; Data
            </h4>
            {researchAndData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-muted hover:text-text mb-2 text-[0.94rem]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="text-text text-[0.95rem] font-bold mb-2.5">
              Support &amp; About
            </h4>
            {supportAndAbout.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-muted hover:text-text mb-2 text-[0.94rem]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[min(1280px,calc(100%-32px))] mx-auto mt-[18px] flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>&copy; {new Date().getFullYear()} Compassion Benchmark — a nonprofit initiative</span>
        <span aria-hidden>&middot;</span>
        <span className="text-[0.82rem]">
          Preview build under /nonprofit-alt — not the live public site
        </span>
      </div>
    </footer>
  );
}
