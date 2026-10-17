import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export type PlatformActivityKind = "join" | "purchase";

/** One row of the public platform feed: a member joining, or buying / upgrading / redeeming a membership. */
export interface PlatformActivityEntry {
  id: string;
  kind: PlatformActivityKind;
  username: string;
  country?: string;
  /** JOINED | PURCHASED | UPGRADED | REDEEMED */
  action: string;
  tier?: string;
  /** Epoch milliseconds. */
  ts: number;
}

/** Public, unauthenticated feed (GET /api/activity/feed), newest first. The backend caps `limit` at 50. */
export function usePlatformActivity(limit = 20) {
  return useQuery({
    queryKey: ["activity", "feed", limit],
    queryFn: () => api.get<PlatformActivityEntry[]>(`/api/activity/feed?limit=${limit}`),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
