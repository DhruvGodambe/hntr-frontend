"use client";

import CountryFlag from "../CountryFlag";
import { usePlatformActivity, type PlatformActivityEntry } from "@/lib/activity";
import { formatRelativeTime } from "@/lib/notifications";

const ROWS = 8;
const COLUMNS = ["Member", "Event", "Tier", "Country", "Time"];

/** [full, short] — the short form is shown where the table is squeezed (tablet widths beside the sidebar). */
const EVENT_LABEL: Record<string, [string, string]> = {
  JOINED: ["Joined", "Joined"],
  PURCHASED: ["Bought membership", "Bought"],
  UPGRADED: ["Upgraded membership", "Upgraded"],
  REDEEMED: ["Redeemed gift code", "Redeemed"],
};

function eventLabel(entry: PlatformActivityEntry): [string, string] {
  return EVENT_LABEL[entry.action] ?? [entry.action, entry.action];
}

/**
 * Home "Platform Activity": recent sign-ups and membership purchases from the
 * public feed (GET /api/activity/feed). Reuses the V2 `.net-act` table styling;
 * on phones V2 hides the 4th (Country) column.
 */
export default function PlatformActivity() {
  const { data, isLoading, isError } = usePlatformActivity(ROWS);
  const rows = (data ?? []).slice(0, ROWS);

  const message = isLoading
    ? "Loading activity…"
    : isError
      ? "Activity is unavailable right now."
      : rows.length === 0
        ? "No activity yet."
        : null;

  return (
    <section id="homeActivity">
      <div className="sh">
        <div>
          <div className="st" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
              <path d="M2 10h3.5l2.2-5.5 4.6 11 2.2-5.5H18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            PLATFORM ACTIVITY
          </div>
          <div className="sub">Latest members joining and buying memberships</div>
        </div>
      </div>
      <div className="net-act">
        <div className="nempty">
          <table className="net-table">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody id="homeActTable">
              {message ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="pa-msg">
                    {message}
                  </td>
                </tr>
              ) : (
                rows.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="td-wallet pa-user" data-no-i18n="">
                        {entry.username}
                      </span>
                    </td>
                    <td>
                      <span className={`pa-ev pa-ev-${entry.kind}`}>
                        <span className="pa-ev-full">{eventLabel(entry)[0]}</span>
                        <span className="pa-ev-short">{eventLabel(entry)[1]}</span>
                      </span>
                    </td>
                    <td>
                      <span className="td-amt">{entry.tier && entry.tier !== "None" ? entry.tier : "—"}</span>
                    </td>
                    <td>
                      <span className="pa-country">
                        {entry.country ? (
                          <>
                            <CountryFlag code={entry.country} className="pa-flag" />
                            {entry.country.toUpperCase()}
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="td-time">{formatRelativeTime(new Date(entry.ts).toISOString())}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
