import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChromeGate from "@/components/layout/ChromeGate";
import "./globals.css";

const SITE_URL = "https://compassionbenchmark.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Compassion Benchmark | Global Benchmarking for Institutional Compassion",
    template: "%s | Compassion Benchmark",
  },
  description:
    "Compassion Benchmark publishes comparative benchmark research across countries, U.S. states, Fortune 500 companies, AI labs, and humanoid robotics labs using a structured institutional compassion framework.",
  openGraph: {
    type: "website",
    siteName: "Compassion Benchmark",
    locale: "en_US",
    title: {
      default: "Compassion Benchmark | Global Benchmarking for Institutional Compassion",
      template: "%s | Compassion Benchmark",
    },
    description:
      "Independent benchmark research measuring how institutions recognize, respond to, and reduce suffering across governments, corporations, AI labs, and robotics.",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Compassion Benchmark",
      template: "%s | Compassion Benchmark",
    },
    description:
      "Independent benchmark research measuring how institutions recognize, respond to, and reduce suffering across governments, corporations, AI labs, and robotics.",
  },
  robots: {
    index: true,
    follow: true,
  },
  /*
   * Search-engine site verification (Wave G0).
   * Set these as Docker build args so they reach `next build`:
   *   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token>
   *   NEXT_PUBLIC_BING_SITE_VERIFICATION=<token>
   * Both are optional — when absent, NO verification meta tags are emitted.
   * See Dockerfile for ARG/ENV wiring (lines added below the builder stage).
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  "@id": `${SITE_URL}/#organization`,
  name: "Compassion Benchmark",
  url: SITE_URL,
  description:
    "Independent benchmark institution measuring how institutions recognize, respond to, and reduce suffering across governments, corporations, AI labs, and robotics labs.",
  foundingDate: "2025",
  // sameAs: populate with founder's real verified profiles (Wikidata, LinkedIn, X)
  // when they exist — never guess. Leaving as empty array until registry is seeded.
  sameAs: [],
  // knowsAbout: factual descriptors of the institution's areas of expertise.
  // These are accurate to the mission — not marketing hype.
  knowsAbout: [
    "Institutional compassion",
    "Compassion benchmarking",
    "Corporate accountability",
    "Suffering reduction",
    "Governance and human rights measurement",
  ],
  // logo: the Calibrated Arc mark (512×512 PNG in public/). Stable @id allows
  // every briefing's publisher node to reference this organization by @id.
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
    caption: "Compassion Benchmark",
  },
};

// #17 — WebSite identity JSON-LD (@graph).
// NOTE: SearchAction (sitelinks search box) intentionally omitted — there is no
// crawlable /search?q= results route yet (site search is a client-side Pagefind
// overlay). Emitting a SearchAction to a non-existent URL would be dishonest
// structured data. Add the SearchAction once a real /search results page exists.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Compassion Benchmark",
      description:
        "Independent benchmark institution measuring how institutions recognize, respond to, and reduce suffering.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          defer
          src="/u/script.js"
          data-website-id="47fd034d-dd7d-43df-ad97-6a2cc5703aca"
          data-host-url="/u"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* #17 — WebSite + SearchAction JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Global chrome renders on every route EXCEPT /nonprofit-alt, which
            supplies its own Nonprofit chrome. See ChromeGate. */}
        <ChromeGate>
          <Navbar />
        </ChromeGate>
        <main className="flex-1">{children}</main>
        <ChromeGate>
          <Footer />
        </ChromeGate>
        {/*
         * Analytics: Umami (self-hosted at /u, loaded in <head> above with a
         * real data-website-id). Custom conversion events are wired via
         * @/lib/analytics (trackEvent + EVENTS) across Button/links. No second
         * tracker — do not add Plausible/GA; instrument new CTAs through Umami.
         */}
      </body>
    </html>
  );
}
