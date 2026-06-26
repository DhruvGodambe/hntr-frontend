export type VaultMetric = {
  label: string;
  value: string;
  delta?: string;
};

export type CollectionFilter = {
  id: string;
  name: string;
  count: number;
};

export type PortfolioSegment = {
  label: string;
  percent: number;
  colorClass: string;
};

export type VaultNFT = {
  id: string;
  name: string;
  collectionId: string;
  poolId: string;
  boughtPrice: string;
  sellPrice: string;
  apy: string;
  imageSeed: string;
};

export type NetworkActivity = {
  id: string;
  asset: string;
  event: string;
  price: string;
  source: string;
  time: string;
};

export const vaultHero = {
  title: "HNTR VAULT",
  subtitle: "INSTITUTIONAL NFT LIQUIDITY & VAULT ACCESS",
  cta: "Join today",
};

export const vaultMetrics: VaultMetric[] = [
  { label: "Total Protocol Value", value: "$24.8M", delta: "+4.2%" },
  { label: "Total NFTs Owned", value: "1,420" },
  { label: "Avg. Vault Yield", value: "12.4% APY" },
  { label: "Liquidity Position", value: "$5.2M (WETH)" },
];

export const collectionFilters: CollectionFilter[] = [
  { id: "punks", name: "CryptoPunks", count: 42 },
  { id: "bayc", name: "Bored Ape Yacht Club", count: 128 },
  { id: "azuki", name: "Azuki", count: 64 },
  { id: "fidenza", name: "Fidenza", count: 36 },
  { id: "pudgy", name: "Pudgy Penguins", count: 88 },
  { id: "art", name: "Art Blocks", count: 52 },
];

export const portfolioDistribution: PortfolioSegment[] = [
  { label: "Punks", percent: 28, colorClass: "bg-[var(--olive)]" },
  { label: "BAYC", percent: 42, colorClass: "bg-t4" },
  { label: "Art", percent: 30, colorClass: "bg-[var(--sage)]" },
];

export const vaultNfts: VaultNFT[] = [
  {
    id: "1",
    name: "BAYC #9112",
    collectionId: "bayc",
    poolId: "bayc-3362",
    boughtPrice: "6.75 ETH",
    sellPrice: "7.75 ETH",
    apy: "+18.3%",
    imageSeed: "bayc-9112",
  },
  {
    id: "2",
    name: "BAYC #3392",
    collectionId: "bayc",
    poolId: "bayc-3392",
    boughtPrice: "17.40 ETH",
    sellPrice: "18.75 ETH",
    apy: "+7.8%",
    imageSeed: "bayc-3392",
  },
  {
    id: "3",
    name: "Punk #8822",
    collectionId: "punks",
    poolId: "punk-4521",
    boughtPrice: "88.00 ETH",
    sellPrice: "95.00 ETH",
    apy: "+8.0%",
    imageSeed: "punk-8822",
  },
  {
    id: "4",
    name: "Pudgy #2210",
    collectionId: "pudgy",
    poolId: "pudgy-1180",
    boughtPrice: "11.80 ETH",
    sellPrice: "12.40 ETH",
    apy: "+5.1%",
    imageSeed: "pudgy-2210",
  },
  {
    id: "5",
    name: "Fidenza #565",
    collectionId: "fidenza",
    poolId: "fidenza-565",
    boughtPrice: "13.90 ETH",
    sellPrice: "14.50 ETH",
    apy: "+4.3%",
    imageSeed: "fidenza-565",
  },
  {
    id: "6",
    name: "Azuki #4201",
    collectionId: "azuki",
    poolId: "bayc-3362",
    boughtPrice: "8.20 ETH",
    sellPrice: "9.10 ETH",
    apy: "+11.0%",
    imageSeed: "azuki-4201",
  },
  {
    id: "7",
    name: "BAYC #1044",
    collectionId: "bayc",
    poolId: "bayc-3362",
    boughtPrice: "17.20 ETH",
    sellPrice: "17.90 ETH",
    apy: "+4.1%",
    imageSeed: "bayc-1044",
  },
  {
    id: "8",
    name: "Chromie #935",
    collectionId: "art",
    poolId: "fidenza-565",
    boughtPrice: "7.80 ETH",
    sellPrice: "8.45 ETH",
    apy: "+8.3%",
    imageSeed: "chromie-935",
  },
];

export const networkActivity: NetworkActivity[] = [
  {
    id: "a1",
    asset: "BAYC #9112",
    event: "PURCHASE",
    price: "6.75 ETH",
    source: "Blur.io",
    time: "2m ago",
  },
  {
    id: "a2",
    asset: "Punk #8822",
    event: "SALE",
    price: "95.00 ETH",
    source: "OpenSea",
    time: "14m ago",
  },
  {
    id: "a3",
    asset: "Fidenza #565",
    event: "PURCHASE",
    price: "13.90 ETH",
    source: "Blur.io",
    time: "28m ago",
  },
  {
    id: "a4",
    asset: "Pudgy #2210",
    event: "SALE",
    price: "12.40 ETH",
    source: "OpenSea",
    time: "1h ago",
  },
  {
    id: "a5",
    asset: "Azuki #4201",
    event: "PURCHASE",
    price: "8.20 ETH",
    source: "Blur.io",
    time: "2h ago",
  },
];
