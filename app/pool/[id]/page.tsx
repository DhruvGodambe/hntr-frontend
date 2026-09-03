"use client";

import MainLayout from "../../components/MainLayout";
import { DEPOSIT_CTA_LABEL } from "../../../lib/deposit-modal";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  OPENSEA_POOL_META,
  parsePoolRouteId,
  poolDisplayName,
  toPoolRouteId,
  useOpenSeaOtherPoolListings,
  useOpenSeaPoolNft,
  type OpenSeaPoolNft,
  type PoolCollectionSlug,
} from "@/lib/opensea";
import type { PoolDetail } from "../../../lib/pools-data";

type TxRow = {
  id: string;
  wallet: string;
  date: string;
  amount: string;
  isNew?: boolean;
};

type DepositRow = {
  id: string;
  addr: string;
  amt: string;
  ago: string;
  isNew?: boolean;
};

const WALLETS = ["0x71C...492", "0x3A8...12D", "0x9FE...88A", "0x12C...55B", "0xB4D...F31"];
const AMOUNTS = ["0.50 ETH", "0.85 ETH", "1.25 ETH", "2.10 ETH", "3.40 ETH"];
const DATES = ["Jun 14, 2026", "Jun 12, 2026", "Jun 10, 2026", "Jun 08, 2026"];

const MOBILE_WALLETS = ["0x9F2…A17", "0x71C…492", "0x3aD…0C9", "0xB4e…77F", "0x6cc…D21"];
const MOBILE_AMOUNTS = ["2.40", "1.85", "0.75", "3.10", "0.50"];
const MOBILE_AGOS = ["2m ago", "14m ago", "38m ago", "1h ago", "2h ago"];

const ETH_USD_RATE = 2203.67;

function makeTxRow(isNew = false): TxRow {
  return {
    id: `${Date.now()}-${Math.random()}`,
    wallet: WALLETS[Math.floor(Math.random() * WALLETS.length)],
    date: DATES[Math.floor(Math.random() * DATES.length)],
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    isNew,
  };
}

function makeDepositRow(isNew = false): DepositRow {
  const i = Math.floor(Math.random() * MOBILE_WALLETS.length);
  return {
    id: `${Date.now()}-${Math.random()}`,
    addr: MOBILE_WALLETS[i],
    amt: MOBILE_AMOUNTS[i],
    ago: MOBILE_AGOS[i],
    isNew,
  };
}

