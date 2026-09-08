export type NavItem = {
  label: string;
  href: string;
  short: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", short: "HM" },
  { label: "Marketplace", href: "/marketplace", short: "MP" },
  { label: "NFT Strategies", href: "/pools", short: "NS" },
  { label: "My NFTs", href: "/collection", short: "MY" },
  { label: "Membership", href: "/membership", short: "MB" },
  { label: "Network", href: "/network", short: "NW" },
  { label: "Gift Codes", href: "/gift-codes", short: "GC" },
  { label: "Learn", href: "/learn", short: "LR" }
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Twitter", href: "https://twitter.com/hntr_io" },
  { label: "Discord", href: "https://discord.gg/hntr" },
  { label: "Telegram", href: "https://t.me/hntr_io" },
  { label: "Instagram", href: "https://www.instagram.com/hntr_io/" },
  { label: "YouTube", href: "https://www.youtube.com/@hntr_io" },
  { label: "TikTok", href: "https://www.tiktok.com/@hntr_io" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hntr_io/" },
  { label: "GitHub", href: "https://github.com/hntr_io" },
];
