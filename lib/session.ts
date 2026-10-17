"use client";

import { useSyncExternalStore } from "react";
import { useAccount } from "wagmi";
import { getStoredAuthSnapshot, subscribeStoredAuth } from "./api";

/**
 * "Who is the app showing?" for read-only data and navigation.
 *
 * - Normal member: the connected wallet.
 * - Super-login (operator viewing a member): the member's wallet from the stored session, and it always
 *   wins over a wallet that happens to be connected in the same browser. The session token is only valid
 *   for that member, so asking for the connected wallet's data with it is rejected by the backend.
 *
 * Write actions (claiming, depositing, signing) must keep using wagmi's `useAccount()` directly: they need
 * a real connected wallet, and a super-login session is read-only anyway.
 */
export function useEffectiveAccount() {
  const wagmi = useAccount();
  // Server snapshot is null so the first client render matches the server HTML; it updates right after hydration.
  const stored = useSyncExternalStore(subscribeStoredAuth, getStoredAuthSnapshot, () => null);

  const isImpersonation = !!stored?.isImpersonation;
  const address = isImpersonation ? (stored!.walletAddress as `0x${string}`) : wagmi.address;
  const isConnected = isImpersonation || wagmi.isConnected;

  return { ...wagmi, address, isConnected, isImpersonation, viewingUsername: isImpersonation ? stored!.username : undefined };
}
