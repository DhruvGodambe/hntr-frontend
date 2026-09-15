import type { ActivityEntry, ActivityTab } from "./types";

const DAY_SECONDS = 86400;
const MONTH_SECONDS = 30 * DAY_SECONDS;

export function formatActivityTimeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < DAY_SECONDS) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < MONTH_SECONDS) return `${Math.floor(seconds / DAY_SECONDS)}d`;
  return `${Math.floor(seconds / MONTH_SECONDS)}mo`;
}

export function activityAccentColor(action: string, pos: boolean): string {
  if (/LISTED|SOLD|SALE/.test(action)) return "var(--green)";
  if (/BID|WITHDRAWN/.test(action)) return "var(--t4)";
  return pos ? "var(--green)" : "var(--red)";
}

export function filterActivityByTab(entries: ActivityEntry[], tab: ActivityTab): ActivityEntry[] {
  if (tab === "bids") return entries.filter((entry) => entry.kind === "bid");
  if (tab === "sales") return entries.filter((entry) => entry.kind === "sale");
  return entries;
}

const TIER_ICONS: Record<string, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
  Diamond: "💎",
};

export function activityIcon(kind: "join" | "purchase", tier?: string): string {
  if (kind === "join") return "👋";
  return (tier && TIER_ICONS[tier]) || "💳";
}

/** Show first two characters; mask the rest with dots for privacy. */
export function maskActivityUsername(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 2) return trimmed;
  return trimmed.slice(0, 2) + ".".repeat(trimmed.length - 2);
}

export function buildNavBarPath(width: number, notchX: number, hasNotch: boolean) {
  const h = 64;
  const cr = 0;
  if (!hasNotch || width <= 0) {
    return `M 0 0 L ${width} 0 L ${width} ${h} L 0 ${h} Z`;
  }

  const nw = 40;
  const nd = 32;
  const cx = Math.max(nw + 12, Math.min(width - nw - 12, notchX));

  return [
    `M 0 ${cr}`,
    `L ${cx - nw - 6} 0`,
    `C ${cx - nw + 4} 0 ${cx - nw * 0.55} 3 ${cx - nw * 0.35} ${nd * 0.45}`,
    `C ${cx - 14} ${nd * 0.95} ${cx - 5} ${nd} ${cx} ${nd}`,
    `C ${cx + 5} ${nd} ${cx + 14} ${nd * 0.95} ${cx + nw * 0.35} ${nd * 0.45}`,
    `C ${cx + nw * 0.55} 3 ${cx + nw - 4} 0 ${cx + nw + 6} 0`,
    `L ${width} 0`,
    `L ${width} ${h}`,
    `L 0 ${h}`,
    "Z",
  ].join(" ");
}

export function shortenAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-3)}`;
}

export function formatRankSubtitle(rank?: string | null) {
  if (!rank || rank === "None") return "Unregistered";
  return rank
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function resolveCurrentPage(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/pool/")) return "pooldetail";
  return pathname.slice(1);
}
