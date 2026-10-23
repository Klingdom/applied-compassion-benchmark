import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import Button from "@/components/ui/Button";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import { IndependenceCallout } from "@/components/model-watch/parts";
import { AUDIENCE_LABEL, insightEntries, loadInsight, relatedInsights, withHeadingIds } from "@/components/insights/data";
import { GUMROAD } from "@/data/gumroad";
import { SITE_URL, dateLong } from "@/lib/model-report-facts";

// Insights post (docs/UX_FLOWS_AI_MODEL_WATCH.md section 5b). BlogPosting is allowed here (not on /ai-models/**).
// generateStaticParams must not be empty under output: "export"; posts ship in the same commit as the route.

export function generateStaticParams() {
  return insightEntries.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadInsight(slug);
  if (!post) return { title: "Insights" };
  const path = `/insights/${slug}`;
  const ogImage = `/og/insights-${slug}.png`;
  return {
    title: `${post.title} | Insights`,
    description: post.dek,
    alternates: { canonical: path },
    openGraph: {
      title: post.title,
      description: post.dek,
      url: path,
      type: "article",
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.dek, images: [ogImage] },
  };
}

// Body typography: the compiled html is plain h2/h3/p/ul/ol/table/blockquote, so style descendants here.
const PROSE =
  "text-muted leading-[1.75] text-[1.02rem] " +
  "[&_h2]:text-text [&_h2]:text-[1.5rem] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:scroll-mt-24 " +
  "[&_h3]:text-text [&_h3]:text-[1.15rem] [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 " +
  "[&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1.5 " +
  "[&_strong]:text-text [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-[rgba(125,211,252,0.4)] [&_blockquote]:pl-4 [&_blockquote]:my-4 " +
  "[&_table]:w-full [&_table]:text-[0.9rem] [&_table]:border-collapse [&_th]:text-left [&_th]:py-2 [&_th]:px-3 [&_th]:border-b [&_th]:border-line " +
  "[&_td]:py-2 [&_td]:px-3 [&_td]:border-b [&_td]:border-line/60 [&_td]:align-top " +
  "[&_.sb-table-wrap]:relative [&_.sb-table-wrap]:overflow-x-auto [&_.sb-table-wrap]:border [&_.sb-table-wrap]:border-line [&_.sb-table-wrap]:rounded-[14px] [&_.sb-table-wrap]:mb-4 " +
  "[&_sup_a]:inline-block [&_sup_a]:min-w-[44px] [&_sup_a]:min-h-[44px] [&_sup_a]:text-center [&_sup_a]:leading-[44px] [&_sup_a]:no-underline " +
  "[&_sup]:leading-none";

