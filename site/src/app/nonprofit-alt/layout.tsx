import type { ReactNode } from "react";
import type { Metadata } from "next";
import NonprofitNavbar from "@/components/nonprofit/NonprofitNavbar";
import NonprofitFooter from "@/components/nonprofit/NonprofitFooter";

// G1 (organic-growth Wave 1): the /nonprofit-alt/* namespace is a founder-
// review preview that duplicates the live site's content — it must never be
// indexed. Metadata objects from multiple segments in the same route are
// shallowly merged (duplicate top-level keys replaced by the more specific
// segment — see Next.js "Merging" docs for generateMetadata/metadata). None
// of the 9 nonprofit-alt/*/page.tsx files currently set their own `robots`
// key, so this layout-level value passes through unreplaced to every child
// route. If a page ever adds its own `metadata.robots`, it must repeat
// `{ index: false, follow: false }` or it will silently override this.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
