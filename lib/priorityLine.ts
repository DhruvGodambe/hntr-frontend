"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getAccount, switchChain, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { api, ApiError } from "./api";
import { ensureAuth } from "./auth";
import { APP_CHAIN_ID, erc20Abi, isCorrectAppChain } from "./contracts";
import type { PaymentToken } from "./tokens";
import { config } from "./wagmi";

/**
 * Priority Line: members reserve a spot in the first strategy pools by sending USDT/USDC
 * to an admin-configured wallet. The backend verifies the on-chain transfer and assigns
 * the line number; withdrawals are requests the admin pays out manually.
 */

export type PriorityLineStatus = "ACTIVE" | "WITHDRAWAL_REQUESTED" | "WITHDRAWN" | "REVIEW";

export interface PriorityLineDeposit {
  id: string;
  lineNumber: number | null;
  token: PaymentToken;
  amountUsd: number;
  txHash: string;
  status: PriorityLineStatus;
  createdAt: string;
  withdrawalRequestedAt: string | null;
  withdrawnAt: string | null;
  payoutTxHash: string | null;
}

export interface PriorityLineOverview {
  tier: string;
  /** Total USD the member can reserve across all active deposits. */
  cap: number;
  used: number;
  remaining: number;
  minDepositUsd: number;
  firstLineNumber: number | null;
  /** Null until an admin configures it — deposits are closed while it is. */
  depositWallet: string | null;
  deposits: PriorityLineDeposit[];
}

interface PreparedDeposit {
  depositWallet: `0x${string}`;
  token: PaymentToken;
  tokenAddress: `0x${string}`;
  decimals: number;
  amountUsd: number;
  amountRaw: string;
  remaining: number;
}

export const priorityLineKeys = {
  overview: ["priority-line"] as const,
};

export function usePriorityLine() {
  const { address, isConnected } = useAccount();
  return useQuery({
    queryKey: [...priorityLineKeys.overview, address],
    queryFn: async (): Promise<PriorityLineOverview> => {
      await ensureAuth();
      return api.get<PriorityLineOverview>("/api/priority-line/me", { auth: true });
    },
    enabled: isConnected && !!address,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function usePriorityLineInvalidate() {
  const qc = useQueryClient();
  const { address } = useAccount();
  return async () => {
    await qc.invalidateQueries({ queryKey: priorityLineKeys.overview });
    await qc.invalidateQueries({ queryKey: ["notifications", address] });
  };
}

/* ── pending transfers ──────────────────────────────────────────────────────
 * The transfer is on-chain before the backend records it. If the tab closes in
 * between, the hash is kept here so the deposit is still recorded next visit. */

const PENDING_KEY = "hntr-priority-line-pending";

interface PendingTransfer {
  address: string;
  hash: string;
  token: PaymentToken;
}

function readPending(): PendingTransfer[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writePending(list: PendingTransfer[]) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable — the in-flight confirm still runs, just without crash recovery.
  }
}

function addPending(p: PendingTransfer) {
  writePending([...readPending().filter((x) => x.hash !== p.hash), p]);
}

function removePending(hash: string) {
  writePending(readPending().filter((x) => x.hash !== hash));
}

/** Codes where retrying can never succeed, so the stored hash can be dropped. */
const PERMANENT_CONFIRM_ERRORS = new Set([
  "TRANSFER_NOT_FOUND",
  "TX_FAILED",
  "TX_ALREADY_USED",
  "INVALID_TX_HASH",
  "UNSUPPORTED_TOKEN",
  "BELOW_MINIMUM",
]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function confirmWithRetry(hash: string, token: PaymentToken): Promise<PriorityLineDeposit[]> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const res = await api.post<{ deposits: PriorityLineDeposit[] }>(
        "/api/priority-line/deposit/confirm",
        { txHash: hash, token },
        { auth: true },
      );
      removePending(hash);
      return res.deposits;
    } catch (err) {
      lastErr = err;
      if (err instanceof ApiError) {
        if (err.code && PERMANENT_CONFIRM_ERRORS.has(err.code)) {
          removePending(hash);
          throw err;
        }
        // Other client errors (e.g. signed out) won't fix themselves by retrying; keep the hash
        // so it is recovered on the next visit. 409 TX_NOT_MINED is the only retryable 4xx.
        if (err.statusCode >= 400 && err.statusCode < 500 && err.statusCode !== 409) throw err;
      }
      // TX_NOT_MINED (backend RPC lagging) or a transient network/server error: wait and retry.
      await sleep(2000);
    }
  }
  throw lastErr;
}

/**
 * Records any transfers that were sent but never confirmed with the backend (closed tab,
 * dropped connection). Returns how many deposits were recovered.
 */
export async function recoverPendingPriorityLine(address: string): Promise<number> {
  const mine = readPending().filter((p) => p.address.toLowerCase() === address.toLowerCase());
  let recovered = 0;
  for (const p of mine) {
    try {
      const deposits = await confirmWithRetry(p.hash, p.token);
      recovered += deposits.length;
    } catch {
      // Left in storage (or dropped if permanent) — nothing else to do here.
    }
  }
  return recovered;
}

/* ── actions ────────────────────────────────────────────────────────────── */

export type DepositPhase = "preparing" | "awaiting-wallet" | "confirming";

/**
 * Sends `amountUsd` of `token` to the admin-configured deposit wallet, waits for it to mine,
 * then asks the backend to verify and record it (which assigns the Priority Line number).
 */
export async function depositPriorityLine(
  token: PaymentToken,
  amountUsd: number,
  onPhase?: (phase: DepositPhase) => void,
): Promise<PriorityLineDeposit[]> {
  await ensureAuth({ interactive: true });
  const account = getAccount(config);
  if (!account.address) throw new ApiError("Connect your wallet to continue.", 401, "CONNECT_WALLET");

  onPhase?.("preparing");
  const prepared = await api.post<PreparedDeposit>(
    "/api/priority-line/deposit/prepare",
    { token, amount: amountUsd },
    { auth: true },
  );

  if (!isCorrectAppChain(account.chainId)) {
    await switchChain(config, { chainId: APP_CHAIN_ID });
  }

  onPhase?.("awaiting-wallet");
  const hash = await writeContract(config, {
    address: prepared.tokenAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [prepared.depositWallet, BigInt(prepared.amountRaw)],
    chainId: APP_CHAIN_ID,
  });
  addPending({ address: account.address, hash, token });

  onPhase?.("confirming");
  await waitForTransactionReceipt(config, { hash });
  return confirmWithRetry(hash, token);
}

export async function requestPriorityLineWithdrawal(depositId: string): Promise<PriorityLineDeposit> {
  await ensureAuth({ interactive: true });
  return api.post<PriorityLineDeposit>("/api/priority-line/withdrawals", { depositId }, { auth: true });
}
