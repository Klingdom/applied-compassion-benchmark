/**
 * BreadcrumbJsonLd — reusable schema.org BreadcrumbList JSON-LD emitter.
 *
 * Emits a valid BreadcrumbList where every `item` URL is an absolute URL
 * on https://compassionbenchmark.com. Callers are responsible for passing
 * only real routes that exist in the build — dead breadcrumb URLs cause
 * rich-result validation warnings.
 *
 * Usage:
 *   <BreadcrumbJsonLd items={[
 *     { name: "Home", url: "https://compassionbenchmark.com/" },
 *     { name: "Indexes", url: "https://compassionbenchmark.com/indexes" },
 *     { name: "World Countries Index", url: "https://compassionbenchmark.com/countries" },
 *   ]} />
 */

const SITE_URL = "https://compassionbenchmark.com";

type BreadcrumbItem = {
  name: string;
  /** Absolute URL — must be a real, existing route in the build. */
  url: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function BreadcrumbJsonLd({ items }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Helper: build a fully-qualified absolute URL from a site-relative path.
 * Callers may also pass absolute URLs directly (e.g. entity page canonical).
 */
export function breadcrumbUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
