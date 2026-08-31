"use client";

import type { RewardsSummary } from "../../../../lib/rewards";

type RailStatsRowProps = {
  summary: RewardsSummary | undefined;
  hntrPoints: number;
  maskBalance: (value: string) => string;
  variant?: "desktop" | "mobile";
};

function formatMonthlyGrowthLabel(percent: number | undefined): { text: string; className: string } {
  const value = percent ?? 0;
  if (value > 0) {
    return { text: `↑+${value.toFixed(1)}% This Month`, className: "rsbc" };
  }
  if (value < 0) {
    return { text: `↓${value.toFixed(1)}% This Month`, className: "rsbc neg" };
  }
  return { text: "0% This Month", className: "rsbg" };
}

export default function RailStatsRow({
  summary,
  hntrPoints,
  maskBalance,
  variant = "desktop",
}: RailStatsRowProps) {
  const isMobile = variant === "mobile";
  const growth = formatMonthlyGrowthLabel(summary?.monthlyEarningsGrowthPercent);

  return (
    <div className="r-div mobile-rail-stats-block">
      <div className="rs2">
        <div className={`rsb${isMobile ? " mobile-rsb" : ""}`}>
          <div className="rsbl">Total Rewarded</div>
          <div className="rsbv">
            {maskBalance(
              `$${(summary?.totalRewarded ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            )}
          </div>
          {!isMobile ? (
            <div className={growth.className}>{maskBalance(growth.text)}</div>
          ) : null}
        </div>
        <div className={`rsb${isMobile ? " mobile-rsb" : ""}`}>
          <div className="rsbl" style={isMobile ? undefined : { display: "flex", alignItems: "center", gap: "4px" }}>
            HNTR Points
            {!isMobile ? (
              <span className="info-i" data-tip="250 points per $1 spent on membership, 10 points per $1 commission earned.">
                i
              </span>
            ) : null}
          </div>
          <div className="rsbv">{maskBalance(hntrPoints.toLocaleString())}</div>
          {!isMobile ? <div className="rsbg">Lifetime</div> : null}
        </div>
      </div>
    </div>
  );
}
