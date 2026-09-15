"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { api } from "./api";
import { ensureAuth } from "./auth";

/**
 * Member-facing voucher (gift code) data. Replaces the old localStorage store in
 * `lib/giftCodes.ts` — every consumer goes through these hooks so the swap to the
 * real API is contained here.
 */

export type VoucherToken = "USDT" | "USDC";

export interface VoucherBalance {
  token: VoucherToken;
  balance: number;
  issued: number;
  refunded: number;
}

export interface VoucherAccess {
  enabled: boolean;
  username: string | null;
  balances: VoucherBalance[];
  redeemed: { count: number; totalUsd: number };
  /** Matches the "Codes Status" filter tabs 1:1 — not derived from the (filtered, paginated) list. */
  counts: { all: number; active: number; redeemed: number; expired: number };
  expiryDays: number;
  tiers: { name: string; valueUsd: number }[];
}

export interface Voucher {
  voucherId: string;
  /** Never sent by the list endpoint — only the last 4 chars are. Call revealVoucherCode() to get the full code. */
  codeLast4: string;
  tier: string;
  amountUsd: number;
  token: VoucherToken;
  status: "ACTIVE" | "REDEEMING" | "REDEEMED" | "EXPIRED" | "REVOKED" | "FAILED";
  note: string | null;
  restrictedUsername: string | null;
  createdAt: string;
  expiresAt: string;
  redeemedAt: string | null;
  redeemerUsername: string | null;
  txHash: string | null;
}

export interface IssuedVoucher {
  voucherId: string;
  code: string;
  redeemUrl: string;
  tier: string;
  amountUsd: number;
  token: VoucherToken;
  expiresAt: string;
  balanceAfter: number;
}

export interface RedeemResult {
  voucherId: string;
  tier: string;
  tierBefore: string;
  txHash: string;
  amountUsd: number;
}

export const voucherKeys = {
  access: ["voucher-access"] as const,
  list: (status: string, page: number) => ["vouchers", status, page] as const,
};

export function useVoucherAccess() {
  const { address, isConnected } = useAccount();
  return useQuery({
    queryKey: [...voucherKeys.access, address],
    queryFn: async (): Promise<VoucherAccess> => {
      await ensureAuth();
      return api.get<VoucherAccess>("/api/vouchers/access", { auth: true });
    },
    enabled: isConnected && !!address,
    staleTime: 15_000,
  });
}

export function useMyVouchers(status = "all", page = 1, limit = 20) {
  const { address, isConnected } = useAccount();
  return useQuery({
    queryKey: [...voucherKeys.list(status, page), address, limit],
    queryFn: async () => {
      await ensureAuth();
      return api.get<{ items: Voucher[]; pagination: { total: number; totalPages: number; page: number } }>(
        `/api/vouchers?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`,
        { auth: true },
      );
    },
    enabled: isConnected && !!address,
    staleTime: 10_000,
  });
}

/** Every voucher the caller has issued, across all statuses and pages — for CSV export. */
export async function fetchAllVouchers(): Promise<Voucher[]> {
  await ensureAuth();
  const limit = 100;
  let page = 1;
  let all: Voucher[] = [];
  for (;;) {
    const res = await api.get<{ items: Voucher[]; pagination: { totalPages: number } }>(
      `/api/vouchers?status=all&page=${page}&limit=${limit}`,
      { auth: true },
    );
    all = all.concat(res.items);
    if (res.items.length === 0 || page >= res.pagination.totalPages) break;
    page++;
  }
  return all;
}

export async function issueVoucher(input: {
  tier: string;
  token: VoucherToken;
  note?: string;
}): Promise<IssuedVoucher> {
  await ensureAuth({ interactive: true });
  return api.post<IssuedVoucher>("/api/vouchers", input, { auth: true });
}

export async function shareVoucher(voucherId: string, usernames: string[]) {
  await ensureAuth({ interactive: true });
  return api.post<{ notified: string[]; skipped: { username: string; reason: string }[] }>(
    `/api/vouchers/${voucherId}/share`,
    { usernames },
    { auth: true },
  );
}

export async function searchUsernames(q: string, limit = 8) {
  await ensureAuth({ interactive: true });
  const data = await api.get<{ items: { username: string; tier: string }[] }>(
    `/api/users/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { auth: true },
  );
  return data.items ?? [];
}

/** Issuer-only, rate-limited re-reveal of a voucher's full plaintext code — it's shown once at issue time otherwise. */
export async function revealVoucherCode(voucherId: string) {
  await ensureAuth({ interactive: true });
  return api.get<{ code: string; redeemUrl: string }>(`/api/vouchers/${voucherId}/code`, { auth: true });
}

export async function revokeVoucher(voucherId: string) {
  await ensureAuth({ interactive: true });
  return api.post<{ voucherId: string; status: string; refunded: number }>(
    `/api/vouchers/${voucherId}/revoke`,
    {},
    { auth: true },
  );
}

export async function redeemVoucher(code: string): Promise<RedeemResult> {
  await ensureAuth({ interactive: true });
  return api.post<RedeemResult>("/api/vouchers/redeem", { code }, { auth: true });
}

/** Invalidate voucher + downstream membership caches after a mutation. */
export function useVoucherInvalidate() {
  const qc = useQueryClient();
  const { address } = useAccount();
  return async (opts: { membership?: boolean } = {}) => {
    await qc.invalidateQueries({ queryKey: voucherKeys.access });
    await qc.invalidateQueries({ queryKey: ["vouchers"] });
    if (opts.membership) {
      await qc.invalidateQueries({ queryKey: ["rewards-summary", address] });
      await qc.invalidateQueries({ queryKey: ["transactions", address] });
    }
  };
}
