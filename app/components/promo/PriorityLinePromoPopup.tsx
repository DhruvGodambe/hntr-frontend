"use client";

import "./promo-popup.css";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Same key as the V2 design (promo-popups.js), so a visitor's "don't show again" choice carries over. */
const HIDE_KEY = "hntr_pl_popup_hide";
/** The design opens the popup this long after the page appears. */
const OPEN_DELAY_MS = 300;

function isHidden() {
  try {
    return !!localStorage.getItem(HIDE_KEY);
  } catch {
    return false;
  }
}

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="pp-ic">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </span>
  );
}

/**
 * "Be first in line" popup on the Priority Line page (from promo-popups.js).
 * Opens shortly after the page appears, until the visitor ticks "Don't show this again".
 */
export default function PriorityLinePromoPopup() {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isHidden()) return;
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

  const reserveSpot = () => {
    setOpen(false);
    window.setTimeout(() => {
      const feed = document.getElementById("feed-priority");
      const amount = document.getElementById("plAmt");
      if (!feed || !amount) return;
      const top = feed.scrollTop + amount.getBoundingClientRect().top - feed.getBoundingClientRect().top - 160;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      feed.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      window.setTimeout(() => amount.focus({ preventScroll: true }), 350);
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
      <div className="pp pp-blue" role="dialog" aria-modal="true" aria-labelledby="ppPlTitle" tabIndex={-1} ref={dialogRef}>
        <button className="pp-x" type="button" aria-label="Close" onClick={close}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="pp-k">
          <i />
          Priority Line
        </div>
        <h2 id="ppPlTitle">Be first in line for HNTR&apos;s first NFT Strategy</h2>
        <p className="pp-p">Priority Line is open. Reserve your seat before launch and get in on the first pool.</p>

        <div className="pp-list">
          <div className="pp-li">
            <RowIcon>
              <circle cx="12" cy="12" r="9" />
              <path d="M14.5 9.5c-.4-.9-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.1 0-2.1-.6-2.5-1.5M12 6.5V8m0 8v1.5" />
            </RowIcon>
            <div>Reserve with USDT or USDC, up to your seat cap.</div>
          </div>
          <div className="pp-li">
            <RowIcon>
              <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
            </RowIcon>
            <div>Get your line number. First in, first served.</div>
          </div>
          <div className="pp-li">
            <RowIcon>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </RowIcon>
            <div>Launch day: your reserve joins the pool in line order.</div>
          </div>
          <div className="pp-li">
            <RowIcon>
              <path d="M20 12v8H4v-8M2 7h20v5H2zM12 20V7M12 7H8a2 2 0 1 1 0-4c3 0 4 4 4 4zm0 0h4a2 2 0 1 0 0-4c-3 0-4 4-4 4z" />
            </RowIcon>
            <div>Claim your share in your back office once the NFT sells.</div>
          </div>
        </div>

        <p className="pp-p">Spots fill in order, so the earlier you reserve, the closer you are to the front.</p>
        <button className="pp-btn" type="button" onClick={reserveSpot}>
          Reserve my spot
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
      </div>
    </div>,
    document.body,
  );
}
