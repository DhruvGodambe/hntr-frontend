export type PoolItem = {
  id: string;
  name: string;
  tokenId: string;
  creator: string;
  series: string;
  poolTargetEth: string;
  poolTargetUsd: string;
  communityRaisedEth: string;
  communityRaisedUsd: string;
  progress: number;
  imageBgClass: string;
  imageSeed: string;
  gpProfit: string;
  ethProfit: string;
  usdtProfit: string;
  users: string;
};

export type ListingItem = {
  id: string;
  name: string;
  boughtPrice: string;
  sellPrice: string;
  imageSeed: string;
  source: "OpenSea" | "Blur";
};

export type SaleItem = {
  id: string;
  name: string;
  boughtPrice: string;
  soldPrice: string;
  profit: string;
  status: "SOLD" | "SALE";
  imageSeed: string;
};

export type MarketMetric = {
  label: string;
  value: string;
};

export type RankedCollection = {
  id: string;
  name: string;
  floorPrice: string;
  volume24h?: string;
  change?: number;
  imageSeed: string;
};

export const heroContent = {
  title: "HNTR",
  subtitle: "YOUR GATEWAY TO THE NFT UNIVERSE",
  cta: "Join today",
};

export const partners = [
  { id: "uniswap", name: "Uniswap" },
  { id: "pudgy", name: "Pudgy Penguins" },
  { id: "opensea", name: "OpenSea" },
  { id: "yuga", name: "Yuga Labs" },
  { id: "blur", name: "Blur" },
  { id: "magiceden", name: "Magic Eden" },
  { id: "looksrare", name: "LooksRare" },
];

export const pools: PoolItem[] = [
  {
    id: "bayc-3362",
    name: "Bored Ape Yacht Club",
    tokenId: "#3362",
    creator: "YUGA LABS",
    series: "SERIES 1/10000",
    poolTargetEth: "18.75 ETH",
    poolTargetUsd: "$41,283.77",
    communityRaisedEth: "9.11 ETH",
    communityRaisedUsd: "$19,843.01",
    progress: 48,
    imageBgClass: "bg-[#5eb8b0] dark:bg-[#2d5248]",
    imageSeed: "bayc-3362",
    gpProfit: "10.00%",
    ethProfit: "1.75 ETH",
    usdtProfit: "$4,198",
    users: "132",
  },
  {
    id: "pudgy-4421",
    name: "Pudgy Penguins",
    tokenId: "#4421",
    creator: "PUDGY",
    series: "SERIES 1/8888",
    poolTargetEth: "12.40 ETH",
    poolTargetUsd: "$27,312.40",
    communityRaisedEth: "5.95 ETH",
    communityRaisedUsd: "$13,110.05",
    progress: 48,
    imageBgClass: "bg-[#c4d8e8] dark:bg-[#2d3f52]",
    imageSeed: "pudgy-4421",
    gpProfit: "8.50%",
    ethProfit: "1.05 ETH",
    usdtProfit: "$2,310",
    users: "98",
  },
  {
    id: "bayc-3392",
    name: "Bored Ape Yacht Club",
    tokenId: "#3392",
    creator: "YUGA LABS",
    series: "SERIES 1/10000",
    poolTargetEth: "24.00 ETH",
    poolTargetUsd: "$52,800.00",
    communityRaisedEth: "11.52 ETH",
    communityRaisedUsd: "$25,344.00",
    progress: 48,
    imageBgClass: "bg-[#d0d4c8] dark:bg-[#353a32]",
    imageSeed: "bayc-3392",
    gpProfit: "12.00%",
    ethProfit: "2.10 ETH",
    usdtProfit: "$4,620",
    users: "156",
  },
  {
    id: "pudgy-1102",
    name: "Pudgy Penguins",
    tokenId: "#1102",
    creator: "PUDGY",
    series: "SERIES 1/8888",
    poolTargetEth: "10.80 ETH",
    poolTargetUsd: "$23,760.00",
    communityRaisedEth: "4.86 ETH",
    communityRaisedUsd: "$10,692.00",
    progress: 45,
    imageBgClass: "bg-[#b8d4e8] dark:bg-[#243848]",
    imageSeed: "pudgy-1102",
    gpProfit: "7.25%",
    ethProfit: "0.78 ETH",
    usdtProfit: "$1,716",
    users: "74",
  },
];

