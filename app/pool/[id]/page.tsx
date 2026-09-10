"use client";

import MainLayout from "../../components/MainLayout";
import { DEPOSIT_CTA_LABEL } from "../../../lib/deposit-modal";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  parsePoolRouteId,
  poolDisplayName,
  toPoolRouteId,
  useOpenSeaOtherPoolListings,
  useOpenSeaPoolNft,
  type OpenSeaPoolNft,
} from "@/lib/opensea";
import { usePool, poolCollectionSlug, poolProgress, type PublicPool } from "@/lib/pools";
import { useEthUsdPrice } from "@/lib/coingecko";

/** Merged view model: admin-managed pool economics + live OpenSea art/floor. */
type PoolView = {
  routeId: string;
  metaId: string;
  name: string;
  shortName: string;
  target: string;
  raised: string;
  progress: number;
  gpProfit: string;
  ethProfit: string;
  usdtProfit: string;
  participants: number;
  floorEth: string;
  img: string;
  avatarImg: string;
  daysRemaining: number;
  tags: [string, string];
};

function tagsFor(pool: PublicPool | undefined, slug: string): [string, string] {
  const t = pool?.tags ?? [];
  if (t.length >= 2) return [t[0], t[1]];
  if (t.length === 1) return [t[0], "STRATEGY POOL"];
  return [poolDisplayName(slug).toUpperCase(), "STRATEGY POOL"];
}

function buildPoolView(
  slug: string,
  pool: PublicPool | undefined,
  nft: OpenSeaPoolNft | null | undefined,
): PoolView {
  const tokenId = nft?.tokenId || "";
  const collectionName = pool?.name || nft?.collectionName || poolDisplayName(slug);
  // Pool target is the live OpenSea floor price.
  const floorEth = nft?.floorPriceEth || nft?.listingPriceEth || 0;
  const raisedEthNum = pool?.raisedEth ?? 0;
  const img = nft?.imageUrl || pool?.imageUrl || "/assets/images/image-6.jpg";

  return {
    routeId: toPoolRouteId(slug, tokenId || "0"),
    metaId: tokenId ? `${slug}-${tokenId}` : slug,
    name: tokenId ? `${collectionName} #${tokenId}` : collectionName,
    shortName: nft?.name || collectionName,
    target: floorEth > 0 ? floorEth.toFixed(2) : "—",
    raised: raisedEthNum.toFixed(2),
    progress: poolProgress(raisedEthNum, floorEth),
    gpProfit: pool?.gpProfit ?? "0",
    ethProfit: pool?.ethProfit ?? "0",
    usdtProfit: pool?.usdtProfit ?? "0",
    participants: pool?.participants ?? 0,
    floorEth: floorEth > 0 ? floorEth.toFixed(2) : "—",
    img,
    avatarImg: img,
    daysRemaining: pool?.daysRemaining ?? 0,
    tags: tagsFor(pool, slug),
  };
}

function makeEthToUsd(rate: number | undefined) {
  return (eth: string): string => {
    const value = parseFloat(eth);
    if (Number.isNaN(value) || !rate) return "$—";
    return `$${(value * rate).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
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
  pool: PoolView;
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
  const { data: ethUsd } = useEthUsdPrice();
  const ethToUsd = useMemo(() => makeEthToUsd(ethUsd), [ethUsd]);

  const tokenId = pool.metaId.includes("-") ? `#${pool.metaId.split("-").pop()}` : "#—";
  const collectionName = pool.name.replace(/\s*#\d+\s*$/, "").trim();
  const [tagPrimary, tagSecondary] = pool.tags;
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
                      {pool.target} <span className="eth-ic" aria-hidden="true" />
                    </div>
                    <div className="pd-mobile-stat-sub">{targetUsd}</div>
                  </div>
                  <div className="pd-mobile-stat">
                    <div className="pd-mobile-stat-lbl">Community Raised</div>
                    <div className="pd-mobile-stat-val">
                      {pool.raised} <span className="eth-ic" aria-hidden="true" />
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
                  {remaining} <span className="eth-ic" aria-hidden="true" /> remaining to fill this pool ·{" "}
                  {pool.participants} contributors
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
                </div>
                <div className="pd-mobile-deposits-card">
                  <div className="pd-mobile-deposit-row is-last" style={{ justifyContent: "center", opacity: 0.6 }}>
                    Deposit activity will appear here once the pool goes live.
                  </div>
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
                <div className="metric-chg">Strategy P&amp;L</div>
              </div>
              <div className="metric">
                <div className="metric-lbl">ETH Profit</div>
                <div className="metric-val">{pool.ethProfit}</div>
                <div className="metric-chg pos">Since inception</div>
              </div>
              <div className="metric">
                <div className="metric-lbl">USDT Profit</div>
                <div className="metric-val">{pool.usdtProfit}</div>
                <div className="metric-chg" style={{ color: "var(--t0)" }}>
                  Unrealised P&amp;L
                </div>
              </div>
              <div className="metric">
                <div className="metric-lbl">Participants</div>
                <div className="metric-val">{pool.participants}</div>
                {pool.participants > 3 && (
                  <div className="participants-wrap">
                    {[0, 1, 2].map((i) => (
                      <div className="p-avatar" key={i}>
                        <img src={pool.avatarImg} alt="" />
                      </div>
                    ))}
                    <span className="p-more">+{pool.participants - 3}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="section-hdr">
              <div className="section-title">Transaction Activity</div>
            </div>
            <div className="tx-table-wrap table-scroll">
              <div className="pd-empty-state" style={{ padding: "40px 16px", textAlign: "center", color: "var(--t0)" }}>
                Transaction activity will appear here once the pool goes live.
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

  const { data: poolRecord, isLoading: poolLoading } = usePool(parsed.slug || null);
  const collectionSlug = poolRecord ? poolCollectionSlug(poolRecord) : parsed.slug;
  const { data: nft, isLoading: nftLoading, error } = useOpenSeaPoolNft(
    collectionSlug || null,
    parsed.tokenId,
  );
  const { data: others = [] } = useOpenSeaOtherPoolListings(
    collectionSlug || undefined,
    nft?.tokenId || parsed.tokenId || undefined,
  );

  if (poolLoading || nftLoading) {
    return <PoolDetailSkeleton />;
  }

  if (!poolRecord && (error || !nft)) {
    return (
      <MainLayout>
        <div className="feed pd-error" id="feed-pooldetail">
          <div className="pd-error-title">Pool not found</div>
          <div className="pd-error-sub">
            This strategy pool is not available. Go back to Pools and pick one.
          </div>
        </div>
      </MainLayout>
    );
  }

  const view = buildPoolView(parsed.slug, poolRecord, nft);
  return (
    <PoolDetailView
      pool={view}
      slug={parsed.slug}
      openseaUrl={nft?.openseaUrl}
      otherListings={others.map((listing) => ({
        tokenId: listing.tokenId,
        name: listing.name,
        imageUrl: listing.imageUrl,
        collection: listing.collection,
        priceEth: listing.priceEth,
      }))}
      key={view.routeId}
    />
  );
}
