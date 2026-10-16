"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { usePools } from "../../../../lib/pools";
import { TIERS } from "../../../../lib/contracts";
import { LOCKED_WHEN_DISCONNECTED } from "./Sidebar";

type SearchItem = { name: string; sub: string; icon: string; href: string };

const QUICK_NAV: SearchItem[] = [
  { href: "/home", name: "Home", sub: "Dashboard overview", icon: "🏠" },
  { href: "/marketplace", name: "Marketplace", sub: "Browse NFT listings", icon: "🛍" },
  { href: "/pools", name: "NFT Strategies", sub: "Active investment pools", icon: "📈" },
  { href: "/membership", name: "Membership", sub: "Tiers and rewards", icon: "💳" },
  { href: "/collection", name: "MY NFTs", sub: "Your collection", icon: "🖼" },
  { href: "/network", name: "Network", sub: "Referrals and commissions", icon: "👤" },
];

const STATIC_INDEX: SearchItem[] = [
  ...QUICK_NAV,
  { href: "/priority-line", name: "Priority Line", sub: "Reserve your strategy slot", icon: "⚡" },
  { href: "/webinar", name: "Live Webinar", sub: "Watch the live presentation", icon: "🎥" },
  { href: "/learn", name: "Learn", sub: "Guides and docs", icon: "📖" },
  { href: "/support", name: "Support", sub: "Create a ticket", icon: "❓" },
  ...TIERS.map((t, i) => ({
    href: "/membership",
    name: `${t.name} Membership`,
    sub: `Tier 0${i + 1} $${t.priceUsd.toLocaleString("en-US")}`,
    icon: "💳",
  })),
];

type SearchPanelProps = {
  open: boolean;
  onClose: () => void;
  walletConnected: boolean;
  onOpenSignup: () => void;
};

function isWalletGated(href: string) {
  return LOCKED_WHEN_DISCONNECTED.has(href.replace(/^\//, "").split("/")[0] ?? "");
}

/** V2 global search: quick navigation plus pages, live strategies and membership tiers. */
export default function SearchPanel({ open, onClose, walletConnected, onOpenSignup }: SearchPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { data: pools } = usePools();

  const index = useMemo<SearchItem[]>(
    () => [
      ...STATIC_INDEX,
      ...(pools ?? [])
        .filter((p) => p.status !== "CLOSED")
        .map((p) => ({ href: "/pools", name: p.name, sub: "NFT Strategy", icon: "📦" })),
    ],
    [pools],
  );

  const q = query.trim().toLowerCase();
  const results = q ? index.filter((x) => x.name.toLowerCase().includes(q) || x.sub.toLowerCase().includes(q)) : QUICK_NAV;

  // Anchor the panel under the visible search trigger (same placement rule as V2).
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const place = () => {
      const trigger = Array.from(document.querySelectorAll<HTMLElement>(".nav-search")).find((b) => b.offsetParent !== null);
      if (!trigger) return;
      const r = trigger.getBoundingClientRect();
      const vw = window.innerWidth;
      const w = Math.min(560, vw - 24);
      const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), vw - w - 12);
      setPos({
        position: "fixed",
        top: r.bottom + 10,
        left,
        right: "auto",
        bottom: "auto",
        transform: "none",
        width: w,
        maxWidth: w,
        margin: 0,
        maxHeight: `calc(100vh - ${r.bottom + 24}px)`,
        overflow: "auto",
      });
    };
    place();
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest("#searchPanel") && !el.closest(".nav-search")) onClose();
    };
    window.addEventListener("resize", place);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", place);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  const pick = (item: SearchItem) => {
    onClose();
    if (!walletConnected && isWalletGated(item.href)) {
      onOpenSignup();
      return;
    }
    router.push(item.href);
  };

  return (
    <div className={`search-panel${open ? " open" : ""}`} id="searchPanel" style={open ? pos : undefined}>
      <div className="search-input-wrap">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          className="search-input"
          id="searchInput"
          placeholder="Search NFTs, pools, collections..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) pick(results[0]);
          }}
        />
        <span className="search-kbd">ESC</span>
      </div>
      <div className="search-results" id="searchResults">
        {q && results.length === 0 ? (
          <div className="search-empty">No results for &quot;{query}&quot;</div>
        ) : (
          <>
            <div className="search-group-lbl">{q ? "Results" : "Quick Navigation"}</div>
            {results.map((x) => (
              <div className="search-item" key={`${x.href}-${x.name}`} onClick={() => pick(x)} role="button" tabIndex={0}>
                <div className="search-item-icon">{x.icon}</div>
                <div>
                  <div className="search-item-name">{x.name}</div>
                  <div className="search-item-sub">{x.sub}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
