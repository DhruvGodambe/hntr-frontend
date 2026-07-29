"use client";

import { HiBell, HiMoon, HiSun, HiViewColumns, HiXMark } from "react-icons/hi2";

type TopNavBarProps = {
  isDark: boolean;
  walletConnected: boolean;
  walletAddressLabel: string;
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
      <div
        className="nav-brand"
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            background: "#0c0c0e",
            boxShadow: "0 1px 2px rgba(0,0,0,.18)",
          }}
        >
          <img
            src="/assets/images/logoMark.png"
            alt="HNTR"
            style={{
              width: "15px",
              height: "auto",
              display: "block",
            }}
          />
        </span>
        <span
          style={{
            marginLeft: "9px",
            fontFamily: "var(--fd)",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: ".18em",
          }}
        >
          HNTR
        </span>
      </div>
      <div className="nav-r">
        <div className="nav-btn" id="navThemeToggle" title="Light / Dark" onClick={onToggleTheme} style={{ cursor: "pointer" }}>
          {isDark ? <HiMoon size={14} aria-hidden /> : <HiSun size={14} aria-hidden />}
        </div>
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
          <div className={`conn-dot${walletConnected ? "" : " red"}`} id="connDot" />
          <span id="connLabel">{walletConnected ? walletAddressLabel : "CONNECT"}</span>
        </div>
      </div>
    </div>
  );
}
