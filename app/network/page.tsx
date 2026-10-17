"use client";

import MainLayout from "../components/MainLayout";
import NetworkTopologyTree, { canvasHeightForDepth } from "../components/NetworkTopologyTree";
import NetworkNodeView from "../components/NetworkNodeView";
import PageHeroBanner from "../components/PageHeroBanner";
import HntrFooter from "../components/layout/shell/HntrFooter";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import QRCode from "qrcode";
import { useRouter } from "nextjs-toploader/app";
import { handleAppError } from "../../lib/errors";
import {
  useClaimCommissions,
  useDashboardData,
  useTransactionHistory,
  useNetworkTree,
  useLeadershipStatus,
  useAchievementStatus,
  usePointsSummary,
  formatPoolWalletBalances,
  formatTokenAmount,
  formatVolume,
  NETWORK_TREE_DEPTH_OPTIONS,
  fetchNetworkTree,
  networkTreeQueryKey,
  type NetworkTreeDepth,
  type TransactionEntry,
} from "../../lib/rewards";
import { formatClaimableByToken, resolveTokenSymbol } from "../../lib/tokens";
import { hasActiveMembership } from "../../lib/membership";
import { useEffectiveAccount } from "../../lib/session";
import { explorerTxUrl, RANKS, TIERS } from "../../lib/contracts";
import { useConnectWallet } from "../../lib/useConnectWallet";
import type { StandardToastData } from "../../lib/notification-data";

declare global {
  interface Window {
    drawQR?: () => void;
    showToast?: (data: StandardToastData) => void;
    connectWalletForSignup?: () => Promise<void>;
    openSignup?: () => void;
  }
}

const TX_TYPE_LABEL: Record<TransactionEntry["type"], string> = {
  CommissionEarned: "Referral Commission",
  COMMISSION_EARNED: "Referral Commission",
  CommissionWithdrawn: "Commission Claimed",
  COMMISSION_WITHDRAWN: "Commission Claimed",
  MembershipPurchased: "Membership Purchase",
  PURCHASE: "Membership Purchase",
  MembershipUpgraded: "Membership Upgrade",
  UPGRADE: "Membership Upgrade",
  COMMISSION_CLAIM: "Commission Claimed",
  UNCLAIMED_WITHDRAWN: "Unclaimed Withdrawal",
  COMPANY_WALLET_WITHDRAWN: "Unclaimed Withdrawal",
  VOUCHER_MEMBERSHIP_REDEEM: "Gift Redemption",
  MEMBERSHIP_OVERRIDE: "Membership Override",
  LEADERSHIP_PAYOUT: "Global Sales Bonus",
  ACHIEVEMENT_BONUS: "Rank Bonus",
};

function formatTxDateParts(iso: string | null): { date: string; time: string } | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;

  return {
    date: parsed.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
    time: `${parsed.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    })} UTC`,
  };
}

function formatTxDate(iso: string | null) {
  const parts = formatTxDateParts(iso);
  if (!parts) return "—";
  return `${parts.date} · ${parts.time}`;
}

function getTxSource(tx: TransactionEntry) {
  if (tx.type === "LEADERSHIP_PAYOUT") {
    return tx.tier ? `Leadership · ${tx.tier}` : "Leadership Pool";
  }
  if (tx.type === "ACHIEVEMENT_BONUS") {
    return tx.tier ? `${tx.tier} rank` : "Rank Bonus";
  }
  if (tx.tier) return `${tx.tier} tier`;
  if (tx.level) return `Level ${tx.level}`;
  return "—";
}

/** Stable filter keys. The menu is this fixed list, not values scraped from the current rows. */
const TX_SOURCE_GROUPS = [
  {
    label: "Referral levels",
    options: Array.from({ length: 12 }, (_, index) => ({
      value: `level:${index + 1}`,
      label: `Level ${index + 1}`,
    })),
  },
  {
    label: "Rank bonuses",
    options: RANKS.map((rank) => ({
      value: `rank:${rank.name}`,
      label: `${rank.name} rank`,
    })),
  },
  {
    label: "Leadership",
    options: [{ value: "leadership", label: "Global Sales Bonus" }],
  },
  {
    label: "Membership tiers",
    options: TIERS.map((tier) => ({
      value: `tier:${tier.name}`,
      label: `${tier.name} tier`,
    })),
  },
] as const;

const TX_SOURCE_OPTIONS = TX_SOURCE_GROUPS.flatMap((group) => [...group.options]);

function txSourceKey(tx: TransactionEntry): string | null {
  if (tx.type === "LEADERSHIP_PAYOUT") return "leadership";
  if (tx.type === "ACHIEVEMENT_BONUS") {
    return RANKS.some((rank) => rank.name === tx.tier) ? `rank:${tx.tier}` : null;
  }
  if (TIERS.some((tier) => tier.name === tx.tier)) return `tier:${tx.tier}`;
  if (tx.level && tx.level >= 1 && tx.level <= 12) return `level:${tx.level}`;
  return null;
}

function formatSourceUser(tx: TransactionEntry) {
  const isCommission = tx.type === "CommissionEarned" || tx.type === "COMMISSION_EARNED";
  if (!isCommission) return "—";

  if (tx.sourceUsername) return `@${tx.sourceUsername}`;
  if (tx.sourceWalletAddress) {
    return `${tx.sourceWalletAddress.slice(0, 6)}…${tx.sourceWalletAddress.slice(-4)}`;
  }
  return "—";
}

