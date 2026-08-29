"use client";

import type { ReactNode } from "react";
import { formatEther } from "viem";
import { useEthUsdPrice } from "../../../../lib/coingecko";

type WalletPanelProps = {
  open: boolean;
  walletAddressLabel: string;
  walletAvatar?: ReactNode;
  ensName?: string | null;
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
  walletAvatar,
  ensName,
  balanceValue,
  balanceSymbol,
  onDisconnect,
}: WalletPanelProps) {
  const { data: ethUsd } = useEthUsdPrice();
  const ethAmount = balanceValue !== undefined ? Number(formatEther(balanceValue)) : 0;

  return (
    <div className={`wallet-panel${open ? " open" : ""}`} id="walletPanel">
      <div className="wallet-panel-top">
        <div className="wallet-panel-lbl">Connected Wallet</div>
        <div className="wallet-address-row">
          {walletAvatar ? (
            <span className="wallet-avatar" aria-hidden>
              {walletAvatar}
            </span>
          ) : (
            <div className="wallet-dot" />
          )}
          <div className="wallet-identity">
            <div className="wallet-address">{walletAddressLabel}</div>
            {ensName ? <div className="wallet-ens-hint">ENS verified</div> : null}
          </div>
        </div>
      </div>
      <div className="wallet-panel-balance">
        <div className="wallet-balance-lbl">Total Balance</div>
        <div className="wallet-balance-val">
          {balanceValue !== undefined ? ethAmount.toFixed(4) : "0.0000"}{" "}
          <span style={{ fontSize: "14px", color: "var(--t2)" }}>{balanceSymbol || "ETH"}</span>
        </div>
        <div className="wallet-balance-usd">{formatUsdEquivalent(ethAmount, ethUsd)}</div>
      </div>
      <div className="wallet-panel-footer">
        <button className="wallet-disconnect-btn" type="button" onClick={onDisconnect}>
          DISCONNECT
        </button>
      </div>
    </div>
  );
}
