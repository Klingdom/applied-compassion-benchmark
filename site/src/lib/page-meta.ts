import type { Metadata } from "next";

/**
 * Per-page share metadata. The root layout sets openGraph and twitter, and a page that sets only title and
 * description inherits the layout's homepage og:title/og:description with no og:url. Pages must therefore set
 * their own openGraph and twitter blocks; this helper builds them from the page's own title, description and path.
 * Next replaces openGraph/twitter as a whole, so the layout's siteName and locale are repeated here.
 */
export function pageMeta({ title, description }: { title: string; description: string }, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "Compassion Benchmark", locale: "en_US", title, description, url: path },
    twitter: { card: "summary_large_image", title, description },
  };
}
