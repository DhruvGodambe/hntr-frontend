"use client";

import { activityAccentColor, countryCodeToFlagEmoji, formatActivityTimeAgo } from "../utils";
import type { ActivityEntry } from "../types";

export default function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const flag = countryCodeToFlagEmoji(entry.country);

  return (
    <div className={`arow${entry.fresh ? " arow-new" : ""}`}>
      <div className="adot">{entry.icon}</div>
      <div className="ainf">
        <div className="an">
          {entry.name}
          {flag ? ` ${flag}` : ""}
        </div>
        <div className="aa" style={{ color: activityAccentColor(entry.action, entry.pos) }}>
          {entry.val ? `${entry.action} · ${entry.val}` : entry.action}
        </div>
      </div>
      <div className="atm">{formatActivityTimeAgo(entry.ts)}</div>
    </div>
  );
}
