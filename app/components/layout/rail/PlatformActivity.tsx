"use client";

import ActivityEmptyState from "../../empty/ActivityEmptyState";
import ActivityRow from "./ActivityRow";
import type { ActivityEntry, ActivityTab } from "../types";

type PlatformActivityProps = {
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  entries?: ActivityEntry[];
  inline?: boolean;
};

export default function PlatformActivity({
  activeTab,
  onTabChange,
  entries = [],
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
        {entries.length > 0 ? (
          entries.map((entry) => <ActivityRow key={entry.id} entry={entry} />)
        ) : (
          <ActivityEmptyState />
        )}
      </div>
    </>
  );
}
