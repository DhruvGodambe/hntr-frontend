"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { writeContract, waitForTransactionReceipt, getPublicClient } from "wagmi/actions";
import { getAddress } from "viem";
import { api } from "./api";
import { ensureAuth } from "./auth";
import { config } from "./wagmi";
import { hntrMembershipAbi, CONTRACT_ADDRESS } from "./contracts";

export interface RankProgress {
  percent: number;
  currentRank: string;
  nextRank: string | null;
  currentThreshold: number;
  nextThreshold: number | null;
}

export interface TokenBalance {
  symbol: "USDT" | "USDC";
  address: string;
  claimable: number;
  locked: number;
}

export interface LegProgress {
  label: string;
  volume: number;
  cap: number;
  percent: number;
}

export interface LegBreakdown {
  competitive: LegProgress[];
  weakest: LegProgress;
}

export interface RewardsSummary {
  walletAddress: string;
  username: string | null;
  rank: string;
  tier: string;
  joinedAt: string | null;
  teamVolume: number;
  networkSize: number;
  progress: RankProgress;
  legs: LegBreakdown;
  claimableNow: number;
  lockedRemaining: number;
  totalRewarded: number;
  tokens: TokenBalance[];
}

/** Compact number formatting for leg volumes, e.g. 12500 -> "12.5K". */
export function formatVolume(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export interface NetworkTreeNode {
  username: string;
  walletAddress: string;
  tier: string;
  rank: string;
  personalVolume: number;
  children: NetworkTreeNode[];
}

export interface LeadershipPayoutBreakdownEntry {
  symbol: string;
  tokenAddress: string;
  amount: number;
  txHash?: string;
  status: "PAID" | "FAILED";
}

export interface LeadershipPayout {
  _id: string;
  walletAddress: string;
  username: string;
  rank: string;
  amountUSDC: number;
  shares: number;
  txHash?: string;
  breakdown: LeadershipPayoutBreakdownEntry[];
  month: string;
  status: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
}

export interface PointsLedgerEntry {
  _id: string;
  walletAddress: string;
  amount: number;
  source: "MEMBERSHIP_PURCHASE" | "MEMBERSHIP_UPGRADE" | "COMMISSION_EARNED" | "POOL_DEPOSIT";
  usdValue: number;
  txHash?: string;
  timestamp: string;
}

export interface PointsSummary {
  hntrPoints: number;
  ledger: PointsLedgerEntry[];
}

export interface TransactionEntry {
  type:
    | "CommissionEarned"
    | "CommissionWithdrawn"
    | "MembershipPurchased"
    | "MembershipUpgraded"
    | "COMMISSION_EARNED"
    | "COMMISSION_WITHDRAWN"
    | "COMMISSION_CLAIM"
    | "PURCHASE"
    | "UPGRADE"
    | "COMPANY_WALLET_WITHDRAWN"
    | "LEADERSHIP_PAYOUT"
    | "ACHIEVEMENT_BONUS";
  txHash?: string;
  blockNumber: number;
  timestamp: string | null;
  amount: string | null;
  lockedAmount?: string | null;
  token: string | null;
  tier?: string;
  level?: number;
  /** Wallet that purchased/upgraded and triggered this commission. */
  sourceWalletAddress?: string | null;
  sourceUsername?: string | null;
  status?: "PENDING" | "CONFIRMED" | "FAILED";
}

/**
 * Single source of truth for the dashboard right rail (MainLayout.tsx) and the
 * network page - both render the same rewards summary so they can never disagree.
 */
export function useDashboardData() {
  const { address, isConnected } = useAccount();

  const summaryQuery = useQuery({
    queryKey: ["rewards-summary", address],
    queryFn: () => api.get<RewardsSummary>(`/api/network/${address}/rewards-summary`),
    enabled: isConnected && !!address,
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  return {
    address,
    isConnected,
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    isFetching: summaryQuery.isFetching,
    isError: summaryQuery.isError,
    refetchSummary: summaryQuery.refetch,
  };
}

export function useTransactionHistory(limit = 10) {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["transactions", address, limit],
    queryFn: () =>
      api.get<{ transactions: TransactionEntry[] }>(`/api/network/transactions/${address}?limit=${limit}`),
    enabled: isConnected && !!address,
    staleTime: 15_000,
  });
}

export interface PoolWalletTokenBalance {
  symbol: "USDT" | "USDC" | string;
  address: string;
  balance: number;
}

export interface PoolWalletBalances {
  walletAddress: string;
  tokens: PoolWalletTokenBalance[];
  totalUSD: number;
}

export interface LeadershipStatus {
  walletAddress: string;
  username: string | null;
  rank: string;
  shares: number;
  hasShares: boolean;
  totalShares: number;
  eligibleUserCount: number;
  poolBalanceUSD: number;
  walletBalances: PoolWalletBalances;
  estimatedPayoutUSD: number;
  lifetimePaidUSD: number;
  shareWeights: Record<string, number>;
  message: string;
  lastPayout: LeadershipPayout | null;
  payouts: LeadershipPayout[];
}

/**
 * Leadership Bonus is auto-deposited straight to the user's wallet by the monthly
 * cron job (see hntr-backend/src/jobs/leadership-cron.ts) rather than accrued as a
 * claimable contract balance, so this just surfaces the payout history for display
 * - there's no "claim" action for it, unlike referral commissions.
 */
export function useLeadershipPayouts() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["leadership-payouts", address],
    queryFn: () => api.get<{ payouts: LeadershipPayout[] }>(`/api/network/${address}/leadership-payouts`),
    enabled: isConnected && !!address,
    staleTime: 30_000,
    select: (data) => data.payouts,
  });
}

