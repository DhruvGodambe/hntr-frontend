"use client";

import SignupCard from "../SignupCard";
import { formatMonthlyGrowthLabel, useDashboardData, usePointsSummary } from "../../../lib/rewards";

export default function WebinarWalletPanel() {
  const { summary } = useDashboardData();
  const { data: pointsSummary } = usePointsSummary();
  const progress = summary?.progress;
  const progressPct = progress?.percent ?? 0;
  const growth = formatMonthlyGrowthLabel(summary?.monthlyEarningsGrowthPercent);

  return (
    <div className="web-wallet">
      <div className="web-wallet-on">
        <div className="r-div">
          <div className="rp">
            <div className="rav">👤</div>
            <div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="rn">{summary?.username || "Unregistered"}</div>
              </div>
              <div className="rt">{summary?.rank || "None"}</div>
            </div>
          </div>
          <div className="rpb-wrap">
            <div className="rph">
              <div className="rpl">Current Progress</div>
              <div className="rpp">{progressPct}%</div>
            </div>
            <div className="rpb">
              <div className="rpf" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="rpls">
              <span>{progress?.currentRank || "None"}</span>
              <span>{progress?.nextRank || "Max Rank"}</span>
            </div>
          </div>
        </div>
        <div className="r-div">
          <div className="rs2">
            <div className="rsb">
              <div className="rsbl">Total Rewarded</div>
              <div className="rsbv">
                ${(summary?.totalRewarded ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className={growth.className}>{growth.text}</div>
            </div>
            <div className="rsb">
              <div className="rsbl" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                HNTR Points
                <span className="info-i" data-tip="HNTR POINTS COMING SOON">
                  i
                </span>
              </div>
              <div className="rsbv">
                {(pointsSummary?.hntrPoints ?? 0).toLocaleString()}
              </div>
              <div className="rsbg">— Lifetime</div>
            </div>
          </div>
        </div>
      </div>
      <div className="web-wallet-off">
        <SignupCard />
      </div>
    </div>
  );
}
