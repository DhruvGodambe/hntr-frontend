"use client";

import { ReferralCommissionIcon, PoolRewardsIcon } from "../icons/RailIcons";
import { formatClaimableByToken } from "../../../../lib/tokens";
import type { RewardsSummary } from "../../../../lib/rewards";

type ClaimSymbol = "USDT" | "USDC";

type RailRewardCardsProps = {
  summary: RewardsSummary | undefined;
  claimBusy: boolean;
  claimBusySymbol?: ClaimSymbol | null;
  maskBalance: (value: string) => string;
  onClaimCommissions: (symbol: ClaimSymbol) => void;
  variant?: "desktop" | "mobile";
};

/** NFT strategy pool rewards are not live yet — never surface a claimable amount. */
const POOL_REWARDS_COMING_SOON_TITLE =
  "Pool rewards from NFT strategy pools are coming soon — nothing to claim yet.";

export default function RailRewardCards({
  summary,
  claimBusy,
  claimBusySymbol = null,
  maskBalance,
  onClaimCommissions,
  variant = "desktop",
}: RailRewardCardsProps) {
  const claimableByTokenLabel = formatClaimableByToken(summary?.tokens);
  const claimableTokens = (summary?.tokens || []).filter((t) => t.claimable > 0 && t.address);
  const isMobile = variant === "mobile";

  const claimButtons =
    claimableTokens.length > 0 ? (
      <div className="rrc-claim-btns">
        {claimableTokens.map((token) => (
          <button
            key={token.symbol}
            type="button"
            className="cbtn"
            disabled={claimBusy}
            onClick={() => onClaimCommissions(token.symbol as ClaimSymbol)}
            title={
              claimBusySymbol === token.symbol
                ? `Claiming ${token.symbol}…`
                : `Claim $${token.claimable.toFixed(2)} ${token.symbol}`
            }
          >
            {claimBusySymbol === token.symbol ? "CLAIMING…" : `CLAIM ${token.symbol}`}
          </button>
        ))}
      </div>
    ) : (
      <button
        type="button"
        className="cbtn"
        disabled
        title="Nothing to claim yet — commissions appear here as your network purchases memberships."
      >
        CLAIM
      </button>
    );

  const poolRewardsClaim = (
    <button type="button" className="cbtn" disabled title={POOL_REWARDS_COMING_SOON_TITLE}>
      SOON
    </button>
  );

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
          {claimButtons}
        </div>
        <div className="rrc mobile-rrc r-div">
          <div
            className="rrc-icon-row"
            style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}
          >
            <PoolRewardsIcon />
            <div className="rrctype">Pool Rewards</div>
          </div>
          <div className="rrcv mobile-rrcv">{maskBalance("$0.00")}</div>
          <div className="rrcd" style={{ marginBottom: "8px" }}>
            Coming soon — NFT strategy pools
          </div>
          {poolRewardsClaim}
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
          {claimButtons}
        </div>
      </div>
      <div className="rrc r-div">
        <div className="rrct">
          <div className="rrc-icon-row" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <PoolRewardsIcon compact />
            <div className="rrctype">Pool Rewards</div>
          </div>
        </div>
        <div className="rrcd">Coming soon — proportional distribution from NFT strategy pools</div>
        <div className="rrcb">
          <div className="rrcv">{maskBalance("$0.00")}</div>
          {poolRewardsClaim}
        </div>
      </div>
    </>
  );
}
