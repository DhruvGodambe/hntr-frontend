"use client";

import { useAccount } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import {
  APP_CHAIN_ID,
  NETWORK_SWITCHER,
  chainLabel,
  isCorrectAppChain,
  shortChainLabel,
} from "../../../../lib/contracts";

function dotClass(chainId: number | undefined): string {
  if (chainId === sepolia.id) return "test";
  if (chainId === mainnet.id) return "main";
  return "unknown";
}

/**
 * Read-only network badge. App network is set by NEXT_PUBLIC_NETWORK
 * (NETWORK_SWITCHER); this only shows which chain the wallet is on.
 * Warns visually when the wallet is on the wrong chain for this deploy.
 */
export default function NetworkSwitcher() {
  const { chainId, isConnected } = useAccount();

  const displayId = isConnected && chainId != null ? chainId : APP_CHAIN_ID;
  const wrongNetwork = isConnected && chainId != null && !isCorrectAppChain(chainId);
  const label = shortChainLabel(isConnected && chainId != null ? chainId : APP_CHAIN_ID);

  const title = !isConnected
    ? `App network: ${chainLabel(APP_CHAIN_ID)} (${NETWORK_SWITCHER}). Connect a wallet to see your chain.`
    : wrongNetwork
      ? `Connected to ${chainLabel(chainId)}. This deploy expects ${chainLabel(APP_CHAIN_ID)} (${NETWORK_SWITCHER}). Switch in your wallet.`
      : `Connected to ${chainLabel(chainId)}`;

  return (
    <div
      className={`net-switch net-badge${wrongNetwork ? " warn" : ""}${isConnected && !wrongNetwork ? " ok" : ""}`}
      title={title}
    >
      <div
        className="net-switch-btn"
        role="status"
        aria-label={title}
      >
        <span className={`net-switch-dot ${dotClass(displayId)}`} />
        <span className="net-switch-label">{label}</span>
      </div>
    </div>
  );
}
