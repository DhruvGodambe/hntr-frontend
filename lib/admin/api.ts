"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import { getStoredAdminAuth, setStoredAdminAuth, clearStoredAdminAuth, StoredAdminAuth } from "./auth";

export class AdminApiError extends Error {
  code?: string;
  statusCode: number;
  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface AdminMetricCard {
  title: string;
  value: string | number;
  subValue?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalVolume: number;
  totalCommissions: number;
  companyBalance: number;
  soldMemberships: number;
  activePools: number;
  pendingWithdrawals: number;
  cards: AdminMetricCard[];
}

export interface AdminUser {
  id: string;
  username: string;
  walletAddress?: string;
  tier: string;
  rank: string;
  teamVolume: number;
  directs: number;
  downlines: number;
  status: string;
  isBlocked: boolean;
  isForcedRank?: boolean;
  isForcedMembership?: boolean;
  isVoucherMembership?: boolean;
  actualTier?: string;
  actualRank?: string;
  tierOverride?: string | null;
  rankOverride?: string | null;
}

export interface AdminPool {
  id: string;
  slug: string;
  name: string;
  targetEth: number;
  raisedEth: number;
  progress: number;
  status: "OPEN" | "CLOSED" | "COMPLETED";
  imageUrl: string;
  depositsPaused: boolean;
  collectionName?: string;
}

export interface AdminWalletBalance {
  name: string;
  key: string;
  symbol: string;
  balance: number;
  tokens: { symbol: string; balance: number }[];
  address: string;
}

export interface AdminTransaction {
  id: string;
  date: string;
  user: string;
  walletAddress: string;
  type: string;
  amount: number;
  token: string;
  hntrPoints: number | null;
  txHash: string | null;
  status: string;
}

export interface AdminActivity {
  id: string;
  type: string;
  user: string;
  walletAddress: string;
  amount: number;
  token: string;
  status: string;
  timestamp: string;
}

export interface LeadershipPreview {
  poolBalanceUSD: number;
  poolTokens: { symbol: string; balance: number }[];
  leadershipWallet?: string;
  eligibleCount: number;
  unpaidCount?: number;
  eligibleUsers: {
    username: string;
    rank: string;
    shares: number;
    walletAddress?: string;
    estimatedPayoutUSD?: number;
    alreadyPaid?: boolean;
  }[];
  totalShares: number;
  month?: string;
  fundTotals?: { USDT: number; USDC: number };
  burnerHas?: { USDT: number; USDC: number };
  /** How much USDT then USDC to send the burner from `fundFromWallet` before Distribute. */
  fundToBurner?: { USDT: number; USDC: number };
  fundFromWallet?: string;
  hopNote?: string;
  protocolEth?: number;
  burnerEth?: number;
  burnerMinEth?: number;
  burnerWallet?: string;
  burnerTokens?: { symbol: string; balance: number }[];
  lastBatch?: {
    id: string;
    status: string;
    triggeredBy: string;
    createdAt: string;
    fundTransfers?: unknown[];
    error?: string;
  } | null;
}

export interface AchievementPreview {
  poolBalanceUSD: number;
  poolTokens: { symbol: string; balance: number }[];
  rankWallet?: string;
  pendingCount: number;
  pendingReviewCount: number;
  totalPendingUSD: number;
  burnerHas?: { USDT: number; USDC: number };
  /** How much USDT then USDC to send the burner from `fundFromWallet` before Distribute. */
  fundToBurner?: { USDT: number; USDC: number };
  fundFromWallet?: string;
  pendingBonuses: {
    id: string;
    username: string;
    walletAddress: string;
    rank: string;
    amountUSD: number;
    createdAt: string;
  }[];
  hopNote?: string;
  protocolEth?: number;
  burnerEth?: number;
  burnerMinEth?: number;
  burnerWallet?: string;
  burnerTokens?: { symbol: string; balance: number }[];
  lastBatch?: {
    id: string;
    status: string;
    triggeredBy: string;
    createdAt: string;
    fundTransfers?: unknown[];
    error?: string;
  } | null;
}

export interface AdminWalletLedgerEntry {
  id: string;
  direction: "IN" | "OUT";
  type: string;
  amount: number;
  token: string;
  counterparty?: string;
  timestamp: string;
  txHash: string;
  blockNumber?: number;
}

export interface AdminWalletLedger {
  walletKey: string;
  walletAddress: string;
  source: "blockchain" | "database";
  totals: { inflow: number; outflow: number };
  items: AdminWalletLedgerEntry[];
  pagination: PaginationMeta;
}

export interface OverdueWallet {
  walletAddress: string;
  username: string;
  unclaimedUSD: number;
  claimStatus?: "never" | "overdue_30d";
  lastClaimedAt?: string | null;
  daysSinceClaim?: number | null;
  gracePeriodDays?: number;
}

export type OverdueClaimFilter = "all" | "never" | "overdue_30d";

async function adminRequest<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; headers?: Record<string, string> } = {},
): Promise<T> {
  const { method = "GET", body, auth = true, headers: extraHeaders } = options;

  const headers: Record<string, string> = { ...(extraHeaders ?? {}) };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const stored = getStoredAdminAuth();
    if (!stored) {
      clearStoredAdminAuth();
      throw new AdminApiError("Admin session expired. Please sign in again.", 401);
    }
    headers.Authorization = `Bearer ${stored.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: { success?: boolean; message?: string; data?: T; errors?: { code?: string } } | null = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (!res.ok || json?.success === false) {
    if (res.status === 401 && auth) clearStoredAdminAuth();
    const message = json?.message || res.statusText || "Request failed";
    throw new AdminApiError(message, res.status, json?.errors?.code);
  }

  return json?.data as T;
}

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  login: async (username: string, password: string): Promise<StoredAdminAuth> => {
    const data = await adminRequest<{ token: string; expiresAt: number; role: "admin"; username: string }>(
      "/api/admin/auth/login",
      { method: "POST", body: { username, password }, auth: false },
    );
    const auth: StoredAdminAuth = {
      token: data.token,
      expiresAt: data.expiresAt,
      role: "admin",
      username: data.username,
    };
    setStoredAdminAuth(auth);
    return auth;
  },

  register: async (username: string, password: string, setupSecret?: string) =>
    adminRequest<{ id: string; username: string }>("/api/admin/auth/register", {
      method: "POST",
      body: { username, password },
      auth: false,
      headers: setupSecret ? { "x-admin-setup-secret": setupSecret } : undefined,
    }),

  me: () => adminRequest<{ id: string; username: string; lastLoginAt?: string | null }>("/api/admin/auth/me"),

  logout: () => clearStoredAdminAuth(),

  getMetrics: () => adminRequest<AdminMetrics>("/api/admin/metrics"),

  getActivity: (page = 1, limit = 10) =>
    adminRequest<PaginatedResult<AdminActivity>>(`/api/admin/activity${qs({ page, limit })}`),

  getUsers: (params: { search?: string; page?: number; limit?: number; status?: string } = {}) =>
    adminRequest<PaginatedResult<AdminUser>>(`/api/admin/users${qs(params)}`),

  blockUser: (username: string, reason?: string) =>
    adminRequest(`/api/admin/users/${encodeURIComponent(username)}/block`, { method: "POST", body: { reason } }),

  unblockUser: (username: string) =>
    adminRequest(`/api/admin/users/${encodeURIComponent(username)}/unblock`, { method: "POST", body: {} }),

  overrideUser: (username: string, tier?: string, rank?: string) =>
    adminRequest<{
      username: string;
      tier: string;
      rank: string;
      isForcedRank?: boolean;
      isForcedMembership?: boolean;
      previousTier?: string;
      previousRank?: string;
      tierOverride?: string | null;
      rankOverride?: string | null;
      message: string;
    }>(`/api/admin/users/${encodeURIComponent(username)}/override`, {
      method: "POST",
      // Rank upgrades only via this endpoint — membership force is on-chain via the burner wallet.
      body: { rank },
    }),

  recordMembershipOverride: (username: string, params: { txHash: string; tier: string }) =>
    adminRequest<{
      username: string;
      walletAddress: string;
      tier: string;
      rank: string;
      isForcedMembership: boolean;
      isForcedRank?: boolean;
      previousTier?: string;
      tierOverride?: string | null;
      rankOverride?: string | null;
      txHash: string;
      message: string;
    }>(`/api/admin/users/${encodeURIComponent(username)}/record-membership-override`, {
      method: "POST",
      body: params,
    }),

  // Backend burner-wallet signer executes overrideMembershipTier on-chain, then
  // persists Mongo state. No browser wallet connection required.
  executeMembershipOverride: (username: string, params: { tier: string }) =>
    adminRequest<{
      username: string;
      walletAddress: string;
      tier: string;
      rank: string;
      isForcedMembership: boolean;
      isForcedRank?: boolean;
      previousTier?: string;
      tierOverride?: string | null;
      rankOverride?: string | null;
      txHash: string;
      message: string;
    }>(`/api/admin/users/${encodeURIComponent(username)}/execute-membership-override`, {
      method: "POST",
      body: params,
    }),

  getTransactions: (params: { type?: string; page?: number; limit?: number; search?: string } = {}) =>
    adminRequest<PaginatedResult<AdminTransaction>>(`/api/admin/transactions${qs(params)}`),

  getWalletBalances: () => adminRequest<AdminWalletBalance[]>("/api/admin/wallets"),

  getWalletLedger: (walletKey: string, page = 1, limit = 20) =>
    adminRequest<AdminWalletLedger>(`/api/admin/wallets/${walletKey}/ledger${qs({ page, limit })}`),

  getLeadershipPreview: () => adminRequest<LeadershipPreview>("/api/admin/leadership/preview"),

  distributeLeadership: () =>
    adminRequest<{ paid?: number; failed?: number; month?: string }>("/api/admin/leadership/distribute", {
      method: "POST",
      body: {},
    }),

  getAchievementPreview: () => adminRequest<AchievementPreview>("/api/admin/achievement/preview"),

  distributeAchievement: () =>
    adminRequest<{ paid?: number }>("/api/admin/achievement/distribute", { method: "POST", body: {} }),

  getDisbursements: (limit = 20) =>
    adminRequest<unknown[]>(`/api/admin/disbursements${qs({ limit })}`),

  getOverdueCommissions: (token = "USDT", page = 1, limit = 10, filter: OverdueClaimFilter = "all") =>
    adminRequest<
      PaginatedResult<OverdueWallet> & {
        totalUnclaimedUSD: number;
        configured?: boolean;
        securityWallet?: string;
        tokenAddress?: string;
        filter?: OverdueClaimFilter;
        counts?: { all: number; never: number; overdue_30d: number };
      }
    >(`/api/admin/commissions/overdue${qs({ token, page, limit, filter })}`),

  getSecurityWallet: () =>
    adminRequest<{ address: string }>("/api/admin/security-wallet"),

  recordSecurityWithdraw: (params: {
    walletAddress: string;
    token: string;
    txHash: string;
    amount: number;
  }) =>
    adminRequest<{
      id: string;
      walletAddress: string;
      txHash: string;
      token: string;
      amount: number;
      type: "UNCLAIMED_WITHDRAWN";
      status: string;
      duplicate?: boolean;
    }>("/api/admin/commissions/record-withdraw", { method: "POST", body: params }),

  getPools: (page = 1, limit = 50) =>
    adminRequest<PaginatedResult<AdminPool>>(`/api/admin/pools${qs({ page, limit })}`),

  createPool: (pool: { name: string; targetEth: number; slug?: string; imageUrl?: string; collectionName?: string }) =>
    adminRequest<AdminPool>("/api/admin/pools", { method: "POST", body: pool }),

  updatePool: (poolId: string, pool: Partial<AdminPool & { depositsPaused: boolean }>) =>
    adminRequest<AdminPool>(`/api/admin/pools/${poolId}`, { method: "PUT", body: pool }),

  deletePool: (poolId: string) =>
    adminRequest(`/api/admin/pools/${poolId}`, { method: "DELETE" }),

  getMaintenance: () =>
    adminRequest<{ maintenanceMode: boolean; maintenanceMessage: string }>("/api/admin/maintenance"),

  setMaintenance: (maintenanceMode: boolean, maintenanceMessage?: string) =>
    adminRequest("/api/admin/maintenance", { method: "POST", body: { maintenanceMode, maintenanceMessage } }),

  recalculateVolumes: (username: string) =>
    adminRequest("/api/admin/volumes/recalculate", { method: "POST", body: { username } }),

  // --- Vouchers / gift codes ---
  getOwnerWallet: () => adminRequest<{ address: string | null }>("/api/admin/owner-wallet"),

  getVoucherAccounts: (params: { search?: string; enabled?: string; page?: number; limit?: number } = {}) =>
    adminRequest<PaginatedResult<AdminVoucherAccount>>(`/api/admin/vouchers/accounts${qs(params)}`),

  setVoucherAccess: (username: string, enabled: boolean, reason?: string) =>
    adminRequest<{ username: string; walletAddress: string; enabled: boolean }>(
      `/api/admin/vouchers/accounts/${encodeURIComponent(username)}/access`,
      { method: "POST", body: { enabled, reason } },
    ),

  adjustVoucherBalance: (username: string, token: "USDT" | "USDC", delta: number, note?: string) =>
    adminRequest<{ username: string; token: string; balance: number; delta: number }>(
      `/api/admin/vouchers/accounts/${encodeURIComponent(username)}/balance`,
      { method: "POST", body: { token, delta, note } },
    ),

  getVouchers: (params: { status?: string; issuer?: string; search?: string; page?: number; limit?: number } = {}) =>
    adminRequest<PaginatedResult<AdminVoucher>>(`/api/admin/vouchers${qs(params)}`),

  revokeVoucher: (voucherId: string, reason: string) =>
    adminRequest<{ voucherId: string; status: string; refunded: number }>(
      `/api/admin/vouchers/${voucherId}/revoke`,
      { method: "POST", body: { reason } },
    ),

  getVoucherLedger: (params: { walletAddress?: string; token?: string; page?: number; limit?: number } = {}) =>
    adminRequest<PaginatedResult<AdminVoucherLedgerEntry>>(`/api/admin/vouchers/ledger${qs(params)}`),

  getBurnerHealth: () => adminRequest<BurnerHealth>("/api/admin/vouchers/burner"),

  recordBurnerRotation: (params: { txHash: string; burnerWallet: string }) =>
    adminRequest<{ burnerWallet: string; txHash: string; matches: boolean; message: string }>(
      "/api/admin/vouchers/burner/record",
      { method: "POST", body: params },
    ),

  reconcileVoucherBalances: (params: { username?: string; token?: string } = {}) =>
    adminRequest<{ checked: number; repaired: number }>("/api/admin/vouchers/reconcile", {
      method: "POST",
      body: params,
    }),

  getBonusReview: (status = "PENDING_REVIEW", page = 1, limit = 20) =>
    adminRequest<PaginatedResult<AdminAchievementBonus>>(
      `/api/admin/achievement-bonuses${qs({ status, page, limit })}`,
    ),

  reviewBonus: (id: string, decision: "approve" | "reject", reason?: string) =>
    adminRequest<{ id: string; status: string; username: string; rank: string; amountUSD: number }>(
      `/api/admin/achievement-bonuses/${id}/${decision}`,
      { method: "POST", body: { reason } },
    ),
};

export interface AdminVoucherBalance {
  token: "USDT" | "USDC";
  balance: number;
  issued: number;
  refunded: number;
}

export interface AdminVoucherAccount {
  username: string;
  walletAddress: string;
  enabled: boolean;
  balances: AdminVoucherBalance[];
  issuedTotal: number;
  activeCount: number;
  redeemedCount: number;
}

export interface AdminVoucher {
  voucherId: string;
  codeLast4: string;
  issuerUsername: string;
  issuerWallet: string;
  tier: string;
  amountUsd: number;
  token: "USDT" | "USDC";
  status: string;
  note: string | null;
  createdAt: string;
  expiresAt: string;
  redeemedAt: string | null;
  redeemerUsername: string | null;
  txHash: string | null;
}

export interface AdminVoucherLedgerEntry {
  _id: string;
  walletAddress: string;
  token: "USDT" | "USDC";
  entryKey: string;
  delta: number;
  balanceAfter: number;
  reason: string;
  voucherId?: string;
  adminUsername?: string;
  note?: string;
  timestamp: string;
}

export interface BurnerHealth {
  configuredAddress: string | null;
  onChainAddress: string | null;
  matches: boolean;
  balanceEth: number;
  minEth: number;
  healthy: boolean;
}

export interface AdminAchievementBonus {
  _id: string;
  walletAddress: string;
  username: string;
  rank: string;
  amountUSD: number;
  status: string;
  reviewReason?: string;
  createdAt: string;
}

export function formatUsd(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return `$${amount.toFixed(2)}`;
}
