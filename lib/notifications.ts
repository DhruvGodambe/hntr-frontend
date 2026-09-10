"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { api } from "./api";
import { ensureAuth } from "./auth";

export type BackendNotificationType =
  | "COMMISSION_EARNED"
  | "COMMISSION_CLAIMED"
  | "MEMBERSHIP_PURCHASED"
  | "MEMBERSHIP_UPGRADED"
  | "LEADERSHIP_PAYOUT"
  | "ACHIEVEMENT_PAYOUT"
  | "RANK_UP"
  | "VOUCHER_RECEIVED"
  | "VOUCHER_REDEEMED"
  | "VOUCHER_CLAIMED_BY_OTHER"
  | "GENERAL";

export interface BackendNotification {
  _id: string;
  walletAddress: string;
  type: BackendNotificationType;
  title: string;
  sub: string;
  link?: string;
  meta?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: BackendNotification[];
  unreadCount: number;
}

/** App-relative path for actionable notifications (gift-code redeem, etc.). */
export function notificationActionHref(n: BackendNotification): string | null {
  if (n.type === "VOUCHER_RECEIVED") {
    const redeemUrl = typeof n.meta?.redeemUrl === "string" ? n.meta.redeemUrl : "";
    let code = typeof n.meta?.code === "string" ? n.meta.code : "";
    if (!code && redeemUrl) {
      try {
        const u = new URL(redeemUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
        code = u.searchParams.get("code") || "";
      } catch {
        // ignore
      }
    }
    if (code) return `/membership?code=${encodeURIComponent(code)}`;
    return "/membership";
  }
  if (n.type === "VOUCHER_REDEEMED") return "/gift-codes";
  return null;
}

export function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Collapse back-to-back identical notifications (same type/title/body within a
 * two-minute window). The backend now dedupes rank-up / membership events at
 * write time, but historical rows created before that fix can still arrive in
 * pairs — this keeps the list clean without hiding genuinely repeated events
 * that happen minutes or hours apart.
 */
export function dedupeNotifications(items: BackendNotification[]): BackendNotification[] {
  const WINDOW_MS = 2 * 60 * 1000;
  const kept: BackendNotification[] = [];
  const seen: { sig: string; ts: number }[] = [];

  for (const n of items) {
    const sig = `${n.type}|${n.title}|${n.sub}`;
    const ts = new Date(n.createdAt).getTime();
    const dup = seen.some(
      (s) => s.sig === sig && Number.isFinite(ts) && Math.abs(s.ts - ts) <= WINDOW_MS,
    );
    if (dup) continue;
    seen.push({ sig, ts });
    kept.push(n);
  }

  return kept;
}

export function useNotifications(limit = 50) {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["notifications", address, limit],
    queryFn: async () => {
      await ensureAuth();
      const res = await api.get<NotificationsResponse>(
        `/api/network/${address}/notifications?limit=${limit}`,
        { auth: true },
      );
      const original = res.notifications ?? [];
      const notifications = dedupeNotifications(original);
      const keptIds = new Set(notifications.map((n) => n._id));
      const removedUnread = original.filter((n) => !keptIds.has(n._id) && !n.read).length;
      return {
        ...res,
        notifications,
        unreadCount: Math.max(0, (res.unreadCount ?? 0) - removedUnread),
      };
    },
    enabled: isConnected && !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationsRead() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: string[]) => {
      await ensureAuth();
      return api.post<{ modified: number }>(
        `/api/network/${address}/notifications/read`,
        { ids },
        { auth: true },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", address] });
    },
  });
}
