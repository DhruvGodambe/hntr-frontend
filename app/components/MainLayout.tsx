"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import SignupOverlays from "./SignupOverlays";
import NotificationSystem from "./NotificationSystem";
import DepositModal from "./DepositModal";
import { clearStoredAuth } from "../../lib/api";
import { handleAppError } from "../../lib/errors";
import { useDashboardData, useClaimCommissions, useLeadershipStatus, usePointsSummary } from "../../lib/rewards";
import type { StandardToastData } from "../../lib/notification-data";
import type { MainLayoutProps } from "./layout/types";
import { MOBILE_MQ } from "./layout/constants";
import { resolveCurrentPage, shortenAddress } from "./layout/utils";
import { useActivityFeed } from "./layout/hooks/useActivityFeed";
import { useMobileHomeSlots } from "./layout/hooks/useMobileHomeSlots";
import { useMobileNavNotch } from "./layout/hooks/useMobileNavNotch";
import RightRail from "./layout/rail/RightRail";
import MobileHomeRailCard from "./layout/rail/MobileHomeRailCard";
import PlatformActivity from "./layout/rail/PlatformActivity";
import TopNavBar from "./layout/shell/TopNavBar";
import WalletPanel from "./layout/shell/WalletPanel";
import BottomNav from "./layout/shell/BottomNav";
import LayoutFooter from "./layout/shell/LayoutFooter";

declare global {
  interface Window {
    showToast?: (data: StandardToastData) => void;
    openDepositModal?: (assetName?: string, floorEth?: string) => void;
    closeDepositModal?: () => void;
    reconnectWallet?: () => void;
  }
}