function getTxTypeCategory(type: TransactionEntry["type"]) {
  switch (type) {
    case "CommissionEarned":
    case "COMMISSION_EARNED":
      return "referral";
    case "CommissionWithdrawn":
    case "COMMISSION_WITHDRAWN":
    case "COMMISSION_CLAIM":
    case "UNCLAIMED_WITHDRAWN":
    case "COMPANY_WALLET_WITHDRAWN":
      return "claimed";
    case "MembershipPurchased":
    case "PURCHASE":
    case "VOUCHER_MEMBERSHIP_REDEEM":
    case "MEMBERSHIP_OVERRIDE":
      return "purchase";
    case "MembershipUpgraded":
    case "UPGRADE":
      return "upgrade";
    case "LEADERSHIP_PAYOUT":
      return "leadership";
    case "ACHIEVEMENT_BONUS":
      return "rankBonus";
    default:
      return "other";
  }
}

function formatTxHash(txHash: string | undefined) {
  if (!txHash) return "—";
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
}

const TX_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "referral", label: "Referral Commission" },
  { value: "claimed", label: "Commission Claimed" },
  { value: "purchase", label: "Membership Purchase" },
  { value: "upgrade", label: "Membership Upgrade" },
  { value: "leadership", label: "Global Sales Bonus" },
  { value: "rankBonus", label: "Rank Bonus" },
] as const;

const TX_PAGE_SIZE = 10;

/** Not-live reward tiers — red status dot + COMING SOON badge. */
const UPCOMING_NETWORK_REWARDS = {
  nftStrategy: {
    name: "NFT Strategy Rewards",
    desc: "Claim your profit upon successful NFT Strategy sale",
  },
  otcDesk: {
    name: "OTC Desk",
    desc: "Private OTC desk for off-market NFT deals. Profit share 0–100% per deal.",
  },
  liquidityProvider: {
    name: "Liquidity Provider",
    desc: "Deploy capital as LP on major NFT lending markets — low-risk yield, separate from floor flips",
  },
} as const;