function extractTokenId(name: string): string {
  const match = name.match(/#(\d+)/);
  return match ? `#${match[1]}` : "#—";
}

function collectionDisplayName(name: string): string {
  return name.replace(/\s*#\d+\s*$/, "").trim();
}

function tagsForSlug(slug: string): [string, string] {
  if (slug in OPENSEA_POOL_META) {
    return OPENSEA_POOL_META[slug as PoolCollectionSlug].tags;
  }
  return ["OPENSEA", "LIVE LISTING"];
}

function mapNftToPool(nft: OpenSeaPoolNft): PoolDetail {
  const target = (nft.listingPriceEth || nft.floorPriceEth || 0).toFixed(2);
  return {
    id: toPoolRouteId(nft.slug, nft.tokenId),
    metaId: `${nft.slug}-${nft.tokenId}`,
    name: `${nft.collectionName} #${nft.tokenId}`,
    shortName: nft.name,
    series: "OpenSea listing",
    target,
    raised: "0.00",
    progress: 0,
    gpProfit: "—",
    gpChange: "Coming soon",
    ethProfit: "0.00",
    ethChange: "—",
    usdtProfit: "$0.00",
    usdtNote: "Unrealised P&L",
    participants: 0,
    floorEth: (nft.floorPriceEth || 0).toFixed(2),
    img: nft.imageUrl || "/assets/images/image-6.jpg",
    avatarImg: nft.imageUrl || "/assets/images/image-6.jpg",
    daysRemaining: 0,
  };
}

function ethToUsd(eth: string): string {
  const value = parseFloat(eth);
  if (Number.isNaN(value)) return "$—";
  return `$${(value * ETH_USD_RATE).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function remainingEth(target: string, raised: string): string {
  return Math.max(0, parseFloat(target) - parseFloat(raised)).toFixed(2);
}

function PoolDetailSkeleton() {
  return (
    <MainLayout>
      <div className="pool-detail-page pd-skel-page">
        <div className="feed pool-detail-scroll" id="feed-pooldetail">
          <div className="pd-desktop-only">
            <div className="breadcrumb">
              <div className="bc-head">
                <div className="pd-skel" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <div className="pd-skel" style={{ width: 160, height: 14 }} />
              </div>
              <div className="pd-skel pd-skel-line" style={{ width: 220, marginTop: 8 }} />
            </div>

            <div className="detail-card">
              <div className="pool-detail-top">
                <div className="pd-skel pd-skel-img" aria-hidden="true" />
                <div className="pool-detail-info">
                  <div className="pool-meta-row">
                    <div className="pd-skel pd-skel-line" style={{ width: 120 }} />
                    <div className="pd-skel pd-skel-line" style={{ width: 88 }} />
                    <div className="pd-skel pd-skel-line" style={{ width: 110 }} />
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      <div className="pd-skel" style={{ width: 28, height: 28, borderRadius: 5 }} />
                      <div className="pd-skel" style={{ width: 28, height: 28, borderRadius: 5 }} />
                    </div>
                  </div>
                  <div className="pd-skel pd-skel-title" />
                  <div className="pd-skel pd-skel-stat" />
                  <div className="pd-skel pd-skel-bar" />
                  <div className="pd-skel pd-skel-btn" />
                  <div className="pd-skel pd-skel-line" style={{ width: "70%", margin: "0 auto" }} />
                </div>
              </div>
            </div>

            <div className="metrics-strip">
              {[0, 1, 2, 3].map((i) => (
                <div className="pd-skel pd-skel-metric" key={i} />
              ))}
            </div>

            <div className="section-hdr">
              <div className="pd-skel" style={{ width: 180, height: 12 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div className="pd-skel" style={{ width: 72, height: 26, borderRadius: 4 }} />
                <div className="pd-skel" style={{ width: 64, height: 26, borderRadius: 4 }} />
              </div>
            </div>
            <div className="pd-skel pd-skel-table" />
          </div>

          <div className="pd-mobile-only">
            <div className="pd-mobile-hero">
              <div className="pd-skel" style={{ width: "100%", height: 280, borderRadius: 0 }} />
            </div>
            <div className="pd-mobile-body">
              <div className="pd-skel pd-skel-stat" style={{ marginBottom: 14 }} />
              <div className="pd-skel pd-skel-bar" style={{ marginBottom: 16 }} />
              <div className="pd-skel pd-skel-btn" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function PoolDetailView({
  pool,
  slug,
  openseaUrl,
  otherListings,
}: {
  pool: PoolDetail;
  slug: string;
  openseaUrl?: string;
  otherListings: Array<{
    tokenId: string;
    name: string;
    imageUrl: string;
    collection: string;
    priceEth: number;
  }>;
}) {
  const router = useRouter();
  const [shareCopied, setShareCopied] = useState(false);
  const [txRows, setTxRows] = useState<TxRow[]>(() => Array.from({ length: 4 }, () => makeTxRow()));
  const [depositRows, setDepositRows] = useState<DepositRow[]>(() =>
    MOBILE_WALLETS.map((addr, i) => ({
      id: `seed-${i}`,
      addr,
      amt: MOBILE_AMOUNTS[i],
      ago: MOBILE_AGOS[i],
    })),
  );
  const [txCount, setTxCount] = useState(1244);

  const tokenId = extractTokenId(pool.name);
  const collectionName = collectionDisplayName(pool.name);
  const [tagPrimary, tagSecondary] = tagsForSlug(slug);
  const poolLabel = `POOL ${tokenId}`;
  const targetUsd = ethToUsd(pool.target);
  const raisedUsd = ethToUsd(pool.raised);
  const remaining = remainingEth(pool.target, pool.raised);
  const progressLabel = `${pool.progress.toFixed(1)}%`;

  const performanceMetrics = useMemo(
    () => [
      { label: "GP Profit", value: pool.gpProfit },
      { label: "ETH Profit", value: `${pool.ethProfit} ETH` },
      { label: "USDT Profit", value: pool.usdtProfit },
      { label: "Users", value: String(pool.participants) },
    ],
    [pool],
  );

  useEffect(() => {
    document.body.dataset.page = "pooldetail";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTxRows((rows) => [makeTxRow(true), ...rows].slice(0, 4));
      setDepositRows((rows) => [makeDepositRow(true), ...rows].slice(0, 5));
      setTxCount((count) => count + 1);
    }, 2500 + Math.random() * 2000);

    return () => clearInterval(timer);
  }, []);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/pools");
  };

  const copyShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = url;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      } catch {
        return;
      }
    }
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1000);
  };

  return (
    <MainLayout>
      <div className="pool-detail-page">
        <div className="pd-mobile-only pd-mobile-header">
          <button className="pd-m-back" type="button" onClick={goBack} aria-label="Back to pools">
            ←
          </button>
          <div className="pd-m-header-title">Pool Details</div>
        </div>

        <div className="feed pool-detail-scroll" id="feed-pooldetail">
          <div className="pd-mobile-only">
            <div className="pd-mobile-hero">
              <div className="pd-mobile-hero-frame">
                <img className="pd-mobile-hero-img" src={pool.img} alt={pool.name} />
                <div className="pd-mobile-hero-shade" aria-hidden="true" />
                <div className="pd-mobile-hero-content">
                  <div className="pd-mobile-tags">
                    <span className="pd-mobile-tag">{tagPrimary}</span>
                    <span className="pd-mobile-tag">{tagSecondary}</span>
                  </div>
                  <div className="pd-mobile-name">{collectionName}</div>
                  <div className="pd-mobile-sub">
                    {tokenId} · {poolLabel}
                  </div>
                </div>
              </div>
            </div>

            <div className="pd-mobile-body">
              <div className="pd-mobile-stats-card">
                <div className="pd-mobile-stats-grid">
                  <div className="pd-mobile-stat">
                    <div className="pd-mobile-stat-lbl">Pool Target</div>
                    <div className="pd-mobile-stat-val">
                      {pool.target} Ξ
                    </div>
                    <div className="pd-mobile-stat-sub">{targetUsd}</div>
                  </div>
                  <div className="pd-mobile-stat">
                    <div className="pd-mobile-stat-lbl">Community Raised</div>
                    <div className="pd-mobile-stat-val">
                      {pool.raised} Ξ
                    </div>
                    <div className="pd-mobile-stat-sub">{raisedUsd}</div>
                  </div>
                </div>

                <div className="pd-mobile-progress-head">
                  <span className="pd-mobile-progress-lbl">Pool Progress</span>
                  <span className="pd-mobile-progress-pct">{progressLabel}</span>
                </div>
                <div className="pd-mobile-progress-track">
                  <div className="pd-mobile-progress-fill" style={{ width: `${pool.progress}%` }} />
                </div>
                <div className="pd-mobile-progress-note">
                  {remaining} Ξ remaining to fill this pool · {pool.participants} contributors
                </div>
              </div>

              <div className="pd-mobile-section">
                <div className="pd-mobile-section-title">Performance</div>
                <div className="pd-mobile-perf-grid">
                  {performanceMetrics.map((metric) => (
                    <div className="pd-mobile-perf-card" key={metric.label}>
                      <div className="pd-mobile-perf-lbl">{metric.label}</div>
                      <div className="pd-mobile-perf-val">{metric.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pd-mobile-section">
                <div className="pd-mobile-deposits-head">
                  <div className="pd-mobile-section-title">Recent Deposits</div>
                  <div className="pd-mobile-live">
                    <span className="pd-mobile-live-dot" aria-hidden="true" />
                    LIVE
                  </div>
                </div>
                <div className="pd-mobile-deposits-card">
                  {depositRows.map((row, index) => (
                    <div
                      className={`pd-mobile-deposit-row${row.isNew ? " is-new" : ""}${index === depositRows.length - 1 ? " is-last" : ""}`}
                      key={row.id}
                    >
                      <div className="pd-mobile-deposit-left">
                        <div className="pd-mobile-deposit-avatar" aria-hidden="true">
                          👤
                        </div>
                        <div>
                          <div className="pd-mobile-deposit-addr">{row.addr}</div>
                          <div className="pd-mobile-deposit-ago">{row.ago}</div>
                        </div>
                      </div>
                      <div className="pd-mobile-deposit-amt">+{row.amt} Ξ</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pd-desktop-only">
            <div className="breadcrumb">
              <div className="bc-head">
                <button className="bc-back" type="button" onClick={goBack} aria-label="Back to pools">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M10 3.5 5.5 8l4.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="bc-title">Pools Details</div>
              </div>
              <div className="bc-sub">
                Item: <span>{pool.name} Details</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="pool-detail-top">
                <img className="pool-detail-img" src={pool.img} alt="Pool NFT" />
                <div className="pool-detail-info">
                  <div className="pool-meta-row">
                    <span className="pool-meta-id">ID: {pool.metaId}</span>
                    <div className="pool-meta-links">
                      <span className="pool-meta-link">{pool.shortName}</span>
                      <span style={{ color: "var(--t0)" }}>|</span>
                      {openseaUrl ? (
                        <a
                          className="pool-meta-link"
                          href={openseaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          OpenSea listing
                        </a>
                      ) : (
                        <span className="pool-meta-link">OpenSea listing</span>
                      )}
                    </div>
                    <div className="pool-share-btns">
                      <button
                        className="share-btn"
                        type="button"
                        aria-label="Copy pool link"
                        onClick={copyShareLink}
                        style={shareCopied ? { color: "var(--green)" } : undefined}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                          />
                          <path
                            d="M5.8 7.1l4.4-2.2M5.8 8.9l4.4 2.2"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                      <button
                        className="share-btn"
                        type="button"
                        aria-label="Open on OpenSea"
                        onClick={() => {
                          if (openseaUrl) window.open(openseaUrl, "_blank", "noopener,noreferrer");
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M4 8h8M8 4l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="pool-name">{pool.name}</div>
                  <div className="pool-stats-pair">
                    <div className="psp">
                      <div className="psp-lbl">Target Price</div>
                      <div className="psp-val">
                        {pool.target} <span className="eth-ic"></span>
                      </div>
                    </div>
                    <div className="psp">
                      <div className="psp-lbl">Community Raised</div>
                      <div className="psp-val">
                        {pool.raised} <span className="eth-ic"></span>
                      </div>
                    </div>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-header">
                      <span className="progress-label">Community Raised</span>
                      <span className="progress-val">
                        {pool.raised} / {pool.target} ETH ({pool.progress}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pool.progress}%` }}></div>
                    </div>
                  </div>
                  <button className="deposit-btn pool-detail-deposit-inline" type="button" disabled>
                    {DEPOSIT_CTA_LABEL}
                  </button>
                  <div className="deposit-note pool-detail-deposit-note">
                    Liquidity locked until pool target or timeout ({pool.daysRemaining}d remaining)
                  </div>
                </div>
              </div>
            </div>

            <div className="metrics-strip">
              <div className="metric">
                <div className="metric-lbl">GP (Gross Profit)</div>
                <div className="metric-val">{pool.gpProfit}</div>
                <div className="metric-chg">{pool.gpChange}</div>
              </div>
              <div className="metric">
                <div className="metric-lbl">ETH Profit</div>
                <div className="metric-val">{pool.ethProfit}</div>
                <div className="metric-chg pos">{pool.ethChange}</div>
              </div>
              <div className="metric">
                <div className="metric-lbl">USDT Profit</div>
                <div className="metric-val">{pool.usdtProfit}</div>
                <div className="metric-chg" style={{ color: "var(--t0)" }}>
                  {pool.usdtNote}
                </div>
              </div>
              <div className="metric">
                <div className="metric-lbl">Participants</div>
                <div className="metric-val">{pool.participants}</div>
                <div className="participants-wrap">
                  {[0, 1, 2].map((i) => (
                    <div className="p-avatar" key={i}>
                      <img src={pool.avatarImg} alt="" />
                    </div>
                  ))}
                  <span className="p-more">+{pool.participants - 3}</span>
                </div>
              </div>
            </div>

            <div className="section-hdr">
              <div className="section-title">Transaction Activity</div>
              <div className="section-actions">
                <button className="act-btn" type="button">
                  Export CSV
                </button>
                <button className="act-btn" type="button">
                  Filters
                </button>
              </div>
            </div>
            <div className="tx-table-wrap table-scroll">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="txTable">
                  {txRows.map((row) => (
                    <tr key={row.id} className={row.isNew ? "row-new" : undefined}>
                      <td className="td-wallet">{row.wallet}</td>
                      <td>
                        <span className="td-badge">POOL_DEPOSIT</span>
                      </td>
                      <td className="td-date">{row.date}</td>
                      <td className="td-amount">{row.amount}</td>
                      <td>
                        <span className="td-action">View Transaction</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <div className="pg-info" id="pgInfo">
                  Showing 1-4 of {txCount.toLocaleString()} entries
                </div>
                <div className="pg-btns">
                  <button className="pg-btn pg-arrow" type="button" aria-label="Previous page">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <polyline
                        points="7,2 3,5 7,8"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="pg-btn active" type="button">
                    1
                  </button>
                  <button className="pg-btn" type="button">
                    2
                  </button>
                  <button className="pg-btn" type="button">
                    3
                  </button>
                  <button className="pg-btn pg-arrow" type="button" aria-label="Next page">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <polyline
                        points="3,2 7,5 3,8"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="section-hdr" style={{ marginTop: "16px" }}>
              <div className="section-title">Other Available Pools</div>
            </div>
            <div className="carousel-outer">
              <div className="carousel-track" id="carouselTrack">
                {(otherListings.length ? [...otherListings, ...otherListings] : []).map((item, i) => {
                  const routeId = toPoolRouteId(item.collection, item.tokenId);
                  return (
                    <div className="pool-thumb" key={`${routeId}-${i}`}>
                      <div
                        className="pool-thumb-art"
                        style={
                          item.imageUrl
                            ? {
                                backgroundImage: `url(${item.imageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      >
                        {item.imageUrl ? "" : "NFT"}
                      </div>
                      <div className="pool-thumb-info">
                        <div className="pt-name">{poolDisplayName(item.collection)}</div>
                        <div className="pt-activity">
                          #{item.tokenId} · {item.priceEth > 0 ? `${item.priceEth.toFixed(2)} ETH` : "Floor listing"}
                        </div>
                        <div
                          className="pt-view"
                          onClick={() => router.push(`/pool/${routeId}`)}
                          role="link"
                          tabIndex={0}
                        >
                          View →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="pool-detail-deposit-bar">
          <button className="deposit-btn pool-detail-deposit-fixed" type="button" disabled>
            <span className="pd-deposit-label-desktop">{DEPOSIT_CTA_LABEL}</span>
            <span className="pd-deposit-label-mobile">Make a Deposit Now</span>
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default function PoolDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const parsed = parsePoolRouteId(id);
  const { data, isLoading, error } = useOpenSeaPoolNft(parsed.slug || null, parsed.tokenId);
  const { data: others = [] } = useOpenSeaOtherPoolListings(
    parsed.slug || undefined,
    data?.tokenId || parsed.tokenId || undefined,
  );

  if (isLoading) {
    return <PoolDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="feed pd-error" id="feed-pooldetail">
          <div className="pd-error-title">NFT not found</div>
          <div className="pd-error-sub">
            This pool id is not a live OpenSea token. Go back to Pools and pick a listing.
          </div>
        </div>
      </MainLayout>
    );
  }

  const pool = mapNftToPool(data);
  return (
    <PoolDetailView
      pool={pool}
      slug={data.slug}
      openseaUrl={data.openseaUrl}
      otherListings={others.map((listing) => ({
        tokenId: listing.tokenId,
        name: listing.name,
        imageUrl: listing.imageUrl,
        collection: listing.collection,
        priceEth: listing.priceEth,
      }))}
      key={pool.id}
    />
  );
}
