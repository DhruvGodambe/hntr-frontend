"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { Avatar } from "connectkit";
import SignupOverlays from "./SignupOverlays";
import NotificationSystem from "./NotificationSystem";
import DepositModal from "./DepositModal";
import OnboardingTour from "./onboarding/OnboardingTour";
import { clearStoredAuth } from "../../lib/api";
import { useEffectiveAccount } from "../../lib/session";
import { isCorrectAppChain } from "../../lib/contracts";
import { useDashboardData } from "../../lib/rewards";
import { LISTINGS_LIVE } from "../../lib/launch";
import { useEnsIdentity } from "../../lib/useEnsIdentity";
import type { StandardToastData } from "../../lib/notification-data";
import type { MainLayoutProps } from "./layout/types";
import { SHELL_MOBILE_MQ } from "./layout/constants";
import { resolveCurrentPage, shortenAddress } from "./layout/utils";
import { useReveal } from "./layout/hooks/useReveal";
import { useContrastFix } from "./layout/hooks/useContrastFix";
import Sidebar, { type SidebarProfile } from "./layout/shell/Sidebar";
import TopNavBar, { ThemeToggleButton } from "./layout/shell/TopNavBar";
// Language selector is switched off for now.
// import LanguageSwitcher from "./layout/shell/LanguageSwitcher";
import SearchPanel from "./layout/shell/SearchPanel";
import WalletPanel from "./layout/shell/WalletPanel";
import { PlaceholderTip } from "./home/NftPlaceholders";

declare global {
  interface Window {
    showToast?: (data: StandardToastData) => void;
    openDepositModal?: (assetName?: string, floorEth?: string) => void;
    closeDepositModal?: () => void;
    reconnectWallet?: () => void;
    setHntrTheme?: (theme: "dark" | "light") => void;
  }
}