export const listings: ListingItem[] = [
  {
    id: "bayc-9172",
    name: "BAYC #9172",
    boughtPrice: "17.40 ETH",
    sellPrice: "18.75 ETH",
    imageSeed: "bayc-9172",
    source: "OpenSea",
  },
  {
    id: "pudgy-2210",
    name: "Pudgy #2210",
    boughtPrice: "11.80 ETH",
    sellPrice: "12.40 ETH",
    imageSeed: "pudgy-2210",
    source: "Blur",
  },
  {
    id: "fidenza-565",
    name: "Fidenza #565",
    boughtPrice: "13.90 ETH",
    sellPrice: "14.50 ETH",
    imageSeed: "fidenza-565",
    source: "OpenSea",
  },
  {
    id: "chromie-935",
    name: "Chromie #935",
    boughtPrice: "7.80 ETH",
    sellPrice: "8.20 ETH",
    imageSeed: "chromie-935",
    source: "Blur",
  },
  {
    id: "bayc-1044",
    name: "BAYC #1044",
    boughtPrice: "17.20 ETH",
    sellPrice: "17.90 ETH",
    imageSeed: "bayc-1044",
    source: "OpenSea",
  },
  {
    id: "punk-8822",
    name: "Punk #8822",
    boughtPrice: "88.00 ETH",
    sellPrice: "95.00 ETH",
    imageSeed: "punk-8822",
    source: "Blur",
  },
];

export const sales: SaleItem[] = [
  {
    id: "s1",
    name: "BAYC #9112",
    boughtPrice: "6.75 ETH",
    soldPrice: "7.15 ETH",
    profit: "+0.40 ETH",
    status: "SOLD",
    imageSeed: "bayc-9112",
  },
  {
    id: "s2",
    name: "Pudgy #1102",
    boughtPrice: "10.20 ETH",
    soldPrice: "11.80 ETH",
    profit: "+1.60 ETH",
    status: "SOLD",
    imageSeed: "pudgy-1102",
  },
  {
    id: "s3",
    name: "Punk #7804",
    boughtPrice: "82.00 ETH",
    soldPrice: "91.00 ETH",
    profit: "+9.00 ETH",
    status: "SOLD",
    imageSeed: "punk-7804",
  },
  {
    id: "s4",
    name: "Fidenza #565",
    boughtPrice: "13.50 ETH",
    soldPrice: "14.90 ETH",
    profit: "+1.40 ETH",
    status: "SALE",
    imageSeed: "fidenza-565-sale",
  },
  {
    id: "s5",
    name: "BAYC #3392",
    boughtPrice: "16.40 ETH",
    soldPrice: "17.20 ETH",
    profit: "+0.80 ETH",
    status: "SOLD",
    imageSeed: "bayc-3392-sale",
  },
  {
    id: "s6",
    name: "Chromie #935",
    boughtPrice: "7.50 ETH",
    soldPrice: "8.45 ETH",
    profit: "+0.95 ETH",
    status: "SALE",
    imageSeed: "chromie-935-sale",
  },
];

export const marketMetrics: MarketMetric[] = [
  { label: "Total Volume (24H)", value: "42,819 ETH" },
  { label: "Active Collections", value: "1,204" },
  { label: "ETH Gas", value: "12 Gwei" },
  { label: "NFT Dominance", value: "8.4 %" },
];

export const topCollections: RankedCollection[] = [
  {
    id: "1",
    name: "CryptoPunks",
    floorPrice: "30.7900",
    change: -0.1,
    imageSeed: "cryptopunks",
  },
  {
    id: "2",
    name: "Autoglyphs",
    floorPrice: "85.0000",
    change: 0,
    imageSeed: "autoglyphs",
  },
  {
    id: "3",
    name: "Fidenza by Tyler Hobbs",
    floorPrice: "16.4500",
    change: 0,
    imageSeed: "fidenza",
  },
  {
    id: "4",
    name: "Bored Ape Yacht Club",
    floorPrice: "7.7994",
    change: -2.44,
    imageSeed: "bayc",
  },
  {
    id: "5",
    name: "Pudgy Penguins",
    floorPrice: "4.3499",
    change: 6.1,
    imageSeed: "pudgy",
  },
];

