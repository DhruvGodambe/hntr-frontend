"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getStoredAuth, type StoredAuth } from "./api";

/**
 * Merges the live wagmi wallet connection with a stored super-login session, so a
 * read-only impersonation session (no wallet actually connected in-browser) can
 * drive read-only dashboard/network data fetching exactly like a normal signed-in
 * wallet. Write actions (claiming, signing) must keep using wagmi's `useAccount()`
 * directly — they still require a real connected wallet.
 */
export function useEffectiveAccount() {
  const wagmi = useAccount();
  const [stored, setStored] = useState<StoredAuth | null>(null);

  useEffect(() => {
    const sync = () => setStored(getStoredAuth());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const isImpersonation = !!stored?.isImpersonation;
  const address = wagmi.address ?? (isImpersonation ? (stored!.walletAddress as `0x${string}`) : undefined);
  const isConnected = wagmi.isConnected || isImpersonation;

  return { ...wagmi, address, isConnected, isImpersonation };
}
