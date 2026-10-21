import { INDEX_REGISTRY } from "./indexRegistry";

export const mainNav = [
  { label: "Indexes", href: "/indexes" },
  { label: "AI Models", href: "/ai-models" },
  { label: "Updates", href: "/updates" },
  { label: "Methodology", href: "/methodology" },
  { label: "Research", href: "/research" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * AI Models submenu (docs/UX_FLOWS_AI_MODEL_WATCH.md section 6). The label for the
 * leaderboards route says what the page is, not that a model ranking exists.
 */
export const aiModelsNav = [
  { label: "Overview", href: "/ai-models" },
  { label: "Model tracker", href: "/ai-models/tracker" },
  { label: "Weekly Watch", href: "/ai-models/watch" },
  { label: "Why no model ranking", href: "/ai-models/leaderboards" },
  { label: "How the weekly cycle works", href: "/ai-models/cycle" },
  { label: "Method", href: "/ai-models/methodology" },
  { label: "Insights", href: "/insights" },
] as const;

export const footerLinks = {
  // Sourced from the canonical indexRegistry.ts — same 8 indexes, same
  // display order and labels as before; a future index is now added here
  // automatically rather than requiring this list to be hand-edited.
  indexes: INDEX_REGISTRY.map((entry) => ({
    label: entry.navLabel,
    href: entry.indexRoute,
  })),
  research: [
    { label: "Methodology", href: "/methodology" },
    { label: "Research", href: "/research" },
    { label: "2026 Report", href: "/updates/special/state-of-institutional-compassion-2026" },
    { label: "Daily Updates", href: "/updates" },
    { label: "Insights", href: "/insights" },
    { label: "Browse archive", href: "/updates/archive" },
    { label: "Data", href: "/data" },
    { label: "For Press & Researchers", href: "/media" },
    { label: "RSS feed", href: "/updates/feed.xml" },
    { label: "JSON feed", href: "/updates/feed.json" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  aiModels: [
    { label: "Overview", href: "/ai-models" },
    { label: "Model tracker", href: "/ai-models/tracker" },
    { label: "Weekly Watch", href: "/ai-models/watch" },
    { label: "Why no model ranking", href: "/ai-models/leaderboards" },
    { label: "How the weekly cycle works", href: "/ai-models/cycle" },
    { label: "AI model method", href: "/ai-models/methodology" },
    { label: "Insights", href: "/insights" },
  ],
  services: [
    { label: "Pricing", href: "/pricing" },
    { label: "Score-Watch Alerts", href: "/score-watch" },
    { label: "Purchase Research", href: "/purchase-research" },
    { label: "Data Licenses", href: "/data-licenses" },
    { label: "Advisory", href: "/advisory" },
    { label: "Certified Assessments", href: "/certified-assessments" },
    { label: "Enterprise", href: "/enterprise" },
    { label: "Contact Sales", href: "/contact-sales" },
  ],
  tools: [
    { label: "Self-Assessment", href: "/self-assessment" },
    { label: "Prompting Suite for Humans", href: "/prompting-suite-for-humans" },
    { label: "AI Evaluation Suite", href: "/ai-evaluation-suite" },
  ],
  community: [
    { label: "Supporters", href: "/supporters" },
    { label: "API Access", href: "/api-access" },
  ],
} as const;
