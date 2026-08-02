"use client";

import RailMobileProfileBlock from "./RailMobileProfileBlock";
import RailStatsRow from "./RailStatsRow";
import RailRewardCards from "./RailRewardCards";
import type { LeadershipStatus, RewardsSummary } from "../../../../lib/rewards";

type ClaimSymbol = "USDT" | "USDC";

type MobileHomeRailCardProps = {
  summary: RewardsSummary | undefined;
  hntrPoints: number;
  leadershipStatus: LeadershipStatus | undefined;
  claimBusy: boolean;
  claimBusySymbol?: ClaimSymbol | null;
  balancesHidden: boolean;
  maskBalance: (value: string) => string;
  onTogglePrivacy: () => void;
  onClaimCommissions: (symbol: ClaimSymbol) => void;
};

export default function MobileHomeRailCard({
  summary,
  hntrPoints,
  leadershipStatus,
  claimBusy,
  claimBusySymbol = null,
  balancesHidden,
  maskBalance,
  onTogglePrivacy,
  onClaimCommissions,
}: MobileHomeRailCardProps) {
  return (
    <div className="mobile-home-rail-card">
      <RailMobileProfileBlock
        summary={summary}
        balancesHidden={balancesHidden}
        onTogglePrivacy={onTogglePrivacy}
      />
      <RailStatsRow summary={summary} hntrPoints={hntrPoints} maskBalance={maskBalance} variant="mobile" />
      <div className="mobile-rail-rewards-grid">
        <RailRewardCards
          summary={summary}
          leadershipStatus={leadershipStatus}
          claimBusy={claimBusy}
          claimBusySymbol={claimBusySymbol}
          maskBalance={maskBalance}
          onClaimCommissions={onClaimCommissions}
          variant="mobile"
        />
      </div>
    </div>
  );
}
