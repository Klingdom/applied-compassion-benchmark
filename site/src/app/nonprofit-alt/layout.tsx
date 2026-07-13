import type { ReactNode } from "react";
import NonprofitNavbar from "@/components/nonprofit/NonprofitNavbar";
import NonprofitFooter from "@/components/nonprofit/NonprofitFooter";

/**
 * Route-group layout for the /nonprofit-alt/* namespace. Wraps every alt
 * page with the alt Navbar/Footer.
 *
 * KNOWN PREVIEW LIMITATION: Next.js App Router layouts compose (they do not
 * replace ancestors), so the root layout's global Navbar/Footer
 * (site/src/app/layout.tsx) still render above/below this layout's chrome
 * during preview. Per the build brief, the root layout is explicitly
 * out of scope for this build (ZERO-TOUCH) — do not edit it to hide the
 * global chrome. A founder reviewing /nonprofit-alt will see:
 *
 *   [global Navbar] → [NonprofitNavbar] → page content → [NonprofitFooter] → [global Footer]
 *
 * This is acceptable for founder review of the alt page content/copy/layout;
 * it would need to be resolved (e.g. a real route-group split with its own
 * root layout, or a conditional in the root layout) before any real
 * deployment of the nonprofit-alt namespace.
 */
export default function NonprofitAltLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NonprofitNavbar />
      <main>{children}</main>
      <NonprofitFooter />
    </>
  );
}
