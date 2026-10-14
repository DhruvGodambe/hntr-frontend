"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CollectionArt } from "../../../lib/collection-art";
import CountUp from "./CountUp";

export type StrategyCardData = {
  key: string;
  routeId: string;
  name: string;
  art: CollectionArt;
  live: boolean;
  /** e.g. "YUGALABS · 1/10000" (mobile card subtitle). */
  sub: string;
  targetEth: number;
  raisedEth: number;
  participants: number;
  pct: number;
  tokenId: string;
  nftImage: string;
};

const TICK = (
  <svg className="nh-tick" viewBox="0 0 16 16" aria-label="Verified">
    <path
      fill="#2f8cff"
      d="M8 .8l1.9 1.4 2.3-.1.7 2.2 1.9 1.3-.7 2.2.7 2.2-1.9 1.3-.7 2.2-2.3-.1L8 15.2l-1.9-1.4-2.3.1-.7-2.2-1.9-1.3.7-2.2-.7-2.2 1.9-1.3.7-2.2 2.3.1z"
    />
    <path d="M5.2 8.2l1.9 1.9 3.8-3.9" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const X_ICON = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" />
  </svg>
);

const WEB_ICON = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
  </svg>
);

export function StrategyHelp({ name }: { name: string }) {
  return (
    <div className="nfx-help" tabIndex={0} onClick={(e) => e.stopPropagation()} aria-label="Pool information">
      ?
      <div className="nfx-pop">
        <div className="nfx-pop-t">{name} Pool</div>
        <p>
          This is a Strategy container for one collection only: {name}. Hunters put money in together. When the pool is full, it
          buys the lowest-priced NFT of the collection on OpenSea. That NFT is owned by the pool, not by one person. It is then
          listed for sale. If it sells, the money comes back to the people in the container. Your membership sets how much you can
          put in. A higher tier means a bigger seat in the same pool.
        </p>
        <div className="nfx-pop-d">
          <span>What it buys</span>
          <b>the cheapest {name} NFT for sale on OpenSea</b>
        </div>
        <div className="nfx-pop-d">
          <span>Who owns it</span>
          <b>everyone who deposited in this container</b>
        </div>
        <div className="nfx-pop-d">
          <span>What happens next</span>
          <b>the NFT is listed for sale</b>
        </div>
        <div className="nfx-pop-d">
          <span>What you get back</span>
          <b>your share of the sale</b>
        </div>
        <div className="nfx-pop-d">
          <span>How much you can put in</span>
          <b>set by your membership tier</b>
        </div>
      </div>
    </div>
  );
}

export function TargetNftCard({ card }: { card: StrategyCardData }) {
  return (
    <div className="nfx-target">
      <div className="mc-top">
        <span className="mc-tk">TARGET NFT</span>
        <img className="mc-logo" src="/assets/v2/hntr-logos/hntr-mark-black.png" alt="" />
      </div>
      <div className="nfx-timg">
        <img src={card.nftImage} alt={`${card.name} #${card.tokenId}`} />
      </div>
      <div className="mc-bot">
        <div className="mc-name">
          {card.art.short} #{card.tokenId}
        </div>
        <div className="mc-pr">
          <span>PRICE</span>
          <b>{card.targetEth > 0 ? `${card.targetEth.toFixed(2)} ETH` : "—"}</b>
        </div>
      </div>
    </div>
  );
}

type Props = {
  cards: StrategyCardData[];
  loading: boolean;
  isMobile: boolean;
  enterLabel: string;
  onOpen: (card: StrategyCardData) => void;
};

