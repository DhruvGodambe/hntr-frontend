import { useQuery } from "@tanstack/react-query";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";

export const OPENSEA_COLLECTION_SLUGS = {
  CryptoPunks: "cryptopunks",
  "Bored Ape Yacht Club": "boredapeyachtclub",
  Azuki: "azuki",
  "Pudgy Penguins": "pudgypenguins",
  Fidenza: "fidenza-by-tyler-hobbs",
} as const;

/** Collections featured on Pools / pool-detail (aligned with homepage strategy cards). */
export const OPENSEA_POOL_SLUGS = [
  "boredapeyachtclub",
  "pudgypenguins",
  "cryptopunks",
  "azuki",
] as const;

export type PoolCollectionSlug = (typeof OPENSEA_POOL_SLUGS)[number];

export const OPENSEA_POOL_META: Record<
  PoolCollectionSlug,
  { name: string; tags: [string, string]; color: string }
> = {
  boredapeyachtclub: {
    name: "Bored Ape Yacht Club",
    tags: ["YUGA LABS", "SERIES 1/10000"],
    color: "var(--olive)",
  },
  pudgypenguins: {
    name: "Pudgy Penguins",
    tags: ["IGLOO", "SERIES 1/8888"],
    color: "#c8b99a",
  },
  cryptopunks: {
    name: "CryptoPunks",
    tags: ["LARVA LABS", "SERIES 1/10000"],
    color: "var(--sage)",
  },
  azuki: {
    name: "Azuki",
    tags: ["CHIRU LABS", "SERIES 1/10000"],
    color: "#9e7a6a",
  },
};

/** Old numeric /pool/:id values → collection slug (token resolved from live listing). */
export const LEGACY_POOL_ROUTE_MAP: Record<string, PoolCollectionSlug> = {
  "54587": "boredapeyachtclub",
  "1": "boredapeyachtclub",
  "2": "cryptopunks",
  "3": "pudgypenguins",
  "4": "azuki",
};

export function toPoolRouteId(slug: string, tokenId: string): string {
  return `${slug}--${tokenId}`;
}

export function parsePoolRouteId(id: string): {
  slug: string;
  tokenId: string | null;
  isLegacy: boolean;
} {
  const decoded = decodeURIComponent(id || "");
  const sep = decoded.lastIndexOf("--");
  if (sep > 0) {
    const slug = decoded.slice(0, sep);
    const tokenId = decoded.slice(sep + 2);
    if (slug && tokenId) return { slug, tokenId, isLegacy: false };
  }
  const legacySlug = LEGACY_POOL_ROUTE_MAP[decoded];
  if (legacySlug) return { slug: legacySlug, tokenId: null, isLegacy: true };
  return { slug: decoded, tokenId: null, isLegacy: false };
}

export function poolDisplayName(slug: string): string {
  if (slug in OPENSEA_POOL_META) {
    return OPENSEA_POOL_META[slug as PoolCollectionSlug].name;
  }
  const named = (Object.entries(OPENSEA_COLLECTION_SLUGS) as [string, string][]).find(
    ([, value]) => value === slug,
  );
  return named?.[0] || slug;
}

export type KnownCollection = keyof typeof OPENSEA_COLLECTION_SLUGS;

export interface OpenSeaCollectionStats {
  slug: string;
  name: string;
  floorPrice: number; // ETH
  totalVolume: number; // ETH
  nftCount: number;
  ownerCount: number;
  imageUrl: string;
  volumeOneDay: number;
  volumeSevenDay: number;
  volumeThirtyDay: number;
  /** Floor / volume change as a percentage (e.g. 2.4 = +2.4%) */
  changeOneDay: number;
  changeSevenDay: number;
  changeThirtyDay: number;
}

export interface OpenSeaSale {
  tokenId: string;
  name: string;
  imageUrl: string;
  collection: string;
  contract: string;
  chain: string;
  priceEth: number;
  openseaUrl: string;
  timestamp: number;
}

/** Extra blue-chips used on the homepage market overview. */
export const OPENSEA_HOME_MARKET_SLUGS = [
  "cryptopunks",
  "boredapeyachtclub",
  "azuki",
  "fidenza-by-tyler-hobbs",
  "pudgypenguins",
  "nakamigos",
  "doodles-official",
  "lilpudgys",
  "invisiblefriends",
  "bored-ape-kennel-club",
] as const;

