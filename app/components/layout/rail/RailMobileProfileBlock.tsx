"use client";

import Link from "next/link";
import PrivacyEyeIcon from "../icons/PrivacyEyeIcon";
import { formatRankSubtitle } from "../utils";
import type { RewardsSummary } from "../../../../lib/rewards";

type RailMobileProfileBlockProps = {
  summary: RewardsSummary | undefined;
  balancesHidden: boolean;
  onTogglePrivacy: () => void;
};

export default function RailMobileProfileBlock({
  summary,
  balancesHidden,
  onTogglePrivacy,
}: RailMobileProfileBlockProps) {
  const progress = summary?.progress;
  const progressPct = progress?.percent ?? 0;
  const rankLabel = summary?.rank || "None";
  const rankBadge = rankLabel.toLowerCase().includes("elite") ? "ELITE" : null;

  return (
    <div className="r-div rail-profile-block mobile-rail-profile">
      <div className="rp mobile-rp">
        <div className="rav mobile-rav">👤</div>
        <div className="mobile-rp-meta">
          <div className="mobile-rp-name-row">
            <div className="rn mobile-rn">{summary?.username || "Unregistered"}</div>
            {rankBadge ? <span className="mobile-rank-badge">{rankBadge}</span> : null}
          </div>
          <div className="rt mobile-rt">{formatRankSubtitle(rankLabel)}</div>
        </div>
        <button
          className={`privacy-eye mobile-privacy-eye${balancesHidden ? " off" : ""}`}
          type="button"
          onClick={onTogglePrivacy}
          aria-label={balancesHidden ? "Show balances" : "Hide balances"}
          title={balancesHidden ? "Show balances" : "Hide balances"}
        >
          <PrivacyEyeIcon hidden={balancesHidden} />
        </button>
        <Link href="/membership" className="mobile-upgrade-btn">
          UPGRADE
        </Link>
      </div>
      <div className="rpb-wrap mobile-rpb-wrap">
        <div className="rph mobile-rph">
          <div className="rpl mobile-rpl">Current Progress</div>
          <div className="rpp mobile-rpp">{progressPct}%</div>
        </div>
        <div className="rpb mobile-rpb">
          <div className="rpf mobile-rpf" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  );
}
