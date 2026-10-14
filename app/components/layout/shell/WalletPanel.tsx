"use client";

import { formatEther } from "viem";
import { useEthUsdPrice } from "../../../../lib/coingecko";
import { APP_CHAIN_ID, chainLabel, isCorrectAppChain } from "../../../../lib/contracts";

type WalletPanelProps = {
  open: boolean;
  walletAddressLabel: string;
  ensName?: string | null;
  chainId?: number;
  balanceValue?: bigint;
  balanceSymbol?: string;
  onDisconnect: () => void;
};

function formatUsdEquivalent(ethAmount: number, ethUsd: number | undefined): string {
  if (ethUsd == null) return "≈ — USD";
  const usd = ethAmount * ethUsd;
  return `≈ $${usd.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}

export default function WalletPanel({
  open,
  walletAddressLabel,
  ensName,
  chainId,
  balanceValue,
  balanceSymbol,
  onDisconnect,
}: WalletPanelProps) {
  const { data: ethUsd } = useEthUsdPrice();
  const ethAmount = balanceValue !== undefined ? Number(formatEther(balanceValue)) : 0;
  const wrongNetwork = chainId != null && !isCorrectAppChain(chainId);

  return (
    <div className={`wallet-panel${open ? " open" : ""}`} id="walletPanel">
      <div className="wallet-panel-top">
        <div className="wallet-panel-lbl">Connected Wallet</div>
        <div className="wallet-address-row">
          <div className="wallet-dot" />
          <div className="wallet-address">{walletAddressLabel}</div>
        </div>
        {ensName ? <div className="wallet-balance-usd">ENS verified</div> : null}
      </div>
      <div className="wallet-panel-balance">
        <div className="wallet-balance-lbl">Total Balance</div>
        <div className="wallet-balance-val">
          {balanceValue !== undefined ? ethAmount.toFixed(4) : "0.0000"}{" "}
          <span style={{ fontSize: "14px", color: "var(--t2)" }}>{balanceSymbol || "ETH"}</span>
        </div>
        <div className="wallet-balance-usd">{formatUsdEquivalent(ethAmount, ethUsd)}</div>
        <div className="wallet-balance-usd" style={{ color: wrongNetwork ? "#ff8a1f" : undefined }}>
          {wrongNetwork
            ? `Wrong network: ${chainLabel(chainId)}. Switch to ${chainLabel(APP_CHAIN_ID)} in your wallet.`
            : `Network: ${chainLabel(chainId ?? APP_CHAIN_ID)}`}
        </div>
      </div>
      <div className="wallet-panel-footer">
        <button className="wallet-disconnect-btn" type="button" onClick={onDisconnect}>
          DISCONNECT
        </button>
      </div>
    </div>
  );
}
