"use client";

import { useEffect, useState } from "react";
import { DISCORD_URL, TELEGRAM_URL } from "./layout/shell/HntrFooter";

/** V2 "Welcome to HNTR" pop-up (`#wlOv`), shown after a first membership purchase. */
export default function WelcomeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [refLink, setRefLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Same link the membership-success modal just showed.
    const r = document.getElementById("msRef") as HTMLInputElement | null;
    setRefLink(r?.value || `${window.location.origin}/`);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
    } catch {
      /* clipboard blocked */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const ext = (url: string) => (url === "#" ? {} : { target: "_blank", rel: "noopener noreferrer" });

  return (
    <div id="wlOv" className={open ? "on" : undefined} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wl" role="dialog" aria-modal="true" aria-labelledby="wlH">
        <button className="wl-x" type="button" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="wl-logo">
          <i />
          <i />
          <i />
          <span className="wl-orbit" />
          <div className="wl-badge">
            <img src="/assets/v2/hntr-dark/8b857621.png" alt="HNTR" />
          </div>
        </div>
        <div className="wl-k">Membership active</div>
        <h2 id="wlH">Welcome to HNTR</h2>
        <p className="wl-p">
          You&apos;re now part of a community that co-owns blue-chip NFTs together. Your membership is live on-chain and your seat is
          reserved.
        </p>
        <div className="wl-list">
          <div className="wl-it">
            <span className="wl-ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <b>
                HNTR NFT Strategy <em>SOON</em>
              </b>
              <p>The strategy is launching very soon. You&apos;ll be notified the moment the first pools open.</p>
            </div>
          </div>
          <div className="wl-it">
            <span className="wl-ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
                <path d="M3 19c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5M17 8v6M14 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b>Invite friends, earn on-chain</b>
              <p>
                Share your link in the meantime. Every time someone you invite buys a membership, you receive an on-chain reward straight to
                your wallet.
              </p>
              <div className="wl-ref">
                <input id="wlRef" readOnly value={refLink} />
                <button type="button" onClick={copy}>
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="wl-soc">
          <a className="wl-tg" href={TELEGRAM_URL} {...ext(TELEGRAM_URL)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L6.2 13.1l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.6 2.7c.9-.3 1.6.2 1.3 1.6Z" />
            </svg>
            Join Telegram
          </a>
          <a className="wl-dc" href={DISCORD_URL} {...ext(DISCORD_URL)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.6 5.3A17.6 17.6 0 0 0 15.3 4l-.5 1.1a16.3 16.3 0 0 0-5 0L9.3 4a17.5 17.5 0 0 0-4.3 1.3C2.3 9.4 1.6 13.4 1.9 17.3a17.7 17.7 0 0 0 5.4 2.7l1.1-1.8a11.4 11.4 0 0 1-1.8-.9l.4-.3a12.6 12.6 0 0 0 10.8 0l.4.3c-.6.4-1.2.7-1.8.9l1.1 1.8a17.6 17.6 0 0 0 5.4-2.7c.4-4.5-.7-8.5-3.3-12ZM8.7 14.9c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2Zm6.6 0c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2Z" />
            </svg>
            Join Discord
          </a>
        </div>
        <button className="wl-go" type="button" onClick={onClose}>
          GO TO DASHBOARD
        </button>
      </div>
    </div>
  );
}
