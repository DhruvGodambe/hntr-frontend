import {
  CreditCard,
  Home,
  LayoutGrid,
  Store,
  UserPlus,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/pools", label: "NFT Strategies", icon: Waves },
  { href: "/my-nfts", label: "MY NFTs", icon: LayoutGrid },
  { href: "/membership", label: "Membership", icon: CreditCard },
  { href: "/referrals", label: "Network", icon: UserPlus },
];
