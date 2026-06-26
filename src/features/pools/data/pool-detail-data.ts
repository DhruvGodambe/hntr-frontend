import { pools } from "@/features/dashboard/data/home-data";
import { runningPools } from "@/features/pools/data/pools-data";

export type PoolDetailMetric = {
  label: string;
  value: string;
  subtext?: string;
  delta?: string;
  deltaVariant?: "success" | "danger";
};

export type PoolTransaction = {
  id: string;
  user: string;
  type: string;
  date: string;
  amount: string;
  txHash: string;
};

export type OtherPoolCard = {
  id: string;
  name: string;
  imageSeed: string;
  activityCurrent: number;
  activityTarget: number;
};

export type PoolDetail = {
  id: string;
  itemId: string;
  name: string;
  tokenName: string;
  creator: string;
  series: string;
  imageSeed: string;
  targetPriceEth: string;
  targetPriceUsd: string;
  communityRaisedEth: string;
  communityRaisedUsd: string;
  progress: number;
  progressSummary: string;
  lockMessage: string;
  metrics: PoolDetailMetric[];
  transactions: PoolTransaction[];
  otherPools: OtherPoolCard[];
};

const defaultTransactions: PoolTransaction[] = [
  {
    id: "tx-1",
    user: "0x71C...492",
    type: "POOL_DEPOSIT",
    date: "Jun 14, 2024",
    amount: "1.25 ETH",
    txHash: "0xabc123",
  },
  {
    id: "tx-2",
    user: "0x3fA...8e1",
    type: "POOL_DEPOSIT",
    date: "Jun 14, 2024",
    amount: "0.85 ETH",
    txHash: "0xdef456",
  },
  {
    id: "tx-3",
    user: "0x9b2...c07",
    type: "POOL_DEPOSIT",
    date: "Jun 13, 2024",
    amount: "2.10 ETH",
    txHash: "0xghi789",
  },
  {
    id: "tx-4",
    user: "0x5d4...a33",
    type: "POOL_DEPOSIT",
    date: "Jun 13, 2024",
    amount: "0.50 ETH",
    txHash: "0xjkl012",
  },
];

const defaultOtherPools: OtherPoolCard[] = [
  {
    id: "bayc-0291",
    name: "Bored Ape Yacht Club",
    imageSeed: "bayc-pool",
    activityCurrent: 5.1,
    activityTarget: 10,
  },
  {
    id: "punk-4521",
    name: "CryptoPunks",
    imageSeed: "punk-pool",
    activityCurrent: 7.2,
    activityTarget: 12,
  },
  {
    id: "azuki-4201",
    name: "Azuki",
    imageSeed: "azuki-4201",
    activityCurrent: 3.4,
    activityTarget: 8,
  },
  {
    id: "pudgy-1180",
    name: "Pudgy Penguins",
    imageSeed: "pudgy-pool",
    activityCurrent: 4.8,
    activityTarget: 9,
  },
];

const defaultMetrics: PoolDetailMetric[] = [
  {
    label: "AP (Gross Profit)",
    value: "10.00%",
    delta: "-0.2% vs avg",
    deltaVariant: "danger",
  },
  {
    label: "ETH Profit",
    value: "1.75",
    delta: "+0.05 week",
    deltaVariant: "success",
  },
  {
    label: "USDT Profit",
    value: "$4,198.00",
    subtext: "Unrealized PnL",
  },
  {
    label: "Participants",
    value: "132",
    subtext: "👤👤👤",
  },
];

