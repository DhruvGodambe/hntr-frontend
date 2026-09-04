"use client";

import MainLayout from "../components/MainLayout";
import PageHeroBanner from "../components/PageHeroBanner";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "nextjs-toploader/app";
import { ensureAuth } from "../../lib/auth";
import { handleAppError } from "../../lib/errors";
import { useConnectWallet } from "../../lib/useConnectWallet";
import {
  purchaseOrUpgradeTier,
  getAmountDueUsd,
  getTierIndex,
  canPurchaseOrUpgradeTier,
  useMembershipQuote,
} from "../../lib/membership";
import { useDashboardData } from "../../lib/rewards";
import { COMMISSION_LEVELS, PACKAGE_BENEFITS, PAYMENT_RULES, RANKS, TIERS, TIERS_WITH_OTC } from "../../lib/contracts";
import { api, ApiError } from "../../lib/api";
import PaymentTokenToggle from "../components/PaymentTokenToggle";
import MembershipPaySummary from "../components/MembershipPaySummary";
import type { PaymentToken } from "../../lib/tokens";
import type { StandardToastData } from "../../lib/notification-data";

declare global {
  interface Window {
    __resources?: Record<string, string>;
    openSignup?: () => void;
    suGoto?: (n: number) => void;
    showToast?: (data: StandardToastData) => void;
  }
}

function openSignupModal(step = 1) {
  if (typeof window.openSignup === "function") {
    window.openSignup();
  } else {
    document.getElementById("signupOverlay")?.classList.add("open");
    for (let s = 1; s <= 3; s += 1) {
      document.getElementById(`suStep${s}`)?.classList.toggle("on", s === step);
    }
    document.getElementById("suModal")?.classList.remove("wide");
  }
  document.body.classList.add("modal-open");
  if (step !== 1) window.suGoto?.(step);
}

type TierPurchasePhase = "wallet" | "loading";

