"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/MainLayout";
import HntrFooter from "../components/layout/shell/HntrFooter";
import PageHeroBanner from "../components/PageHeroBanner";
import { PlaceholderBars } from "../components/home/NftPlaceholders";
import ShareCollectionModal from "../components/collection/ShareCollectionModal";
import { usePools } from "@/lib/pools";
import { useDashboardData } from "@/lib/rewards";
import { useEthUsdPrice } from "@/lib/coingecko";

// Co-ownership is not live yet: the grid shows the V2 pre-launch placeholder
// cards and every position value reads "—" (see lib/launch.ts).

const GIF = "/assets/v2/hntr-dark/nft-cycle.gif";
const MARK = "/assets/v2/hntr-dark/8b857621.png";
const PLACEHOLDER_COUNT = 9;
const CARD_DELAYS = ["0.24s", "0.40s", "0.40s", "0.00s", "0.12s", "0.40s", "0.30s", "0.06s", "0.18s"];

type PosView = "listed" | "sold" | "progress";

const POS_HEADS: Record<PosView, string[]> = {
  listed: ["Collection", "Price Listed", "APR", "My Profit", "View NFT"],
  sold: ["Collection", "Bought Price", "Sold Price", "My Profit", "View NFT"],
  progress: ["Collection", "ETH Target", "Raised", "APR", "My Deposit", "View NFT"],
};

const POS_TABS: { view: PosView; label: string }[] = [
  { view: "listed", label: "NFTs Listed" },
  { view: "sold", label: "NFTs Sold" },
  { view: "progress", label: "Pools in Progress" },
];

export default function CollectionPage() {
  const [posView, setPosView] = useState<PosView>("listed");
  const [shareOpen, setShareOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const { data: pools } = usePools();
  const { summary } = useDashboardData();
  const { data: ethUsd } = useEthUsdPrice();

  useEffect(() => setOrigin(window.location.origin), []);

  const collections = useMemo(() => (pools ?? []).filter((p) => p.status !== "CLOSED").map((p) => p.name), [pools]);
  const username = summary?.username || "HNTR member";
  const shareUrl = origin ? `${origin}/${summary?.username ? `?ref=${summary.username}` : ""}` : "";

  return (
    <MainLayout>
      <div className="feed" id="feed-collection" style={{ padding: 0 }}>
        <div className="coll-body">
          <PageHeroBanner
            canvasId="collBannerCv"
            animationKind="collection"
            shadeClassName="coll-banner-shade"
            mosaicId="collMosaic"
            style={{ marginBottom: "18px" }}
          >
            <div className="hero-title" style={{ fontSize: "20px", letterSpacing: ".08em" }}>
              MY NFT COLLECTION
            </div>
            <div className="hero-sub">Real-time oversight across all your NFT positions.</div>
          </PageHeroBanner>

          <div className="coll-stats">
            <div className="coll-stat">
              <div className="cs-lbl">NFT Owned</div>
              <div className="cs-val">
                0 <span className="cs-unit">NFTs</span>
              </div>
            </div>
            <div className="coll-stat">
              <div className="cs-lbl">Total NFTs Value</div>
              <div className="cs-val">
                0 <span className="eth-ic" />
              </div>
              <div className="cs-sub">$0</div>
            </div>
            <div className="coll-stat">
              <div className="cs-lbl">MY PROFIT</div>
              <div className="cs-val">
                0 <span className="eth-ic" />
              </div>
              <div className="cs-sub">$0</div>
            </div>
            <div className="cs-share-wrap">
              <button type="button" className="cs-share-btn hs-btn" onClick={() => setShareOpen(true)}>
                <span className="hs-lbl">SHARE MY COLLECTION</span>
                <span className="hs-ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="17.5" cy="5.5" r="2.8" fill="currentColor" />
                    <circle cx="6.5" cy="12" r="2.8" fill="currentColor" />
                    <circle cx="17.5" cy="18.5" r="2.8" fill="currentColor" />
                    <path d="M8.8 10.7l6.4-3.9M8.8 13.3l6.4 3.9" stroke="currentColor" strokeWidth="2.2" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className="coll-main">
            <div className="coll-main-right">
              <div className="coll-sh">
                <div className="coll-sh-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                    <rect x="2.5" y="2.5" width="6" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
                    <rect x="11.5" y="2.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
                    <rect x="11.5" y="11.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  Co-Owned NFTs
                </div>
              </div>
              <div className="nc-grid" id="ncGrid">
                {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                  <div className="nc" key={i} style={{ animationDelay: CARD_DELAYS[i % CARD_DELAYS.length] }} data-locked="1">
                    <div className="nc-img-wrap nvw">
                      <img className="nc-img" src={GIF} alt="" />
                      <img className="lc-gif" src={GIF} alt="" />
                      <div className="lc-lock">
                        <img src={MARK} alt="" />
                      </div>
                    </div>
                    <div className="nc-body">
                      <PlaceholderBars />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="coll-sh" style={{ marginTop: "8px" }}>
            <div className="coll-sh-title">All Positions Breakdown</div>
            <div className="pos-toggle">
              {POS_TABS.map((t) => (
                <button
                  key={t.view}
                  type="button"
                  className={`pos-tab${posView === t.view ? " active" : ""}`}
                  data-view={t.view}
                  onClick={() => setPosView(t.view)}
                >
                  <span className="pos-tab-dot" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="pos-table-wrap">
            <div className="nempty">
              <table className="pos-table">
                <thead>
                  <tr id="posHead">
                    {POS_HEADS[posView].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody id="posTable">
                  {collections.map((name) => (
                    <tr className="pos-tr" key={name}>
                      <td>
                        <div className="pos-coll">{name}</div>
                      </td>
                      {POS_HEADS[posView].slice(1).map((h) => (
                        <td key={h} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pos-footer">
              <div className="pos-count" id="posCount">
                Showing 0 of 0 entries
              </div>
              <div className="pos-pages">
                <button type="button" className="pos-pg" disabled aria-label="Previous page">
                  ‹
                </button>
                <button type="button" className="pos-pg active">
                  1
                </button>
                <button type="button" className="pos-pg" disabled aria-label="Next page">
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
        <HntrFooter />
      </div>
      <ShareCollectionModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        username={username}
        shareUrl={shareUrl}
        nfts={[]}
        ethUsd={ethUsd}
      />
    </MainLayout>
  );
}
