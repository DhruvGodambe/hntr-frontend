import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PublicPoolOpenSea {
  collectionSlug: string;
  contractAddress?: string;
  chain: string;
  tokenStandard?: string;
  trait?: { type: string; value: string };
}

export interface PublicPool {
  slug: string;
  name: string;
  imageUrl: string;
  /** Community-raised ETH. The pool *target* is the live OpenSea floor price. */
  raisedEth: number;
  status: "OPEN" | "CLOSED" | "COMPLETED";
  depositsPaused: boolean;
  collectionName?: string;
  openSea?: PublicPoolOpenSea;
  /** Economics default to 0 until the pool goes live. */
  gpProfit: string;
  ethProfit: string;
  usdtProfit: string;
  participants: number;
  daysRemaining: number;
  tags?: string[];
  updatedAt?: string;
}

export function poolProgress(raisedEth: number, floorEth: number): number {
  return floorEth > 0 ? Math.min(100, Math.round((raisedEth / floorEth) * 100)) : 0;
}

export interface OfferPayloadPreview {
  openSeaEndpoint: string;
  proxyPath: string;
  chain: string;
  body: Record<string, unknown>;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }
  return (json?.data ?? json) as T;
}

export async function fetchPools(): Promise<PublicPool[]> {
  return apiGet<PublicPool[]>("/api/pools");
}

export async function fetchPool(slug: string): Promise<PublicPool> {
  return apiGet<PublicPool>(`/api/pools/${encodeURIComponent(slug)}`);
}

export async function fetchPoolOfferPayload(
  slug: string,
  offerer: string,
  quantity = 1,
): Promise<OfferPayloadPreview> {
  const res = await fetch(`${API_BASE}/api/pools/${encodeURIComponent(slug)}/offer-payload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offerer, quantity }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }
  return json.data as OfferPayloadPreview;
}

/** The OpenSea collection slug a pool is bound to (used to layer live market data). */
export function poolCollectionSlug(pool: Pick<PublicPool, "openSea" | "slug">): string {
  return pool.openSea?.collectionSlug || pool.slug;
}

export function usePools() {
  return useQuery({
    queryKey: ["pools", "list"],
    queryFn: fetchPools,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function usePool(slug: string | null | undefined) {
  return useQuery({
    queryKey: ["pools", "detail", slug],
    queryFn: () => fetchPool(slug as string),
    enabled: !!slug,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
