"use client";

import MainLayout from "../components/MainLayout";
import PoolsHeroBanner from "../components/PoolsHeroBanner";
import { DEPOSIT_CTA_LABEL } from "../../lib/deposit-modal";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import {
  formatUsd,
  OPENSEA_POOL_META,
  poolDisplayName,
  toPoolRouteId,
  useOpenSeaFeaturedPoolListings,
  useOpenSeaMarketplaceSales,
  type PoolCollectionSlug,
} from "@/lib/opensea";

type ActivityRow = {
  id: string;
  wallet: string;
  amount: string;
  date: string;
  collection: string;
  color: string;
  pct: number;
  isNew?: boolean;
  openseaUrl?: string;
};

function formatEth(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0.00";
  return value >= 100 ? value.toFixed(1) : value.toFixed(2);
}

function timeAgo(timestamp: number): string {
  if (!timestamp) return "—";
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = Math.max(0, Date.now() - ms);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function truncateAddr(value: string): string {
  if (!value || value.length < 10) return value || "—";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function PoolsPage() {
  const router = useRouter();
  const [expandedPool, setExpandedPool] = useState<string | null>(null);
  const [progWidths, setProgWidths] = useState<Record<string, number>>({});
  const { data: featured, isLoading: listingsLoading, error: listingsError } =
    useOpenSeaFeaturedPoolListings();
  const { data: sales, isLoading: salesLoading } = useOpenSeaMarketplaceSales(2);

  const pools = useMemo(() => {
    return (featured || [])
      .map((item) => {
        const meta = OPENSEA_POOL_META[item.slug];
        const tokenId = item.listing?.tokenId || item.nft?.tokenId;
        if (!tokenId) return null;
        const targetEth = item.listing?.priceEth || item.stats?.floorPrice || 0;
        const img = item.listing?.imageUrl || item.nft?.imageUrl || item.stats?.imageUrl || "";
        return {
          id: toPoolRouteId(item.slug, tokenId),
          slug: item.slug,
          tokenId,
          name: meta?.name || poolDisplayName(item.slug),
          number: `#${tokenId}`,
          img,
          tags: meta?.tags || ["OPENSEA", "LIVE"],
          color: meta?.color || "var(--olive)",
          target: formatEth(targetEth),
          raised: "0.00",
          targetUsd: formatUsd(targetEth),
          raisedUsd: "$0",
          progress: 0,
          gpProfit: "—",
          ethProfit: "—",
          usdtProfit: "—",
          users: 0,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      slug: PoolCollectionSlug;
      tokenId: string;
      name: string;
      number: string;
      img: string;
      tags: readonly string[];
      color: string;
      target: string;
      raised: string;
      targetUsd: string;
      raisedUsd: string;
      progress: number;
      gpProfit: string;
      ethProfit: string;
      usdtProfit: string;
      users: number;
    }>;
  }, [featured]);

  const activityRows = useMemo<ActivityRow[]>(() => {
    return (sales || []).slice(0, 8).map((sale) => {
      const slug = sale.collection as PoolCollectionSlug;
      const meta = slug in OPENSEA_POOL_META ? OPENSEA_POOL_META[slug] : null;
      return {
        id: `${sale.collection}-${sale.tokenId}-${sale.timestamp}`,
        wallet: truncateAddr(sale.contract),
        amount: `${formatEth(sale.priceEth)} ETH`,
        date: timeAgo(sale.timestamp),
        collection: poolDisplayName(sale.collection),
        color: meta?.color || "var(--olive)",
        pct: 100,
        openseaUrl: sale.openseaUrl,
      };
    });
  }, [sales]);

  const goToPool = (poolId: string) => {
    router.push(`/pool/${poolId}`);
  };

  const togglePool = (id: string) => {
    setExpandedPool(expandedPool === id ? null : id);
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    activityRows.forEach((row, i) => {
      timers.push(
        setTimeout(() => {
          setProgWidths((prev) => {
            if (prev[row.id] !== undefined) return prev;
            return { ...prev, [row.id]: row.pct };
          });
        }, 200 + i * 100),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [activityRows]);

  return (
    <MainLayout>
      <div className="feed" id="feed-pools">
        <div className="page-body">
          <PoolsHeroBanner />

          <div className="stat-strip">
            <div className="ss">
              <div className="ss-lbl">Total ETH Raised</div>
              <div className="ss-val">
                0 <span className="eth-ic"></span>
              </div>
              <div className="ss-chg" style={{ color: "var(--t0)" }}>
                ≈ $0
              </div>
            </div>
            <div className="ss">
              <div className="ss-lbl">NFT Strategy Available</div>
              <div className="ss-val">
                {pools.length} <span className="ss-unit">Pools</span>
              </div>
              <div className="ss-chg" style={{ color: "var(--t0)" }}>
                {listingsLoading ? (
                  <span className="pd-skel" style={{ display: "inline-block", width: 88, height: 10 }} />
                ) : (
                  "Live listings"
                )}
              </div>
            </div>
            <div className="ss">
              <div className="ss-lbl">Avg. LTV</div>
              <div className="ss-val">
                0<span className="ss-unit">%</span>
              </div>
              <div className="ss-chg" style={{ color: "var(--t0)" }}>
                Collateral ratio
              </div>
            </div>
            <div className="ss">
              <div className="ss-lbl">Total Users</div>
              <div className="ss-val">0</div>
              <div className="ss-chg" style={{ color: "var(--t0)" }}>
                —
              </div>
            </div>
          </div>

          <div className="section-hdr pools-section-hdr">
            <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              CURRENT LIVE STRATEGIES
              <span
                className="live-dot"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 8px rgba(52,211,153,.8)",
                  flexShrink: 0,
                }}
              ></span>
            </div>
            <div className="manage-link">Manage All</div>
          </div>

          <div className="np-grid">
            {listingsLoading && pools.length === 0 &&
              [0, 1, 2, 3].map((i) => (
                <div key={`pool-skel-${i}`} className="npc npc-skel" aria-hidden="true">
                  <div className="npc-row">
                    <div className="npc-art">
                      <div className="pd-skel" style={{ width: "100%", height: "100%", minHeight: 168, borderRadius: 0 }} />
                    </div>
                    <div className="npc-body">
                      <div className="npc-head">
                        <div style={{ flex: 1 }}>
                          <div className="pd-skel" style={{ width: "70%", height: 16, marginBottom: 8 }} />
                          <div className="pd-skel" style={{ width: 56, height: 10 }} />
                        </div>
                        <div className="pd-skel" style={{ width: 88, height: 24, borderRadius: 5 }} />
                      </div>
                      <div className="npc-stats">
                        <div className="pd-skel" style={{ height: 44, borderRadius: 6 }} />
                        <div className="pd-skel" style={{ height: 44, borderRadius: 6 }} />
                      </div>
                      <div className="pd-skel pd-skel-bar" style={{ marginBottom: 14 }} />
                      <div className="npc-act">
                        <div className="pd-skel" style={{ flex: 1, height: 32, borderRadius: 6 }} />
                        <div className="pd-skel" style={{ flex: 1.4, height: 32, borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {listingsError && pools.length === 0 && (
              <div className="npc" style={{ padding: "24px", color: "#ff6b6b" }}>
                OpenSea listings unavailable. Try again shortly.
              </div>
            )}
            {pools.map((pool) => (
              <div key={pool.id} className={`npc${expandedPool === pool.id ? " open" : ""}`}>
                <div className="npc-row">
                  <div className="npc-art" onClick={() => goToPool(pool.id)} style={{ cursor: "pointer" }}>
                    {pool.img ? (
                      <img src={pool.img} alt={pool.name} />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "var(--e3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--t2)",
                          fontSize: "12px",
                        }}
                      >
                        No image
                      </div>
                    )}
                    <div className="npc-pool">POOL {pool.number}</div>
                  </div>
                  <div className="npc-body">
                    <div className="npc-head">
                      <div>
                        <div className="npc-name">{pool.name}</div>
                        <div className="npc-id">{pool.number}</div>
                        <div className="npc-tags">
                          {pool.tags.map((tag, i) => (
                            <span key={i} className="npc-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="npc-insights"
                        onClick={() => goToPool(pool.id)}
                      >
                        <i></i>VIEW INSIGHTS
                      </button>
                    </div>
                    <div className="npc-stats">
                      <div>
                        <div className="npc-sl">Target</div>
                        <div className="npc-sv">
                          {pool.target}
                          <span className="eth-ic"></span>
                        </div>
                        <div className="npc-su">{pool.targetUsd}</div>
                      </div>
                      <div>
                        <div className="npc-sl">Raised</div>
                        <div className="npc-sv raised">
                          {pool.raised}
                          <span className="eth-ic"></span>
                        </div>
                        <div className="npc-su">{pool.raisedUsd}</div>
                      </div>
                    </div>
                    <div className="npc-prog">
                      <div className="npc-pr">
                        <span>Progress</span>
                        <span className="pct">{pool.progress.toFixed(1)}%</span>
                      </div>
                      <div className="npc-pb">
                        <div className="npc-pf" style={{ width: `${pool.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="npc-act">
                      <button className="npc-btn-d" onClick={() => togglePool(pool.id)}>
                        <span className="car">{expandedPool === pool.id ? "▴" : "▾"}</span>
                        Pool Details
                      </button>
                      <button className="npc-btn-p" type="button" disabled>
                        {DEPOSIT_CTA_LABEL}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="npc-detail">
                  <div className="npc-detail-in">
                    <div className="npc-db">
                      <div className="npc-dl">GP Profit</div>
                      <div className="npc-dv">{pool.gpProfit}</div>
                    </div>
                    <div className="npc-db">
                      <div className="npc-dl">ETH Profit</div>
                      <div className="npc-dv">{pool.ethProfit}</div>
                    </div>
                    <div className="npc-db">
                      <div className="npc-dl">USDT Profit</div>
                      <div className="npc-dv">{pool.usdtProfit}</div>
                    </div>
                    <div className="npc-db">
                      <div className="npc-dl">Users</div>
                      <div className="npc-dv">{pool.users}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rt-activity">
            <div className="rta-hdr">
              <div className="rta-title">
                <span className="rta-title-desktop">Real-Time Activity</span>
                <span className="rta-title-mobile">Recent Sales</span>
              </div>
              <div className="rta-live">
                <div className="rta-dot"></div>
                <span className="rta-live-desktop">OpenSea</span>
                <span className="rta-live-mobile">LIVE</span>
              </div>
            </div>

            <div className="pools-dep-mobile">
              <div className="pools-dep-card">
                {salesLoading && activityRows.length === 0 &&
                  [0, 1, 2, 3].map((i) => (
                    <div key={`dep-skel-${i}`} className="pools-dep-row">
                      <div className="pd-skel" style={{ width: 52, height: 16, borderRadius: 4 }} />
                      <div className="pools-dep-main">
                        <div className="pd-skel" style={{ width: 90, height: 10, marginBottom: 6 }} />
                        <div className="pd-skel" style={{ width: 48, height: 8 }} />
                      </div>
                      <div className="pd-skel" style={{ width: 64, height: 12 }} />
                    </div>
                  ))}
                {activityRows.slice(0, 5).map((row) => (
                  <div key={row.id} className={`pools-dep-row${row.isNew ? " fresh" : ""}`}>
                    <span className="pools-dep-badge">SALE</span>
                    <div className="pools-dep-main">
                      <div className="pools-dep-wallet">{row.wallet}</div>
                      <div className="pools-dep-date">{row.date}</div>
                    </div>
                    <div className="pools-dep-amt">{row.amount}</div>
                  </div>
                ))}
                <div className="pools-dep-footer">
                  {activityRows.length === 0
                    ? "No recent OpenSea sales"
                    : `Showing 1–${Math.min(5, activityRows.length)} of ${activityRows.length} sales`}
                </div>
              </div>
            </div>

            <div className="pools-act-desktop table-scroll">
              <table className="act-table">
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Sale Amount</th>
                    <th>Collection</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="actTable">
                  {salesLoading && activityRows.length === 0 &&
                    [0, 1, 2, 3].map((i) => (
                      <tr key={`act-skel-${i}`} className="act-skel">
                        <td><div className="pd-skel" style={{ width: 88, height: 10 }} /></td>
                        <td><div className="pd-skel" style={{ width: 72, height: 10 }} /></td>
                        <td><div className="pd-skel" style={{ width: 140, height: 10 }} /></td>
                        <td><div className="pd-skel pd-skel-bar" /></td>
                        <td><div className="pd-skel" style={{ width: 64, height: 10 }} /></td>
                      </tr>
                    ))}
                  {activityRows.map((row) => (
                    <tr key={row.id} className={row.isNew ? "row-new" : ""}>
                      <td className="td-wallet">{row.wallet}</td>
                      <td className="td-amt">{row.amount}</td>
                      <td>
                        <div className="td-coll">
                          <div className="td-coll-dot" style={{ background: row.color }}></div>
                          <span className="td-coll-name">{row.collection}</span>
                        </div>
                      </td>
                      <td>
                        <div className="td-prog-wrap">
                          <div className="td-prog-bar">
                            <div
                              className="td-prog-fill"
                              style={{ width: `${progWidths[row.id] ?? 0}%` }}
                            ></div>
                          </div>
                          <span className="td-prog-pct">{row.pct}%</span>
                        </div>
                      </td>
                      <td>
                        {row.openseaUrl ? (
                          <a
                            className="td-action"
                            href={row.openseaUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            VIEW TX
                          </a>
                        ) : (
                          <span className="td-action">VIEW TX</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
