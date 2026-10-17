"use client";

import Link from "next/link";
import NetworkSwitcher from "./NetworkSwitcher";
// Language selector is switched off for now.
// import LanguageSwitcher from "./LanguageSwitcher";

type TopNavBarProps = {
  isDark: boolean;
  isMobile: boolean;
  walletConnected: boolean;
  walletAddressLabel: string;
  wrongNetwork: boolean;
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onToggleTheme: () => void;
  onToggleNotifPanel: () => void;
  onToggleWalletPanel: () => void;
};

export function ThemeToggleButton({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <div
      className="nav-btn"
      id="navThemeToggle"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      title="Light / Dark"
      role="button"
      tabIndex={0}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <svg id="themeIcon" width="14" height="14" viewBox="0 0 16 16" fill="none">
        {isDark ? (
          <path
            d="M13 10.5A5.5 5.5 0 0 1 6.5 4a5.5 5.5 0 0 0 0 8.5A5.5 5.5 0 0 0 13 10.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M12.6 3.4l-.9.9M4.3 11.7l-.9.9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}

const onKeyActivate = (fn: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

export default function TopNavBar({
  isDark,
  isMobile,
  walletConnected,
  walletAddressLabel,
  wrongNetwork,
  onOpenDrawer,
  onOpenSearch,
  onToggleTheme,
  onToggleNotifPanel,
  onToggleWalletPanel,
}: TopNavBarProps) {
  return (
    <div className="nav">
      <button id="mBurger" type="button" aria-label="Open menu" onClick={onOpenDrawer}>
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
      <Link href="/" className="nav-brand" title="HNTR home" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "#0c0c0e",
            boxShadow: "0 1px 2px rgba(0,0,0,.18)",
          }}
        >
          <img src="/assets/v2/hntr-dark/8b857621.png" alt="HNTR" style={{ width: 15, height: "auto", display: "block" }} />
        </span>
        <span style={{ marginLeft: 9, fontFamily: "var(--fd)", fontWeight: 700, fontSize: 13, letterSpacing: ".2em" }}>HNTR</span>
      </Link>
      <div className="nav-search" onClick={onOpenSearch} role="button" tabIndex={0} onKeyDown={onKeyActivate(onOpenSearch)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>Search everything…</span>
      </div>
      {/* Language selector is switched off for now. On mobile V2 moves it into the drawer header (see Sidebar brandAccessory). */}
      {/* {!isMobile && <LanguageSwitcher />} */}
      <div className="nav-r">
        <Link href="/webinar" className="nav-btn nav-live" title="Live Webinar" style={{ cursor: "pointer", position: "relative" }}>
          <span className="rec-dot" />
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11.5 7.2l3-1.8v5.2l-3-1.8V7.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </Link>
        {/* On mobile V2 moves the theme toggle into the drawer header (see Sidebar brandAccessory). */}
        {!isMobile && <ThemeToggleButton isDark={isDark} onToggle={onToggleTheme} />}
        <div
          className="nav-btn"
          data-btn="notif"
          onClick={onToggleNotifPanel}
          role="button"
          tabIndex={0}
          aria-label="Notifications"
          onKeyDown={onKeyActivate(onToggleNotifPanel)}
          style={{ cursor: "pointer", position: "relative" }}
        >
          {/* visibility is driven by NotificationSystem (unread count) */}
          <div className="notif-badge" />
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a3.5 3.5 0 0 1 3.5 3.5c0 3.5 1.5 4.5 1.5 4.5H3s1.5-1 1.5-4.5A3.5 3.5 0 0 1 8 2z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        {/* V2 has no chain badge; only surface it when the wallet is on the wrong chain. */}
        {wrongNetwork && <NetworkSwitcher />}
        <div
          className={`conn-pill${walletConnected ? "" : " disconnected"}`}
          id="connPill"
          onClick={onToggleWalletPanel}
          role="button"
          tabIndex={0}
          onKeyDown={onKeyActivate(onToggleWalletPanel)}
        >
          {walletConnected && <div className="conn-dot" id="connDot" />}
          <span id="connLabel">{walletConnected ? walletAddressLabel : "CONNECT"}</span>
          <span className="conn-pw">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3v8" />
              <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
