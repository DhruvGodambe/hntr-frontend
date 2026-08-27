import { useQuery } from "@tanstack/react-query";

export type MarketTimeFrame = "24H" | "7D" | "30D";

export type Sparkline = {
  points: string;
  pos: boolean;
};

export type TrendingNft = {
  id: string;
  name: string;
  imageUrl: string;
  initials: string;
  floorNative: string;
  changePct: number | null;
};

export type DominanceNft = {
  id: string;
  name: string;
  imageUrl: string;
  initials: string;
  sharePct: number;
};

export type FloorNftRow = {
  id: string;
  rank: number;
  name: string;
  imageUrl: string;
  initials: string;
  chain: string;
  buyUrl: string;
  floorNative: string;
  floorUsd: string;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  marketCapUsd: string;
  marketCapNative: string;
  volumeNative: string;
  volumeUsd: string;
  sales24h: string;
};

export type RelatedCoin = {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  imageUrl: string;
  initials: string;
  price: string;
  change24h: number | null;
  change7d: number | null;
  sparkline: Sparkline | null;
  marketCap: string;
  volume: string;
};

export type CoinGeckoMarketOverview = {
  marketCapUsd: number;
  marketCapChangePct: number | null;
  volumeUsd: number;
  volumeChangePct: number | null;
  volumeLabel: string;
  trending: TrendingNft[];
  dominance: DominanceNft[];
  rows: FloorNftRow[];
  coins: RelatedCoin[];
};

type MoneyPair = { native_currency?: number; usd?: number };
type PctPair = number | { usd?: number; native_currency?: number } | null | undefined;

type NftMarket = {
  id: string;
  name?: string;
  symbol?: string;
  asset_platform_id?: string;
  native_currency_symbol?: string;
  image?: { small?: string; small_2x?: string };
  floor_price?: MoneyPair;
  market_cap?: MoneyPair;
  volume_24h?: MoneyPair;
  floor_price_in_usd_24h_percentage_change?: number;
  floor_price_24h_percentage_change?: PctPair;
  floor_price_7d_percentage_change?: PctPair;
  floor_price_30d_percentage_change?: PctPair;
  market_cap_24h_percentage_change?: PctPair;
  volume_24h_percentage_change?: PctPair;
  volume_in_usd_24h_percentage_change?: number;
  one_day_sales?: number | null;
  number_of_unique_addresses?: number | null;
};

type TrendingResponse = {
  nfts?: Array<{
    id?: string;
    name?: string;
    thumb?: string;
    native_currency_symbol?: string;
    floor_price_in_native_currency?: number;
    floor_price_24h_percentage_change?: number;
  }>;
};

type CoinMarket = {
  id: string;
  symbol?: string;
  name?: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  total_volume?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price?: number[] };
};

const RELATED_COIN_IDS = "ethereum,bitcoin,apecoin,blur,immutable-x";

const CG_TO_OPENSEA: Record<string, string> = {
  cryptopunks: "cryptopunks",
  "bored-ape-yacht-club": "boredapeyachtclub",
  "mutant-ape-yacht-club": "mutant-ape-yacht-club",
  "bored-ape-kennel-club": "bored-ape-kennel-club",
  "pudgy-penguins": "pudgypenguins",
  azuki: "azuki",
  "doodles-official": "doodles-official",
  milady: "milady",
  autoglyphs: "autoglyphs",
  "lil-pudgys": "lilpudgys",
  moonbirds: "proof-moonbirds",
  "otherdeed-for-otherside": "otherdeed",
  "clone-x-nft": "clonex",
  "fidenza-798": "fidenza-by-tyler-hobbs",
};

