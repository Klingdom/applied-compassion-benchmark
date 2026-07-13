"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the global site chrome (Navbar / Footer) on the `/nonprofit-alt`
 * preview namespace, which renders its own Nonprofit chrome via
 * `app/nonprofit-alt/layout.tsx`. Every other route renders the global chrome
 * exactly as before — this component is a pass-through for all non-alt paths.
 *
 * Static-export safe: `usePathname()` resolves to the concrete route path for
 * each statically generated page at build time, so the alt HTML is emitted
 * without the global chrome (no hydration flash, no mismatch).
 */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/nonprofit-alt")) return null;
  return <>{children}</>;
}
