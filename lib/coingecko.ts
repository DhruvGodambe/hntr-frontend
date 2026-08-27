import { useQuery } from "@tanstack/react-query";

export type MarketTimeFrame = "24H" | "7D" | "30D";
export type ChartRange = "7D" | "30D" | "1Y";

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
  sparkline: Sparkline | null;
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
  marketCapSpark: Sparkline | null;
  volumeUsd: number;
  volumeChangePct: number | null;
  volumeSpark: Sparkline | null;
  volumeLabel: string;
  trending: TrendingNft[];
  dominance: DominanceNft[];
  rows: FloorNftRow[];
  chart: {
    marketCapUsd: number;
    changePct: number | null;
    changeCaption: string;
    polyline: string;
    area: string;
    pos: boolean;
    axis: string[];
  };
  chartStats: {
    volume24h: string;
    collectionsTracked: string;
    nftDominance: string;
    high30d: string;
  };
  coins: RelatedCoin[];
};

type MoneyPair = { native_currency?: number; usd?: number };
type PctPair = number | { usd?: number; native_currency?: number } | null | undefined;
type ChartPair = [number, number];

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

type NftChart = {
  floor_price_usd?: ChartPair[];
  floor_price_native?: ChartPair[];
  h24_volume_usd?: ChartPair[];
  market_cap_usd?: ChartPair[];
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

async function fetchCoinGecko<T>(path: string): Promise<T> {
  const res = await fetch(`/api/coingecko?path=${encodeURIComponent(path)}`);
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

function toMs(ts: number): number {
  return ts < 1e12 ? ts * 1000 : ts;
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

export function polylineToArea(points: string, width: number, height: number): string {
  if (!points) return "";
  return `0,${height} ${points} ${width},${height}`;
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

function pairsToValues(pairs?: ChartPair[]): number[] {
  if (!pairs?.length) return [];
  return pairs.map((p) => p?.[1]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
}

function slicePairs(pairs: ChartPair[] | undefined, days: number): ChartPair[] {
  if (!pairs?.length) return [];
  const last = toMs(pairs[pairs.length - 1][0]);
  const cutoff = last - days * 86_400_000;
  return pairs.filter((p) => toMs(p[0]) >= cutoff);
}

function pctFromPairs(pairs: ChartPair[]): number | null {
  const values = pairsToValues(pairs);
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (!first) return last ? 100 : 0;
  return ((last - first) / first) * 100;
}

function sumDailyVolume(pairs: ChartPair[], days: number): number | null {
  const sliced = slicePairs(pairs, days);
  if (!sliced.length) return null;
  const byDay = new Map<string, number>();
  for (const [ts, value] of sliced) {
    if (!Number.isFinite(value)) continue;
    const day = new Date(toMs(ts)).toISOString().slice(0, 10);
    byDay.set(day, value);
  }
  if (!byDay.size) return null;
  return [...byDay.values()].reduce((sum, v) => sum + v, 0);
}

function axisLabels(pairs: ChartPair[], count = 5): string[] {
  if (!pairs.length) return [];
  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / Math.max(count - 1, 1)) * (pairs.length - 1));
    labels.push(
      new Date(toMs(pairs[idx][0])).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    );
  }
  return labels;
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

function daysForTimeFrame(tf: MarketTimeFrame): number {
  if (tf === "24H") return 1;
  if (tf === "7D") return 7;
  return 30;
}

function volumeLabel(tf: MarketTimeFrame): string {
  if (tf === "7D") return "7d Trading Volume";
  if (tf === "30D") return "30d Trading Volume";
  return "24h Trading Volume";
}

function chartCaption(range: ChartRange): string {
  if (range === "7D") return "past 7 days";
  if (range === "1Y") return "past year";
  return "past 30 days";
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

async function fetchNftMarkets(): Promise<{ markets: NftMarket[]; hasProNftData: boolean }> {
  const markets = await fetchCoinGeckoOptional<NftMarket[]>(
    "nfts/markets?vs_currency=usd&order=market_cap_usd_desc&per_page=20&page=1",
  );
  if (Array.isArray(markets) && markets.length) return { markets, hasProNftData: true };

  const listed = await fetchCoinGeckoOptional<Array<{ id?: string }>>(
    "nfts/list?order=market_cap_usd_desc&per_page=20&page=1",
  );
  const ids = [...new Set((listed || []).map((item) => item.id).filter((id): id is string => Boolean(id)))].slice(
    0,
    20,
  );

  const details = await mapInBatches(ids, 4, (id) => fetchCoinGeckoOptional<NftMarket>(`nfts/${id}`));
  return {
    markets: details
      .filter((item): item is NftMarket => Boolean(item?.id))
      .sort((a, b) => (b.market_cap?.usd || 0) - (a.market_cap?.usd || 0)),
    hasProNftData: false,
  };
}

async function fetchOverviewRaw(chartDays: number) {
  const coinsPath =
    `coins/markets?vs_currency=usd&ids=${RELATED_COIN_IDS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`;

  const [marketPayload, trendingResult, coinsResult, globalResult] = await Promise.all([
    fetchNftMarkets(),
    fetchCoinGeckoOptional<TrendingResponse>("search/trending"),
    fetchCoinGeckoOptional<CoinMarket[]>(coinsPath),
    fetchCoinGeckoOptional<NftChart>(`nfts/market_chart/global?days=${chartDays}`),
  ]);

  const markets = marketPayload.markets;
  const trending = trendingResult?.nfts || [];
  const coins = Array.isArray(coinsResult) ? coinsResult : [];
  const globalChart = globalResult;

  const chartIds = marketPayload.hasProNftData
    ? markets.slice(0, 8).map((m) => m.id).filter(Boolean)
    : [];
  const collectionCharts = await mapInBatches(chartIds, 4, async (id) => {
    const chart = await fetchCoinGeckoOptional<NftChart>(`nfts/${id}/market_chart?days=7`);
    return { id, chart };
  });

  const chartsById = new Map(
    collectionCharts.filter((c) => c.chart).map((c) => [c.id, c.chart as NftChart]),
  );
  return { markets, trending, coins, globalChart, chartsById };
}

function buildOverview(
  raw: Awaited<ReturnType<typeof fetchOverviewRaw>>,
  timeFrame: MarketTimeFrame,
  chartRange: ChartRange,
): CoinGeckoMarketOverview {
  const { markets, trending, coins, globalChart, chartsById } = raw;
  const tfDays = daysForTimeFrame(timeFrame);
  const chartDays = chartRange === "1Y" ? 365 : chartRange === "7D" ? 7 : 30;

  const totalMcap = markets.reduce((sum, m) => sum + (m.market_cap?.usd || 0), 0);
  const volume24h = markets.reduce((sum, m) => sum + (m.volume_24h?.usd || 0), 0);

  const mcapSeries = globalChart?.market_cap_usd || [];
  const volSeries = globalChart?.h24_volume_usd || [];
  const mcapTf = slicePairs(mcapSeries, tfDays);
  const volTf = slicePairs(volSeries, tfDays);
  const mcapChart = slicePairs(mcapSeries, chartDays);
  const mcap30 = slicePairs(mcapSeries, 30);

  const marketCapUsd = totalMcap || pairsToValues(mcapSeries).at(-1) || 0;
  const marketCapChangePct =
    tfDays === 1
      ? weightedPct(markets.map((m) => ({ weight: m.market_cap?.usd || 0, pct: pctValue(m.market_cap_24h_percentage_change) })))
      : pctFromPairs(mcapTf);

  const volumeFromChart = tfDays === 1 ? null : sumDailyVolume(volSeries, tfDays);
  const volumeUsd = volumeFromChart ?? volume24h;
  const volumeChangePct =
    tfDays === 1
      ? weightedPct(
          markets.map((m) => ({
            weight: m.volume_24h?.usd || 0,
            pct: pctValue(m.volume_24h_percentage_change) ?? asNumber(m.volume_in_usd_24h_percentage_change),
          })),
        )
      : pctFromPairs(volTf);

  const marketCapSpark = seriesToPolyline(downsample(pairsToValues(mcapTf.length ? mcapTf : mcapSeries), 26), 150, 44);
  const volumeSpark = seriesToPolyline(downsample(pairsToValues(volTf.length ? volTf : volSeries), 26), 150, 44);

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

  const rows: FloorNftRow[] = markets.map((m, index) => {
    const symbol = m.native_currency_symbol || "ETH";
    const sales = asNumber(m.one_day_sales);
    const sparkValues = pairsToValues(chartsById.get(m.id)?.floor_price_usd);
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
      change24h: pctValue(m.floor_price_24h_percentage_change) ?? asNumber(m.floor_price_in_usd_24h_percentage_change),
      change7d: pctValue(m.floor_price_7d_percentage_change),
      change30d: pctValue(m.floor_price_30d_percentage_change),
      sparkline: seriesToPolyline(downsample(sparkValues, 26), 120, 34),
      marketCapUsd: formatUsdFull(m.market_cap?.usd),
      marketCapNative: formatNativeAmount(m.market_cap?.native_currency, symbol),
      volumeNative: formatNativeAmount(m.volume_24h?.native_currency, symbol),
      volumeUsd: formatUsdFull(m.volume_24h?.usd),
      sales24h: sales == null ? "—" : String(Math.round(sales)),
    };
  });

  const chartValues = downsample(pairsToValues(mcapChart.length ? mcapChart : mcapSeries), 60);
  const chartSpark = seriesToPolyline(chartValues, 1000, 220, 13.2);
  const chartChange = pctFromPairs(mcapChart.length ? mcapChart : mcapSeries);
  const high30d = Math.max(0, ...pairsToValues(mcap30.length ? mcap30 : mcapSeries), marketCapUsd);
  const ethMcap = coins.find((c) => c.id === "ethereum")?.market_cap || 0;
  const nftDominance = ethMcap > 0 && marketCapUsd > 0 ? (marketCapUsd / (marketCapUsd + ethMcap)) * 100 : null;

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
    marketCapSpark,
    volumeUsd,
    volumeChangePct,
    volumeSpark,
    volumeLabel: volumeLabel(timeFrame),
    trending: trendingRows,
    dominance,
    rows,
    chart: {
      marketCapUsd,
      changePct: chartChange,
      changeCaption: chartCaption(chartRange),
      polyline: chartSpark?.points || "",
      area: chartSpark ? polylineToArea(chartSpark.points, 1000, 220) : "",
      pos: chartSpark?.pos ?? (chartChange == null || chartChange >= 0),
      axis: axisLabels(mcapChart.length ? mcapChart : mcapSeries),
    },
    chartStats: {
      volume24h: formatUsdFull(volume24h),
      collectionsTracked: markets.length ? markets.length.toLocaleString("en-US") : "—",
      nftDominance: nftDominance == null ? "—" : `${nftDominance.toFixed(1)} %`,
      high30d: formatUsdFull(high30d),
    },
    coins: related,
  };
}

export function useCoinGeckoMarketOverview(
  timeFrame: MarketTimeFrame = "24H",
  chartRange: ChartRange = "30D",
) {
  const chartDays = chartRange === "1Y" ? 365 : 30;

  const query = useQuery({
    queryKey: ["coingecko", "market-overview", chartDays],
    queryFn: () => fetchOverviewRaw(chartDays),
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  });

  const data = query.data ? buildOverview(query.data, timeFrame, chartRange) : undefined;

  return {
    data,
    isPending: query.isPending,
    isError: query.isError,
  };
}
