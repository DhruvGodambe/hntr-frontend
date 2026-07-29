import {
  HiBookOpen,
  HiChartBar,
  HiCreditCard,
  HiHome,
  HiShoppingBag,
  HiSquares2X2,
  HiUserGroup,
} from "react-icons/hi2";

const NAV_ICON_SIZE = 16;

export function HomeNavIcon() {
  return <HiHome size={NAV_ICON_SIZE} aria-hidden />;
}

export function MarketNavIcon() {
  return <HiShoppingBag size={NAV_ICON_SIZE} aria-hidden />;
}

export function StrategiesNavIcon() {
  return <HiChartBar size={NAV_ICON_SIZE} aria-hidden />;
}

export function CollectionNavIcon() {
  return <HiSquares2X2 size={NAV_ICON_SIZE} aria-hidden />;
}

export function MembershipNavIcon() {
  return <HiCreditCard size={NAV_ICON_SIZE} aria-hidden />;
}

export function NetworkNavIcon() {
  return <HiUserGroup size={NAV_ICON_SIZE} aria-hidden />;
}

export function LearnNavIcon() {
  return <HiBookOpen size={NAV_ICON_SIZE} aria-hidden />;
}
