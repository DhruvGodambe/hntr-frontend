export type CollectionFilter = {
  id: string;
  name: string;
  count: number;
};

export type OwnedNFT = {
  id: string;
  name: string;
  tokenId: string;
  collectionId: string;
  imageSeed: string;
  poolTag: string;
  sharePercent: number;
  listedPriceEth: string;
  listedPriceUsd: string;
  shareValueEth: string;
  profit: string;
  status: "listed" | "sold";
  poolId: string;
};

export const collectionHero = {
  title: "MY NFT COLLECTION",
  subtitle: "Real-time oversight across all your NFT positions.",
};

export const collectionStats = [
  { label: "NFT Owned", value: "14", unit: "NFTs" },
  {
    label: "Total NFTs Value",
    value: "30",
    unit: "ETH",
    sub: "$65,000.32",
  },
  { label: "Unrealized Profit", value: "42.8", unit: "%" },
  {
    label: "Unrealized Profit",
    value: "15",
    unit: "ETH",
    sub: "$35,000.32",
  },
] as const;

export const collectionFilters: CollectionFilter[] = [
  { id: "cryptopunks", name: "CryptoPunks", count: 24 },
  { id: "bayc", name: "Bored Ape Yacht Club", count: 12 },
  { id: "azuki", name: "Azuki", count: 48 },
  { id: "fidenza", name: "Fidenza", count: 8 },
];

export const portfolioDistribution = [
  { label: "Punks", percent: 35, color: "var(--dist-punks)" },
  { label: "BAYC", percent: 28, color: "var(--dist-bayc)" },
  { label: "Art", percent: 37, color: "var(--dist-art)" },
] as const;

export type PositionRow = {
  id: string;
  source: string;
  collection: string;
  tokenId: string;
  collateralEth: string;
  collateralUsd: string;
  ltv: string;
  apr: string;
  date: string;
  status: "listed" | "sold";
  poolId: string;
};

export const positionsPagination = {
  from: 1,
  to: 5,
  total: 1244,
} as const;

export const positionRows: PositionRow[] = [
  {
    id: "pos-1",
    source: "OpenSea",
    collection: "Bored Ape Yacht Club",
    tokenId: "#6722",
    collateralEth: "42.50 ETH",
    collateralUsd: "$61,750",
    ltv: "25.0%",
    apr: "12.4%",
    date: "24 Jun 2026",
    status: "listed",
    poolId: "bayc-3392",
  },
  {
    id: "pos-2",
    source: "OpenSea",
    collection: "CryptoPunks",
    tokenId: "#3100",
    collateralEth: "58.20 ETH",
    collateralUsd: "$100,840",
    ltv: "42.0%",
    apr: "9.8%",
    date: "16 Jun 2026",
    status: "sold",
    poolId: "bayc-3362",
  },
  {
    id: "pos-3",
    source: "OpenSea",
    collection: "Azuki",
    tokenId: "#4412",
    collateralEth: "6.40 ETH",
    collateralUsd: "$8,750",
    ltv: "10.0%",
    apr: "18.2%",
    date: "22 Jun 2026",
    status: "listed",
    poolId: "bayc-3362",
  },
  {
    id: "pos-4",
    source: "Blur",
    collection: "Fidenza",
    tokenId: "#812",
    collateralEth: "24.80 ETH",
    collateralUsd: "$55,304",
    ltv: "18.5%",
    apr: "11.2%",
    date: "20 Jun 2026",
    status: "listed",
    poolId: "bayc-3392",
  },
  {
    id: "pos-5",
    source: "OpenSea",
    collection: "Bored Ape Yacht Club",
    tokenId: "#7159",
    collateralEth: "29.80 ETH",
    collateralUsd: "$66,374",
    ltv: "22.0%",
    apr: "10.6%",
    date: "18 Jun 2026",
    status: "listed",
    poolId: "bayc-3392",
  },
];

export const ownedNfts: OwnedNFT[] = [
  {
    id: "1",
    name: "Bored Ape Yacht Club",
    tokenId: "#6722",
    collectionId: "bayc",
    imageSeed: "bayc-3392",
    poolTag: "POOL #842",
    sharePercent: 22,
    listedPriceEth: "33.54",
    listedPriceUsd: "$74,794",
    shareValueEth: "7.38",
    profit: "+18.4%",
    status: "listed",
    poolId: "bayc-3392",
  },
  {
    id: "2",
    name: "CryptoPunk",
    tokenId: "#4821",
    collectionId: "cryptopunks",
    imageSeed: "punk-4821",
    poolTag: "POOL #619",
    sharePercent: 15,
    listedPriceEth: "48.20",
    listedPriceUsd: "$107,488",
    shareValueEth: "7.23",
    profit: "+9.2%",
    status: "listed",
    poolId: "bayc-3362",
  },
  {
    id: "3",
    name: "Fidenza",
    tokenId: "#565",
    collectionId: "fidenza",
    imageSeed: "fidenza-565",
    poolTag: "POOL #204",
    sharePercent: 10,
    listedPriceEth: "62.00",
    listedPriceUsd: "$138,240",
    shareValueEth: "6.20",
    profit: "+24.1%",
    status: "listed",
    poolId: "bayc-3392",
  },
  {
    id: "4",
    name: "Azuki",
    tokenId: "#2044",
    collectionId: "azuki",
    imageSeed: "azuki-2044",
    poolTag: "POOL #118",
    sharePercent: 8,
    listedPriceEth: "12.40",
    listedPriceUsd: "$27,648",
    shareValueEth: "0.99",
    profit: "-2.4%",
    status: "sold",
    poolId: "bayc-3362",
  },
  {
    id: "5",
    name: "Bored Ape Yacht Club",
    tokenId: "#7159",
    collectionId: "bayc",
    imageSeed: "bayc-7159",
    poolTag: "POOL #842",
    sharePercent: 18,
    listedPriceEth: "29.80",
    listedPriceUsd: "$66,374",
    shareValueEth: "5.36",
    profit: "+12.8%",
    status: "listed",
    poolId: "bayc-3392",
  },
  {
    id: "6",
    name: "CryptoPunk",
    tokenId: "#3104",
    collectionId: "cryptopunks",
    imageSeed: "punk-3104",
    poolTag: "POOL #619",
    sharePercent: 12,
    listedPriceEth: "52.10",
    listedPriceUsd: "$116,183",
    shareValueEth: "6.25",
    profit: "+6.7%",
    status: "listed",
    poolId: "bayc-3362",
  },
  {
    id: "7",
    name: "Fidenza",
    tokenId: "#812",
    collectionId: "fidenza",
    imageSeed: "fidenza-812",
    poolTag: "POOL #204",
    sharePercent: 9,
    listedPriceEth: "58.50",
    listedPriceUsd: "$130,464",
    shareValueEth: "5.27",
    profit: "+15.3%",
    status: "listed",
    poolId: "bayc-3392",
  },
  {
    id: "8",
    name: "Azuki",
    tokenId: "#991",
    collectionId: "azuki",
    imageSeed: "azuki-991",
    poolTag: "POOL #118",
    sharePercent: 6,
    listedPriceEth: "14.20",
    listedPriceUsd: "$31,654",
    shareValueEth: "0.85",
    profit: "+3.1%",
    status: "listed",
    poolId: "bayc-3362",
  },
];
