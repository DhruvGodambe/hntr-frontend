"use client";

import { useMemo, useState } from "react";
import { usePlatformActivity } from "../../../../lib/activity";
import { activityIcon, filterActivityByTab, maskActivityUsername } from "../utils";
import type { ActivityEntry, ActivityTab } from "../types";

export function useActivityFeed() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");
  const { data } = usePlatformActivity();

  const activityLog = useMemo<ActivityEntry[]>(
    () =>
      (data ?? []).map((entry) => ({
        id: entry.id,
        icon: activityIcon(entry.kind, entry.tier),
        name: maskActivityUsername(entry.username),
        country: entry.country,
        action: entry.action,
        val: entry.tier ?? "",
        pos: true,
        kind: entry.kind === "join" ? "join" : "sale",
        ts: entry.ts,
        fresh: false,
      })),
    [data],
  );

  const filteredActivity = useMemo(
    () => filterActivityByTab(activityLog, activeTab).slice(0, 7),
    [activityLog, activeTab],
  );

  return { activeTab, setActiveTab, filteredActivity };
}