const CHAIN_LABELS: Record<string, string> = {
  ethereum: "Ethereum",
  solana: "Solana",
  bitcoin: "Bitcoin",
  "polygon-pos": "Polygon",
  base: "Base",
  "arbitrum-one": "Arbitrum",
  "optimistic-ethereum": "Optimism",
  "binance-smart-chain": "BNB Chain",
  immutable: "Immutable",
  "immutable-zkevm": "Immutable",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchCoinGecko<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/market/coingecko?path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CoinGecko API error: ${res.status} (${path}) ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function fetchCoinGeckoOptional<T>(path: string): Promise<T | null> {
  try {
    return await fetchCoinGecko<T>(path);
  } catch {
    return null;
  }
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function pctValue(value: PctPair): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return asNumber(value.usd) ?? asNumber(value.native_currency);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NFT";
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function nativeSymbol(raw?: string): string {
  const s = (raw || "ETH").trim();
  if (!s) return "ETH";
  return s.length <= 4 ? s.toUpperCase() : s;
}

function chainLabel(platform?: string): string {
  if (!platform) return "Ethereum";
  return CHAIN_LABELS[platform] || platform.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buyUrlFor(id: string): string {
  const slug = CG_TO_OPENSEA[id];
  if (slug) return `https://opensea.io/collection/${slug}`;
  return `https://www.coingecko.com/en/nft/${id}`;
}

export function formatUsdFull(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1) {
    return `$${Math.round(n).toLocaleString("en-US")}`;
  }
  if (abs === 0) return "$0";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUsdPrice(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "$0";
  if (Math.abs(n) >= 1000) {
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (Math.abs(n) >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

export function formatNativeAmount(n: number | null | undefined, symbol: string): string {
  const sym = nativeSymbol(symbol);
  if (n == null || !Number.isFinite(n)) return `0 ${sym}`;
  const digits = Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 2 : Math.abs(n) >= 1 ? 2 : Math.abs(n) >= 0.01 ? 3 : 4;
  return `${n.toLocaleString("en-US", {
    minimumFractionDigits: Math.min(2, digits),
    maximumFractionDigits: digits,
  })} ${sym}`;
}

export function formatPctArrow(n: number | null | undefined): { text: string; pos: boolean } {
  if (n == null || !Number.isFinite(n)) return { text: "—", pos: true };
  const pos = n >= 0;
  const abs = Math.abs(n);
  const digits = abs >= 10 ? 1 : 2;
  return { text: `${pos ? "▴" : "▾"} ${abs.toFixed(digits)} %`, pos };
}

export function seriesToPolyline(
  values: number[],
  width: number,
  height: number,
  pad = 2.6,
): Sparkline | null {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
      const y = pad + (1 - (v - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const pos = values[values.length - 1] >= values[0];
  return { points, pos };
}

function downsample(values: number[], maxPoints: number): number[] {
  if (values.length <= maxPoints) return values;
  const out: number[] = [];
  const step = (values.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    out.push(values[Math.round(i * step)]);
  }
  return out;
}

function weightedPct(items: Array<{ weight: number; pct: number | null }>): number | null {
  let sum = 0;
  let weight = 0;
  for (const item of items) {
    if (item.pct == null || item.weight <= 0) continue;
    sum += item.pct * item.weight;
    weight += item.weight;
  }
  return weight ? sum / weight : null;
}

async function mapInBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const part = await Promise.allSettled(chunk.map(fn));
    for (const result of part) {
      if (result.status === "fulfilled") out.push(result.value);
    }
  }
  return out;
}

async function fetchNftMarkets(): Promise<NftMarket[]> {
  const markets = await fetchCoinGeckoOptional<NftMarket[]>(
    "nfts/markets?vs_currency=usd&order=market_cap_usd_desc&per_page=10&page=1",
  );
  if (Array.isArray(markets) && markets.length) return markets;

  const listed = await fetchCoinGeckoOptional<Array<{ id?: string }>>(
    "nfts/list?order=market_cap_usd_desc&per_page=10&page=1",
  );
  const ids = [...new Set((listed || []).map((item) => item.id).filter((id): id is string => Boolean(id)))].slice(
    0,
    10,
  );

  const details = await mapInBatches(ids, 4, (id) => fetchCoinGeckoOptional<NftMarket>(`nfts/${id}`));
  return details
    .filter((item): item is NftMarket => Boolean(item?.id))
    .sort((a, b) => (b.market_cap?.usd || 0) - (a.market_cap?.usd || 0));
}

async function fetchOverviewRaw() {
  const coinsPath =
    `coins/markets?vs_currency=usd&ids=${RELATED_COIN_IDS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`;

  const [markets, trendingResult, coinsResult] = await Promise.all([
    fetchNftMarkets(),
    fetchCoinGeckoOptional<TrendingResponse>("search/trending"),
    fetchCoinGeckoOptional<CoinMarket[]>(coinsPath),
  ]);

  return {
    markets,
    trending: trendingResult?.nfts || [],
    coins: Array.isArray(coinsResult) ? coinsResult : [],
  };
}

function buildOverview(
  raw: Awaited<ReturnType<typeof fetchOverviewRaw>>,
  timeFrame: MarketTimeFrame,
): CoinGeckoMarketOverview {
  const { markets, trending, coins } = raw;

  const totalMcap = markets.reduce((sum, m) => sum + (m.market_cap?.usd || 0), 0);
  const volume24h = markets.reduce((sum, m) => sum + (m.volume_24h?.usd || 0), 0);
  const marketCapUsd = totalMcap;

  const marketCapChangePct =
    timeFrame === "24H"
      ? weightedPct(markets.map((m) => ({ weight: m.market_cap?.usd || 0, pct: pctValue(m.market_cap_24h_percentage_change) })))
      : timeFrame === "7D"
        ? weightedPct(markets.map((m) => ({ weight: m.market_cap?.usd || 0, pct: pctValue(m.floor_price_7d_percentage_change) })))
        : weightedPct(markets.map((m) => ({ weight: m.market_cap?.usd || 0, pct: pctValue(m.floor_price_30d_percentage_change) })));

  const volumeChangePct = weightedPct(
    markets.map((m) => ({
      weight: m.volume_24h?.usd || 0,
      pct: pctValue(m.volume_24h_percentage_change) ?? asNumber(m.volume_in_usd_24h_percentage_change),
    })),
  );

  const trendingFromApi: TrendingNft[] = trending.slice(0, 3).map((n) => ({
    id: n.id || n.name || "",
    name: n.name || "—",
    imageUrl: n.thumb || "",
    initials: initials(n.name || "NFT"),
    floorNative: formatNativeAmount(n.floor_price_in_native_currency, n.native_currency_symbol || "ETH"),
    changePct: asNumber(n.floor_price_24h_percentage_change),
  }));

  const trendingFromMarkets = [...markets]
    .sort((a, b) => {
      const pctA =
        timeFrame === "30D"
          ? pctValue(a.floor_price_30d_percentage_change)
          : pctValue(a.floor_price_7d_percentage_change);
      const pctB =
        timeFrame === "30D"
          ? pctValue(b.floor_price_30d_percentage_change)
          : pctValue(b.floor_price_7d_percentage_change);
      return (pctB || 0) - (pctA || 0);
    })
    .slice(0, 3)
    .map((m) => ({
      id: m.id,
      name: m.name || "—",
      imageUrl: m.image?.small || m.image?.small_2x || "",
      initials: initials(m.name || "NFT"),
      floorNative: formatNativeAmount(m.floor_price?.native_currency, m.native_currency_symbol || "ETH"),
      changePct:
        timeFrame === "30D"
          ? pctValue(m.floor_price_30d_percentage_change)
          : pctValue(m.floor_price_7d_percentage_change),
    }));

  const trendingRows = timeFrame === "24H" && trendingFromApi.length ? trendingFromApi : trendingFromMarkets;

  const dominance: DominanceNft[] = markets.slice(0, 3).map((m) => ({
    id: m.id,
    name: m.name || "—",
    imageUrl: m.image?.small || m.image?.small_2x || "",
    initials: initials(m.name || "NFT"),
    sharePct: totalMcap > 0 ? Math.round(((m.market_cap?.usd || 0) / totalMcap) * 100) : 0,
  }));

  const rows: FloorNftRow[] = markets.slice(0, 10).map((m, index) => {
    const symbol = m.native_currency_symbol || "ETH";
    const sales = asNumber(m.one_day_sales);
    return {
      id: m.id,
      rank: index + 1,
      name: m.name || "—",
      imageUrl: m.image?.small || m.image?.small_2x || "",
      initials: initials(m.name || "NFT"),
      chain: chainLabel(m.asset_platform_id),
      buyUrl: buyUrlFor(m.id),
      floorNative: formatNativeAmount(m.floor_price?.native_currency, symbol),
      floorUsd: formatUsdPrice(m.floor_price?.usd),
      change24h:
        pctValue(m.floor_price_24h_percentage_change) ?? asNumber(m.floor_price_in_usd_24h_percentage_change),
      change7d: pctValue(m.floor_price_7d_percentage_change),
      change30d: pctValue(m.floor_price_30d_percentage_change),
      marketCapUsd: formatUsdFull(m.market_cap?.usd),
      marketCapNative: formatNativeAmount(m.market_cap?.native_currency, symbol),
      volumeNative: formatNativeAmount(m.volume_24h?.native_currency, symbol),
      volumeUsd: formatUsdFull(m.volume_24h?.usd),
      sales24h: sales == null ? "—" : String(Math.round(sales)),
    };
  });

  const related: RelatedCoin[] = coins.map((c, index) => {
    const spark = c.sparkline_in_7d?.price || [];
    return {
      id: c.id,
      rank: index + 1,
      name: c.name || "—",
      symbol: (c.symbol || "").toUpperCase(),
      imageUrl: c.image || "",
      initials: (c.symbol || c.name || "COIN").slice(0, 3).toUpperCase(),
      price: formatUsdPrice(c.current_price),
      change24h: asNumber(c.price_change_percentage_24h_in_currency) ?? asNumber(c.price_change_percentage_24h),
      change7d: asNumber(c.price_change_percentage_7d_in_currency),
      sparkline: seriesToPolyline(downsample(spark, 26), 110, 30, 1.8),
      marketCap: formatUsdFull(c.market_cap),
      volume: formatUsdFull(c.total_volume),
    };
  });

  return {
    marketCapUsd,
    marketCapChangePct,
    volumeUsd: volume24h,
    volumeChangePct,
    volumeLabel: "24h Trading Volume",
    trending: trendingRows,
    dominance,
    rows,
    coins: related,
  };
}

export function useCoinGeckoMarketOverview(timeFrame: MarketTimeFrame = "24H") {
  const query = useQuery({
    queryKey: ["coingecko", "market-overview"],
    queryFn: () => fetchOverviewRaw(),
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  });

  const data = query.data ? buildOverview(query.data, timeFrame) : undefined;

  return {
    data,
    isPending: query.isPending,
    isError: query.isError,
  };
}