/** Live share entitlement + pool estimate for the Leadership Bonus card. */
export function useLeadershipStatus() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["leadership-status", address],
    queryFn: () => api.get<LeadershipStatus>(`/api/network/${address}/leadership-status`),
    enabled: isConnected && !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export interface AchievementBonusEntry {
  _id: string;
  walletAddress: string;
  username: string;
  rank: string;
  amountUSD: number;
  status: "PENDING" | "PAID" | "FAILED";
  token?: string;
  tokenAddress?: string;
  txHash?: string;
  createdAt: string;
  paidAt?: string;
}

export interface AchievementStatus {
  walletAddress: string;
  username: string | null;
  rank: string;
  bonusTable: Record<string, number>;
  lifetimePaidUSD: number;
  pendingUSD: number;
  hasPending: boolean;
  hasPaid: boolean;
  message: string;
  walletBalances: PoolWalletBalances;
  poolBalanceUSD: number;
  bonuses: AchievementBonusEntry[];
  lastBonus: AchievementBonusEntry | null;
}

/** Formats pool wallet token balances for the Network reward cards. */
export function formatPoolWalletBalances(balances?: PoolWalletBalances | null): string {
  if (!balances?.tokens?.length) return "Pool: —";
  const parts = balances.tokens.map((t) => `${t.balance.toFixed(2)} ${t.symbol}`);
  return `Pool: ${parts.join(" · ")}`;
}

/** One-time rank achievement bonus status for the Network Rank Bonus card. */
export function useAchievementStatus() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["achievement-status", address],
    queryFn: () => api.get<AchievementStatus>(`/api/network/${address}/achievement-status`),
    enabled: isConnected && !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePointsSummary() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["points-summary", address],
    queryFn: () => api.get<PointsSummary>(`/api/network/${address}/points`),
    enabled: isConnected && !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/** Allowed downline depths for the topology tree visualization. */
export const NETWORK_TREE_DEPTH_OPTIONS = [3, 6, 9, 12] as const;
export type NetworkTreeDepth = (typeof NETWORK_TREE_DEPTH_OPTIONS)[number];

export function networkTreeQueryKey(username: string, depth: NetworkTreeDepth) {
  return ["network-tree", username, depth] as const;
}

export function fetchNetworkTree(username: string, depth: NetworkTreeDepth) {
  return api.get<{ tree: NetworkTreeNode }>(`/api/network/${username}/tree?depth=${depth}`);
}