export default function MainLayout({ children, panelClassName }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  // `walletConnected` / `address` also cover a super-login session (read-only view of a member), so the
  // sidebar locks, search gating and profile card treat that member as signed in. `chainId` stays the real wallet's.
  const { address, isConnected: walletConnected, isImpersonation } = useEffectiveAccount();
  const { chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address, query: { enabled: !!address } });
  const { label: walletAddressLabel, ensName } = useEnsIdentity(address);
  const { summary } = useDashboardData();

  const [isDark, setIsDark] = useState(true);
  const [walletPanelOpen, setWalletPanelOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAssetName, setDepositAssetName] = useState("Pool Asset");
  const [depositFloorEth, setDepositFloorEth] = useState("0.00");
  const [isMobileView, setIsMobileView] = useState(false);

  const currentPage = resolveCurrentPage(pathname);
  const hasSummary = !!summary;
  const hasMembership = !!summary?.tier && summary.tier !== "None";
  const wrongNetwork = !isImpersonation && walletConnected && chainId != null && !isCorrectAppChain(chainId);

  useReveal(pathname);
  useContrastFix(isDark);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("hntrTheme");
      if (savedTheme === "light") setIsDark(false);
      else if (savedTheme === "dark") setIsDark(true);
    } catch (e) {
      console.error("Failed to load theme:", e);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(SHELL_MOBILE_MQ);
    const onChange = () => {
      setIsMobileView(mq.matches);
      if (!mq.matches) setDrawerOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    document.body.dataset.page = currentPage;
    document.body.classList.toggle("wallet-connected", walletConnected);
    document.body.classList.toggle("mdr-open", drawerOpen);
    document.body.classList.toggle("dark", isDark);
    document.body.classList.toggle("hntr-prelaunch", !LISTINGS_LIVE);
    document.body.classList.toggle("su-pending", walletConnected && hasSummary && !hasMembership);
    document.body.classList.toggle("su-member", walletConnected && hasMembership);
  }, [isDark, currentPage, walletConnected, drawerOpen, hasSummary, hasMembership]);

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
    setDrawerOpen(false);
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
      openSignup();
      return;
    }
    setNotifPanelOpen(false);
    setSearchOpen(false);
    setWalletPanelOpen((open) => !open);
  };

  const disconnectWallet = () => {
    setWalletPanelOpen(false);
    setDrawerOpen(false);
    // Logging out of a super-login view just ends it; there is no wallet to disconnect.
    if (isImpersonation) {
      clearStoredAuth();
      window.showToast?.({ title: "Exited super-login", sub: "The read-only member view was closed.", link: "" });
      router.push("/super-login");
      return;
    }
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
    setSearchOpen(false);
    setNotifPanelOpen((open) => !open);
  };

  const toggleSearch = () => {
    setWalletPanelOpen(false);
    setNotifPanelOpen(false);
    setSearchOpen((open) => !open);
  };
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const applyTheme = useCallback((newIsDark: boolean) => {
    setIsDark(newIsDark);
    try {
      localStorage.setItem("hntrTheme", newIsDark ? "dark" : "light");
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  }, []);

  const toggleTheme = () => applyTheme(!isDark);

  useEffect(() => {
    window.setHntrTheme = (theme) => applyTheme(theme === "dark");
    return () => {
      delete window.setHntrTheme;
    };
  }, [applyTheme]);

  const [siteOrigin, setSiteOrigin] = useState("");
  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);
  const referralLink = siteOrigin && summary?.username ? `${siteOrigin}/?ref=${summary.username}` : "";

  const profile: SidebarProfile | null =
    walletConnected && address
      ? {
          name: summary?.username || ensName || shortenAddress(address),
          sub: referralLink,
          tier: summary?.tier && summary.tier !== "None" ? summary.tier : null,
          avatar: (
            <span
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${isDark ? "rgba(255,255,255,.9)" : "#e4e4e7"}`,
              }}
            >
              <Avatar address={address} name={ensName ?? undefined} size={42} radius={21} />
            </span>
          ),
        }
      : null;

  return (
    <>
      <div className="shell">
        <Sidebar
          currentPage={currentPage}
          walletConnected={walletConnected}
          profile={profile}
          brandAccessory={
            isMobileView ? (
              <>
                {/* Language selector is switched off for now. */}
                {/* <LanguageSwitcher /> */}
                <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />
              </>
            ) : null
          }
          onNavigate={() => setDrawerOpen(false)}
          onOpenSignup={openSignup}
          onEditProfile={() =>
            isImpersonation
              ? window.showToast?.({ title: "Read-only view", sub: "Profiles can't be edited in a super-login session.", link: "" })
              : window.openEditProfile?.()
          }
        />
        <div className="main-col">
          <TopNavBar
            isDark={isDark}
            isMobile={isMobileView}
            walletConnected={walletConnected}
            walletAddressLabel={walletAddressLabel}
            wrongNetwork={wrongNetwork}
            onOpenDrawer={() => setDrawerOpen(true)}
            onOpenSearch={toggleSearch}
            onToggleTheme={toggleTheme}
            onToggleNotifPanel={toggleNotifPanel}
            onToggleWalletPanel={toggleWalletPanel}
          />
          <div className="content">
            <div className={`page-panel${panelClassName ? ` ${panelClassName}` : ""} active`} id={`panel-${currentPage}`}>
              {children}
            </div>
          </div>
        </div>
      </div>

      <div id="mScrim" onClick={() => setDrawerOpen(false)} aria-hidden={!drawerOpen} />

      <SearchPanel
        open={searchOpen}
        onClose={closeSearch}
        walletConnected={walletConnected}
        onOpenSignup={openSignup}
      />

      <PlaceholderTip active={!LISTINGS_LIVE} />

      <WalletPanel
        open={walletPanelOpen}
        walletAddressLabel={walletAddressLabel}
        ensName={ensName}
        chainId={chainId}
        balanceValue={balanceData?.value}
        balanceSymbol={balanceData?.symbol}
        onDisconnect={disconnectWallet}
        disconnectLabel={isImpersonation ? "EXIT VIEW" : undefined}
      />

      <NotificationSystem panelOpen={notifPanelOpen} onClosePanel={() => setNotifPanelOpen(false)} />

      <SignupOverlays />

      <OnboardingTour />

      <DepositModal open={depositOpen} assetName={depositAssetName} floorEth={depositFloorEth} onClose={closeDepositModal} />
    </>
  );
}
