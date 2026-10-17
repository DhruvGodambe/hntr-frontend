"use client";

import { useEffect, useRef } from "react";

const GIF = "/assets/v2/hntr-dark/nft-cycle.gif";
const MARK = "/assets/v2/hntr-dark/8b857621.png";

/** Skeleton bars shared by every V2 placeholder card body. */
export function PlaceholderBars() {
  return (
    <>
      <i className="lc-sk" />
      <i className="lc-sk r" />
      <i className="lc-sk s" />
      <i className="lc-sk r" />
    </>
  );
}

/** Image well of a placeholder card: looping NFT GIF, faint HNTR mark. */
export function PlaceholderArt({ imgClass, sold }: { imgClass: string; sold?: boolean }) {
  return (
    <div className="nvw">
      <img className={imgClass} src={GIF} alt="" />
      <img className="lc-gif" src={GIF} alt="" />
      <div className="lc-lock">
        <img src={MARK} alt="" />
      </div>
      {sold && <i className="sc-bdg" />}
    </div>
  );
}

/** Home "HNTR LISTINGS" grid while listings are not live. */
export function ListingPlaceholderGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="lg">
      {Array.from({ length: count }, (_, i) => (
        <div className="lc gf" data-locked="1" key={i}>
          <PlaceholderArt imgClass="lcimg" />
          <div className="lcb">
            <PlaceholderBars />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Home "HNTR SALES" marquee while sales are not live. */
export function SalesPlaceholderTrack({ count = 8 }: { count?: number }) {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Mobile: V2 drives the marquee with a slow JS scroll that pauses on touch.
  useEffect(() => {
    const m = marqueeRef.current;
    const t = trackRef.current;
    if (!m || !t || !window.matchMedia("(max-width:600px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    m.style.setProperty("scroll-snap-type", "none", "important");
    let hold = 0;
    let last = 0;
    let pos = -1;
    let raf = 0;
    const onHold = () => {
      hold = Date.now();
      pos = -1;
    };
    const evs = ["touchstart", "pointerdown", "wheel"] as const;
    evs.forEach((ev) => m.addEventListener(ev, onHold, { passive: true }));
    const step = (ts: number) => {
      const dt = last ? Math.min(ts - last, 50) : 16;
      last = ts;
      const w = t.scrollWidth / 2;
      if (w > 0 && !document.hidden && Date.now() - hold > 2500) {
        if (pos < 0) pos = m.scrollLeft;
        pos -= dt * 0.035;
        if (pos <= 0) pos += w;
        m.scrollLeft = pos;
      }
      raf = requestAnimationFrame(step);
    };
    const start = window.setTimeout(() => {
      m.scrollLeft = t.scrollWidth / 2;
      raf = requestAnimationFrame(step);
    }, 300);
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(raf);
      evs.forEach((ev) => m.removeEventListener(ev, onHold));
    };
  }, []);

  // Cards are rendered twice so the CSS/JS marquee can loop seamlessly.
  return (
    <div className="sales-marquee" ref={marqueeRef}>
      <div className="sales-track" id="salesTrack" ref={trackRef}>
        {Array.from({ length: count * 2 }, (_, i) => (
          <div className="sc gf" data-locked="1" key={i}>
            <PlaceholderArt imgClass="scimg" sold />
            <div className="scb">
              <PlaceholderBars />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TIP_TARGETS = "#panel-home .lg .lc,#panel-home #salesTrack .sc,#panel-vault .vault-grid .vc,#mkSoldGrid .sdc,#ncGrid .nc";

/**
 * V2 hover tooltip for placeholder NFT cards ("All NFTs … will appear here").
 * Mounted once by the shell; only active while the pre-launch placeholders show.
 */
export function PlaceholderTip({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = ref.current;
    if (!t || !active) return;
    let cur: Element | null = null;
    const show = (c: Element) => {
      const r = c.getBoundingClientRect();
      t.style.opacity = "0";
      t.style.display = "block";
      const tw = t.offsetWidth;
      const th = t.offsetHeight;
      const x = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2));
      let y = r.top - th - 10;
      if (y < 8) y = r.bottom + 10;
      t.style.left = `${x}px`;
      t.style.top = `${y}px`;
      t.style.opacity = "1";
      t.style.transform = "translateY(0)";
    };
    const hide = () => {
      t.style.opacity = "0";
      t.style.transform = "translateY(4px)";
      cur = null;
    };
    const onOver = (e: MouseEvent) => {
      const c = (e.target as Element).closest?.(TIP_TARGETS) ?? null;
      if (c && c.closest('[data-locked="1"]') !== c) {
        if (cur) hide();
        return;
      }
      if (c && c !== cur) {
        cur = c;
        t.textContent =
          c.classList.contains("sc") || c.classList.contains("sdc")
            ? "All NFTs sold will appear here"
            : "All NFTs purchased and listed will appear here.";
        show(c);
      } else if (!c && cur) hide();
    };
    const onScroll = () => {
      if (cur) hide();
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("scroll", onScroll, true);
      hide();
    };
  }, [active]);

  return (
    <div
      id="lcTip"
      ref={ref}
      role="tooltip"
      style={{
        position: "fixed",
        zIndex: 2000,
        left: 0,
        top: 0,
        maxWidth: 240,
        padding: "9px 13px",
        borderRadius: 9,
        background: "#1c1c1e",
        border: "1px solid rgba(255,255,255,.12)",
        color: "#fff",
        font: "500 13px/1.4 var(--fn)",
        textAlign: "center",
        boxShadow: "0 8px 22px rgba(0,0,0,.45)",
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity .16s,transform .16s",
        transform: "translateY(4px)",
      }}
    >
      All NFTs purchased and listed will appear here.
    </div>
  );
}
