"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HiBell, HiMoon, HiOutlineVideoCamera, HiSun, HiViewColumns, HiXMark } from "react-icons/hi2";
import NetworkSwitcher from "./NetworkSwitcher";

type TopNavBarProps = {
  isDark: boolean;
  walletConnected: boolean;
  walletAddressLabel: string;
  walletAvatar?: ReactNode;
  railOpen: boolean;
  hideRightRail: boolean;
  hideMobileRailToggle: boolean;
  onToggleTheme: () => void;
  onToggleRail: () => void;
  onToggleNotifPanel: () => void;
  onToggleWalletPanel: () => void;
};

export default function TopNavBar({
  isDark,
  walletConnected,
  walletAddressLabel,
  walletAvatar,
  railOpen,
  hideRightRail,
  hideMobileRailToggle,
  onToggleTheme,
  onToggleRail,
  onToggleNotifPanel,
  onToggleWalletPanel,
}: TopNavBarProps) {
  return (
    <div className="nav">
      {/* Brand-mark presentation lives in CSS (`.nav-brand`, `.nav-logomark`,
          `.nav-wordmark` in styles.css) so the mobile breakpoint and the dark
          theme can restyle it without fighting inline specificity. */}
      <Link href="/" className="nav-brand" aria-label="Go to home">
        <span className="nav-logomark">
          <img src="/assets/images/logoMark.png" alt="" />
        </span>
        <span className="nav-wordmark">HNTR</span>
      </Link>
      <div className="nav-r">
        {!hideRightRail && !hideMobileRailToggle && (
          <div
            className={`nav-btn rail-toggle-btn${railOpen ? " active" : ""}`}
            title={railOpen ? "Close panel" : "Open panel"}
            onClick={onToggleRail}
            role="button"
            tabIndex={0}
            aria-expanded={railOpen}
            aria-controls="app-right-rail"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleRail();
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {railOpen ? <HiXMark size={14} aria-hidden /> : <HiViewColumns size={14} aria-hidden />}
          </div>
        )}
        {/* Order: Webinar → Dark Mode → Notification → Network → Wallet */}
        <Link
          href="/presentation"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-btn nav-live"
          title="Live Webinar"
          aria-label="Open business presentation"
          style={{ color: "#eda06a" }}
        >
          <span className="rec-dot" />
          <HiOutlineVideoCamera size={14} aria-hidden />
        </Link>
        <div className="nav-btn" id="navThemeToggle" title="Light / Dark" onClick={onToggleTheme} style={{ cursor: "pointer" }}>
          {isDark ? <HiMoon size={14} aria-hidden /> : <HiSun size={14} aria-hidden />}
        </div>
        <div
          className="nav-btn"
          data-btn="notif"
          onClick={onToggleNotifPanel}
          style={{ cursor: "pointer", position: "relative" }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleNotifPanel();
            }
          }}
        >
          <div className="notif-badge" />
          <HiBell size={13} aria-hidden />
        </div>
        <NetworkSwitcher />
        <div
          className={`conn-pill${walletConnected ? "" : " disconnected"}`}
          id="connPill"
          onClick={onToggleWalletPanel}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleWalletPanel();
            }
          }}
        >
          {walletConnected && walletAvatar ? (
            <span className="conn-avatar" aria-hidden>
              {walletAvatar}
            </span>
          ) : (
            <div className={`conn-dot${walletConnected ? "" : " red"}`} id="connDot" />
          )}
          <span id="connLabel" className={walletConnected ? "conn-label" : undefined}>
            {walletConnected ? walletAddressLabel : "CONNECT"}
          </span>
        </div>
      </div>
    </div>
  );
}
