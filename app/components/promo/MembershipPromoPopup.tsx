"use client";

import "./promo-popup.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TIERS } from "../../../lib/contracts";
import { PRELAUNCH_PRICING } from "../../../lib/launch";

/** Same key as the V2 design (promo-popups.js), so a member's "don't show again" choice carries over. */
const HIDE_KEY = "hntr_mem_popup_hide";
/** The design opens the popup this long after the page appears. */
const OPEN_DELAY_MS = 300;

const TIER_DOT: Record<string, string> = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c8",
  Gold: "#e8b83a",
  Platinum: "#9fd5e6",
  Diamond: "#7ab8ff",
};

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function isHidden() {
  try {
    return !!localStorage.getItem(HIDE_KEY);
  } catch {
    return false;
  }
}

/**
 * "Pre-launch pricing: 50% off" popup on the Membership page (from the V2 design's promo-popups.js).
 * Opens shortly after the page appears, for signed-in and signed-out visitors alike, until the visitor
 * ticks "Don't show this again". Prices come from `TIERS`; the struck-through launch price is double.
 */
export default function MembershipPromoPopup() {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!PRELAUNCH_PRICING || isHidden()) return;
    // Someone arriving from a gift-code link came to redeem it: don't put a sales popup in front of that.
    if (new URLSearchParams(window.location.search).has("code")) return;
    const timer = window.setTimeout(() => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDontShow(false);
      setOpen(true);
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    returnFocusRef.current?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    // Focus the dialog itself (announced by screen readers, no focus ring) and keep Tab inside it.
    dialogRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button, input, a[href]") ?? []);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const toggleDontShow = (checked: boolean) => {
    setDontShow(checked);
    try {
      if (checked) localStorage.setItem(HIDE_KEY, "1");
      else localStorage.removeItem(HIDE_KEY);
    } catch {
      /* storage blocked: the popup simply shows again next time */
    }
  };

  const chooseMembership = () => {
    setOpen(false);
    // After the popup is gone, bring the tier cards to the top of the page.
    window.setTimeout(() => {
      const feed = document.getElementById("feed-membership");
      const tiers = feed?.querySelector(".tiers-grid");
      if (!feed || !tiers) return;
      const top = feed.scrollTop + tiers.getBoundingClientRect().top - feed.getBoundingClientRect().top - 24;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      feed.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }, 60);
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="ppo"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="pp pp-wide" role="dialog" aria-modal="true" aria-labelledby="ppMemTitle" tabIndex={-1} ref={dialogRef}>
        <button className="pp-x" type="button" aria-label="Close" onClick={close}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="pp-vis" aria-hidden="true">
          <div className="pp-glow" />
          <div className="pp-card">
            <div className="pp-holo" />
            <div className="pp-shine" />
            <span className="pp-chip" />
            <img src="/assets/v2/hntr-logos/hntr-mark-white.png" alt="" />
            <span className="pp-cl">HNTR MEMBERSHIP</span>
            <span className="pp-cr">50% OFF</span>
          </div>
        </div>

        <div className="pp-body">
          <div className="pp-k">
            <i />
            Limited time
          </div>
          <h2 id="ppMemTitle">Pre-launch pricing: 50% off</h2>
          <p className="pp-p">Every membership is at its pre-launch price for a limited time. Prices go up at official launch.</p>

          <div className="pp-tiers">
            {TIERS.map((t) => (
              <div className="pp-tr" key={t.name}>
                <div className="pp-tn">
                  <i style={{ background: TIER_DOT[t.name] ?? "#a1a1aa" }} />
                  {t.name}
                </div>
                <div className="pp-tp">
                  <b>{usd(t.priceUsd)}</b>
                  <s>launch price {usd(t.priceUsd * 2)}</s>
                </div>
              </div>
            ))}
          </div>

          <p className="pp-lock">Lock in your tier now, before launch.</p>
          <button className="pp-btn" type="button" onClick={chooseMembership}>
            Choose my membership
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <label className="pp-hide">
            <input type="checkbox" checked={dontShow} onChange={(e) => toggleDontShow(e.target.checked)} />
            <span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6.2 5 8.6l4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Don&apos;t show this again
          </label>
          <p className="pp-fine">Memberships give access to HNTR services. Not an investment or financial advice.</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
