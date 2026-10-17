"use client";

import MainLayout from "../components/MainLayout";
import PageHeroBanner from "../components/PageHeroBanner";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "nextjs-toploader/app";
import { ensureAuth } from "../../lib/auth";
import { handleAppError } from "../../lib/errors";
import { useConnectWallet } from "../../lib/useConnectWallet";
import {
  approveMembershipSpend,
  purchaseOrUpgradeTier,
  getAmountDueUsd,
  getTierIndex,
  canPurchaseOrUpgradeTier,
  showMembershipSuccessModal,
  useMembershipQuote,
} from "../../lib/membership";
import { useDashboardData } from "../../lib/rewards";
import { TIERS, TIERS_WITH_OTC } from "../../lib/contracts";
import { api, ApiError } from "../../lib/api";
import MembershipRedeemPanel from "../components/MembershipRedeemPanel";
import MembershipPromoPopup from "../components/promo/MembershipPromoPopup";
import HntrFooter from "../components/layout/shell/HntrFooter";
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
    if (opts.isSelected) {
      if (quoteQuery.isLoading) return "CHECKING...";
      if (quoteQuery.data?.insufficientBalance) return "INSUFFICIENT BALANCE";
      if (quoteQuery.data?.needsApproval) return `APPROVE ${paymentToken}`;
      return opts.isUpgrade ? `UPGRADE WITH ${paymentToken}` : `PURCHASE WITH ${paymentToken}`;
    }
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

      const quote = quoteQuery.data ?? (await quoteQuery.refetch()).data;
      if (quote?.insufficientBalance) {
        window.showToast?.({
          title: "Insufficient balance",
          sub: `Add more ${quote.tokenSymbol} or switch to ${paymentToken === "USDT" ? "USDC" : "USDT"}.`,
          link: "",
        });
        return;
      }

      // Step 1 — approve only. Button switches to Purchase after quote refetch.
      if (quote?.needsApproval) {
        await approveMembershipSpend(tierName, paymentToken, {
          onAwaitingWallet: () => setPurchasePhase("wallet"),
          onWalletAccepted: () => setPurchasePhase("loading"),
        });
        await quoteQuery.refetch();
        window.showToast?.({
          title: `${paymentToken} approved`,
          sub: `Now click Purchase with ${paymentToken} to finish.`,
          link: "",
        });
        return;
      }

      // Step 2 — purchase / upgrade (allowance already set).
      const result = await purchaseOrUpgradeTier(tierName, paymentToken, {
        onAwaitingWallet: () => setPurchasePhase("wallet"),
        onWalletAccepted: () => setPurchasePhase("loading"),
      });

      await refetchSummary();
      setSelectedTier(null);
      // V2 success modal -> Welcome pop-up (first purchase) -> dashboard.
      showMembershipSuccessModal(result, summary?.username || "");
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
          <PageHeroBanner canvasId="memBannerCv" animationKind="membership" shadeClassName="mem-banner-shade" mosaicId="heroMosaic">
            <div className="hero-title">Membership Packages</div>
          </PageHeroBanner>

          <PaymentTokenToggle value={paymentToken} onChange={setPaymentToken} disabled={!!pendingTier} />
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
              // V2 highlights Gold by default; a selection (or the member's plan) takes over the highlight.
              const isHighlighted = isSelected || (!selectedTier && !currentTier && tier.name === "Gold");
              const amountDue = getAmountDueUsd(tier.name, currentTier);
              const disabled =
                !!pendingTier || isCurrent || isLower || (isSelected && quoteQuery.data?.insufficientBalance === true);
              const buttonLabel = tierButtonLabel(tier.name, { isCurrent, isLower, isUpgrade, isSelected });
              const badge = isCurrent ? "YOUR PLAN" : isSelected ? (isUpgrade ? "UPGRADE" : "SELECTED") : isHighlighted ? "RECOMMENDED" : null;
              const features = [`${tier.levels} Unilevel Levels`, "All Strategy Pools", `${tier.maxDeposit} Max Deposit`];
              if (TIERS_WITH_OTC.has(tier.name)) features.push("Tailor OTC Desk & NFT Lending");

              return (
                <div
                  className={`tier-card${isHighlighted || isCurrent ? " recommended" : ""} has-tcard${isCurrent ? " current" : ""}${isLower ? " locked" : ""}`}
                  key={tier.name}
                  style={isLower ? { opacity: 0.55 } : undefined}
                >
                  {badge && <div className="recommended-badge">{badge}</div>}
                  <div className="tcard" data-tier={tier.name.toLowerCase()}>
                    <span className="tcard-sheen" />
                    <div className="tcard-top">
                      <img src="/assets/v2/hntr-logos/hntr-wordmark-white.png" alt="HNTR" />
                      <span className="tcard-chip">Tier 0{idx + 1}</span>
                    </div>
                    <div>
                      <div className="tcard-lbl">Membership</div>
                      <div className="tcard-tier">{tier.name}</div>
                    </div>
                    <div className="tcard-bot">
                      <span>{isUpgrade ? "Upgrade" : "Price"}</span>
                      <b>${(isUpgrade ? amountDue : tier.priceUsd).toLocaleString()} USD</b>
                    </div>
                  </div>
                  <div className="tier-features">
                    {features.map((f) => (
                      <div className="tier-feature" key={f}>
                        <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                          <path
                            d="M3.5 6l1.5 1.5L8.5 4"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="tier-feature-text">{f}</span>
                      </div>
                    ))}
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

          <Suspense fallback={null}>
            <MembershipRedeemPanel />
          </Suspense>
        </div>
        <HntrFooter />
      </div>
      <MembershipPromoPopup />
    </MainLayout>
  );
}
