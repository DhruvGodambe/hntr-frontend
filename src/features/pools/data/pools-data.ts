export type PoolMetric = {
  label: string;
  value: string;
  subtext?: string;
  delta?: string;
};

export type RunningPool = {
  id: string;
  name: string;
  poolId: string;
  stakePercent: number;
  imageSeed: string;
  target: string;
  raised: string;
  premium: string;
  userStake: string;
};

export type PoolActivity = {
  id: string;
  wallet: string;
  bidAmount: string;
  collection: string;
  collectionSeed: string;
  completion: number;
  txHash: string;
};

export const poolsHero = {
  title: "Active NFT Pools",
  subtitle:
    "Real-time institutional liquidity oversight across high-value NFT collaterals.",
};

export const poolsMetrics: PoolMetric[] = [
  {
    label: "Total ETH Raised",
    value: "12.4 ETH",
    subtext: "$28,520",
  },
  {
    label: "NFT Strategy Available",
    value: "14 Pools",
  },
  {
    label: "Avg. LTV",
    value: "42.8%",
  },
  {
    label: "Total Users",
    value: "2,193",
    delta: "+2.4%",
  },
];

export const runningPools: RunningPool[] = [
  {
    id: "bayc-0291",
    name: "Bored Ape Yacht Club",
    poolId: "ID: #0291",
    stakePercent: 75,
    imageSeed: "bayc-0291",
    target: "50 ETH",
    raised: "37.5 ETH",
    premium: "2.4%",
    userStake: "4.2 ETH",
  },
  {
    id: "punk-4521",
    name: "CryptoPunks",
    poolId: "ID: #4521",
    stakePercent: 62,
    imageSeed: "punk-4521",
    target: "80 ETH",
    raised: "49.6 ETH",
    premium: "3.1%",
    userStake: "4.8 ETH",
  },
  {
    id: "pudgy-1180",
    name: "Pudgy Penguins",
    poolId: "ID: #1180",
    stakePercent: 88,
    imageSeed: "pudgy-1180",
    target: "24 ETH",
    raised: "21.1 ETH",
    premium: "1.9%",
    userStake: "2.1 ETH",
  },
];

export const poolActivity: PoolActivity[] = [
  {
    id: "act-1",
    wallet: "0x71C...492",
    bidAmount: "2.40 ETH",
    collection: "BAYC #3362",
    collectionSeed: "bayc-3362",
    completion: 82,
    txHash: "0xabc123",
  },
  {
    id: "act-2",
    wallet: "0x3fA...8e1",
    bidAmount: "1.15 ETH",
    collection: "Punk #8822",
    collectionSeed: "punk-8822",
    completion: 64,
    txHash: "0xdef456",
  },
  {
    id: "act-3",
    wallet: "0x9b2...c07",
    bidAmount: "0.85 ETH",
    collection: "Pudgy #6523",
    collectionSeed: "pudgy-6523",
    completion: 91,
    txHash: "0xghi789",
  },
  {
    id: "act-4",
    wallet: "0x5d4...a33",
    bidAmount: "3.20 ETH",
    collection: "Fidenza #565",
    collectionSeed: "fidenza-565",
    completion: 45,
    txHash: "0xjkl012",
  },
  {
    id: "act-5",
    wallet: "0xe18...7f9",
    bidAmount: "0.62 ETH",
    collection: "Azuki #4201",
    collectionSeed: "azuki-4201",
    completion: 73,
    txHash: "0xmno345",
  },
];