const poolDetails: Record<string, PoolDetail> = {
  "fidenza-565": {
    id: "fidenza-565",
    itemId: "ART-FID-565",
    name: "Fidenza #565",
    tokenName: "Fidenza #565",
    creator: "TYLER HOBBS",
    series: "SERIES 1/999",
    imageSeed: "fidenza-565",
    targetPriceEth: "14.50 ETH",
    targetPriceUsd: "$31,900.00",
    communityRaisedEth: "11.20 ETH",
    communityRaisedUsd: "$24,640.00",
    progress: 77,
    progressSummary: "11.2 / 14.5 ETH (77.2%)",
    lockMessage: "Liquidity locked until pool target or timeout (7d remaining)",
    metrics: defaultMetrics,
    transactions: defaultTransactions,
    otherPools: defaultOtherPools,
  },
  "bayc-0291": {
    id: "bayc-0291",
    itemId: "#0291",
    name: "Bored Ape Yacht Club",
    tokenName: "BAYC #0291",
    creator: "YUGA LABS",
    series: "SERIES 1/10000",
    imageSeed: "bayc-pool",
    targetPriceEth: "50.00 ETH",
    targetPriceUsd: "$110,000.00",
    communityRaisedEth: "37.50 ETH",
    communityRaisedUsd: "$82,500.00",
    progress: 75,
    progressSummary: "37.5 / 50 ETH (75%)",
    lockMessage: "Liquidity locked until pool target or timeout (5d remaining)",
    metrics: defaultMetrics,
    transactions: defaultTransactions,
    otherPools: defaultOtherPools.filter((p) => p.id !== "bayc-0291"),
  },
  "punk-4521": {
    id: "punk-4521",
    itemId: "#4521",
    name: "CryptoPunks",
    tokenName: "Punk #4521",
    creator: "LARVA LABS",
    series: "SERIES 1/10000",
    imageSeed: "punk-pool",
    targetPriceEth: "80.00 ETH",
    targetPriceUsd: "$176,000.00",
    communityRaisedEth: "49.60 ETH",
    communityRaisedUsd: "$109,120.00",
    progress: 62,
    progressSummary: "49.6 / 80 ETH (62%)",
    lockMessage: "Liquidity locked until pool target or timeout (12d remaining)",
    metrics: defaultMetrics,
    transactions: defaultTransactions,
    otherPools: defaultOtherPools.filter((p) => p.id !== "punk-4521"),
  },
  "pudgy-1180": {
    id: "pudgy-1180",
    itemId: "#1180",
    name: "Pudgy Penguins",
    tokenName: "Pudgy #1180",
    creator: "PUDGY",
    series: "SERIES 1/8888",
    imageSeed: "pudgy-pool",
    targetPriceEth: "24.00 ETH",
    targetPriceUsd: "$52,800.00",
    communityRaisedEth: "21.10 ETH",
    communityRaisedUsd: "$46,420.00",
    progress: 88,
    progressSummary: "21.1 / 24 ETH (88%)",
    lockMessage: "Liquidity locked until pool target or timeout (2d remaining)",
    metrics: defaultMetrics,
    transactions: defaultTransactions,
    otherPools: defaultOtherPools.filter((p) => p.id !== "pudgy-1180"),
  },
  "bayc-3362": {
    id: "bayc-3362",
    itemId: "#3362",
    name: "Bored Ape Yacht Club",
    tokenName: "BAYC #3362",
    creator: "YUGA LABS",
    series: "SERIES 1/10000",
    imageSeed: "bayc-3362",
    targetPriceEth: "18.75 ETH",
    targetPriceUsd: "$41,283.77",
    communityRaisedEth: "9.11 ETH",
    communityRaisedUsd: "$19,843.01",
    progress: 48,
    progressSummary: "9.11 / 18.75 ETH (48.6%)",
    lockMessage: "Liquidity locked until pool target or timeout (9d remaining)",
    metrics: defaultMetrics,
    transactions: defaultTransactions,
    otherPools: defaultOtherPools,
  },
};

export function getPoolDetail(poolId: string): PoolDetail | undefined {
  if (poolDetails[poolId]) {
    return poolDetails[poolId];
  }

  const running = runningPools.find((pool) => pool.id === poolId);
  if (running) {
    return buildDetailFromRunningPool(running);
  }

  const featured = pools.find((pool) => pool.id === poolId);
  if (featured) {
    return buildDetailFromFeaturedPool(featured);
  }

  return undefined;
}

function buildDetailFromRunningPool(
  pool: (typeof runningPools)[number],
): PoolDetail {
  const target = parseFloat(pool.target);
  const raised = parseFloat(pool.raised);

  return {
    id: pool.id,
    itemId: pool.poolId.replace("ID: ", ""),
    name: pool.name,
    tokenName: pool.name,
    creator: "INSTITUTIONAL",
    series: "SERIES 1/10000",
    imageSeed: pool.imageSeed,
    targetPriceEth: pool.target,
    targetPriceUsd: "—",
    communityRaisedEth: pool.raised,
    communityRaisedUsd: "—",
    progress: pool.stakePercent,
    progressSummary: `${raised} / ${target} ETH (${pool.stakePercent}%)`,
    lockMessage: "Liquidity locked until pool target or timeout (7d remaining)",
    metrics: defaultMetrics,
    transactions: defaultTransactions,
    otherPools: defaultOtherPools.filter((item) => item.id !== pool.id),
  };
}

function buildDetailFromFeaturedPool(
  pool: (typeof pools)[number],
): PoolDetail {
  return {
    id: pool.id,
    itemId: pool.tokenId.replace("#", ""),
    name: pool.name,
    tokenName: `${pool.name.split(" ")[0]} ${pool.tokenId}`,
    creator: pool.creator,
    series: pool.series,
    imageSeed: pool.imageSeed,
    targetPriceEth: pool.poolTargetEth,
    targetPriceUsd: pool.poolTargetUsd,
    communityRaisedEth: pool.communityRaisedEth,
    communityRaisedUsd: pool.communityRaisedUsd,
    progress: pool.progress,
    progressSummary: `${pool.communityRaisedEth.replace(" ETH", "")} / ${pool.poolTargetEth.replace(" ETH", "")} ETH (${pool.progress}%)`,
    lockMessage: "Liquidity locked until pool target or timeout (7d remaining)",
    metrics: [
      {
        label: "AP (Gross Profit)",
        value: pool.gpProfit,
        delta: "-0.2% vs avg",
        deltaVariant: "danger",
      },
      {
        label: "ETH Profit",
        value: pool.ethProfit.replace(" ETH", ""),
        delta: "+0.05 week",
        deltaVariant: "success",
      },
      {
        label: "USDT Profit",
        value: pool.usdtProfit,
        subtext: "Unrealized PnL",
      },
      {
        label: "Participants",
        value: pool.users,
        subtext: "👤👤👤",
      },
    ],
    transactions: defaultTransactions,
    otherPools: defaultOtherPools,
  };
}

export const poolTransactionPagination = {
  from: 1,
  to: 4,
  total: 1244,
};
