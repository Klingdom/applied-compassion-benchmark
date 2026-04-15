export const mainNav = [
  { label: "Indexes", href: "/indexes" },
  { label: "Updates", href: "/updates" },
  { label: "Methodology", href: "/methodology" },
  { label: "Research", href: "/research" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLinks = {
  indexes: [
    { label: "Countries Index", href: "/countries" },
    { label: "U.S. States Index", href: "/us-states" },
    { label: "Fortune 500", href: "/fortune-500" },
    { label: "AI Labs", href: "/ai-labs" },
    { label: "Robotics Labs", href: "/robotics-labs" },
    { label: "U.S. Cities", href: "/us-cities" },
    { label: "Global Cities", href: "/global-cities" },
  ],
  research: [
    { label: "Methodology", href: "/methodology" },
    { label: "Research", href: "/research" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
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
} as const;
