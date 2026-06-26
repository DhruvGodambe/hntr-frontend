export const depositDefaults = {
  availableBalanceEth: 4.25,
  ethUsdRate: 2200,
  membership: {
    tier: "RANGER",
    price: "$750",
    poolsUsed: 5,
    poolsLimit: 7,
    maxDepositUsed: "$1500",
    maxDepositLimit: "$7500",
  },
  explorerTxUrl: "https://etherscan.io/tx/0xabc123def456",
};

export function ethToUsd(eth: number, rate = depositDefaults.ethUsdRate): number {
  return eth * rate;
}

export function parseEthAmount(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatEthAmount(value: number): string {
  return value.toFixed(2);
}

export function formatUsdAmount(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
