"use client";

import SignupCard from "../../SignupCard";
import RailProfileCard from "./RailProfileCard";
import RailStatsRow from "./RailStatsRow";
import RailRewardCards from "./RailRewardCards";
import PlatformActivity from "./PlatformActivity";
import type { ActivityEntry, ActivityTab } from "../types";
import type { LeadershipStatus, RewardsSummary } from "../../../../lib/rewards";

type ClaimSymbol = "USDT" | "USDC";

type RightRailProps = {
  walletConnected: boolean;
  railOpen: boolean;
  isMobileView: boolean;
  railTransX: number;
  railOpacity: number;
  summary: RewardsSummary | undefined;
  hntrPoints: number;
  leadershipStatus: LeadershipStatus | undefined;
  claimBusy: boolean;
  claimBusySymbol?: ClaimSymbol | null;
  balancesHidden: boolean;
  activeTab: ActivityTab;
  filteredActivity: ActivityEntry[];
  maskBalance: (value: string) => string;
  onTogglePrivacy: () => void;
  onClaimCommissions: (symbol: ClaimSymbol) => void;
  onTabChange: (tab: ActivityTab) => void;
};

export default function RightRail({
  walletConnected,
  railOpen,
  isMobileView,
  railTransX,
  railOpacity,
  summary,
  hntrPoints,
  leadershipStatus,
  claimBusy,
  claimBusySymbol = null,
  balancesHidden,
  activeTab,
  filteredActivity,
  maskBalance,
  onTogglePrivacy,
  onClaimCommissions,
  onTabChange,
}: RightRailProps) {
  return (
    <div
      id="app-right-rail"
      className={`rail${railOpen ? " rail-open" : ""}${isMobileView ? " mobile-rail-drawer" : ""}`}
      style={
        isMobileView
          ? undefined
          : {
              transform: railOpen ? undefined : `translateX(${railTransX}%)`,
              opacity: railOpacity,
            }
      }
      onClick={(e) => e.stopPropagation()}
    >
      {!walletConnected ? (
        <SignupCard />
      ) : (
        <>
          <RailProfileCard summary={summary} balancesHidden={balancesHidden} onTogglePrivacy={onTogglePrivacy} />
          <RailStatsRow summary={summary} hntrPoints={hntrPoints} maskBalance={maskBalance} />
          <div className="rrtl">Active Rewards Tiers</div>
          <RailRewardCards
            summary={summary}
            leadershipStatus={leadershipStatus}
            claimBusy={claimBusy}
            claimBusySymbol={claimBusySymbol}
            maskBalance={maskBalance}
            onClaimCommissions={onClaimCommissions}
          />
        </>
      )}

      <PlatformActivity activeTab={activeTab} onTabChange={onTabChange} entries={filteredActivity} />
    </div>
  );
}
