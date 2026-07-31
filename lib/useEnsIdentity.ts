"use client";

import { useEnsAvatar, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

type EnsIdentity = {
  ensName?: string | null;
  ensAvatar?: string | null;
  /** ENS name when set, otherwise a shortened address. */
  label: string;
};

function fallbackLabel(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-3)}`;
}

/**
 * Resolve mainnet ENS name + avatar for a wallet (works while connected to Sepolia).
 */
export function useEnsIdentity(address?: `0x${string}`): EnsIdentity {
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
    query: { enabled: Boolean(address) },
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: mainnet.id,
    query: { enabled: Boolean(ensName) },
  });

  const label = ensName
    ? ensName.length > 18
      ? `${ensName.slice(0, 14)}…`
      : ensName
    : fallbackLabel(address);

  return { ensName, ensAvatar, label };
}
