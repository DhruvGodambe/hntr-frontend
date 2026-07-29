"use client";

import { formatEther } from "viem";

type WalletPanelProps = {
  open: boolean;
  walletAddressLabel: string;
  balanceValue?: bigint;
  balanceSymbol?: string;
  onDisconnect: () => void;
};

export default function WalletPanel({
  open,
  walletAddressLabel,
  balanceValue,
  balanceSymbol,
  onDisconnect,
}: WalletPanelProps) {
  return (
    <div className={`wallet-panel${open ? " open" : ""}`} id="walletPanel">
      <div className="wallet-panel-top">
        <div className="wallet-panel-lbl">Connected Wallet</div>
        <div className="wallet-address-row">
          <div className="wallet-dot" />
          <div className="wallet-address">{walletAddressLabel}</div>
        </div>
      </div>
      <div className="wallet-panel-balance">
        <div className="wallet-balance-lbl">Total Balance</div>
        <div className="wallet-balance-val">
          {balanceValue !== undefined ? Number(formatEther(balanceValue)).toFixed(4) : "0.0000"}{" "}
          <span style={{ fontSize: "14px", color: "var(--t2)" }}>{balanceSymbol || "ETH"}</span>
        </div>
        <div className="wallet-balance-usd">Sepolia testnet balance</div>
      </div>
      <div className="wallet-panel-footer">
        <button className="wallet-disconnect-btn" type="button" onClick={onDisconnect}>
          DISCONNECT
        </button>
      </div>
    </div>
  );
}
