"use client";

import { Expand, Share2 } from "lucide-react";
import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { useToast } from "@/components/toast/toast-provider";
import { nftPlaceholder } from "@/lib/placeholders";
import { PoolDepositButton } from "./deposit-modal";

type PoolDetailHeroProps = {
  pool: PoolDetail;
};

function ethAmount(value: string): string {
  return value.replace(/\s*ETH$/i, "").trim();
}

export function PoolDetailHero({ pool }: PoolDetailHeroProps) {
  const { showToast } = useToast();

  const handleShare = async () => {
    const poolUrl = `${window.location.origin}/pools/${pool.id}`;

    try {
      await navigator.clipboard.writeText(poolUrl);
      showToast({
        title: "Link copied",
        sub: "Pool link copied to clipboard",
      });
    } catch {
      showToast({
        title: "Copy failed",
        sub: "Could not copy link to clipboard",
      });
    }
  };

  return (
    <section className="mb-3.5">
      <header className="breadcrumb mb-3.5">
        <h1 className="font-display text-body-sm font-bold uppercase tracking-[0.1em] text-t4">
          Pools Details
        </h1>
        <p className="mt-0.5 text-label text-t1">
          Item: <span className="text-t2">{pool.tokenName} Details</span>
        </p>
      </header>

      <div className="pool-detail-card">
        <div className="flex flex-col sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nftPlaceholder(pool.imageSeed, 600)}
            alt=""
            className="pool-detail-img"
          />

          <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5 sm:py-[18px]">
            <div className="mb-1.5 flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="font-mono text-caption tracking-[0.06em] text-t0">
                ID: {pool.itemId}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="pool-detail-meta-link">{pool.creator}</span>
                <span className="text-t0">|</span>
                <span className="pool-detail-meta-link">{pool.series}</span>
              </div>
              <div className="ml-auto flex gap-1.5">
                <button
                  type="button"
                  className="pool-detail-share-btn"
                  aria-label="Share pool"
                  onClick={handleShare}
                >
                  <Share2 className="size-3" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  className="pool-detail-share-btn"
                  aria-label="Expand pool"
                >
                  <Expand className="size-3" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <h2 className="mb-3.5 font-display text-heading-sm font-bold leading-tight text-t4 sm:text-heading">
              {pool.name}
            </h2>

            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-md border border-bd0">
              <div className="border-r border-bd0 bg-e3 px-3.5 py-3 sm:px-3.5">
                <p className="mb-1 font-mono text-caption uppercase tracking-[0.08em] text-t0">
                  Target Price
                </p>
                <p className="font-mono text-stat font-bold text-t4">
                  {ethAmount(pool.targetPriceEth)}{" "}
                  <span className="text-body-sm" aria-hidden>
                    Ξ
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-caption text-t0">
                  {pool.targetPriceUsd}
                </p>
              </div>
              <div className="bg-e3 px-3.5 py-3">
                <p className="mb-1 font-mono text-caption uppercase tracking-[0.08em] text-t0">
                  Community Raised
                </p>
                <p className="font-mono text-stat font-bold text-t4">
                  {ethAmount(pool.communityRaisedEth)}{" "}
                  <span className="text-body-sm" aria-hidden>
                    Ξ
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-caption text-t0">
                  {pool.communityRaisedUsd}
                </p>
              </div>
            </div>

            <div className="mb-3.5">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="font-mono text-caption uppercase tracking-[0.08em] text-t0">
                  Community Raised
                </span>
                <span className="font-mono text-label text-t2">
                  {pool.progressSummary}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-[3px] bg-[var(--cream-dark)]"
                role="progressbar"
                aria-valuenow={pool.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="pool-detail-progress-fill"
                  style={{ width: `${pool.progress}%` }}
                />
              </div>
            </div>

            <PoolDepositButton
              pool={pool}
              className="pool-deposit-btn pool-detail-deposit"
            />
            <p className="text-center font-mono text-caption text-t0">
              {pool.lockMessage}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
