import {
  Home,
  Info,
  ShoppingCart,
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
  { href: "/pools", label: "NFT Pools", icon: Waves },
  { href: "/membership", label: "Memberships", icon: ShoppingCart },
  { href: "/referrals", label: "Referrals", icon: UserPlus },
  { href: "/info", label: "Info", icon: Info },
];