export default async function InsightPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadInsight(slug);
  if (!post) notFound();

  const { html, headings } = withHeadingIds(post.html);
  const related = relatedInsights(slug, post.audience);
  const labFacing = post.audience === "ai-labs" || post.audience === "both";
  const entry = insightEntries.find((p) => p.slug === slug);
  const modified = entry?.lastCorrected ?? post.date;
  const url = `${SITE_URL}/insights/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.dek,
    datePublished: post.date,
    dateModified: modified,
    mainEntityOfPage: url,
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}/og/insights-${slug}.png`,
      width: 1200,
      height: 630,
    },
    author: { "@type": "Organization", name: "Compassion Benchmark research", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Compassion Benchmark", url: SITE_URL },
  };

  const toc = (
    <ol className="grid gap-1.5 text-[0.9rem]">
      {headings.map((h) => (
        <li key={h.id}>
          <a href={`#${h.id}`} className="text-muted no-underline hover:underline underline-offset-2 hover:text-text break-words">
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "Insights", url: breadcrumbUrl("/insights") },
          { name: post.title, url },
        ]}
      />

      <section className="py-[38px]">
        <Container>
          <div className="min-[1100px]:grid min-[1100px]:grid-cols-[minmax(0,70ch)_260px] min-[1100px]:gap-12 min-[1100px]:justify-center">
            <article data-pagefind-body className="min-w-0 max-w-[70ch]">
              <nav aria-label="Breadcrumb" className="text-[0.88rem] text-muted-subtle mb-4">
                <Link href="/" className="underline underline-offset-2">Home</Link> /{" "}
                <Link href="/insights" className="underline underline-offset-2">Insights</Link> / {post.title}
              </nav>
              <Eyebrow>Insights</Eyebrow>
              <h1 className="text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.15] mt-3 mb-4">{post.title}</h1>
              <p className="text-[0.92rem] text-muted-subtle mb-4 flex flex-wrap items-center gap-2">
                <span>Compassion Benchmark research</span>
                <span aria-hidden="true">&middot;</span>
                <time dateTime={post.date}>{dateLong(post.date)}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{post.readingMinutes} min read</span>
                <Pill>{AUDIENCE_LABEL[post.audience]}</Pill>
              </p>
              <p className="text-text text-[1.05rem] leading-relaxed mb-5 border-l-2 border-[rgba(125,211,252,0.4)] pl-4">
                <strong>In short.</strong> {post.dek}
              </p>

              <details className="min-[1100px]:hidden border border-line rounded-[14px] px-4 py-3 mb-6">
                <summary className="cursor-pointer text-text font-medium">On this page</summary>
                <div className="mt-3">{toc}</div>
              </details>

              <div id="post-body" className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />

              {post.claimLedger.length > 0 && (
                <details className="border border-line rounded-[14px] px-4 py-3 mt-8">
                  <summary className="cursor-pointer text-text font-medium">Claims and sources in this post</summary>
                  <div className="mt-3 relative overflow-x-auto">
                    <table className="w-full text-[0.88rem] border-collapse min-w-[480px]">
                      <caption className="sr-only">Claims in this post that carry a figure, with their source or derivation</caption>
                      <thead>
                        <tr className="text-left text-muted-subtle">
                          <th scope="col" className="py-2 px-3 border-b border-line font-medium">Claim</th>
                          <th scope="col" className="py-2 px-3 border-b border-line font-medium">Source or derivation</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted">
                        {post.claimLedger.map((c, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 border-b border-line/60 align-top">{c.sentence}</td>
                            <td className="py-2 px-3 border-b border-line/60 align-top">
                              {c.citations.length > 0
                                ? c.citations.map((n, j) => (
                                    <span key={n}>
                                      {j > 0 && ", "}
                                      <a href={`#src-${n}`} className="underline underline-offset-2 text-accent">
                                        Source {n}
                                      </a>
                                    </span>
                                  ))
                                : "Derived from data published on this site"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}

              <h2 id="sources" className="text-text text-[1.5rem] font-bold tracking-tight mt-10 mb-3">Sources</h2>
              <ol className="grid gap-2 text-[0.92rem] text-muted">
                {post.sources.map((s) => (
                  <li key={s.n} id={`src-${s.n}`} className="scroll-mt-24 flex gap-2">
                    <span className="text-muted-subtle">[{s.n}]</span>
                    <span>
                      {s.title}, {s.publisher}, <time dateTime={s.date}>{s.date}</time>.{" "}
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 text-accent break-words"
                      >
                        {s.url}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>{" "}
                      <a href="#post-body" className="underline underline-offset-2 text-muted-subtle">
                        Back to text
                      </a>
                    </span>
                  </li>
                ))}
              </ol>

              <h2 id="corrections" className="text-text text-[1.5rem] font-bold tracking-tight mt-10 mb-3">Corrections</h2>
              {post.corrections.length === 0 ? (
                <p className="text-muted">No corrections yet. Corrections are appended with a date and the original stays visible.</p>
              ) : (
                <ul className="grid gap-2 text-muted">
                  {post.corrections.map((c) => (
                    <li key={`${c.date}-${c.text.slice(0, 24)}`}>
                      <time dateTime={c.date} className="text-text">{c.date}</time>: {c.text}
                    </li>
                  ))}
                </ul>
              )}

              {labFacing && (
                <div className="mt-8">
                  <IndependenceCallout />
                </div>
              )}

              <div className="mt-8 flex gap-3 flex-wrap">
                {labFacing ? (
                  <>
                    <Button href="/ai-labs" variant="primary">See the AI Labs Index</Button>
                    <Button href={GUMROAD.aiLabsIndex} external>Get the AI Labs Index dataset</Button>
                  </>
                ) : (
                  <>
                    <Button href="/ai-evaluation-suite" variant="primary">Open the AI Evaluation Suite</Button>
                    <Button href="/ai-models/watch">Read AI Model Watch</Button>
                  </>
                )}
              </div>
            </article>

            <aside className="hidden min-[1100px]:block" aria-label="On this page">
              <div className="sticky top-24">
                <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-2">On this page</p>
                {toc}
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="py-[18px]" aria-labelledby="related-heading">
          <Container>
            <h2 id="related-heading" className="text-[1.3rem] tracking-tight mb-4">Related posts</h2>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {related.map((r) => (
                <Card key={r.slug} href={`/insights/${r.slug}`}>
                  <p className="text-[0.8rem] text-muted-subtle mb-1.5">
                    {AUDIENCE_LABEL[r.audience]} &middot; {r.readingMinutes} min read
                  </p>
                  <h3 className="text-[1.05rem] mb-1.5">{r.title}</h3>
                  <p className="text-muted text-[0.9rem] leading-relaxed">{r.dek}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-[20px] pb-[40px]">
        <Container>
          <div className="max-w-[900px]">
            <NewsletterSignup
              variant="card"
              source={`insights-${slug}`}
              heading="Email me when a new edition or piece publishes"
              body="One email when a new AI Model Watch edition or Insights piece is published. No promise of weekly timing."
              buttonLabel="Email me new editions"
              finePrint="Free. No promise of weekly timing. We never share your email."
              successTitle="Subscribed."
              successBody="Subscribed. We will email you when something publishes."
            />
          </div>
        </Container>
      </section>
    </>
  );
}
