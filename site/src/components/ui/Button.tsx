"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { trackEvent, gumroadProductFromUrl } from "@/lib/analytics";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "default" | "primary";
  full?: boolean;
  className?: string;
  external?: boolean;
  /**
   * Optional custom Umami event name to fire on click. Works for BOTH external
   * and internal links. If omitted, external Gumroad URLs auto-fire
   * `gumroad_click` with the product key as metadata; internal links with no
   * `trackAs` are not tracked.
   */
  trackAs?: string;
  /** Extra metadata merged into the tracked event payload. */
  trackData?: Record<string, unknown>;
};

export default function Button({
  children,
  href,
  variant = "default",
  full = false,
  className = "",
  external = false,
  trackAs,
  trackData,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center min-h-[48px] px-[18px] rounded-[14px] font-bold transition-all duration-150";
  const variants = {
    default:
      "border border-line bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)] text-text",
    primary:
      "bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent hover:from-[#8bddff] hover:to-[#6caefb]",
  };
  const cls = `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;

  if (href && external) {
    const handleClick = () => {
      const gumroadProduct = gumroadProductFromUrl(href);
      if (trackAs) {
        trackEvent(trackAs, { href, ...(trackData || {}) });
      } else if (gumroadProduct) {
        trackEvent("gumroad_click", {
          product: gumroadProduct,
          href,
          ...(trackData || {}),
        });
      }
      // Non-Gumroad external clicks without an explicit trackAs are intentionally
      // not tracked — avoids flooding analytics with low-signal events.
    };
    return (
      <a
        href={href}
        className={cls}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  if (href) {
    const handleInternalClick = trackAs
      ? () => trackEvent(trackAs, { href, ...(trackData || {}) })
      : undefined;
    return (
      <Link href={href} className={cls} onClick={handleInternalClick}>
        {children}
      </Link>
    );
  }

  return <button className={cls}>{children}</button>;
}
