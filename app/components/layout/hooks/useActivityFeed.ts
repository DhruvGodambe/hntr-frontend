"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  filterActivityByTab,
  nextActivityId,
  pickActivityTemplate,
  seedActivityLog,
} from "../utils";
import type { ActivityEntry, ActivityTab } from "../types";

export function useActivityFeed() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(() => seedActivityLog());
  const [activityTimeTick, setActivityTimeTick] = useState(0);
  const activeTabRef = useRef<ActivityTab>("all");

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const pushActivity = () => {
      const template = pickActivityTemplate(activeTabRef.current);
      setActivityLog((entries) =>
        [
          {
            ...template,
            id: nextActivityId(),
            ts: Date.now(),
            fresh: true,
          },
          ...entries.map((entry) => ({ ...entry, fresh: false })),
        ].slice(0, 20),
      );
    };

    const scheduleNext = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        pushActivity();
        scheduleNext();
      }, 2800 + Math.random() * 2200);
    };

    timer = window.setTimeout(() => {
      if (cancelled) return;
      pushActivity();
      scheduleNext();
    }, 3200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivityTimeTick((tick) => tick + 1);
      setActivityLog((entries) => entries.map((entry) => ({ ...entry, fresh: false })));
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredActivity = useMemo(
    () => filterActivityByTab(activityLog, activeTab).slice(0, 7),
    [activityLog, activeTab, activityTimeTick],
  );

  return { activeTab, setActiveTab, filteredActivity };
}
