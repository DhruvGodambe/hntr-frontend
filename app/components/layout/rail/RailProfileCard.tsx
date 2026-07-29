"use client";

import PrivacyEyeIcon from "../icons/PrivacyEyeIcon";
import type { RewardsSummary } from "../../../../lib/rewards";

type RailProfileCardProps = {
  summary: RewardsSummary | undefined;
  balancesHidden: boolean;
  onTogglePrivacy: () => void;
};

export default function RailProfileCard({ summary, balancesHidden, onTogglePrivacy }: RailProfileCardProps) {
  const progress = summary?.progress;
  const progressPct = progress?.percent ?? 0;

  return (
    <div className="r-div rail-profile-block">
      <div className="rp">
        <div className="rav">👤</div>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="rn">{summary?.username || "Unregistered"}</div>
          </div>
          <div className="rt">{summary?.rank || "None"}</div>
        </div>
        <button
          className={`privacy-eye${balancesHidden ? " off" : ""}`}
          type="button"
          onClick={onTogglePrivacy}
          aria-label={balancesHidden ? "Show balances" : "Hide balances"}
          title={balancesHidden ? "Show balances" : "Hide balances"}
        >
          <PrivacyEyeIcon hidden={balancesHidden} />
        </button>
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
  );
}
