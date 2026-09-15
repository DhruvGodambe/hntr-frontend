"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export type PublicActivityKind = "join" | "purchase";

export interface PublicActivityEntry {
  id: string;
  kind: PublicActivityKind;
  username: string;
  country?: string;
  action: string;
  tier?: string;
  ts: number;
}

/** Toggle live platform activity feed (disabled until privacy masking + moderation are ready). */
export const PLATFORM_ACTIVITY_ENABLED = false;

/** Public "who joined / who bought" feed shown in the Platform Activity rail. No wallet required. */
export function usePlatformActivity(limit = 20) {
  return useQuery({
    queryKey: ["platform-activity", limit],
    queryFn: () => api.get<PublicActivityEntry[]>(`/api/activity/feed?limit=${limit}`),
    enabled: PLATFORM_ACTIVITY_ENABLED,
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}