/** V2 home "HNTR STRATEGIES" hero carousel (scroll-snap, arrows, dots, 10s autoplay). */
export default function StrategyCarousel({ cards, loading, isMobile, enterLabel, onOpen }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const holdRef = useRef(0);
  const [active, setActive] = useState(0);
  const [countKey, setCountKey] = useState(0);

  const nearest = useCallback(() => {
    const g = gridRef.current;
    if (!g) return 0;
    const els = Array.from(g.querySelectorAll<HTMLElement>(":scope > .nfx"));
    if (!els.length) return 0;
    const o = els[0].offsetLeft;
    let best = 0;
    let bd = Infinity;
    els.forEach((c, k) => {
      const d = Math.abs(c.offsetLeft - o - g.scrollLeft);
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    if (g.scrollLeft + g.clientWidth >= g.scrollWidth - 4) best = els.length - 1;
    return best;
  }, []);

  const scrollToCard = useCallback((i: number) => {
    const g = gridRef.current;
    if (!g) return;
    const els = Array.from(g.querySelectorAll<HTMLElement>(":scope > .nfx"));
    if (!els[i]) return;
    g.scrollTo({ left: els[i].offsetLeft - els[0].offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const g = gridRef.current;
    if (!g) return;
    const onScroll = () => setActive(nearest());
    const hold = () => {
      holdRef.current = Date.now();
    };
    g.addEventListener("scroll", onScroll, { passive: true });
    ["touchstart", "pointerdown", "wheel"].forEach((ev) => g.addEventListener(ev, hold, { passive: true }));
    onScroll();
    return () => {
      g.removeEventListener("scroll", onScroll);
      ["touchstart", "pointerdown", "wheel"].forEach((ev) => g.removeEventListener(ev, hold));
    };
  }, [nearest, cards.length]);

  // Autoplay (desktop and mobile), paused for 6s after any interaction or while hovering.
  useEffect(() => {
    if (cards.length < 2) return;
    const iv = window.setInterval(() => {
      const g = gridRef.current;
      if (!g || document.hidden || Date.now() - holdRef.current < 6000) return;
      if (g.querySelector(".nfx-help:hover,.nfx-help:focus,.nfx-help:focus-within")) return;
      scrollToCard((nearest() + 1) % cards.length);
    }, 10000);
    return () => window.clearInterval(iv);
  }, [cards.length, nearest, scrollToCard]);

  useEffect(() => {
    if (!loading && cards.length) {
      const t = window.setTimeout(() => setCountKey((k) => k + 1), 400);
      return () => window.clearTimeout(t);
    }
  }, [loading, cards.length]);

  const step = (d: number) => {
    holdRef.current = Date.now();
    if (!cards.length) return;
    scrollToCard((nearest() + d + cards.length) % cards.length);
  };

  return (
    <>
      <div className="sh m-hide">
        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-start" }}>
          <div className="st" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
              <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.9" />
              <circle cx="10" cy="10" r="4.6" stroke="currentColor" strokeWidth="1.9" />
              <circle cx="10" cy="10" r="1.6" fill="currentColor" />
            </svg>
            HNTR STRATEGIES
            <span
              className="live-dot"
              style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,.8)", flexShrink: 0 }}
            />
          </div>
        </div>
      </div>
      <div id="npTitle">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
          <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.9" />
          <circle cx="10" cy="10" r="4.6" stroke="currentColor" strokeWidth="1.9" />
          <circle cx="10" cy="10" r="1.6" fill="currentColor" />
        </svg>
        NFT STRATEGIES
      </div>

      <div
        className="np-wrap"
        onMouseEnter={() => {
          holdRef.current = Date.now() + 1e9;
        }}
        onMouseLeave={() => {
          holdRef.current = Date.now();
        }}
      >
        <div className="np-grid" ref={gridRef}>
          {loading && (
            <div className="nfx np-on nfx-loading" aria-hidden="true">
              <div className="pd-skel" style={{ position: "absolute", inset: 0, borderRadius: "inherit" }} />
            </div>
          )}
          {!loading &&
            cards.map((card, i) => (
              <div
                key={card.key}
                className={`nfx${card.live ? " nfx-live" : ""}${card.art.light ? " nfx-light" : ""}${i === active ? " np-on" : ""}${isMobile ? "" : " has-nh"}`}
                onClick={() => onOpen(card)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onOpen(card);
                }}
              >
                <img className="nfx-bg" src={card.art.scene} alt="" />
                <div className="nfx-shade" />
                <StrategyHelp name={card.name} />
                {isMobile ? (
                  <div className="nfx-body">
                    <div className="nfx-main">
                      <div className="nfx-id">
                        <div className="nfx-logo">
                          <img src={card.art.logo} alt="" />
                        </div>
                        <div className="nfx-idt">
                          <div className="nfx-name">
                            <span>{card.name}</span>
                            <svg className="nfx-tick" viewBox="0 0 16 16" aria-label="Verified">
                              <path
                                fill="#2f8cff"
                                d="M8 .8l1.9 1.4 2.3-.1.7 2.2 1.9 1.3-.7 2.2.7 2.2-1.9 1.3-.7 2.2-2.3-.1L8 15.2l-1.9-1.4-2.3.1-.7-2.2-1.9-1.3.7-2.2-.7-2.2 1.9-1.3.7-2.2 2.3.1z"
                              />
                              <path d="M5.2 8.2l1.9 1.9 3.8-3.9" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="nfx-sub">{card.sub}</div>
                        </div>
                      </div>
                      <div className="nfx-foot">
                        <div className="nfx-stats">
                          <div>
                            <div className="nfx-sl">Target</div>
                            <div className="nfx-sv">{card.targetEth > 0 ? `${card.targetEth.toFixed(2)} ETH` : "—"}</div>
                          </div>
                          <div>
                            <div className="nfx-sl">Total Raised</div>
                            <div className="nfx-sv">{card.raisedEth.toFixed(2)} ETH </div>
                          </div>
                        </div>
                        <button
                          className="nfx-btn m-enter"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen(card);
                          }}
                        >
                          {enterLabel}
                        </button>
                      </div>
                    </div>
                    <TargetNftCard card={card} />
                  </div>
                ) : (
                  <div className="nh">
                    <div className="nh-left">
                      <div className="nh-id">
                        <img className="nh-logo" src={card.art.logo} alt="" />
                        <div className="nh-idt">
                          <div className="nh-name">
                            {card.name}
                            {TICK}
                          </div>
                          <div className="nh-by">
                            <span>By {card.art.by}</span>
                            {card.art.x && (
                              <a href={card.art.x} target="_blank" rel="noopener noreferrer" aria-label="X" onClick={(e) => e.stopPropagation()}>
                                {X_ICON}
                              </a>
                            )}
                            {card.art.web && (
                              <a href={card.art.web} target="_blank" rel="noopener noreferrer" aria-label="Website" onClick={(e) => e.stopPropagation()}>
                                {WEB_ICON}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="nh-stats">
                        <div>
                          <span>Target Price</span>
                          <b>{card.targetEth > 0 ? `${card.targetEth.toFixed(2)} ETH` : "—"}</b>
                        </div>
                        <div>
                          <span>Total Raised</span>
                          <b>
                            <CountUp value={card.raisedEth} decimals={2} suffix=" ETH" runKey={countKey} />
                          </b>
                        </div>
                        <div>
                          <span>Participants</span>
                          <b>
                            <CountUp value={card.participants} runKey={countKey} />
                          </b>
                        </div>
                        <div>
                          <span>% Raised</span>
                          <b>
                            <CountUp value={card.pct} runKey={countKey} />
                            <i>/100%</i>
                          </b>
                        </div>
                      </div>
                    </div>
                    <TargetNftCard card={card} />
                  </div>
                )}
              </div>
            ))}
        </div>
        <button type="button" className="np-arr prev" aria-label="Previous strategy" onClick={(e) => { e.stopPropagation(); step(-1); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button type="button" className="np-arr next" aria-label="Next strategy" onClick={(e) => { e.stopPropagation(); step(1); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {cards.length > 1 && (
        <div id="npDots">
          {cards.map((card, i) => (
            <button key={card.key} type="button" aria-label={`Slide ${i + 1}`} className={i === active ? "on" : undefined} onClick={() => scrollToCard(i)} />
          ))}
        </div>
      )}
    </>
  );
}
