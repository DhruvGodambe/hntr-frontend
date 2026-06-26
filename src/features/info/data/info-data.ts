export const infoHero = {
  title: "Info & Help",
  subtitle:
    "Institutional documentation, platform guidance, and support resources for the HNTR terminal.",
};

export const infoTopics = [
  {
    id: "platform",
    title: "Platform Overview",
    description:
      "HNTR is an institutional NFT dashboard for pooled liquidity, membership tiers, marketplace vault access, and network referrals.",
    icon: "platform" as const,
  },
  {
    id: "security",
    title: "Security & Custody",
    description:
      "Wallet signatures, encrypted sessions, and smart-contract custody are core to every deposit and membership action.",
    icon: "security" as const,
  },
  {
    id: "compliance",
    title: "Compliance",
    description:
      "Institutional tiers require KYC verification, risk assessment, and ongoing protocol parameter review.",
    icon: "compliance" as const,
  },
  {
    id: "support",
    title: "Support",
    description:
      "For account, pool, or membership inquiries, contact the HNTR institutional desk through your assigned channel.",
    icon: "support" as const,
  },
];

export const infoResources = [
  {
    id: "docs",
    label: "Documentation",
    description: "Platform architecture and feature guides",
    href: "#",
  },
  {
    id: "pools",
    label: "NFT Pools",
    description: "How pooled liquidity and deposits work",
    href: "/pools",
  },
  {
    id: "membership",
    label: "Membership Tiers",
    description: "Compare institutional packages",
    href: "/membership",
  },
  {
    id: "referrals",
    label: "Referrals",
    description: "Network rewards and commission structure",
    href: "/referrals",
  },
];

export const infoLegalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Risk Disclosure", href: "/risk" },
];
