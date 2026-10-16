"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import SidebarHolo from "./SidebarHolo";

/** Routes that need a connected wallet; clicking them while disconnected opens signup instead. */
export const LOCKED_WHEN_DISCONNECTED = new Set(["collection", "network"]);

type NavItem = { page: string; href: string; label: string; icon: ReactNode; className?: string };

const LockIcon = () => (
  <span className="si-lock">
    <svg viewBox="0 0 14 14" fill="none">
      <rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 6V4.3a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  </span>
);

const MAIN_ITEMS: NavItem[] = [
  {
    page: "home",
    href: "/home",
    label: "Home",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <path d="M2 6.5L8 2l6 4.5V14H10v-3H6v3H2V6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    page: "vault",
    href: "/marketplace",
    label: "Marketplace",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <path d="M2 6.5h12M3.5 6.5V13h9V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.5 4l1 2.5h11l1-2.5H1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M6.5 6.5V13M9.5 6.5V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    page: "pools",
    href: "/pools",
    label: "NFT Strategy",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <polyline points="2,11 5,7.5 8,9 11,5.5 14,3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="12" width="2.5" height="2" rx=".5" fill="currentColor" opacity=".5" />
        <rect x="5.5" y="10" width="2.5" height="4" rx=".5" fill="currentColor" opacity=".5" />
        <rect x="9" y="7" width="2.5" height="7" rx=".5" fill="currentColor" opacity=".5" />
        <rect x="12.5" y="5" width="2" height="9" rx=".5" fill="currentColor" opacity=".5" />
      </svg>
    ),
  },
  {
    page: "collection",
    href: "/collection",
    label: "MY NFTs",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".4" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".4" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".4" />
      </svg>
    ),
  },
  {
    page: "membership",
    href: "/membership",
    label: "Membership",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M1.5 7.5h13" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="11.5" cy="10.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    page: "network",
    href: "/network",
    label: "Network",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 14c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    page: "priority",
    href: "/priority-line",
    label: "Priority Line",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.5 3v10" stroke="currentColor" strokeWidth="1.4" strokeDasharray="1.6 1.6" />
        <path d="M8.5 6.5h3.5M8.5 9.5h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const GENERAL_ITEMS: NavItem[] = [
  {
    page: "learn",
    href: "/learn",
    label: "HNTR Doc",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <path
          d="M8 3.2C6.7 2.3 4.9 2 2.8 2.1c-.4 0-.8.4-.8.8v8.3c0 .5.4.9.9.8 2-.1 3.6.2 4.7 1 .3.2.5.2.8 0 1.1-.8 2.7-1.1 4.7-1 .5.1.9-.3.9-.8V2.9c0-.4-.4-.8-.8-.8-2.1-.1-3.9.2-5.2 1.1z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path d="M8 3.4v9.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    page: "webinar",
    href: "/webinar",
    label: "Live Webinar",
    className: "si-webinar",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <rect x="1.5" y="3.5" width="9.5" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11 7.2l3.5-2v5.6L11 8.8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    page: "support",
    href: "/support",
    label: "Support",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 10.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 5.5a2 2 0 0 1 2 2c0 1.2-2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export type SidebarProfile = {
  name: string;
  sub: string;
  tier: string | null;
  avatar: ReactNode;
};

type SidebarProps = {
  currentPage: string;
  walletConnected: boolean;
  profile: SidebarProfile | null;
  /** Rendered inside the brand row on mobile (V2 moves the theme toggle into the drawer header). */
  brandAccessory?: ReactNode;
  onNavigate: () => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
};

export default function Sidebar({
  currentPage,
  walletConnected,
  profile,
  brandAccessory,
  onNavigate,
  onOpenSignup,
  onLogout,
  onEditProfile,
}: SidebarProps) {
  const renderItem = (item: NavItem) => {
    const locked = !walletConnected && LOCKED_WHEN_DISCONNECTED.has(item.page);
    const onClick = (e: MouseEvent) => {
      if (locked) {
        e.preventDefault();
        onOpenSignup();
      }
      onNavigate();
    };
    return (
      <Link
        key={item.page}
        href={item.href}
        className={`si${item.className ? ` ${item.className}` : ""}${currentPage === item.page ? " active" : ""}${locked ? " locked" : ""}`}
        data-page={item.page}
        onClick={onClick}
      >
        <div className="si-icon">{item.icon}</div>
        <span className="si-label">{item.label}</span>
        {locked && <LockIcon />}
      </Link>
    );
  };

  return (
    <div className="sb">
      <div className="sb-brand" title="HNTR home">
        <Link href="/" onClick={onNavigate} style={{ display: "contents", color: "inherit" }}>
          <img src="/assets/v2/hntr-dark/8b857621.png" alt="" />
          <span>HNTR</span>
        </Link>
        {brandAccessory}
      </div>
      <div className="sb-sec">Main</div>
      {MAIN_ITEMS.map(renderItem)}
      <div className="si-bot">
        <div className="sb-sec">General</div>
        {GENERAL_ITEMS.map(renderItem)}
      </div>

      {walletConnected && profile ? (
        <div className="sb-prof">
          <div
            className="sb-prof-av"
            role="button"
            tabIndex={0}
            title="Edit profile"
            onClick={onEditProfile}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEditProfile();
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {profile.avatar}
            <span className="sb-prof-ok">
              <svg viewBox="0 0 12 12">
                <path d="M3 6.2l2 2L9 4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <div className="sb-prof-t">
            <div className="sb-prof-n" title={profile.name}>
              {profile.name}
            </div>
            <div className="sb-prof-e" title={profile.sub}>
              {profile.sub}
            </div>
            {profile.tier && (
              <Link href="/membership" className="sb-prof-tier" onClick={onNavigate}>
                {profile.tier.toUpperCase()}
              </Link>
            )}
          </div>
          <button className="sb-prof-out" type="button" onClick={onLogout} aria-label="Log out" title="Log out">
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M8 4H5a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 005 16h3M13 13.5L16.5 10 13 6.5M16.5 10H8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="sb-member">
          <SidebarHolo />
          <div className="sb-member-t">Become a member</div>
          <div className="sb-member-s">Buy your membership. Join every strategy, with no limit.</div>
          <button
            className="sb-member-b"
            type="button"
            onClick={() => {
              onNavigate();
              onOpenSignup();
            }}
          >
            JOIN NOW
          </button>
        </div>
      )}
    </div>
  );
}
