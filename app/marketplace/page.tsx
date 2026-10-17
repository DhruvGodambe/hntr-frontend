"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/MainLayout";
import HntrFooter from "../components/layout/shell/HntrFooter";
import { PlaceholderBars } from "../components/home/NftPlaceholders";
import { usePools, poolCollectionSlug } from "@/lib/pools";
import { collectionArt } from "@/lib/collection-art";

// Marketplace is not live yet: the grids render the V2 pre-launch placeholder
// cards and every activity value reads "—". Restore live OpenSea listings/sales
// here at launch (see lib/launch.ts).

const GIF = "/assets/v2/hntr-dark/nft-cycle.gif";
const MARK = "/assets/v2/hntr-dark/8b857621.png";
const PLACEHOLDER_COUNT = 10;

const HERO_NFTS = [
  "nft-punk2.png",
  "nft-dog.jpg",
  "nft-penguin2.png",
  "nft-ape-crown.jpeg",
  "nft-bayc.jpg",
  "nft-ape-captain.jpeg",
  "nft-pudgy.jpg",
  "nft-ape-demon.jpeg",
  "nft-punk.jpg",
  "nft-bayc3d.jpg",
  "nft-bayc-soldier.jpg",
  "nft-penguin2.png",
  "nft-dog.jpg",
  "nft-ape-crown.jpeg",
  "nft-ape-captain.jpeg",
];

const ACTIVITY_COLUMNS = ["Asset", "Event", "Price", "Source", "Time"];

type View = "held" | "sold";

function viewBtnStyle(on: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    height: 34,
    padding: "0 16px",
    borderRadius: 9,
    border: 0,
    background: on ? "#fff" : "transparent",
    color: on ? "#0a0a0a" : "#a1a1aa",
    fontFamily: "var(--fn)",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: ".06em",
    cursor: "pointer",
  };
}

export default function MarketplacePage() {
  const [view, setView] = useState<View>("held");
  const [collOpen, setCollOpen] = useState(false);
  const [coll, setColl] = useState("All");
  const { data: pools } = usePools();

  const collections = useMemo(
    () =>
      (pools ?? [])
        .filter((p) => p.status !== "CLOSED")
        .map((p) => ({ name: p.name, art: collectionArt(poolCollectionSlug(p), p.imageUrl, p.name) })),
    [pools],
  );

  useEffect(() => {
    if (!collOpen) return;
    const close = () => setCollOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [collOpen]);

  return (
    <MainLayout>
      <div className="feed" id="feed-vault">
        <div className="vault-hero">
          <div className="vh-nftgrid">
            {HERO_NFTS.map((img, i) => (
              <div className="vh-nft" key={i}>
                <img src={`/assets/v2/nft/${img}`} alt="" />
              </div>
            ))}
          </div>
          <div className="vault-hero-shade" />
          <div className="vault-title">HNTR MARKETPLACE</div>
          <div className="vault-sub">The pool’s assets. Browse every NFT HNTR holds.</div>
          <div className="vault-join">
            <button type="button" className="join-btn" onClick={() => window.openSignup?.()}>
              Join today
            </button>
          </div>
        </div>

        <div className="proto-stats">
          <div className="ps">
            <div className="ps-lbl">Total Protocol Value</div>
            <div className="ps-val">$0</div>
          </div>
          <div className="ps">
            <div className="ps-lbl">Total NFTs Owned</div>
            <div className="ps-val">0</div>
          </div>
          <div className="ps">
            <div className="ps-lbl">TOTAL CO-OWNERS</div>
            <div className="ps-val">0</div>
          </div>
          <div className="ps">
            <div className="ps-lbl">Total NFTs Sold</div>
            <div className="ps-val">0</div>
          </div>
        </div>

        <div className="vault-body">
          <div className="vault-right">
            <div className="grid-toolbar mk-tb">
              <div
                id="mkView"
                style={{
                  display: "flex",
                  gap: 4,
                  padding: 4,
                  borderRadius: 12,
                  background: "#161618",
                  border: "1px solid rgba(255,255,255,.08)",
                  marginRight: "auto",
                }}
              >
                <button type="button" data-v="held" onClick={() => setView("held")} style={viewBtnStyle(view === "held")}>
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                    <rect x="2.5" y="2.5" width="6" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.9" />
                    <rect x="11.5" y="2.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.9" />
                    <rect x="11.5" y="11.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.9" />
                  </svg>
                  NFT LISTED
                </button>
                <button type="button" data-v="sold" onClick={() => setView("sold")} style={viewBtnStyle(view === "sold")}>
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                    <path d="M12.6 2.3A8 8 0 1 0 17.9 9.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6.4 9.6l3.2 3.2 7.6-8.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  NFT SOLD
                </button>
              </div>
              {view === "held" && (
                <div className={`mk-sort${collOpen ? " open" : ""}`} id="mkColl">
                  <button
                    type="button"
                    className="mk-sort-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCollOpen((o) => !o);
                    }}
                  >
                    <span className="mk-sort-k">Collection:</span>
                    <span id="mkCollLbl">{coll}</span>
                    <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
                      <path d="M3 4.5L6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="mk-sort-menu" id="mkCollMenu">
                    {["All", ...collections.map((c) => c.name)].map((name) => (
                      <div
                        key={name}
                        className={`mk-opt${coll === name ? " on" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setColl(name);
                          setCollOpen(false);
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {view === "sold" ? (
              <div
                id="mkSoldGrid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5,minmax(0,1fr))",
                  gridAutoRows: "max-content",
                  gap: 16,
                  fontFamily: "var(--fn)",
                }}
              >
                {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                  <div
                    className="sdc gf"
                    data-locked="1"
                    key={i}
                    style={{
                      background: "#161618",
                      border: "1px solid rgba(255,255,255,.07)",
                      borderRadius: 14,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="nvw" style={{ position: "relative", aspectRatio: "1 / 1", flexShrink: 0, background: "rgb(10, 10, 12)" }}>
                      <img src={GIF} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <img className="lc-gif" src={GIF} alt="" />
                      <div className="lc-lock">
                        <img src={MARK} alt="" />
                      </div>
                      <i className="sc-bdg" />
                    </div>
                    <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <PlaceholderBars />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vault-grid">
                {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                  <div className="vc gf" data-locked="1" key={i}>
                    <div className="vc-img-wrap">
                      <img className="lc-gif" src={GIF} alt="" />
                      <img className="vc-img" src={GIF} alt="" />
                      <div className="lc-lock">
                        <img src={MARK} alt="" />
                      </div>
                    </div>
                    <div className="vc-body">
                      <PlaceholderBars />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="net-act">
              <div className="net-act-hdr">
                <div className="net-act-title">Network Activity</div>
              </div>
              <div className="nempty">
                <table className="net-table">
                  <thead>
                    <tr>
                      {ACTIVITY_COLUMNS.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody id="netTable">
                    {collections.map((c) => (
                      <tr key={c.name}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <img src={c.art.logo} alt="" style={{ width: 26, height: 26, borderRadius: 4, objectFit: "cover" }} />
                            <span className="td-wallet">{c.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="td-wallet" />
                        </td>
                        <td>
                          <span className="td-amt" />
                        </td>
                        <td>
                          <span className="td-wallet" />
                        </td>
                        <td>
                          <span className="td-time" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <HntrFooter />
      </div>
    </MainLayout>
  );
}