/** Real downline tree (up to `depth` levels) for the Topology Matrix Mapping visualization. */
export function useNetworkTree(username: string | null | undefined, depth: NetworkTreeDepth = 3) {
  return useQuery({
    queryKey: networkTreeQueryKey(username ?? "", depth),
    queryFn: () => fetchNetworkTree(username!, depth),
    enabled: !!username,
    staleTime: 0,
    select: (data) => data.tree,
  });
}

/** Formats a dollar amount string returned by the backend as a USD display string. */
export function formatTokenAmount(value: string | null | undefined): string {
  if (!value) return "$0.00";
  const num = Number(value);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface PreparedCommissionClaim {
  operation: "COMMISSION_CLAIM";
  walletAddress: string;
  tokenAddress: string;
  contractAddress: `0x${string}`;
  pendingTransactionId: string;
  status: "PENDING";
}

/**
 * Claims the given token balances (typically one token per button click).
 * The user signs `withdrawCommissions()` from their wallet; the backend prepares
 * the call and the listener confirms it. Pending locks are per-token.
 */
export function useClaimCommissions() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return async function claimTokens(claimableTokens: TokenBalance[]) {
    const toClaim = claimableTokens.filter((t) => t.claimable > 0 && t.address);
    if (toClaim.length === 0) {
      throw new Error("Nothing to claim right now.");
    }

    await ensureAuth();
    const results: { symbol: string; txHash: string }[] = [];
    const failures: { symbol: string; message: string }[] = [];
    const publicClient = getPublicClient(config);

    for (const token of toClaim) {
      const tokenAddress = getAddress(token.address as `0x${string}`);

      // Fresh on-chain balance — skip MetaMask if already drained.
      if (publicClient && address) {
        try {
          const live = (await publicClient.readContract({
            address: getAddress(CONTRACT_ADDRESS),
            abi: hntrMembershipAbi,
            functionName: "withdrawableCommissions",
            args: [getAddress(address), tokenAddress],
          })) as bigint;
          if (live === BigInt(0)) {
            continue;
          }
        } catch {
          // If the preflight read fails, still attempt the claim from the summary.
        }
      }

      let prepared: PreparedCommissionClaim;
      try {
        prepared = await api.post<PreparedCommissionClaim>(
          "/api/network/claim",
          { token: tokenAddress },
          { auth: true },
        );
      } catch (err) {
        failures.push({
          symbol: token.symbol,
          message: err instanceof Error ? err.message : "Failed to prepare claim",
        });
        continue;
      }

      const preparedToken = getAddress(prepared.tokenAddress as `0x${string}`);
      try {
        const txHash = await writeContract(config, {
          address: getAddress(prepared.contractAddress),
          abi: hntrMembershipAbi,
          functionName: "withdrawCommissions",
          args: [getAddress(prepared.walletAddress as `0x${string}`), preparedToken],
        });

        try {
          await api.post(
            "/api/network/relay/submit",
            { pendingTransactionId: prepared.pendingTransactionId, txHash },
            { auth: true },
          );
        } catch {
          // Listener can still promote the pending row via CommissionWithdrawn.
        }

        await waitForTransactionReceipt(config, { hash: txHash });
        results.push({ symbol: token.symbol, txHash });
      } catch (err) {
        try {
          await api.post(
            "/api/network/relay/fail",
            {
              pendingTransactionId: prepared.pendingTransactionId,
              reason: err instanceof Error ? err.message : "Wallet claim aborted",
            },
            { auth: true },
          );
        } catch {
          // best-effort; stale pending recovery still clears locks after timeout
        }
        failures.push({
          symbol: token.symbol,
          message: err instanceof Error ? err.message : "Claim failed",
        });
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["rewards-summary", address] });
    await queryClient.invalidateQueries({ queryKey: ["transactions", address] });

    if (results.length === 0) {
      const detail = failures.map((f) => `${f.symbol}: ${f.message}`).join("; ");
      throw new Error(detail || "Nothing to claim right now.");
    }

    return results;
  };
}
