import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  name: "Compassion Benchmark",
  url: SITE_URL,
  description:
    "Independent benchmark institution measuring how institutions recognize, respond to, and reduce suffering across governments, corporations, AI labs, and robotics labs.",
  foundingDate: "2025",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