export default function MainLayout({
  children,
  sbTransY = 0,
  sbOpacity = 1,
  railTransX = 0,
  railOpacity = 1,
}: MainLayoutProps) {
  const pathname = usePathname();
  const { address, isConnected: walletConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address, query: { enabled: !!address } });
  const walletAddressLabel = shortenAddress(address);
  const { summary, refetchSummary } = useDashboardData();
  const { data: pointsSummary } = usePointsSummary();
  const { data: leadershipStatus } = useLeadershipStatus();
  const claimCommissions = useClaimCommissions();

  const [claimBusy, setClaimBusy] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [walletPanelOpen, setWalletPanelOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAssetName, setDepositAssetName] = useState("Pool Asset");
  const [depositFloorEth, setDepositFloorEth] = useState("0.00");
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);

  const bottomNavRef = useRef<HTMLDivElement | null>(null);
  const navBarPathRef = useRef<SVGPathElement | null>(null);

  const currentPage = resolveCurrentPage(pathname);
  const hideRightRail = currentPage === "network" || currentPage === "webinar";
  const showMobileHomeRail = currentPage === "home" && walletConnected && !hideRightRail && isMobileView;
  const showMobileHomeActivity = currentPage === "home" && !hideRightRail && isMobileView;
  const hideMobileRailToggle = isMobileView;

  const { activeTab, setActiveTab, filteredActivity } = useActivityFeed();
  const { profileAnchor, activityAnchor } = useMobileHomeSlots(showMobileHomeRail, showMobileHomeActivity);

  useMobileNavNotch(bottomNavRef, navBarPathRef, pathname, currentPage);

  const maskBalance = useCallback((value: string) => (balancesHidden ? "••••••" : value), [balancesHidden]);
  const closeRail = useCallback(() => setRailOpen(false), []);

  const triggerNavHaptic = useCallback(() => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(12);
      }
    } catch {
      // Haptics unavailable or blocked in this environment.
    }
  }, []);

  const onBottomNavClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest(".si")) {
        triggerNavHaptic();
      }
    },
    [triggerNavHaptic],
  );

  const toggleRail = useCallback(() => {
    setWalletPanelOpen(false);
    setNotifPanelOpen(false);
    setRailOpen((open) => !open);
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("hntrTheme");
      if (savedTheme === "light") setIsDark(false);
      else if (savedTheme === "dark") setIsDark(true);
      if (localStorage.getItem("hntrBalHidden") === "1") setBalancesHidden(true);
    } catch (e) {
      console.error("Failed to load theme:", e);
    }
  }, []);

  useEffect(() => {
    setPortalMounted(true);
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      setIsMobileView(mq.matches);
      if (!mq.matches) setRailOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setRailOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!railOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRailOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [railOpen]);

  useEffect(() => {
    document.body.dataset.page = currentPage;
    document.body.classList.toggle("wallet-connected", walletConnected);
    document.body.classList.toggle("balances-hidden", balancesHidden);
    document.body.classList.toggle("rail-drawer-open", railOpen);
    document.body.classList.toggle("dark", isDark);
  }, [isDark, currentPage, walletConnected, balancesHidden, railOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#walletPanel") && !target.closest(".conn-pill")) {
        setWalletPanelOpen(false);
      }
      if (!target.closest("#notifPanel") && !target.closest('[data-btn="notif"]')) {
        setNotifPanelOpen(false);
      }
    };
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, []);

  const openSignup = useCallback(() => {
    if (typeof window.openSignup === "function") {
      window.openSignup();
    } else {
      document.getElementById("signupOverlay")?.classList.add("open");
      for (let step = 1; step <= 3; step += 1) {
        document.getElementById(`suStep${step}`)?.classList.toggle("on", step === 1);
      }
      document.getElementById("suModal")?.classList.remove("wide");
    }
    document.body.classList.add("modal-open");
  }, []);

  const closeDepositModal = useCallback(() => {
    setDepositOpen(false);
  }, []);

  const openDepositModal = useCallback((assetName = "Pool Asset", floorEth = "0.00") => {
    setDepositAssetName(assetName);
    setDepositFloorEth(floorEth);
    setDepositOpen(true);
    setWalletPanelOpen(false);
    setNotifPanelOpen(false);
    setRailOpen(false);
  }, []);

  useEffect(() => {
    window.openDepositModal = openDepositModal;
    window.closeDepositModal = closeDepositModal;
    window.reconnectWallet = () => {};
    return () => {
      delete window.openDepositModal;
      delete window.closeDepositModal;
      delete window.reconnectWallet;
    };
  }, [openDepositModal, closeDepositModal]);

  const toggleWalletPanel = () => {
    if (!walletConnected) {
      setWalletPanelOpen(false);
      setNotifPanelOpen(false);
      setRailOpen(false);
      openSignup();
      return;
    }
    setNotifPanelOpen(false);
    setRailOpen(false);
    setWalletPanelOpen((open) => !open);
  };

  const disconnectWallet = () => {
    setWalletPanelOpen(false);
    const disconnectedLabel = walletAddressLabel;
    clearStoredAuth();
    disconnect();
    window.showToast?.({
      title: "Wallet disconnected",
      sub: `${disconnectedLabel} has been disconnected`,
      link: "",
    });
  };

  const toggleNotifPanel = () => {
    setWalletPanelOpen(false);
    setRailOpen(false);
    setNotifPanelOpen((open) => !open);
  };

  const togglePrivacy = () => {
    setBalancesHidden((hidden) => {
      const next = !hidden;
      try {
        localStorage.setItem("hntrBalHidden", next ? "1" : "0");
      } catch (e) {
        console.error("Failed to save privacy preference:", e);
      }
      return next;
    });
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      localStorage.setItem("hntrTheme", newIsDark ? "dark" : "light");
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  };

  const handleClaimCommissions = async () => {
    if (claimBusy) return;
    setClaimBusy(true);
    try {
      const results = await claimCommissions(summary?.tokens || []);
      await refetchSummary();
      window.showToast?.({
        title: "Commissions claimed",
        sub: `${results.length} token${results.length > 1 ? "s" : ""} sent to your wallet.`,
        link: "",
      });
    } catch (error) {
      handleAppError(error, "Claim failed");
    } finally {
      setClaimBusy(false);
    }
  };

  const hntrPoints = pointsSummary?.hntrPoints ?? 0;

  const railProps = {
    walletConnected,
    railOpen,
    isMobileView,
    railTransX,
    railOpacity,
    summary,
    hntrPoints,
    leadershipStatus,
    claimBusy,
    balancesHidden,
    activeTab,
    filteredActivity,
    maskBalance,
    onTogglePrivacy: togglePrivacy,
    onClaimCommissions: handleClaimCommissions,
    onTabChange: setActiveTab,
  };

  return (
    <div className="app-shell-root">
      <TopNavBar
        isDark={isDark}
        walletConnected={walletConnected}
        walletAddressLabel={walletAddressLabel}
        railOpen={railOpen}
        hideRightRail={hideRightRail}
        hideMobileRailToggle={hideMobileRailToggle}
        onToggleTheme={toggleTheme}
        onToggleRail={toggleRail}
        onToggleNotifPanel={toggleNotifPanel}
        onToggleWalletPanel={toggleWalletPanel}
      />

      <WalletPanel
        open={walletPanelOpen}
        walletAddressLabel={walletAddressLabel}
        balanceValue={balanceData?.value}
        balanceSymbol={balanceData?.symbol}
        onDisconnect={disconnectWallet}
      />

      <NotificationSystem panelOpen={notifPanelOpen} />

      {!hideRightRail && !isMobileView && (
        <div className={`rail-backdrop${railOpen ? " open" : ""}`} onClick={closeRail} aria-hidden={!railOpen} />
      )}

      <div className="shell">
        <BottomNav
          currentPage={currentPage}
          sbTransY={sbTransY}
          sbOpacity={sbOpacity}
          bottomNavRef={bottomNavRef}
          navBarPathRef={navBarPathRef}
          onBottomNavClick={onBottomNavClick}
        />

        <div className="content">
          <div className="page-panel active" id={`panel-${currentPage}`}>
            {children}
            {!hideRightRail && !isMobileView && <RightRail {...railProps} />}
          </div>
        </div>
      </div>

      {profileAnchor &&
        showMobileHomeRail &&
        createPortal(
          <MobileHomeRailCard
            summary={summary}
            hntrPoints={hntrPoints}
            leadershipStatus={leadershipStatus}
            claimBusy={claimBusy}
            balancesHidden={balancesHidden}
            maskBalance={maskBalance}
            onTogglePrivacy={togglePrivacy}
            onClaimCommissions={handleClaimCommissions}
          />,
          profileAnchor,
        )}

      {activityAnchor &&
        showMobileHomeActivity &&
        createPortal(
          <div className="mobile-home-activity">
            <PlatformActivity
              activeTab={activeTab}
              onTabChange={setActiveTab}
              entries={filteredActivity}
              inline
            />
          </div>,
          activityAnchor,
        )}

      <SignupOverlays />

      {portalMounted &&
        isMobileView &&
        !hideRightRail &&
        currentPage !== "home" &&
        createPortal(
          <>
            <div className={`rail-backdrop${railOpen ? " open" : ""}`} onClick={closeRail} aria-hidden={!railOpen} />
            <RightRail {...railProps} />
          </>,
          document.body,
        )}

      <DepositModal
        open={depositOpen}
        assetName={depositAssetName}
        floorEth={depositFloorEth}
        onClose={closeDepositModal}
      />

      <LayoutFooter />
    </div>
  );
}
