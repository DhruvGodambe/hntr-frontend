"use client";

import { ReferralCommissionIcon, PoolRewardsIcon } from "../icons/RailIcons";
import { formatClaimableByToken } from "../../../../lib/tokens";
import type { LeadershipStatus, RewardsSummary } from "../../../../lib/rewards";

type RailRewardCardsProps = {
  summary: RewardsSummary | undefined;
  leadershipStatus: LeadershipStatus | undefined;
  claimBusy: boolean;
  maskBalance: (value: string) => string;
  onClaimCommissions: () => void;
  variant?: "desktop" | "mobile";
};

export default function RailRewardCards({
  summary,
  leadershipStatus,
  claimBusy,
  maskBalance,
  onClaimCommissions,
  variant = "desktop",
}: RailRewardCardsProps) {
  const poolRewardsAmount = leadershipStatus?.estimatedPayoutUSD ?? 0;
  const hasPoolRewards = !!(leadershipStatus?.hasShares && poolRewardsAmount > 0);
  const claimableByTokenLabel = formatClaimableByToken(summary?.tokens);
  const isMobile = variant === "mobile";

  if (isMobile) {
    return (
      <>
        <div className="rrc mobile-rrc">
          <div
            className="rrc-icon-row"
            style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}
          >
            <ReferralCommissionIcon />
            <div className="rrctype">Referral Commission</div>
          </div>
          <div className="rrcv mobile-rrcv">{maskBalance(`$${(summary?.claimableNow ?? 0).toFixed(2)}`)}</div>
          {claimableByTokenLabel ? (
            <div className="rrcd" style={{ marginTop: "4px", marginBottom: "8px" }}>
              {claimableByTokenLabel}
            </div>
          ) : null}
          <button
            className="cbtn"
            disabled={claimBusy || !(summary?.claimableNow && summary.claimableNow > 0)}
            onClick={onClaimCommissions}
            title={
              claimBusy
                ? "Claim in progress…"
                : summary?.claimableNow && summary.claimableNow > 0
                  ? "Claim your commissions now"
                  : "Nothing to claim yet"
            }
          >
            {claimBusy ? "CLAIMING…" : "CLAIM"}
          </button>
        </div>
        <div className="rrc mobile-rrc r-div">
          <div
            className="rrc-icon-row"
            style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}
          >
            <PoolRewardsIcon />
            <div className="rrctype">Pool Rewards</div>
          </div>
          <div className="rrcv mobile-rrcv">{maskBalance(`$${poolRewardsAmount.toFixed(2)}`)}</div>
          <button
            className="cbtn"
            disabled={!hasPoolRewards}
            title={
              hasPoolRewards
                ? "Pool rewards are distributed monthly from the leadership pool"
                : "Reach Hunter rank or above to earn pool rewards"
            }
          >
            CLAIM
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="rrc" style={{ marginBottom: "8px" }}>
        <div className="rrct">
          <div className="rrc-icon-row" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <ReferralCommissionIcon compact />
            <div className="rrctype">Referral Commission</div>
          </div>
        </div>
        <div className="rrcd">Claimable now from your direct referral network</div>
        {claimableByTokenLabel ? (
          <div className="rrcd" style={{ marginTop: "2px", color: "var(--t3)" }}>
            {claimableByTokenLabel}
          </div>
        ) : null}
        <div className="rrcb">
          <div className="rrcv">{maskBalance(`$${(summary?.claimableNow ?? 0).toFixed(2)}`)}</div>
          <button
            className="cbtn"
            disabled={claimBusy || !(summary?.claimableNow && summary.claimableNow > 0)}
            onClick={onClaimCommissions}
            title={
              claimBusy
                ? "Claim in progress…"
                : summary?.claimableNow && summary.claimableNow > 0
                  ? "Claim your commissions now"
                  : "Nothing to claim yet — commissions appear here as your network purchases memberships."
            }
          >
            {claimBusy ? "CLAIMING…" : "CLAIM"}
          </button>
        </div>
      </div>
      <div className="rrc r-div">
        <div className="rrct">
          <div className="rrc-icon-row" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <PoolRewardsIcon compact />
            <div className="rrctype">Pool Rewards</div>
          </div>
        </div>
        <div className="rrcd">Proportional distribution from NFT strategy pools</div>
        <div className="rrcb">
          <div className="rrcv">{maskBalance(`$${poolRewardsAmount.toFixed(2)}`)}</div>
          <button
            className="cbtn"
            disabled={!hasPoolRewards}
            title={
              hasPoolRewards
                ? "Pool rewards are distributed monthly from the leadership pool"
                : "Reach Hunter rank or above to earn pool rewards"
            }
          >
            CLAIM
          </button>
        </div>
      </div>
    </>
  );
}
