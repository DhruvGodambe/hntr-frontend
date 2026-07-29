import { ACTIVITY_TEMPLATES } from "./constants";
import type { ActivityEntry, ActivityTab, ActivityTemplate } from "./types";

let activityIdCounter = 0;

export function nextActivityId() {
  activityIdCounter += 1;
  return `act-${activityIdCounter}`;
}

export function seedActivityLog(): ActivityEntry[] {
  return Array.from({ length: 7 }, (_, index) => {
    const template = ACTIVITY_TEMPLATES[index % ACTIVITY_TEMPLATES.length];
    return {
      ...template,
      id: nextActivityId(),
      ts: Date.now() - (index * 47 + 22) * 1000,
      fresh: false,
    };
  });
}

export function formatActivityTimeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
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

export function pickActivityTemplate(tab: ActivityTab): ActivityTemplate {
  const pool =
    tab === "bids"
      ? ACTIVITY_TEMPLATES.filter((entry) => entry.kind === "bid")
      : tab === "sales"
        ? ACTIVITY_TEMPLATES.filter((entry) => entry.kind === "sale")
        : ACTIVITY_TEMPLATES;
  return pool[Math.floor(Math.random() * pool.length)];
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
