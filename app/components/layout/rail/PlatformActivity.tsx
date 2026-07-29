"use client";

import { AnimatePresence, motion } from "framer-motion";
import { activityAccentColor, formatActivityTimeAgo } from "../utils";
import type { ActivityEntry, ActivityTab } from "../types";

type PlatformActivityProps = {
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  entries: ActivityEntry[];
  inline?: boolean;
};

export default function PlatformActivity({
  activeTab,
  onTabChange,
  entries,
  inline = false,
}: PlatformActivityProps) {
  return (
    <>
      {inline ? (
        <div className="mobile-activity-head">
          <div className="ratl">Platform Activity</div>
          <div className="mobile-activity-live">
            <span className="mobile-activity-live-dot" aria-hidden="true" />
            LIVE
          </div>
        </div>
      ) : (
        <div className="ratl">Platform Activity</div>
      )}
      <div className={inline ? "mobile-activity-tabs" : "atabs"}>
        <button
          type="button"
          className={`at ${activeTab === "all" ? "active" : ""}`}
          onClick={() => onTabChange("all")}
        >
          All Feeds
        </button>
        <button
          type="button"
          className={`at ${activeTab === "bids" ? "active" : ""}`}
          onClick={() => onTabChange("bids")}
        >
          Bids
        </button>
        <button
          type="button"
          className={`at ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => onTabChange("sales")}
        >
          Sales
        </button>
      </div>
      <div id={inline ? "mobileActivityFeed" : "activityFeed"} className={inline ? "mobile-activity-feed" : undefined}>
        <AnimatePresence mode="popLayout" initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`arow${entry.fresh ? " arow-new" : ""}`}
            >
              <div className="adot">{entry.icon}</div>
              <div className="ainf">
                <div className="an">{entry.name}</div>
                <div className="aa" style={{ color: activityAccentColor(entry.action, entry.pos) }}>
                  {entry.action} · {entry.val}
                </div>
              </div>
              <div className="atm">{formatActivityTimeAgo(entry.ts)}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <a className="vact">View Activity</a>
    </>
  );
}