export interface OpenSeaNFT {
  tokenId: string;
  name: string;
  imageUrl: string;
  collection: string;
  contract?: string;
  openseaUrl: string;
}

export interface OpenSeaListing {
  tokenId: string;
  name: string;
  imageUrl: string;
  collection: string;
  contract: string;
  chain: string;
  priceEth: number;
  source: string;
  openseaUrl: string;
}

function getApiKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_OPENSEA_API_KEY;
  return key?.replace(/^["']|["']$/g, "").trim();
}

function getHeaders(): Record<string, string> {
  const key = getApiKey();
  return key ? { "X-API-KEY": key } : {};
}

async function fetchOpenSea<T>(path: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  const isClient = typeof window !== "undefined";
  const url = isClient
    ? `/api/opensea?path=${encodeURIComponent(path)}`
    : `${OPENSEA_API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: isClient
      ? body
        ? { "Content-Type": "application/json" }
        : {}
      : {
          ...getHeaders(),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const resBody = await res.text().catch(() => "");
    throw new Error(`OpenSea API error: ${res.status} ${res.statusText} (${url}) ${resBody.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function parseEth(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function parseIntervalChange(interval: any): number {
  // Prefer explicit floor/price change; fall back to volume_change (fraction → %).
  const raw =
    interval?.floor_price_change ??
    interval?.price_change ??
    interval?.volume_change ??
    0;
  const num = Number(raw);
  if (Number.isNaN(num)) return 0;
  // OpenSea often returns fractions (0.024); treat |x| < 1 as fraction.
  return Math.abs(num) > 0 && Math.abs(num) < 1 ? num * 100 : num;
}

function findInterval(intervals: any[], key: string) {
  return (intervals || []).find(
    (i) => String(i?.interval || i?.period || "").toLowerCase().replace(/-/g, "_") === key,
  );
}

export async function fetchCollectionStats(slug: string): Promise<OpenSeaCollectionStats> {
  const stats = (await fetchOpenSea<any>(`/collections/${slug}/stats`)) ?? {};
  const collection = (await fetchOpenSea<any>(`/collections/${slug}`).catch(() => ({}))) ?? {};

  const total = stats.total || {};
  const intervals = stats.intervals || [];
  const oneDay = findInterval(intervals, "one_day");
  const sevenDay = findInterval(intervals, "seven_day");
  const thirtyDay = findInterval(intervals, "thirty_day");

  return {
    slug,
    name: collection.name || slug,
    floorPrice: parseEth(total.floor_price),
    totalVolume: parseEth(total.volume),
    nftCount: Number(collection.total_supply ?? total.num_owners ?? 0),
    ownerCount: Number(total.num_owners ?? 0),
    imageUrl: collection.image_url || "",
    volumeOneDay: parseEth(oneDay?.volume),
    volumeSevenDay: parseEth(sevenDay?.volume),
    volumeThirtyDay: parseEth(thirtyDay?.volume),
    changeOneDay: parseIntervalChange(oneDay),
    changeSevenDay: parseIntervalChange(sevenDay),
    changeThirtyDay: parseIntervalChange(thirtyDay),
  };
}

function paymentToEth(payment: any): number {
  if (!payment) return 0;
  const decimals = Number(payment.decimals ?? 18);
  const raw = payment.quantity ?? payment.value;
  if (raw === undefined || raw === null) return 0;
  try {
    const value = BigInt(String(raw));
    return decimals > 0 ? Number(value) / 10 ** decimals : Number(value);
  } catch {
    return parseEth(raw);
  }
}

export async function fetchCollectionSales(
  slug: string,
  limit = 8,
): Promise<OpenSeaSale[]> {
  const data = await fetchOpenSea<any>(
    `/events/collection/${slug}?event_type=sale&limit=${limit}`,
  );
  const events = data?.asset_events || data?.events || [];

  return events
    .map((event: any): OpenSeaSale | null => {
      const type = event.event_type || event.eventType;
      if (type && type !== "sale") return null;

      const nft = event.nft || event.asset || {};
      const tokenId = String(nft.identifier || nft.token_id || "");
      const contract = nft.contract || "";
      const chain = event.chain || nft.chain || "ethereum";
      if (!tokenId) return null;

      const priceEth = paymentToEth(event.payment);
      if (priceEth <= 0) return null;

      return {
        tokenId,
        name: nft.name || `${slug} #${tokenId}`,
        imageUrl: nft.display_image_url || nft.image_url || "",
        collection: nft.collection || slug,
        contract,
        chain,
        priceEth,
        openseaUrl:
          nft.opensea_url ||
          (contract
            ? `https://opensea.io/assets/${chain}/${contract}/${tokenId}`
            : `https://opensea.io/collection/${slug}`),
        timestamp: Number(event.event_timestamp || event.closing_date || 0),
      };
    })
    .filter(Boolean) as OpenSeaSale[];
}

function pickNftImage(nft: any): string {
  return String(
    nft?.display_image_url ||
      nft?.image_url ||
      nft?.display_animation_url ||
      nft?.image_original_url ||
      nft?.metadata?.image ||
      "",
  );
}

function nftContractAddress(nft: any): string {
  if (typeof nft?.contract === "string") return nft.contract;
  return String(nft?.contract?.address || nft?.contract_address || "");
}

function isConcreteTokenId(tokenId: string): boolean {
  if (!tokenId || tokenId === "0") return false;
  if (/^0x[a-f0-9]{64}$/i.test(tokenId)) return false;
  return /^\d+$/.test(tokenId);
}

export async function fetchCollectionNFTs(
  slug: string,
  limit = 8,
): Promise<OpenSeaNFT[]> {
  const data = await fetchOpenSea<any>(`/collection/${slug}/nfts?limit=${limit}`);
  const nfts = data?.nfts || [];

  return nfts
    .map((nft: any): OpenSeaNFT | null => {
      const tokenId = String(nft.identifier || nft.token_id || "");
      const contract = nftContractAddress(nft);
      if (!isConcreteTokenId(tokenId)) return null;
      return {
        tokenId,
        name: nft.name || `${slug} #${tokenId}`,
        imageUrl: pickNftImage(nft),
        collection: nft.collection || slug,
        contract,
        openseaUrl:
          nft.opensea_url ||
          (contract ? `https://opensea.io/item/ethereum/${contract}/${tokenId}` : `https://opensea.io/collection/${slug}`),
      };
    })
    .filter(Boolean) as OpenSeaNFT[];
}

export async function fetchNFTMetadata(
  chain: string,
  contract: string,
  tokenId: string,
): Promise<OpenSeaNFT | null> {
  if (!contract || !tokenId) return null;
  const data = await fetchOpenSea<any>(`/chain/${chain}/contract/${contract}/nfts/${tokenId}`).catch(() => null);
  const nft = data?.nft;
  if (!nft) return null;

  return normalizeNft(nft, chain, contract, tokenId);
}

export async function fetchNFTsBatch(
  identifiers: { chain: string; contract_address: string; token_id: string }[],
): Promise<OpenSeaNFT[]> {
  if (!identifiers.length) return [];
  const data = await fetchOpenSea<any>("/nfts/batch", "POST", { identifiers });
  const nfts = data?.nfts || [];
  return nfts.map((nft: any) => normalizeNft(nft, nft.chain, nft.contract, nft.identifier));
}

function normalizeNft(nft: any, chain: string, contract: string, tokenId: string): OpenSeaNFT {
  const id = String(nft.identifier || tokenId);
  const address = nftContractAddress(nft) || contract;
  return {
    tokenId: id,
    name: nft.name || `#${id}`,
    imageUrl: pickNftImage(nft),
    collection: nft.collection || "",
    contract: address,
    openseaUrl: nft.opensea_url || `https://opensea.io/item/${chain}/${address}/${id}`,
  };
}

const nftMetadataCache: Record<string, Promise<OpenSeaNFT | null>> = {};

function getCachedNFTMetadata(chain: string, contract: string, tokenId: string): Promise<OpenSeaNFT | null> {
  const key = `${chain}:${contract}:${tokenId}`;
  if (!nftMetadataCache[key]) {
    nftMetadataCache[key] = fetchNFTMetadata(chain, contract, tokenId);
  }
  return nftMetadataCache[key];
}

export async function fetchBestListings(
  slug: string,
  limit = 8,
): Promise<OpenSeaListing[]> {
  const data = await fetchOpenSea<any>(`/listings/collection/${slug}/best?limit=${limit}`);
  const listings = data?.listings || [];

  const seen = new Set<string>();

  return listings
    .map((listing: any): OpenSeaListing | null => {
      const parsed = parseListingNft(listing);
      if (!parsed) return null;

      const { tokenId, contract, chain } = parsed;
      const dedupeKey = `${contract}:${tokenId}`;
      if (seen.has(dedupeKey)) return null;
      seen.add(dedupeKey);

      const price = listing?.price?.current || listing?.price || {};
      const decimals = Number(price.decimals ?? 18);
      const rawValue = price.value ? BigInt(price.value) : BigInt(0);
      const priceEth = decimals > 0 ? Number(rawValue) / 10 ** decimals : Number(rawValue);

      return {
        tokenId,
        name: `${slug} #${tokenId}`,
        imageUrl: pickNftImage(listing.asset || listing.nft || {}),
        collection: slug,
        contract,
        chain,
        priceEth,
        source: "OpenSea",
        openseaUrl: `https://opensea.io/item/${chain}/${contract}/${tokenId}`,
      };
    })
    .filter(Boolean) as OpenSeaListing[];
}

function parseListingNft(listing: any): { tokenId: string; contract: string; chain: string } | null {
  const chain = String(listing?.chain || "ethereum");
  const offer = listing?.protocol_data?.parameters?.offer || listing?.protocol_data?.parameters?.offer || [];
  const items = [listing?.asset, listing?.nft, ...offer].filter(Boolean);

  for (const item of items) {
    const itemType = Number(item.itemType ?? item.item_type ?? 2);
    if (itemType === 0 || itemType === 1) continue;
    const tokenId = String(
      item.identifier ||
        item.token_id ||
        item.identifierOrCriteria ||
        item.identifier_or_criteria ||
        item.identifierOrCriteria ||
        "",
    );
    const contract = String(item.contract || item.token || item.contract_address || "");
    if (isConcreteTokenId(tokenId) && contract) {
      return { tokenId, contract, chain };
    }
  }
  return null;
}

async function enrichNftsWithImages(
  nfts: OpenSeaNFT[],
  chain = "ethereum",
): Promise<OpenSeaNFT[]> {
  const missing = nfts.filter((n) => !n.imageUrl && n.contract && isConcreteTokenId(n.tokenId));
  if (!missing.length) return nfts;

  let batchNfts: OpenSeaNFT[] = [];
  try {
    batchNfts = await fetchNFTsBatch(
      missing.map((n) => ({
        chain,
        contract_address: n.contract as string,
        token_id: n.tokenId,
      })),
    );
  } catch (err) {
    console.error("OpenSea batch NFT fetch failed:", err);
  }
  const batchById = Object.fromEntries(batchNfts.map((n) => [n.tokenId, n]));

  return nfts.map((nft) => {
    const extra = batchById[nft.tokenId];
    if (!extra) return nft;
    return {
      ...nft,
      imageUrl: extra.imageUrl || nft.imageUrl,
      name: extra.name || nft.name,
    };
  });
}

async function enrichListingsWithImages(
  listings: OpenSeaListing[],
  collectionNFTs: OpenSeaNFT[],
): Promise<OpenSeaListing[]> {
  const nftById = Object.fromEntries(collectionNFTs.map((n) => [n.tokenId, n]));

  // Find listings that need images fetched via batch endpoint
  const missing = listings.filter((l) => !nftById[l.tokenId]?.imageUrl && l.contract);
  let batchNfts: OpenSeaNFT[] = [];
  if (missing.length) {
    try {
      batchNfts = await fetchNFTsBatch(
        missing.map((l) => ({ chain: l.chain, contract_address: l.contract, token_id: l.tokenId })),
      );
    } catch (err) {
      console.error("OpenSea batch NFT fetch failed:", err);
    }
  }
  const batchById = Object.fromEntries(batchNfts.map((n) => [n.tokenId, n]));

  return listings.map((listing) => {
    const nft = nftById[listing.tokenId] || batchById[listing.tokenId];
    return {
      ...listing,
      imageUrl: nft?.imageUrl || listing.imageUrl || "",
      name: nft?.name || listing.name,
    };
  });
}

/** Fetches stats + NFTs for all known collections. */
export function useOpenSeaCollections() {
  const slugs = Object.values(OPENSEA_COLLECTION_SLUGS);
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "collections", slugs],
    queryFn: async () => {
      const results = await Promise.allSettled(
        slugs.map(async (slug) => {
          const stats = await fetchCollectionStats(slug);
          const nfts = await enrichNftsWithImages(await fetchCollectionNFTs(slug, 4));
          return { slug, stats, nfts };
        }),
      );

      const record: Record<string, { stats: OpenSeaCollectionStats; nfts: OpenSeaNFT[] }> = {};
      results.forEach((result, index) => {
        const slug = slugs[index];
        if (result.status === "fulfilled") {
          record[slug] = result.value;
        } else {
          console.error(`OpenSea collections failed for ${slug}:`, result.reason);
        }
      });

      return record;
    },
    enabled: !!key,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Fetches the best listings for a single collection, enriched with metadata. */
export function useOpenSeaListings(slug: string, limit = 8) {
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "listings", slug, limit],
    queryFn: async () => {
      const [listingsResult, nftsResult] = await Promise.allSettled([
        fetchBestListings(slug, limit),
        fetchCollectionNFTs(slug, limit),
      ]);

      const listings = listingsResult.status === "fulfilled" ? listingsResult.value : [];
      const nfts = nftsResult.status === "fulfilled" ? nftsResult.value : [];

      if (listingsResult.status === "rejected") {
        console.error(`OpenSea listings failed for ${slug}:`, listingsResult.reason);
      }
      if (nftsResult.status === "rejected") {
        console.error(`OpenSea NFTs failed for ${slug}:`, nftsResult.reason);
      }

      return enrichListingsWithImages(listings, nfts);
    },
    enabled: !!key && !!slug,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function formatFloorPrice(price: number): string {
  return `${price.toFixed(2)} ETH`;
}

export function formatUsd(ethPrice: number, ethUsd = 2900): string {
  return `$${(ethPrice * ethUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/** Fetches the best listings for all known collections, enriched with metadata. */
export function useOpenSeaMarketplaceListings(limitPerCollection = 4) {
  const slugs = Object.values(OPENSEA_COLLECTION_SLUGS);
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "marketplace", slugs, limitPerCollection],
    queryFn: async () => {
      const results = await Promise.allSettled(
        slugs.map(async (slug) => {
          const [listingsResult, nftsResult] = await Promise.allSettled([
            fetchBestListings(slug, limitPerCollection),
            fetchCollectionNFTs(slug, limitPerCollection),
          ]);

          const listings = listingsResult.status === "fulfilled" ? listingsResult.value : [];
          const nfts = nftsResult.status === "fulfilled" ? nftsResult.value : [];

          if (listingsResult.status === "rejected") {
            console.error(`OpenSea marketplace listings failed for ${slug}:`, listingsResult.reason);
          }
          if (nftsResult.status === "rejected") {
            console.error(`OpenSea marketplace NFTs failed for ${slug}:`, nftsResult.reason);
          }

          return enrichListingsWithImages(listings, nfts);
        }),
      );

      return results
        .map((result, index) => {
          if (result.status === "rejected") {
            console.error(`OpenSea marketplace batch failed for ${slugs[index]}:`, result.reason);
            return [];
          }
          return result.value;
        })
        .flat();
    },
    enabled: !!key,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Recent sales across known marketplace collections. */
export function useOpenSeaMarketplaceSales(limitPerCollection = 3) {
  const slugs = Object.values(OPENSEA_COLLECTION_SLUGS);
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "sales", slugs, limitPerCollection],
    queryFn: async () => {
      const results = await Promise.allSettled(
        slugs.map((slug) => fetchCollectionSales(slug, limitPerCollection)),
      );

      return results
        .map((result, index) => {
          if (result.status === "rejected") {
            console.error(`OpenSea sales failed for ${slugs[index]}:`, result.reason);
            return [] as OpenSeaSale[];
          }
          return result.value;
        })
        .flat()
        .sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: !!key,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export type MarketTimeFrame = "24H" | "7D" | "30D";

function volumeForTimeframe(stats: OpenSeaCollectionStats, tf: MarketTimeFrame): number {
  if (tf === "24H") return stats.volumeOneDay || stats.totalVolume;
  if (tf === "7D") return stats.volumeSevenDay || stats.totalVolume;
  return stats.volumeThirtyDay || stats.totalVolume;
}

function changeForTimeframe(stats: OpenSeaCollectionStats, tf: MarketTimeFrame): number {
  if (tf === "24H") return stats.changeOneDay;
  if (tf === "7D") return stats.changeSevenDay;
  return stats.changeThirtyDay;
}

/** Homepage market overview: floors, volumes, and ranked lists for a timeframe. */
export function useOpenSeaHomeMarket(timeFrame: MarketTimeFrame = "24H") {
  const slugs = [...OPENSEA_HOME_MARKET_SLUGS];
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "home-market", slugs, timeFrame],
    queryFn: async () => {
      const results = await Promise.allSettled(slugs.map((slug) => fetchCollectionStats(slug)));
      const collections = results
        .map((result, index) => {
          if (result.status === "rejected") {
            console.error(`OpenSea home market failed for ${slugs[index]}:`, result.reason);
            return null;
          }
          return result.value;
        })
        .filter(Boolean) as OpenSeaCollectionStats[];

      const withMeta = collections.map((c) => ({
        ...c,
        volume: volumeForTimeframe(c, timeFrame),
        change: changeForTimeframe(c, timeFrame),
      }));

      const totalVolume = withMeta.reduce((sum, c) => sum + (c.volume || 0), 0);
      const byVolume = [...withMeta].sort((a, b) => b.volume - a.volume);
      const byChange = [...withMeta].sort((a, b) => b.change - a.change);

      return {
        totalVolume,
        activeCollections: withMeta.length,
        top: byVolume.slice(0, 5),
        trending: byVolume.slice(0, 5),
        topFlyers: byChange.slice(0, 5),
      };
    },
    enabled: !!key,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function formatChangePct(change: number): string {
  const sign = change > 0 ? "+" : change < 0 ? "−" : "";
  return `${sign}${Math.abs(change).toFixed(2)} %`;
}

export interface OpenSeaCollectionInfo {
  slug: string;
  name: string;
  imageUrl: string;
  contracts: { address: string; chain: string }[];
}

export async function fetchCollectionInfo(slug: string): Promise<OpenSeaCollectionInfo> {
  const collection = (await fetchOpenSea<any>(`/collections/${slug}`).catch(() => ({}))) ?? {};
  const contracts = (collection.contracts || [])
    .map((c: any) => ({
      address: String(c.address || ""),
      chain: String(c.chain || "ethereum"),
    }))
    .filter((c: { address: string }) => c.address);

  return {
    slug,
    name: collection.name || poolDisplayName(slug),
    imageUrl: collection.image_url || "",
    contracts,
  };
}

export interface OpenSeaPoolNft {
  slug: string;
  tokenId: string;
  name: string;
  imageUrl: string;
  collectionName: string;
  contract?: string;
  chain: string;
  openseaUrl: string;
  listingPriceEth: number;
  floorPriceEth: number;
  stats: OpenSeaCollectionStats | null;
}

async function resolvePoolNft(slug: string, tokenId: string | null): Promise<OpenSeaPoolNft | null> {
  const [statsResult, listingsResult, nftsResult, infoResult] = await Promise.allSettled([
    fetchCollectionStats(slug),
    fetchBestListings(slug, 20),
    fetchCollectionNFTs(slug, 20),
    fetchCollectionInfo(slug),
  ]);

  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
  const rawListings = listingsResult.status === "fulfilled" ? listingsResult.value : [];
  const nfts = nftsResult.status === "fulfilled" ? nftsResult.value : [];
  const info = infoResult.status === "fulfilled" ? infoResult.value : null;
  const listings = await enrichListingsWithImages(rawListings, nfts);

  const listing =
    (tokenId ? listings.find((l) => l.tokenId === tokenId) : listings[0]) ||
    listings[0] ||
    null;

  const resolvedTokenId = tokenId || listing?.tokenId || nfts[0]?.tokenId;
  if (!resolvedTokenId) return null;

  let nft = nfts.find((n) => n.tokenId === resolvedTokenId) || null;
  const chain = listing?.chain || info?.contracts[0]?.chain || "ethereum";
  const contract = listing?.contract || info?.contracts[0]?.address || nft?.contract;

  if (!nft && contract) {
    nft = await fetchNFTMetadata(chain, contract, resolvedTokenId);
  }

  const collectionName = info?.name || stats?.name || poolDisplayName(slug);
  const imageUrl = nft?.imageUrl || listing?.imageUrl || info?.imageUrl || stats?.imageUrl || "";
  const name = nft?.name || listing?.name || `${collectionName} #${resolvedTokenId}`;
  const openseaChain = chain === "ethereum" || !chain ? "ethereum" : chain;
  const openseaUrl =
    listing?.openseaUrl ||
    nft?.openseaUrl ||
    (contract
      ? `https://opensea.io/item/${openseaChain}/${contract}/${resolvedTokenId}`
      : `https://opensea.io/collection/${slug}`);

  return {
    slug,
    tokenId: resolvedTokenId,
    name,
    imageUrl,
    collectionName,
    contract,
    chain,
    openseaUrl,
    listingPriceEth: listing?.priceEth || 0,
    floorPriceEth: stats?.floorPrice || 0,
    stats,
  };
}

export function useOpenSeaPoolNft(slug: string | null, tokenId: string | null) {
  return useQuery({
    queryKey: ["opensea", "pool-nft", slug, tokenId],
    queryFn: () => resolvePoolNft(slug!, tokenId),
    enabled: !!slug,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export interface FeaturedPoolListing {
  slug: PoolCollectionSlug;
  listing: OpenSeaListing | null;
  nft: OpenSeaNFT | null;
  stats: OpenSeaCollectionStats | null;
}

export function useOpenSeaFeaturedPoolListings() {
  const slugs = [...OPENSEA_POOL_SLUGS];

  return useQuery({
    queryKey: ["opensea", "featured-pools", slugs],
    queryFn: async (): Promise<FeaturedPoolListing[]> => {
      const results = await Promise.allSettled(
        slugs.map(async (slug): Promise<FeaturedPoolListing> => {
          const [listingsResult, nftsResult, statsResult] = await Promise.allSettled([
            fetchBestListings(slug, 1),
            fetchCollectionNFTs(slug, 4),
            fetchCollectionStats(slug),
          ]);
          const listings = listingsResult.status === "fulfilled" ? listingsResult.value : [];
          const nfts = nftsResult.status === "fulfilled" ? nftsResult.value : [];
          const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
          const enriched = await enrichListingsWithImages(listings, nfts);
          return {
            slug,
            listing: enriched[0] ?? null,
            nft: nfts[0] ?? null,
            stats,
          };
        }),
      );

      return results.map((result, index) => {
        if (result.status === "fulfilled") return result.value;
        console.error(`OpenSea featured pool failed for ${slugs[index]}:`, result.reason);
        return { slug: slugs[index], listing: null, nft: null, stats: null };
      });
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useOpenSeaOtherPoolListings(excludeSlug?: string, excludeTokenId?: string) {
  const slugs = [...OPENSEA_POOL_SLUGS];

  return useQuery({
    queryKey: ["opensea", "other-pools", slugs, excludeSlug, excludeTokenId],
    queryFn: async () => {
      const results = await Promise.allSettled(
        slugs.map(async (slug) => {
          const [listings, nfts] = await Promise.all([
            fetchBestListings(slug, 3),
            fetchCollectionNFTs(slug, 3),
          ]);
          return enrichListingsWithImages(listings, nfts).then((enriched) =>
            enriched.map((listing) => ({ ...listing, collection: slug })),
          );
        }),
      );

      return results
        .flatMap((result, index) => {
          if (result.status === "rejected") {
            console.error(`OpenSea other pools failed for ${slugs[index]}:`, result.reason);
            return [];
          }
          return result.value;
        })
        .filter(
          (listing) =>
            !(listing.collection === excludeSlug && listing.tokenId === excludeTokenId),
        );
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