export const trendingCollections: RankedCollection[] = [
  {
    id: "6",
    name: "Nakamigos",
    floorPrice: "0.1358",
    volume24h: "5.4801",
    imageSeed: "nakamigos",
  },
  {
    id: "7",
    name: "NORMIES",
    floorPrice: "0.4544",
    volume24h: "17.7327",
    imageSeed: "normies",
  },
  {
    id: "8",
    name: "Kaito Genesis",
    floorPrice: "0.1500",
    volume24h: "3.4152",
    imageSeed: "kaito",
  },
  {
    id: "9",
    name: "Lil Pudgys",
    floorPrice: "0.4456",
    volume24h: "9.9610",
    imageSeed: "lil-pudgys",
  },
  {
    id: "10",
    name: "Invisible Friends",
    floorPrice: "0.1244",
    volume24h: "2.7875",
    imageSeed: "invisible-friends",
  },
];

export const topMovers: RankedCollection[] = [
  {
    id: "11",
    name: "Kaito Genesis",
    floorPrice: "0.1500",
    change: 41.65,
    imageSeed: "kaito-mover",
  },
  {
    id: "12",
    name: "VeeFriends",
    floorPrice: "1.8390",
    change: 28.79,
    imageSeed: "veefriends",
  },
  {
    id: "13",
    name: "Bored Ape Kennel Club",
    floorPrice: "0.3000",
    change: 13.48,
    imageSeed: "bakc",
  },
  {
    id: "14",
    name: "Pudgy Rods",
    floorPrice: "0.1250",
    change: -5.67,
    imageSeed: "pudgy-rods",
  },
  {
    id: "15",
    name: "Terraform by Mathcastles",
    floorPrice: "0.3001",
    change: -6.64,
    imageSeed: "terraform",
  },
];

export type RewardTier = {
  id: string;
  title: string;
  tag: string;
  description: string;
  amount: string;
  icon: "referral" | "pool";
};

export type ActivityItem = {
  id: string;
  icon: string;
  name: string;
  action: string;
  value: string;
  positive: boolean;
  timeAgo: string;
};

export const rightPanelData = {
  username: "masteraccount",
  badge: "ELITE",
  title: "Elite Hunter",
  progress: 74,
  progressStart: "Hunter Elite",
  progressEnd: "Hunter Legend",
  totalRewarded: {
    value: "$119,551.44",
    delta: "↑+4.2% This Month",
  },
  hntrPoints: {
    value: "6,913,586",
    subtitle: "— Lifetime",
  },
  membership: {
    tier: "RANGER",
    tierSubtitle: "Current Tier",
    networkUsers: "12,482",
    growth: "↑+1.6% Growth",
  },
  rewardTiers: [
    {
      id: "referral",
      title: "Referral Commission",
      tag: "INSTANT",
      description: "Instant earnings from direct referral volume",
      amount: "$42,301.12",
      icon: "referral" as const,
    },
    {
      id: "pool",
      title: "Pool Rewards",
      tag: "RSK·TYPE",
      description: "Proportional distribution from NFT strategy pools",
      amount: "$18,442.80",
      icon: "pool" as const,
    },
  ] satisfies RewardTier[],
  activityTabs: ["All Perso", "Bids", "Sales"] as const,
  activity: [
    {
      id: "a1",
      icon: "🐧",
      name: "Pudgy Penguin #3362",
      action: "DEPOSITED",
      value: "2.4 Ξ",
      positive: true,
      timeAgo: "2m",
    },
    {
      id: "a2",
      icon: "🦧",
      name: "BAYC #9112",
      action: "LISTED",
      value: "$19,400",
      positive: true,
      timeAgo: "5m",
    },
    {
      id: "a3",
      icon: "👾",
      name: "CryptoPunk #7804",
      action: "SOLD",
      value: "$91,000",
      positive: true,
      timeAgo: "12m",
    },
    {
      id: "a4",
      icon: "🐧",
      name: "Pudgy Penguin #1021",
      action: "BID PLACED",
      value: "3.1 Ξ",
      positive: true,
      timeAgo: "22m",
    },
    {
      id: "a5",
      icon: "🦧",
      name: "BAYC #5678",
      action: "RENEWED",
      value: "+14% APY",
      positive: true,
      timeAgo: "34m",
    },
    {
      id: "a6",
      icon: "🎨",
      name: "Normie #2265",
      action: "SOLD",
      value: "$4,200",
      positive: true,
      timeAgo: "1h",
    },
  ] satisfies ActivityItem[],
};
