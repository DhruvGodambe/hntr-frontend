import { HiCheckCircle, HiLockClosed } from "react-icons/hi2";

const RAIL_ICON_SIZE = 13;

export function ReferralCommissionIcon({ compact = false }: { compact?: boolean }) {
  const size = compact ? 11 : RAIL_ICON_SIZE;
  return <HiCheckCircle size={size} aria-hidden />;
}

export function PoolRewardsIcon({ compact = false }: { compact?: boolean }) {
  const size = compact ? 11 : RAIL_ICON_SIZE;
  return <HiLockClosed size={size} aria-hidden />;
}
