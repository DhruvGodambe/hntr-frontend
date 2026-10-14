"use client";

import { useMemo } from "react";
import { useRouter } from "nextjs-toploader/app";
import MainLayout from "../components/MainLayout";
import HntrFooter from "../components/layout/shell/HntrFooter";
import { DEPOSITS_ENABLED } from "../../lib/deposit-modal";
import { toPoolRouteId, useOpenSeaListingsForSlugs } from "@/lib/opensea";
import { usePools, poolCollectionSlug, poolProgress } from "@/lib/pools";
import { collectionArt } from "@/lib/collection-art";

const LOGO_ROWS = [
  ["l1.avif", "l2.avif", "l3.avif", "l4.avif", "l5.avif", "l6.avif", "l7.avif"],
  ["l8.avif", "l9.webp", "l10.avif", "l11.avif", "l12.avif", "l13.avif", "l14.avif"],
  ["l15.avif", "l16.avif", "l17.avif", "l18.avif", "l19.avif", "l20.avif", "l21.avif"],
];

const ACTIVITY_COLUMNS = ["Wallet", "Bid Amount", "Collection", "Completion", "Action"];

const OPENSEA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="11" />
    <path fill="#fff" d="M6 13.2 9.4 8l1.5 4.2-.6 1zM12.4 15h4.4c-.4 1.4-1.4 2.1-2.8 2.1H8.3c-.9 0-1.4-.9-1.4-1.7V15h3.9l.6-.9h1z" />
  </svg>
);

function formatEth(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0.00";
  return value >= 100 ? value.toFixed(1) : value.toFixed(2);
}