export default function MembershipPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectWallet } = useConnectWallet();
  const { summary, refetchSummary } = useDashboardData();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const [purchasePhase, setPurchasePhase] = useState<TierPurchasePhase | null>(null);
  const [paymentToken, setPaymentToken] = useState<PaymentToken>("USDT");

  const currentTier = summary?.tier && summary.tier !== "None" ? summary.tier : null;
  const currentTierIndex = getTierIndex(currentTier);
  const quoteQuery = useMembershipQuote(selectedTier, paymentToken, !!selectedTier && !pendingTier);

  useEffect(() => {
    setSelectedTier(null);
  }, [currentTier]);

  const tierButtonLabel = (
    tierName: string,
    opts: { isCurrent: boolean; isLower: boolean; isUpgrade: boolean; isSelected: boolean },
  ) => {
    if (opts.isCurrent) return "CURRENT";
    if (opts.isLower) return "LOCKED";
    if (pendingTier === tierName) {
      if (purchasePhase === "loading") return "LOADING...";
      if (purchasePhase === "wallet") return "CONFIRM IN WALLET";
    }
    if (opts.isSelected) return opts.isUpgrade ? "UPGRADE" : "PURCHASE";
    return "SELECT";
  };

  useEffect(() => {
    window.__resources = {
      ...(window.__resources || {}),
      logoMark: "/assets/images/logoMark.png",
    };
  }, []);

  const ensureReadyToPurchase = async (walletAddress: string): Promise<boolean> => {
    try {
      await ensureAuth({ interactive: true });
      await api.get<{ profile: { username: string; tier: string } }>(
        `/api/users/wallet/${walletAddress.toLowerCase()}`,
        { auth: true },
      );
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        openSignupModal(2);
        return false;
      }
      throw error;
    }
  };

  const purchaseTier = async (tierName: string) => {
    if (pendingTier) return;
    if (selectedTier !== tierName) return;
    if (!canPurchaseOrUpgradeTier(tierName, currentTier)) {
      window.showToast?.({
        title: currentTierIndex > 0 ? "Cannot downgrade" : "Unavailable",
        sub:
          currentTierIndex > 0
            ? `You already hold ${currentTier}. Only higher tiers can be purchased.`
            : "This package is not available.",
        link: "",
      });
      return;
    }

    let walletAddress = address;
    if (!isConnected || !walletAddress) {
      try {
        walletAddress = await connectWallet();
      } catch {
        window.showToast?.({
          title: "Wallet required",
          sub: "Connect your wallet to purchase a membership tier.",
          link: "",
        });
        return;
      }
    }

    setPendingTier(tierName);
    setPurchasePhase(null);
    try {
      const ready = await ensureReadyToPurchase(walletAddress);
      if (!ready) return;

      if (quoteQuery.data?.insufficientBalance) {
        window.showToast?.({
          title: "Insufficient balance",
          sub: `Add more ${quoteQuery.data.tokenSymbol} or switch to ${paymentToken === "USDT" ? "USDC" : "USDT"}.`,
          link: "",
        });
        return;
      }

      const result = await purchaseOrUpgradeTier(tierName, paymentToken, {
        onAwaitingWallet: () => setPurchasePhase("wallet"),
        onWalletAccepted: () => setPurchasePhase("loading"),
      });

      window.showToast?.({
        title: result.isUpgrade ? "Membership upgraded" : "Membership activated",
        sub: `${result.tier} tier confirmed — paid ${result.amountLabel}.`,
        link: "",
      });
      await refetchSummary();
      setSelectedTier(null);
      router.push("/network");
    } catch (error) {
      const resolved = handleAppError(error, "Purchase failed");
      if (resolved.openSignup) openSignupModal(2);
    } finally {
      setPendingTier(null);
      setPurchasePhase(null);
    }
  };

  const handleTierAction = (tierName: string) => {
    if (pendingTier) return;
    if (!canPurchaseOrUpgradeTier(tierName, currentTier)) {
      window.showToast?.({
        title: currentTierIndex > 0 ? "Cannot downgrade" : "Unavailable",
        sub:
          currentTierIndex > 0
            ? `You already hold ${currentTier}. Only higher tiers can be purchased.`
            : "This package is not available.",
        link: "",
      });
      return;
    }

    if (selectedTier === tierName) {
      void purchaseTier(tierName);
      return;
    }

    setSelectedTier(tierName);
  };

  return (
    <MainLayout>
      <div className="feed" id="feed-membership">
        <div className="page-body">
          <PageHeroBanner
            canvasId="memBannerCv"
            animationKind="membership"
            shadeClassName="mem-banner-shade"
            mosaicId="heroMosaic"
          >
            <div className="hero-title">Membership Packages</div>
            {currentTier ? (
              <div className="hero-sub">
                You hold {currentTier}. Upgrade prices show only the difference you still owe — downgrades
                are not available.
              </div>
            ) : (
              <>
                <div className="hero-sub hero-sub-desktop">
                  Select a tier to unlock platform features. Deeper unilevel commissions also require the
                  matching network rank.
                </div>
                <div className="hero-sub hero-sub-mobile">
                  Select a tier to unlock all platform strategies and network commissions.
                </div>
              </>
            )}
          </PageHeroBanner>

          {/* TIER CARDS */}
          <PaymentTokenToggle
            value={paymentToken}
            onChange={setPaymentToken}
            disabled={!!pendingTier}
          />
          <MembershipPaySummary
            token={paymentToken}
            tierName={selectedTier}
            quote={quoteQuery.data}
            isLoading={quoteQuery.isLoading}
            isError={quoteQuery.isError}
            error={quoteQuery.error}
          />
          <div className="tiers-grid">
            {TIERS.map((tier, idx) => {
              const tierIndex = idx + 1;
              const isCurrent = currentTierIndex > 0 && tierIndex === currentTierIndex;
              const isLower = currentTierIndex > 0 && tierIndex < currentTierIndex;
              const isUpgrade = currentTierIndex > 0 && tierIndex > currentTierIndex;
              const isSelected = selectedTier === tier.name;
              const isPending = pendingTier === tier.name;
              const isHighlighted = isSelected;
              const amountDue = getAmountDueUsd(tier.name, currentTier);
              const disabled =
                !!pendingTier ||
                isCurrent ||
                isLower ||
                (isSelected && quoteQuery.data?.insufficientBalance === true);
              const hasExtra = TIERS_WITH_OTC.has(tier.name);
              const buttonLabel = tierButtonLabel(tier.name, {
                isCurrent,
                isLower,
                isUpgrade,
                isSelected,
              });

              return (
                <div
                  className={`tier-card${isHighlighted ? " recommended" : ""}${isCurrent ? " current" : ""}${isLower ? " locked" : ""}`}
                  key={tier.name}
                  style={isLower || isCurrent ? { opacity: isCurrent ? 0.92 : 0.55 } : undefined}
                >
                  {isHighlighted && !isCurrent && (
                    <div className="recommended-badge">
                      {isUpgrade ? "UPGRADE" : "SELECTED"}
                    </div>
                  )}
                  {isCurrent && (
                    <div className="recommended-badge" style={{ background: "var(--green, #5E6B55)" }}>
                      YOUR PLAN
                    </div>
                  )}
                  <div className="tier-label">Tier 0{idx + 1}</div>
                  <div className="tier-name">{tier.name}</div>
                  <div className="tier-price">
                    ${(isUpgrade ? amountDue : tier.priceUsd).toLocaleString()}
                    <span className="tier-price-unit">USD</span>
                  </div>
                  {isUpgrade && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--t0)",
                        marginTop: "-6px",
                        marginBottom: "8px",
                      }}
                    >
                      Upgrade from {currentTier} · full price ${tier.priceUsd.toLocaleString()}
                    </div>
                  )}
                  <div className="tier-divider"></div>
                  <div className="tier-features">
                    <div className="tier-feature">
                      <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke={isHighlighted ? "rgba(242,239,234,.7)" : "currentColor"} strokeWidth="1.2"></circle>
                        <path d="M3.5 6l1.5 1.5L8.5 4" stroke={isHighlighted ? "rgba(242,239,234,.9)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <span className="tier-feature-text">Full Educational Section</span>
                    </div>
                    <div className="tier-feature">
                      <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke={isHighlighted ? "rgba(242,239,234,.7)" : "currentColor"} strokeWidth="1.2"></circle>
                        <path d="M3.5 6l1.5 1.5L8.5 4" stroke={isHighlighted ? "rgba(242,239,234,.9)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <span className="tier-feature-text">Pool Strategy Access</span>
                    </div>
                    <div className="tier-feature">
                      <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke={isHighlighted ? "rgba(242,239,234,.7)" : "currentColor"} strokeWidth="1.2"></circle>
                        <path d="M3.5 6l1.5 1.5L8.5 4" stroke={isHighlighted ? "rgba(242,239,234,.9)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <span className="tier-feature-text">{tier.levels} Unilevel Levels</span>
                    </div>
                    <div className="tier-feature">
                      <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke={isHighlighted ? "rgba(242,239,234,.7)" : "currentColor"} strokeWidth="1.2"></circle>
                        <path d="M3.5 6l1.5 1.5L8.5 4" stroke={isHighlighted ? "rgba(242,239,234,.9)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <span className="tier-feature-text">{tier.maxDeposit} Max Deposit per Pool</span>
                    </div>
                    {hasExtra && (
                      <div className="tier-feature">
                        <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                          <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        <span className="tier-feature-text">Tailor OTC Desk & NFT Lending</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`tier-btn${isSelected || isPending ? " purchase" : ""}`}
                    onClick={() => handleTierAction(tier.name)}
                    disabled={disabled}
                    title={
                      isLower
                        ? "Downgrades are not allowed"
                        : isCurrent
                        ? "This is your current membership"
                        : isSelected && quoteQuery.data?.insufficientBalance
                        ? `Insufficient ${quoteQuery.data.tokenSymbol} balance`
                        : undefined
                    }
                  >
                    {buttonLabel}
                  </button>
                </div>
              );
            })}
          </div>

          {/* COMMISSION STRUCTURE */}
          <div className="comparison">
            <div className="cmp-hdr">
              <div className="cmp-title">Commission Structure</div>
              <div className="cmp-sub">
                Each downline level pays the listed rate. Levels 4–12 require both the membership tier and the network rank.
                Example — a $1,000 membership sale pays $650 instantly across all 12 levels (65% total).
              </div>
            </div>
            <div className="table-scroll">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th style={{ width: "12%" }}>Level</th>
                    <th style={{ width: "18%" }}>Commission %</th>
                    <th style={{ width: "35%" }}>Required Membership</th>
                    <th style={{ width: "35%" }}>Required Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_LEVELS.map((row, idx) => (
                    <tr key={row.level} className={idx % 2 === 0 ? "highlight-row" : ""}>
                      <td>{row.level}</td>
                      <td>{row.percent}%</td>
                      <td>{row.requiredMembership}</td>
                      <td>{row.requiredRank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div className="comparison">
            <div className="cmp-hdr">
              <div className="cmp-title">Membership Comparison</div>
              <div className="cmp-sub">Detailed feature breakdown across all membership tiers.</div>
            </div>
            <div className="table-scroll">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th style={{ width: "28%" }}>Feature</th>
                    {TIERS.map((tier) => {
                      const isCurrentColumn = currentTierIndex > 0 && getTierIndex(tier.name) === currentTierIndex;
                      return (
                        <th
                          key={tier.name}
                          className={[
                            tier.name === "Diamond" ? "apex-col" : "",
                            isCurrentColumn ? "current-tier-col" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {tier.name}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Educational Section</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        <span className="check">✓</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="highlight-row">
                    <td>Pool Strategy Access</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        <span className="check">✓</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Unilevel Levels</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        {tier.levels} Levels
                      </td>
                    ))}
                  </tr>
                  <tr className="highlight-row">
                    <td>Max Deposit per Pool</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        {tier.maxDeposit}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Tailor OTC Desk & NFT Lending Platform</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        {TIERS_WITH_OTC.has(tier.name) ? (
                          <span className="check">✓</span>
                        ) : (
                          <span className="cross">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PACKAGE BENEFITS */}
          <div className="comparison">
            <div className="cmp-hdr">
              <div className="cmp-title">Detailed Package Benefits</div>
              <div className="cmp-sub">Full feature breakdown for every membership tier.</div>
            </div>
            <div className="package-benefits-grid">
              {PACKAGE_BENEFITS.map((section) => (
                <div className="package-benefit-card" key={section.title}>
                  <div className="package-benefit-title">{section.title}</div>
                  <ul className="package-benefit-list">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* RANK STRUCTURE */}
          <div className="comparison">
            <div className="cmp-hdr">
              <div className="cmp-title">Rank Structure & Requirements</div>
              <div className="cmp-sub">
                Lifetime cumulative team volume with balanced leg rules (40/40/20). You must maintain the minimum required active membership.
              </div>
            </div>
            <div className="table-scroll">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th style={{ width: "18%" }}>Rank</th>
                    <th style={{ width: "18%" }}>Required Team Volume</th>
                    <th style={{ width: "22%" }}>Minimum Membership</th>
                    <th style={{ width: "18%" }}>Achievement Bonus</th>
                    <th style={{ width: "14%" }}>Leadership Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {RANKS.map((row, idx) => (
                    <tr key={row.name} className={idx % 2 === 0 ? "highlight-row" : ""}>
                      <td>{row.name}</td>
                      <td>${row.teamVolumeUsd.toLocaleString()}</td>
                      <td>{row.requiredMembership}</td>
                      <td>${row.achievementBonusUsd.toLocaleString()}</td>
                      <td>{row.leadershipShares ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAYMENT & PAYOUT RULES */}
          <div className="comparison">
            <div className="cmp-hdr">
              <div className="cmp-title">Payment & Payout Rules</div>
              <div className="cmp-sub">How memberships, commissions, pools, and bonuses are settled on-chain and off-chain.</div>
            </div>
            <ul className="payment-rules-list">
              {PAYMENT_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
