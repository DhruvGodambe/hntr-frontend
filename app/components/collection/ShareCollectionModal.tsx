"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const A = (n: string) => `/assets/v2/about/${n}.avif`;

/** Background mosaic columns of the V2 share card (each column scrolls; `r` = reverse). */
const MOSAIC: { r: boolean; dur: number; imgs: string[] }[] = [
  { r: true, dur: 44, imgs: ["punk-10", "mayc-10", "pudgy-10", "azuki-10", "ape-10", "ape-12", "ape-13"] },
  { r: false, dur: 38, imgs: ["punk-11", "mayc-11", "pudgy-11", "azuki-11", "ape-11", "mayc-12", "mayc-13"] },
  { r: false, dur: 34, imgs: ["pudgy-01", "pudgy-05", "pudgy-09", "ape-04", "ape-08", "azuki-03", "azuki-07", "punk-02", "punk-06", "mayc-01", "mayc-05", "mayc-09"] },
  { r: true, dur: 40, imgs: ["pudgy-02", "pudgy-06", "ape-01", "ape-05", "ape-09", "azuki-04", "azuki-08", "punk-03", "punk-07", "mayc-02", "mayc-06"] },
  { r: false, dur: 46, imgs: ["pudgy-03", "pudgy-07", "ape-02", "ape-06", "azuki-01", "azuki-05", "azuki-09", "punk-04", "punk-08", "mayc-03", "mayc-07"] },
  { r: true, dur: 52, imgs: ["pudgy-04", "pudgy-08", "ape-03", "ape-07", "azuki-02", "azuki-06", "punk-01", "punk-05", "punk-09", "mayc-04", "mayc-08"] },
];

export type SharedNft = { name: string; id: string; image: string; pool?: string; priceEth: number };

type Props = {
  open: boolean;
  onClose: () => void;
  username: string;
  shareUrl: string;
  nfts: SharedNft[];
  ethUsd?: number;
};

/** V2 "Share My Collection" pop-up (`#scOv`). */
export default function ShareCollectionModal({ open, onClose, username, shareUrl, nfts, ethUsd }: Props) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const total = nfts.reduce((s, n) => s + n.priceEth, 0);
  const text = `My NFT collection on HNTR: ${nfts.length} NFTs worth ${total.toFixed(2)} ETH`;
  const usd = ethUsd ? `$${Math.round(total * ethUsd).toLocaleString("en-US")}` : "$0";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* clipboard blocked */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const share = async () => {
    if (navigator.share) {
      navigator.share({ title: "My HNTR collection", text, url: shareUrl }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
    } catch {
      /* clipboard blocked */
    }
    setShared(true);
    window.setTimeout(() => setShared(false), 1600);
  };

  if (!mounted) return null;
  return createPortal(
    <div id="scOv" className={open ? "on" : undefined} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="scx" role="dialog" aria-modal="true" aria-label="Share my collection">
        <div className="scx-hd">
          <div className="scm" aria-hidden="true">
            <div className="scm-in">
              {MOSAIC.map((col, i) => (
                <div key={i} className={`scm-col${col.r ? " r" : ""}`} style={{ animationDuration: `${col.dur}s` }}>
                  {[...col.imgs, ...col.imgs].map((n, k) => (
                    <img key={k} src={A(n)} alt="" loading="lazy" />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="scx-brand">
            <img src="/assets/v2/hntr-dark/8b857621.png" alt="" />
            HNTR
          </div>
          <div className="scx-title">
            <b className="scx-u">{username}</b>
            <span className="scx-c">My NFT Collection</span>
          </div>
          <div className="scx-stats">
            <div>
              <span>NFTs owned</span>
              <b id="scN">
                {nfts.length} NFT{nfts.length === 1 ? "" : "s"}
              </b>
            </div>
            <div>
              <span>Total value</span>
              <b id="scV">{total.toFixed(2)} ETH</b>
            </div>
            <div>
              <span>Value in USD</span>
              <b className="g" id="scP">
                {usd}
              </b>
            </div>
          </div>
          <button className="scx-x" type="button" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="scx-grid" id="scGrid">
          {nfts.length === 0 ? (
            <div style={{ color: "#a1a1aa", fontSize: 14 }}>No NFTs owned yet.</div>
          ) : (
            nfts.map((n) => (
              <div className="scx-c" key={`${n.name}${n.id}`}>
                <div className="im">
                  <img src={n.image} alt="" />
                  {n.pool && <em>{n.pool}</em>}
                </div>
                <div className="bd">
                  <div className="nm">
                    <span>{n.name}</span>
                    {n.id && <i>{n.id}</i>}
                  </div>
                  <div className="pr">
                    <svg width="10" height="14" viewBox="0 0 10 16" fill="none">
                      <path d="M5 0L0 8.2 5 11l5-2.8z" fill="#a1a1aa" />
                      <path d="M5 12l-5-2.8L5 16l5-6.8z" fill="#71717a" />
                    </svg>
                    {n.priceEth > 0 ? n.priceEth.toFixed(2) : "—"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="scx-ft">
          <div className="scx-link">
            <input id="scUrl" readOnly value={shareUrl} />
            <button type="button" onClick={copy}>
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>
          <a
            className="scx-soc"
            id="scX"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.2 2H21l-6.5 7.4L22 22h-6.2l-4.8-6.3L5.4 22H2.6l7-8L2 2h6.3l4.4 5.8zm-1 18h1.7L7 3.9H5.2z" />
            </svg>
          </a>
          <a
            className="scx-soc"
            id="scTg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Telegram"
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.9 4.3l-3.2 15.1c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L6.2 13.1l-4.9-1.5c-1-.3-1.1-1 .2-1.5L20.6 2.8c.9-.3 1.6.2 1.3 1.5z" />
            </svg>
          </a>
          <button className="scx-sh" type="button" onClick={share}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 10V2M5 4.5L8 1.5l3 3M3 8v5.5h10V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{shared ? "LINK COPIED" : "SHARE"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
