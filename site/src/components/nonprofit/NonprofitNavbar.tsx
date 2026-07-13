"use client";

import Link from "next/link";
import { useState } from "react";
import LogoMark from "@/components/ui/LogoMark";
import Container from "@/components/ui/Container";
import { SUPPORT_URL } from "./constants";

/**
 * Alt nav — mirrors the mission of the global Navbar but points every link
 * at the /nonprofit-alt/* namespace and swaps the commercial "Contact Sales"
 * CTA for a "Support" donation CTA. Order matches the build brief exactly.
 */
const NAV_ITEMS = [
  { label: "Home", href: "/nonprofit-alt" },
  { label: "Indexes", href: "/nonprofit-alt/indexes" },
  { label: "Daily Briefing", href: "/nonprofit-alt/updates" },
  { label: "Methodology", href: "/nonprofit-alt/methodology" },
  { label: "Research", href: "/nonprofit-alt/research" },
  { label: "About", href: "/nonprofit-alt/about" },
  { label: "Contact", href: "/nonprofit-alt/contact" },
] as const;

/**
 * NonprofitNavbar — self-contained alt nav for the /nonprofit-alt route
 * namespace. Does not import or modify site/src/data/nav.ts or the global
 * Navbar.
 *
 * KNOWN PREVIEW LIMITATION: the root layout (site/src/app/layout.tsx) always
 * renders the global Navbar above this one and the global Footer below the
 * NonprofitFooter, because nonprofit-alt/layout.tsx nests inside the root
 * layout rather than replacing it (Next.js App Router route groups compose,
 * they don't override). This is intentional per the build brief — do not
 * edit the root layout to hide the global chrome during this build.
 */
export default function NonprofitNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 backdrop-blur-[12px] bg-[rgba(8,12,24,0.78)] border-b border-line">
      <Container className="flex items-center justify-between gap-5 min-h-[74px]">
        <Link href="/nonprofit-alt" className="flex items-center gap-2.5">
          {/* Same logomark as the commercial site — one institution, two models */}
          <LogoMark size={32} variant="color" />
          <span className="font-[750] tracking-[0.2px] text-base">
            <span className="text-[--color-text]">Compassion </span>
            <span className="text-[#3b82f6] font-[600] tracking-[0.02em]">Benchmark</span>
          </span>
          <span className="hidden sm:inline-flex items-center text-muted-subtle text-[0.68rem] font-bold uppercase tracking-wider border border-line rounded-full px-2 py-0.5 ml-1">
            Nonprofit
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted hover:text-text transition-colors text-[0.96rem]"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href={SUPPORT_URL}
            className="inline-flex items-center justify-center min-h-[42px] px-3.5 rounded-[12px] bg-gradient-to-br from-accent to-accent-2 text-[#07111f] font-bold"
          >
            Support
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-muted p-2"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </Container>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-line px-4 pb-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-muted hover:text-text transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={SUPPORT_URL}
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center min-h-[42px] px-3.5 rounded-[12px] bg-gradient-to-br from-accent to-accent-2 text-[#07111f] font-bold mt-2"
          >
            Support
          </Link>
        </div>
      )}
    </div>
  );
}
