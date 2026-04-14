export const mainNav = [
  { label: "Indexes", href: "/indexes" },
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
} as const;