export default function PoolsPage() {
  const router = useRouter();
  const { data: poolRecords, isLoading: poolsLoading, error: poolsError } = usePools();
  const openPoolRecords = useMemo(() => (poolRecords ?? []).filter((p) => p.status !== "CLOSED"), [poolRecords]);
  const collectionSlugs = useMemo(() => Array.from(new Set(openPoolRecords.map((p) => poolCollectionSlug(p)))), [openPoolRecords]);
  const { data: liveListings, isLoading: liveLoading } = useOpenSeaListingsForSlugs(collectionSlugs, 1);
  const loading = poolsLoading || (collectionSlugs.length > 0 && liveLoading);

  const pools = useMemo(
    () =>
      openPoolRecords.map((p) => {
        const slug = poolCollectionSlug(p);
        const live = liveListings?.[slug];
        const tokenId = live?.listing?.tokenId || "0";
        const targetEth = live?.floorEth ?? 0;
        return {
          id: toPoolRouteId(p.slug, tokenId),
          name: p.name,
          art: collectionArt(slug, p.imageUrl, p.name),
          live: p.status === "OPEN" && !p.depositsPaused,
          lowest: targetEth > 0 ? `${formatEth(targetEth)} ETH` : "TBA",
          raised: `${formatEth(p.raisedEth)} ETH`,
          progress: poolProgress(p.raisedEth, targetEth),
          participants: p.participants,
        };
      }),
    [openPoolRecords, liveListings],
  );
  const livePools = pools.filter((p) => p.live);
  const upcomingPools = pools.filter((p) => !p.live);

  const collectionCell = (p: (typeof pools)[number]) => (
    <div className="stl-c">
      <img src={p.art.logo} alt="" />
      <div>
        <div className="stl-n">
          {p.name}
          <em>ERC 721</em>
        </div>
      </div>
    </div>
  );

  const marketplaceCell = (
    <span className="stl-m">
      {OPENSEA_ICON}
      OpenSea
    </span>
  );

  return (
    <MainLayout>
      <div className="feed" id="feed-pools" style={{ padding: "0 0 40px" }}>
        <div className="page-body">
          <div className="pools-hero">
            <div className="ph-rows">
              {LOGO_ROWS.map((row, i) => {
                const imgs = [...row, ...row, ...row, ...row, ...row, ...row];
                return (
                  <div key={i} className={`ph-row${i % 2 ? " r" : ""}`} style={{ animationDuration: `${50 + i * 8}s` }}>
                    {imgs.map((src, k) => (
                      <img key={k} src={`/assets/v2/hntr-dark/logos/${src}`} alt="" loading="lazy" />
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="ph-fade" />
            <div className="pools-hero-content">
              <div className="pools-hero-title">NFT STRATEGIES</div>
            </div>
          </div>

          <section className="stl" id="stlLive">
            <div className="stl-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="8.5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="12" cy="12" r="1.2" fill="currentColor" />
              </svg>
              Live NFT Strategy
              <span className="stl-dot" />
              {/* Priority Line is the pre-launch way in; keep it reachable from the strategy list. */}
              <button
                type="button"
                className="stl-btn"
                style={{ marginLeft: "auto", width: "auto", padding: "0 16px" }}
                onClick={() => router.push("/priority-line")}
              >
                Priority Line
              </button>
            </div>
            <div className="stl-box">
              <table className="stl-t">
                <colgroup>
                  <col className="c1" />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col style={{ width: "15%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Collection</th>
                    <th>Lowest Price</th>
                    <th>ETH Raised</th>
                    <th>Percentage</th>
                    <th>Participants</th>
                    <th>Marketplace</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {loading &&
                    [0, 1].map((i) => (
                      <tr key={`skel-${i}`}>
                        <td>
                          <div className="pd-skel" style={{ width: 180, height: 32 }} />
                        </td>
                        {Array.from({ length: 6 }, (_, k) => (
                          <td key={k}>
                            <div className="pd-skel" style={{ width: 60, height: 12 }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  {!loading && poolsError && (
                    <tr>
                      <td colSpan={7} style={{ color: "#ff6b6b" }}>
                        Could not load strategies. Please try again shortly.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    livePools.map((p) => (
                      <tr key={p.id} onClick={() => router.push(`/pool/${p.id}`)} style={{ cursor: "pointer" }}>
                        <td>{collectionCell(p)}</td>
                        <td>{p.lowest}</td>
                        <td>{DEPOSITS_ENABLED ? p.raised : "—"}</td>
                        <td>
                          <div className={`stl-pb${DEPOSITS_ENABLED ? "" : " au-pre"}`}>
                            <span className="stl-g">{p.progress}%</span>
                            <i>
                              <b style={{ width: `${p.progress}%` }} />
                            </i>
                          </div>
                        </td>
                        <td>{p.participants.toLocaleString()}</td>
                        <td>{marketplaceCell}</td>
                        <td>
                          <button
                            type="button"
                            className="stl-btn"
                            data-k="live"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/pool/${p.id}`);
                            }}
                          >
                            {DEPOSITS_ENABLED ? "Enter strategy" : "Preview strategy"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {upcomingPools.length > 0 && (
            <section className="stl" id="stlUp">
              <div className="stl-h">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Upcoming NFT Strategies
              </div>
              <div className="stl-box">
                <table className="stl-t">
                  {/* Same 7-column grid as the live table; V2 CSS hides columns 3–5 here. */}
                  <colgroup>
                    <col className="c1" />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col style={{ width: "15%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Collection</th>
                      <th>Lowest Price</th>
                      <th />
                      <th />
                      <th />
                      <th>Marketplace</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingPools.map((p) => (
                      <tr key={p.id} onClick={() => router.push(`/pool/${p.id}`)} style={{ cursor: "pointer" }}>
                        <td>{collectionCell(p)}</td>
                        <td>{p.lowest}</td>
                        <td />
                        <td />
                        <td />
                        <td>{marketplaceCell}</td>
                        <td>
                          <span className="stl-soon">Coming soon</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="rt-activity">
            <div className="rta-hdr">
              <div className="rta-title">Real-Time Activity</div>
              <div className="rta-live">Starts at launch</div>
            </div>
            <div className="nempty">
              <table className="act-table au-pre">
                <thead>
                  <tr>
                    {ACTIVITY_COLUMNS.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody id="actTable" />
              </table>
              <div className="au-note">Activity starts when the strategy goes live.</div>
            </div>
          </div>
        </div>
        <HntrFooter />
      </div>
    </MainLayout>
  );
}