function getPageNumbers(current: number, total: number) {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) {
    pages.push(page);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export default function NetworkPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { chainId } = useAccount();
  const { isImpersonation } = useEffectiveAccount();
  const [profileFlipped, setProfileFlipped] = useState(false);
  const { summary, refetchSummary, isFetching, isConnected } = useDashboardData();
  const {
    data: txData,
    refetch: refetchTransactions,
    isFetching: txFetching,
  } = useTransactionHistory(100);
  const [treeDepth, setTreeDepth] = useState<NetworkTreeDepth>(3);
  const [topoView, setTopoView] = useState<"plane" | "node">("plane");
  const {
    data: treeData,
    isLoading: treeLoading,
    isFetching: treeFetching,
  } = useNetworkTree(summary?.username, treeDepth);
  const { data: leadershipStatus } = useLeadershipStatus();
  const { data: achievementStatus } = useAchievementStatus();
  const { data: pointsSummary } = usePointsSummary();
  const claimCommissions = useClaimCommissions();
  const { connectWallet } = useConnectWallet();
  const [connectBusy, setConnectBusy] = useState(false);
  const [claimBusySymbol, setClaimBusySymbol] = useState<"USDT" | "USDC" | null>(null);
  const claimBusy = claimBusySymbol !== null;
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState<(typeof TX_TYPE_FILTER_OPTIONS)[number]["value"]>("all");
  const [txSourceFilter, setTxSourceFilter] = useState("all");
  const [txFilterOpen, setTxFilterOpen] = useState(false);
  const [txSourceMenuOpen, setTxSourceMenuOpen] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const transactions = txData?.transactions || [];

  const handleTreeDepthChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextDepth = Number(event.target.value) as NetworkTreeDepth;
      if (!NETWORK_TREE_DEPTH_OPTIONS.includes(nextDepth)) return;

      if (!isConnected) {
        window.showToast?.({
          title: "Wallet not connected",
          sub: "Connect your wallet to load your network tree.",
          link: "",
          variant: "error",
        });
        return;
      }

      const username = summary?.username;
      if (!username) {
        window.showToast?.({
          title: "Network unavailable",
          sub: "Sign in with your wallet to view your downline tree.",
          link: "",
          variant: "error",
        });
        return;
      }

      setTreeDepth(nextDepth);

      void queryClient.fetchQuery({
        queryKey: networkTreeQueryKey(username, nextDepth),
        queryFn: () => fetchNetworkTree(username, nextDepth),
      });
    },
    [queryClient, summary?.username, isConnected],
  );

  const txSourceLabel = TX_SOURCE_OPTIONS.find((option) => option.value === txSourceFilter)?.label ?? "All Sources";

  const filteredTransactions = useMemo(() => {
    const query = txSearch.trim().toLowerCase();

    return transactions.filter((tx) => {
      const typeLabel = TX_TYPE_LABEL[tx.type] || tx.type;
      const source = getTxSource(tx);
      const typeCategory = getTxTypeCategory(tx.type);

      if (txTypeFilter !== "all" && typeCategory !== txTypeFilter) return false;
      if (txSourceFilter !== "all" && txSourceKey(tx) !== txSourceFilter) return false;

      if (!query) return true;

      const haystack = [
        formatTxDate(tx.timestamp),
        typeLabel,
        source,
        formatTokenAmount(tx.amount),
        tx.status || "Confirmed",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [transactions, txSearch, txTypeFilter, txSourceFilter]);

  const txTotalPages = Math.max(1, Math.ceil(filteredTransactions.length / TX_PAGE_SIZE));

  const paginatedTransactions = useMemo(() => {
    const safePage = Math.min(txPage, txTotalPages);
    const start = (safePage - 1) * TX_PAGE_SIZE;
    return filteredTransactions.slice(start, start + TX_PAGE_SIZE);
  }, [filteredTransactions, txPage, txTotalPages]);

  const txPageNumbers = useMemo(() => getPageNumbers(Math.min(txPage, txTotalPages), txTotalPages), [txPage, txTotalPages]);

  useEffect(() => {
    setTxPage(1);
  }, [txSearch, txTypeFilter, txSourceFilter]);

  useEffect(() => {
    if (txPage > txTotalPages) setTxPage(txTotalPages);
  }, [txPage, txTotalPages]);

  useEffect(() => {
    if (!txFilterOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".txh-filter-wrap")) {
        setTxFilterOpen(false);
        setTxSourceMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [txFilterOpen]);
  const claimableTokens = (summary?.tokens || []).filter((t) => t.claimable > 0 && t.address);
  const hasClaimableCommissions = claimableTokens.length > 0;
  const claimDisabledReason = claimBusy
    ? `Claiming ${claimBusySymbol}…`
    : !summary
    ? "Connect your wallet to check your balance."
    : !hasClaimableCommissions
    ? "Nothing to claim yet — commissions appear here as your network purchases memberships."
    : "";
  const hasLeadershipShares = !!leadershipStatus?.hasShares;
  const leadershipShares = leadershipStatus?.shares ?? 0;
  const totalLeadershipReceived = leadershipStatus?.lifetimePaidUSD ?? 0;
  const estimatedLeadershipPayout = leadershipStatus?.estimatedPayoutUSD ?? 0;
  const leadershipAmountLabel = hasLeadershipShares
    ? totalLeadershipReceived > 0
      ? `$${totalLeadershipReceived.toFixed(2)}`
      : `~$${estimatedLeadershipPayout.toFixed(2)}`
    : "$0.00";
  const leadershipNote = !leadershipStatus
    ? "…"
    : hasLeadershipShares
    ? totalLeadershipReceived > 0
      ? "PAID"
      : `${leadershipShares} SHARE${leadershipShares === 1 ? "" : "S"}`
    : "NO SHARES";
  const leadershipPoolLabel = formatPoolWalletBalances(leadershipStatus?.walletBalances);
  const leadershipDesc = !leadershipStatus
    ? "Loading leadership pool status…"
    : hasLeadershipShares
    ? `You have ${leadershipShares} share${leadershipShares === 1 ? "" : "s"} as ${leadershipStatus.rank}. ` +
      (totalLeadershipReceived > 0
        ? `$${totalLeadershipReceived.toFixed(2)} received from the 5% monthly leadership pool.`
        : `Est. next payout $${estimatedLeadershipPayout.toFixed(2)} from the current $${leadershipStatus.poolBalanceUSD.toFixed(2)} pool.`)
    : "Monthly leadership pool (5%) distributed to Hunter rank and above based on shares — Hunter=1, Elite Hunter=3, Master Hunter=7, Legend Hunter=15.";

  const achievementLifetimePaid = achievementStatus?.lifetimePaidUSD ?? 0;
  const achievementPending = achievementStatus?.pendingUSD ?? 0;
  const hasAchievementPending = !!achievementStatus?.hasPending;
  const hasAchievementPaid = !!achievementStatus?.hasPaid;
  const achievementAmountLabel = !achievementStatus
    ? "$0.00"
    : hasAchievementPending
    ? `$${achievementPending.toFixed(2)}`
    : `$${achievementLifetimePaid.toFixed(2)}`;
  const achievementNote = !achievementStatus
    ? "…"
    : hasAchievementPending
    ? "PENDING"
    : hasAchievementPaid
    ? "PAID"
    : "NONE";
  const achievementTag = !achievementStatus
    ? "…"
    : hasAchievementPending
    ? "PENDING"
    : "ONE-TIME";
  const achievementPoolLabel = formatPoolWalletBalances(achievementStatus?.walletBalances);
  const achievementDesc =
    achievementStatus?.message ||
    "One-time rank achievement bonuses from Scout ($25) through Legend Hunter ($500,000), paid same-day after qualification (manual distribution).";
  const claimableByTokenLabel = formatClaimableByToken(summary?.tokens);

  const [siteOrigin, setSiteOrigin] = useState("");

  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  // Referral links are available to every registered user, member or not — only
  // commission eligibility is gated by membership (enforced on-chain per tier/rank).
  const canShareReferral = Boolean(isConnected && summary?.username);
  const isMember = hasActiveMembership(summary?.tier);

  const referralLink = useMemo(() => {
    if (!canShareReferral || !siteOrigin || !summary?.username) return "";
    return `${siteOrigin}/?ref=${summary.username}`;
  }, [canShareReferral, siteOrigin, summary?.username]);

  const drawReferralQR = useCallback(async () => {
    const canvas = document.getElementById("qrCanvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!referralLink) {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const cs = getComputedStyle(document.body);
    const fg = cs.getPropertyValue("--accent").trim() || "#ec7a2c";
    const bg = cs.getPropertyValue("--inner").trim() || cs.getPropertyValue("--e3").trim() || "#f7f5f1";

    try {
      await QRCode.toCanvas(canvas, referralLink, {
        width: canvas.width,
        margin: 1,
        color: { dark: fg, light: bg },
      });
    } catch (error) {
      console.error("Failed to draw referral QR:", error);
    }
  }, [referralLink]);

  useEffect(() => {
    const drawQRHandler = () => {
      void drawReferralQR();
    };
    window.drawQR = drawQRHandler;
    void drawReferralQR();
    return () => {
      if (window.drawQR === drawQRHandler) {
        window.drawQR = undefined;
      }
    };
  }, [drawReferralQR]);

  const referralLinkDisplay = useMemo(() => {
    if (!canShareReferral || !summary?.username || !siteOrigin) return "";
    const host = siteOrigin.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const full = `${host}/?ref=${summary.username}`;
    if (full.length <= 42) return full;
    return `${full.slice(0, 22)}…${full.slice(-4)}`;
  }, [canShareReferral, siteOrigin, summary?.username]);

  const copyRef = () => {
    if (!canShareReferral) {
      window.showToast?.({
        title: "No referral link yet",
        sub: "Connect your wallet to get your link.",
        link: "",
        variant: "error",
      });
      return;
    }
    navigator.clipboard.writeText(referralLink);
    window.showToast?.({ title: "Referral link copied", sub: referralLink, link: "" });
  };

  const handleConnectWallet = async () => {
    if (connectBusy || isConnected) return;
    setConnectBusy(true);
    try {
      if (typeof window.connectWalletForSignup === "function") {
        await window.connectWalletForSignup();
      } else {
        await connectWallet();
        window.openSignup?.();
      }
    } catch (error) {
      handleAppError(error, "Wallet connection failed");
    } finally {
      setConnectBusy(false);
    }
  };

  const handleClaimCommissions = async (symbol: "USDT" | "USDC") => {
    if (claimBusy) return;
    // Claiming sends an on-chain transaction from the member's own wallet, which a super-login view doesn't have.
    if (isImpersonation) {
      window.showToast?.({ title: "Read-only view", sub: "Commissions can't be claimed in a super-login session.", link: "" });
      return;
    }
    const token = (summary?.tokens || []).find((t) => t.symbol === symbol && t.claimable > 0);
    if (!token) {
      window.showToast?.({
        title: "Nothing to claim",
        sub: `No claimable ${symbol} commissions right now.`,
        link: "",
      });
      return;
    }
    setClaimBusySymbol(symbol);
    try {
      await claimCommissions([token]);
      await refetchSummary();
      window.showToast?.({
        title: `${symbol} claimed`,
        sub: `$${token.claimable.toFixed(2)} ${symbol} sent to your wallet.`,
        link: "",
      });
    } catch (error) {
      handleAppError(error, `${symbol} claim failed`);
    } finally {
      setClaimBusySymbol(null);
    }
  };

  const progressPct = summary?.progress.percent ?? 0;
  const tierInfo = TIERS.find((t) => t.name === summary?.tier);
  const fmtUsd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const legs = [
    { leg: summary?.legs.competitive[0], tag: "Competitive", weak: false },
    { leg: summary?.legs.competitive[1], tag: "Competitive", weak: false },
    { leg: summary?.legs.weakest, tag: "Weakest", weak: true },
  ];
  const statusIcon = (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const rewardCard = (opts: {
    delay: string;
    bg: string;
    fg: string;
    icon: React.ReactNode;
    spark: string;
    tag: string;
    name: string;
    amount: string;
    title?: string;
    action: React.ReactNode;
  }) => (
    <div className="net-reward-card" style={{ "--delay": opts.delay } as React.CSSProperties} data-v2="1" title={opts.title}>
      <div className="net-rc-top">
        <div className="net-rc-icon" style={{ "--nc-bg": opts.bg, "--nc-fg": opts.fg } as React.CSSProperties}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {opts.icon}
          </svg>
        </div>
        <div className="net-rc-right">
          <svg className="net-rc-spark" viewBox="0 0 72 28" fill="none">
            <path d={opts.spark} stroke={opts.fg} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="net-rc-tag">{opts.tag}</div>
        </div>
      </div>
      <div className="net-rc-name">{opts.name}</div>
      <div className="net-rc-footer">
        <div className="net-rc-amount">{opts.amount}</div>
        {opts.action}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="feed" id="feed-network" style={{ padding: 0 }}>
        <div className="page-body" style={{ padding: "18px 0 40px" }}>
          <PageHeroBanner
            canvasId="netBannerCv"
            animationKind="network"
            shadeClassName="net-banner-shade"
            mosaicId="networkMosaic"
            style={{ marginBottom: "18px" }}
          >
            <div className="hero-title">MY NETWORK</div>
          </PageHeroBanner>

          {!isConnected ? (
            <div className="net-wallet-banner net-wallet-banner--warning" role="alert">
              <div className="net-wallet-banner-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 7.25v3.5M10 13.5h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M4.2 16h11.6L10 4.5 4.2 16z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="net-wallet-banner-copy">
                <div className="net-wallet-banner-title">Connect your wallet to access your network</div>
                <div className="net-wallet-banner-msg">
                  View your downline tree, track commissions, claim rewards, and share your referral link after connecting.
                </div>
              </div>
              <button type="button" className="net-wallet-banner-btn" onClick={() => void handleConnectWallet()} disabled={connectBusy}>
                {connectBusy ? "Connecting…" : "Connect Wallet"}
              </button>
            </div>
          ) : null}

          <div className="net-top-grid">
            <div
              className={`net-profile-card${profileFlipped ? " is-flipped" : ""}`}
              onClick={() => setProfileFlipped((flipped) => !flipped)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setProfileFlipped((flipped) => !flipped);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={profileFlipped}
            >
              <div className="net-flip-inner">
                <div className="net-flip-face net-flip-front hx-card">
                  <div className="hx-head">
                    <img className="hx-word" src="/assets/v2/hntr-logos/hntr-wordmark-white.png" alt="HNTR" />
                    <div className="hx-info" title="Hover for performance">
                      i
                    </div>
                  </div>
                  <div className="hx-user">
                    <div className="hx-av">
                      <img src="/assets/v2/hntr-logos/hntr-mark-white.png" alt="" />
                    </div>
                    <div>
                      <div className="hx-name">{summary?.username || "Unregistered"}</div>
                      <div className="hx-rank">{summary?.rank || "None"}</div>
                    </div>
                  </div>
                  <div className="hx-prog-row">
                    <span className="hx-prog-lbl">Your HNTR Progress</span>
                    <span className="hx-amt">{fmtUsd(summary?.teamVolume ?? 0)}</span>
                  </div>
                  <div className="hx-bar">
                    <div className="hx-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="hx-foot">
                    <div className="hx-tier">
                      <b>Current:</b>
                      <span className="hx-cur">{summary?.progress.currentRank || "None"}</span>
                      <i className="hx-badge hx-b1" />
                    </div>
                    <div className="hx-mid">
                      {progressPct}%<span> / 100%</span>
                    </div>
                    <div className="hx-tier">
                      <b>Next:</b>
                      <span className="hx-next">{summary?.progress.nextRank || "Max Rank"}</span>
                      <i className="hx-badge hx-b2" />
                    </div>
                  </div>
                </div>

                <div className="net-flip-face net-flip-back">
                  <div className="net-perf-head">
                    <div className="hx-av hx-av-sm">
                      <img src="/assets/v2/hntr-logos/hntr-mark-white.png" alt="" />
                    </div>
                    <div>
                      <div className="net-perf-user">{summary?.username || "Unregistered"}</div>
                      <div className="net-rank">
                        Rank: <span>{summary?.rank || "None"}</span>
                      </div>
                    </div>
                    <div className="net-perf-rule npf-rule">
                      <span>Rule</span>
                      <div>
                        <b>40</b>
                        <em>/</em>
                        <b>40</b>
                        <em>/</em>
                        <b>20</b>
                      </div>
                    </div>
                  </div>
                  <div className="net-perf-grid npf-grid">
                    {legs.map((col, i) => {
                      const pct = col.leg?.percent ?? 0;
                      return (
                        <div className={`net-perf-col npf-col${col.weak ? " npf-weak" : ""}`} key={i}>
                          <div className="npf-top">
                            <div>
                              <div className="npf-lbl">Referring Team</div>
                              <div className="npf-team">User: {col.leg?.label || "—"}</div>
                            </div>
                            <span className="npf-tag">{col.tag}</span>
                          </div>
                          <div className="npf-mid">
                            <div className="npf-val">
                              {formatVolume(col.leg?.volume ?? 0)}
                              <span>/{formatVolume(col.leg?.cap ?? 0)}</span>
                            </div>
                            <div className="npf-pct">
                              {pct >= 100 && (
                                <i>
                                  <svg viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6.2l2.3 2.3L9.5 3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </i>
                              )}
                              {pct}%
                            </div>
                          </div>
                          <div className="net-perf-bar">
                            <div className="net-perf-fill" style={{ "--w": `${pct}%` } as React.CSSProperties} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="net-stats-grid">
              <div
                className="net-stat"
                title={`${fmtUsd(summary?.claimableNow ?? 0)} claimable now · ${fmtUsd(summary?.lockedRemaining ?? 0)} locked in pool`}
              >
                <div className="net-stat-lbl">Total Rewarded</div>
                <div className="net-stat-val">{fmtUsd(summary?.totalRewarded ?? 0)}</div>
                <div className="net-stat-pts" title="Lifetime HNTR Points">
                  HNTR Points <b>{pointsSummary ? pointsSummary.hntrPoints.toLocaleString("en-US") : "—"}</b>
                </div>
              </div>
              <div className="net-stat">
                <div className="net-stat-lbl">Rank</div>
                <div className="net-stat-val">{(summary?.rank || "None").toUpperCase()}</div>
              </div>
              <div className="net-stat" style={{ position: "relative" }}>
                <div className="net-stat-lbl">Membership</div>
                <div className="net-stat-val" style={{ fontSize: "22px", fontFamily: "var(--fd)" }}>
                  {(summary?.tier || "NONE").toUpperCase()}
                </div>
                <button
                  type="button"
                  className="upgrade-btn"
                  style={{ position: "absolute", top: "12px", right: "12px", margin: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/membership");
                  }}
                >
                  UPGRADE
                </button>
              </div>
              <div className="net-stat">
                <div className="net-stat-lbl">Total Network Users</div>
                <div className="net-stat-val" style={{ transition: "color 0.3s" }}>
                  {(summary?.networkSize ?? 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="net-section-hdr">
            <div className="net-section-title nsh-t">
              <svg className="nsh-ic" viewBox="0 0 20 20" fill="none">
                <circle cx="4" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="16" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="10" cy="15" r="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5.6 6.5l3.2 7M14.4 6.5l-3.2 7M6 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              NETWORK REWARDS
            </div>
          </div>
          <div className="net-rewards-grid">
            {rewardCard({
              delay: ".05s",
              bg: "#e6f3ff",
              fg: "#1e9bf0",
              icon: (
                <>
                  <circle cx="4" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="16" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="10" cy="15" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5.6 6.5l3.2 7M14.4 6.5l-3.2 7M6 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ),
              spark: "M2 22 C14 26 20 10 32 16 S50 18 56 10 S66 4 70 3",
              tag: "REAL-TIME",
              name: "Referral Commissions",
              amount: fmtUsd(summary?.claimableNow ?? 0),
              title: [
                `80% claimable now (${fmtUsd(summary?.claimableNow ?? 0)}) + 20% locked in pool (${fmtUsd(summary?.lockedRemaining ?? 0)}).`,
                claimableByTokenLabel,
              ]
                .filter(Boolean)
                .join(" "),
              action:
                claimableTokens.length > 1 ? (
                  <div className="net-claim-btns" style={{ display: "flex", gap: 6 }}>
                    {claimableTokens.map((token) => (
                      <button
                        key={token.symbol}
                        type="button"
                        className="net-claim-btn"
                        disabled={claimBusy}
                        onClick={() => handleClaimCommissions(token.symbol as "USDT" | "USDC")}
                        title={`Claim $${token.claimable.toFixed(2)} ${token.symbol}`}
                      >
                        {claimBusySymbol === token.symbol ? "CLAIMING…" : `CLAIM ${token.symbol}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="net-claim-btn"
                    disabled={claimBusy || claimableTokens.length === 0}
                    title={
                      claimableTokens[0]
                        ? `Claim $${claimableTokens[0].claimable.toFixed(2)} ${claimableTokens[0].symbol}`
                        : claimDisabledReason || "Nothing to claim yet"
                    }
                    onClick={() => {
                      if (claimableTokens[0]) void handleClaimCommissions(claimableTokens[0].symbol as "USDT" | "USDC");
                    }}
                  >
                    {claimBusy ? "CLAIMING…" : "CLAIM"}
                  </button>
                ),
            })}
            {rewardCard({
              delay: ".10s",
              bg: "#e3f8ef",
              fg: "#2bb673",
              icon: (
                <>
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M6.5 3.6l1.6 1.5L10 3l1.9 2.1 1.6-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ),
              spark: "M2 18 C10 22 18 24 28 19 S42 12 50 18 S62 10 70 4",
              tag: hasLeadershipShares ? (totalLeadershipReceived > 0 ? "MONTHLY" : "ELIGIBLE") : "NO SHARES",
              name: "Leadership Bonus",
              amount: leadershipAmountLabel,
              title: [leadershipDesc, leadershipPoolLabel].filter(Boolean).join(" · "),
              action: (
                <button type="button" className="net-claim-btn" disabled title="Paid automatically each month">
                  {leadershipNote}
                </button>
              ),
            })}
            {rewardCard({
              delay: ".15s",
              bg: "#ffe9f3",
              fg: "#f06ba8",
              icon: (
                <>
                  <rect x="3" y="11" width="3.4" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="8.3" y="7" width="3.4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="13.6" y="3" width="3.4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </>
              ),
              spark: "M2 24 C10 20 16 12 26 16 S40 22 50 12 S62 6 70 5",
              tag: achievementTag,
              name: "Rank Bonus",
              amount: achievementAmountLabel,
              title: [achievementDesc, achievementPoolLabel].filter(Boolean).join(" · "),
              action: (
                <button type="button" className="net-claim-btn" disabled title="Paid same-day after qualification">
                  {achievementNote}
                </button>
              ),
            })}
          </div>

          <div className="net-section-hdr">
            <div className="net-section-title nsh-t">
              <svg className="nsh-ic" viewBox="0 0 20 20" fill="none">
                <path d="M6 3h8v4a4 4 0 0 1-8 0V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M6 4.5H3.5V6A2.5 2.5 0 0 0 6 8.5M14 4.5h2.5V6A2.5 2.5 0 0 1 14 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M8.2 13.5h3.6L12 17H8l.2-3.5zM10 11v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              NFT STRATEGY REWARDS
            </div>
          </div>
          <div className="net-rewards-grid">
            {rewardCard({
              delay: ".20s",
              bg: "#e6f3ff",
              fg: "#1e9bf0",
              icon: (
                <>
                  <path d="M6 3h8v4a4 4 0 0 1-8 0V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M6 4.5H3.5V6A2.5 2.5 0 0 0 6 8.5M14 4.5h2.5V6A2.5 2.5 0 0 1 14 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8.2 13.5h3.6L12 17H8l.2-3.5zM10 11v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ),
              spark: "M2 22 C14 26 20 10 32 16 S50 18 56 10 S66 4 70 3",
              tag: "EVENT",
              name: UPCOMING_NETWORK_REWARDS.nftStrategy.name,
              amount: "$0.00",
              title: UPCOMING_NETWORK_REWARDS.nftStrategy.desc,
              action: (
                <button type="button" className="net-claim-btn" disabled title="Unlocks when NFT Strategies go live">
                  SOON
                </button>
              ),
            })}
            <div className="tp-card">
              <div className="tp-donut">
                <svg viewBox="0 0 200 200" aria-hidden="true">
                  <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="10" />
                  <circle
                    className="tp-prog"
                    cx="100"
                    cy="100"
                    r="84"
                    fill="none"
                    stroke="#e6e7ea"
                    strokeWidth="10"
                    strokeDasharray="527.79"
                    strokeDashoffset="527.79"
                    transform="rotate(-90 100 100)"
                    style={{ "--off": "527.79", "--c": "527.79" } as React.CSSProperties}
                  />
                </svg>
                <div className="tp-center">
                  <div className="tp-val">0</div>
                  <div className="tp-lbl">/100%</div>
                </div>
              </div>
              <div className="tp-body">
                <div className="tp-head">
                  <div>
                    <div className="tp-title">Total Profit</div>
                    <div className="tp-amt">$0.00</div>
                  </div>
                  <button type="button" className="tp-btn" onClick={() => router.push("/membership")}>
                    {isMember ? "UPGRADE MEMBERSHIP" : "GET MEMBERSHIP"}
                  </button>
                </div>
                <div className="tp-rows">
                  <div className="tp-row">
                    <svg viewBox="0 0 20 20" fill="none">
                      <circle cx="5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="15" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="15" r="2.2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M6.5 6.6l2.4 6.4M13.5 6.6l-2.4 6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>
                      <b>0</b> Pool Participations
                    </span>
                  </div>
                  <div className="tp-row">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M10 3v10M6 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>
                      <b>$0</b> Total Deposited
                    </span>
                  </div>
                  <div className="tp-row">
                    <svg viewBox="0 0 20 20" fill="none">
                      <rect x="3.5" y="3.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>
                      <b>{tierInfo ? tierInfo.maxDeposit : "$0"}</b> Max Deposit/Pool
                    </span>
                  </div>
                </div>
                <div className="tp-bar">
                  <i style={{ "--w": "0%" } as React.CSSProperties} />
                  <em style={{ "--w": "0%" } as React.CSSProperties} />
                </div>
                <div className="tp-scale">
                  <span>0 %</span>
                  <span>50 %</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="topo-outer">
            <div className="topo-card">
              <div className="topo-hdr">
                <div className="topo-hdr-title">Topology Matrix Mapping</div>
                <div className="topo-view-btns" role="group" aria-label="Topology view">
                  <button
                    type="button"
                    className={`topo-vbtn${topoView === "plane" ? " active" : ""}`}
                    aria-pressed={topoView === "plane"}
                    onClick={() => setTopoView("plane")}
                  >
                    2D Plane
                  </button>
                  <button
                    type="button"
                    className={`topo-vbtn${topoView === "node" ? " active" : ""}`}
                    aria-pressed={topoView === "node"}
                    onClick={() => setTopoView("node")}
                  >
                    Node View
                  </button>
                  <select
                    className="topo-vbtn"
                    value={treeDepth}
                    onChange={handleTreeDepthChange}
                    aria-label="Network tree depth"
                    style={{ cursor: "pointer" }}
                  >
                    {NETWORK_TREE_DEPTH_OPTIONS.map((depth) => (
                      <option key={depth} value={depth}>
                        {depth} Levels
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {topoView === "plane" && (
                <NetworkTopologyTree
                  treeData={treeData ?? null}
                  isLoading={Boolean(summary?.username) && (treeLoading || treeFetching)}
                  rootRank={summary?.rank || "Unranked"}
                  maxDepth={treeDepth}
                />
              )}
              <NetworkNodeView
                treeData={treeData ?? null}
                isLoading={Boolean(summary?.username) && (treeLoading || treeFetching)}
                maxDepth={treeDepth}
                minHeight={canvasHeightForDepth(treeDepth)}
                hidden={topoView !== "node"}
              />
            </div>

            <div className="ref-card se-card">
              <div className="se-holo">
                <i className="se-h1" />
                <i className="se-h2" />
                <i className="se-scan" />
                <img src="/assets/v2/hntr-dark/8b857621.png" alt="HNTR" />
              </div>
              <div className="ref-title se-title">Share &amp; Earn</div>
              <div className="se-k">How it works:</div>
              <div className="se-steps">
                <div className="se-st">
                  <span className="se-ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                      <path d="M16 6l-4-4-4 4" />
                      <path d="M12 2v13" />
                    </svg>
                  </span>
                  <span>Share your invite link</span>
                </div>
                <div className="se-st">
                  <span className="se-ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="8" width="18" height="13" rx="1" />
                      <path d="M12 8v13M3 12h18" />
                      <path d="M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z" />
                    </svg>
                  </span>
                  <span>{isMember ? "Earn an on-chain reward on every purchase" : "Get a membership to earn on every purchase"}</span>
                </div>
              </div>
              <div className="se-k">Your invite link:</div>
              <div className="ref-link-row se-link">
                <svg className="se-chain" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                  <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                </svg>
                <div className="ref-link-box" title={referralLink}>
                  {canShareReferral ? referralLinkDisplay : "Connect your wallet"}
                </div>
                <button className="ref-copy-btn" type="button" onClick={copyRef} disabled={!canShareReferral}>
                  copy
                </button>
              </div>
            </div>
          </div>

          <div className="txh-card">
            <div className="txh-hdr">
              <div className="txh-title">Transaction History</div>
              <div className="txh-controls">
                <div className="txh-search">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <input className="txh-input" placeholder="Filter..." value={txSearch} onChange={(e) => setTxSearch(e.target.value)} />
                </div>
                <div className="txh-filter-wrap" style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`txh-filter-btn${txFilterOpen || txTypeFilter !== "all" || txSourceFilter !== "all" ? " active" : ""}`}
                    onClick={() =>
                      setTxFilterOpen((open) => {
                        if (open) setTxSourceMenuOpen(false);
                        return !open;
                      })
                    }
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>{" "}
                    Filter
                  </button>
                  {txFilterOpen && (
                    <div className="txh-filter-panel">
                      <label className="txh-filter-field">
                        <span>Type</span>
                        <select
                          className="txh-filter-select"
                          value={txTypeFilter}
                          onChange={(e) => setTxTypeFilter(e.target.value as (typeof TX_TYPE_FILTER_OPTIONS)[number]["value"])}
                        >
                          {TX_TYPE_FILTER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="txh-filter-field">
                        <span>Source</span>
                        <div className="txh-source-menu">
                          <button
                            type="button"
                            className="txh-filter-select txh-source-toggle"
                            aria-haspopup="listbox"
                            aria-expanded={txSourceMenuOpen}
                            onClick={() => setTxSourceMenuOpen((open) => !open)}
                          >
                            {txSourceLabel}
                          </button>
                          {txSourceMenuOpen && (
                            <div className="txh-source-list" role="listbox" aria-label="Source">
                              <button
                                type="button"
                                role="option"
                                aria-selected={txSourceFilter === "all"}
                                className={`txh-source-opt${txSourceFilter === "all" ? " on" : ""}`}
                                onClick={() => {
                                  setTxSourceFilter("all");
                                  setTxSourceMenuOpen(false);
                                }}
                              >
                                All Sources
                              </button>
                              {TX_SOURCE_GROUPS.map((group) => (
                                <div key={group.label}>
                                  <div className="txh-source-group">{group.label}</div>
                                  {group.options.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      role="option"
                                      aria-selected={txSourceFilter === option.value}
                                      className={`txh-source-opt${txSourceFilter === option.value ? " on" : ""}`}
                                      onClick={() => {
                                        setTxSourceFilter(option.value);
                                        setTxSourceMenuOpen(false);
                                      }}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="txh-filter-clear"
                        onClick={() => {
                          setTxTypeFilter("all");
                          setTxSourceFilter("all");
                          setTxSearch("");
                          void refetchTransactions();
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <table className="txh-table">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody id="txhTable">
                {paginatedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "24px 0" }}>
                      {txFetching && transactions.length === 0
                        ? "Loading…"
                        : transactions.length === 0
                        ? "No reward activity yet."
                        : "No transactions match your filters."}
                    </td>
                  </tr>
                )}
                {paginatedTransactions.map((tx, i) => {
                  const isOutgoing =
                    tx.type === "MembershipPurchased" || tx.type === "MembershipUpgraded" || tx.type === "PURCHASE" || tx.type === "UPGRADE";
                  const isCommissionEarned = tx.type === "CommissionEarned" || tx.type === "COMMISSION_EARNED";
                  const hasLocked = isCommissionEarned && !!tx.lockedAmount && Number(tx.lockedAmount) > 0;
                  const statusLabel = tx.status === "PENDING" ? "Pending" : tx.status === "FAILED" ? "Failed" : "Confirmed";
                  const sourceUser = formatSourceUser(tx);
                  const tokenLabel = resolveTokenSymbol(tx.token);
                  const check = (
                    <div
                      className="txh-check"
                      title={statusLabel}
                      style={tx.status && tx.status !== "CONFIRMED" ? { opacity: 0.45 } : undefined}
                    >
                      {statusIcon}
                    </div>
                  );
                  return (
                    <tr key={`${tx.txHash || tx.type}-${i}`}>
                      <td className="txh-dt">{formatTxDate(tx.timestamp)}</td>
                      <td>
                        <span className="txh-type">{TX_TYPE_LABEL[tx.type] || tx.type}</span>
                      </td>
                      <td className="txh-source">
                        {getTxSource(tx)}
                        {sourceUser && sourceUser !== "—" ? ` · ${sourceUser}` : ""}
                      </td>
                      <td className="txh-amount" style={isOutgoing ? { color: "var(--t2)" } : undefined}>
                        {isOutgoing ? "-" : "+"}
                        {formatTokenAmount(tx.amount)}
                        {tokenLabel ? ` ${tokenLabel}` : ""}
                        {hasLocked && (
                          <div className="txh-amount-locked">
                            + {formatTokenAmount(tx.lockedAmount)}
                            {tokenLabel ? ` ${tokenLabel}` : ""} locked (20%)
                          </div>
                        )}
                      </td>
                      <td className="txh-status">
                        {tx.txHash ? (
                          <a
                            href={explorerTxUrl(chainId, tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View transaction ${formatTxHash(tx.txHash)}`}
                          >
                            {check}
                          </a>
                        ) : (
                          check
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="txh-footer">
              <div className="txh-count" id="txhCount">
                {filteredTransactions.length === 0
                  ? "Showing 0 entries"
                  : `Showing ${(Math.min(txPage, txTotalPages) - 1) * TX_PAGE_SIZE + 1}-${Math.min(
                      Math.min(txPage, txTotalPages) * TX_PAGE_SIZE,
                      filteredTransactions.length,
                    )} of ${filteredTransactions.length.toLocaleString()} entries`}
              </div>
              <div className="txh-pages">
                <button
                  type="button"
                  className="txh-pg"
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((page) => Math.max(1, page - 1))}
                  aria-label="Previous page"
                >
                  ‹
                </button>
                {txPageNumbers.map((page, index) =>
                  page === "ellipsis" ? (
                    <span key={`ellipsis-${index}`} className="txh-pg-ellipsis">
                      …
                    </span>
                  ) : (
                    <button key={page} type="button" className={`txh-pg${page === txPage ? " active" : ""}`} onClick={() => setTxPage(page)}>
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  className="txh-pg"
                  disabled={txPage >= txTotalPages}
                  onClick={() => setTxPage((page) => Math.min(txTotalPages, page + 1))}
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
        <HntrFooter />
      </div>
    </MainLayout>
  );
}
