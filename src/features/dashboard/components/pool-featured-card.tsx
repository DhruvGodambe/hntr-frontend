"use client";

import Link from "next/link";
import * as React from "react";
import { BarChart3, ChevronDown } from "lucide-react";
import type { PoolItem } from "@/features/dashboard/data/home-data";
import { PoolDepositButton } from "@/features/pools/components/deposit-modal";
import { getPoolDetail } from "@/features/pools/data/pool-detail-data";
import { nftPlaceholder } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

type PoolFeaturedCardProps = {
  pool: PoolItem;
};

function ethAmount(value: string): string {
  return value.replace(/\s*ETH$/i, "").trim();
}

function EthValue({ value }: { value: string }) {
  return (
    <p className="font-mono text-stat font-bold leading-tight text-t4">
      {ethAmount(value)}{" "}
      <span className="text-body-sm font-bold" aria-hidden>
        Ξ
      </span>
    </p>
  );
}

export function PoolFeaturedCard({ pool }: PoolFeaturedCardProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const poolDetail = getPoolDetail(pool.id);
  const href = `/pools/${pool.id}`;

  return (
    <article
      data-pool-slide
      className={cn(
        "@container overflow-hidden rounded-md border border-border bg-e2 transition-opacity hover:opacity-95",
        detailsOpen && "open",
      )}
    >
      <div className="flex">
        <Link
          href={href}
          className={cn(
            "relative w-[42%] shrink-0 self-stretch sm:w-[40%]",
            pool.imageBgClass,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nftPlaceholder(pool.imageSeed)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </Link>

        <div className="flex min-h-[210px] min-w-0 flex-1 flex-col p-2.5 sm:p-3">
          <div className="relative mb-2.5">
            <Link
              href={href}
              className="absolute right-0 top-0 inline-flex items-center gap-1 font-mono text-micro tracking-[0.06em] text-t2 transition-colors hover:text-t4"
            >
              <BarChart3 className="size-2.5" strokeWidth={1.75} />
              View Insights
            </Link>

            <Link href={href} className="block pr-20 transition-opacity hover:opacity-90">
              <h3 className="font-display text-body-sm font-bold leading-tight text-t4">
                {pool.name}
              </h3>
              <p className="font-display text-body-sm font-bold leading-tight text-t4">
                {pool.tokenId}
              </p>
            </Link>

            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="inline-flex h-3.5 items-center rounded-[2px] bg-e4 px-1.5 font-mono text-micro tracking-[0.06em] text-t2">
                {pool.creator}
              </span>
              <span className="inline-flex h-3.5 items-center rounded-[2px] bg-e4 px-1.5 font-mono text-micro tracking-[0.06em] text-t2">
                {pool.series}
              </span>
            </div>
          </div>

          <div className="mb-2.5 grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-caption uppercase tracking-[0.05em] text-t1">
                Pool Target
              </p>
              <EthValue value={pool.poolTargetEth} />
              <p className="mt-0.5 font-mono text-caption text-t0">
                {pool.poolTargetUsd}
              </p>
            </div>
            <div>
              <p className="mb-1 text-caption uppercase tracking-[0.05em] text-t1">
                Community Raised
              </p>
              <EthValue value={pool.communityRaisedEth} />
              <p className="mt-0.5 font-mono text-caption text-t0">
                {pool.communityRaisedUsd}
              </p>
            </div>
          </div>

          <div className="mb-2.5 h-1 overflow-hidden rounded-[2px] bg-e4">
            <div
              className="h-full rounded-[2px] bg-t4"
              style={{ width: `${pool.progress}%` }}
            />
          </div>

          <div className="pool-card-actions mt-auto">
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
              className="pool-details-btn"
            >
              <span className="truncate">Pool Details</span>
              <ChevronDown
                className="pool-details-chevron size-3 shrink-0"
                strokeWidth={1.75}
              />
            </button>
            {poolDetail ? (
              <PoolDepositButton
                pool={poolDetail}
                className="pool-deposit-btn font-mono text-micro font-bold uppercase tracking-[0.04em]"
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          detailsOpen ? "max-h-32" : "max-h-0",
        )}
      >
        <div className="grid grid-cols-4 gap-1 border-t border-border bg-e3 px-2.5 py-2">
          {[
            { label: "GP Profit", value: pool.gpProfit },
            {
              label: "ETH Profit",
              value: `${ethAmount(pool.ethProfit)} Ξ`,
            },
            { label: "USDT Profit", value: pool.usdtProfit },
            { label: "Users", value: pool.users },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex min-h-[34px] flex-col justify-between rounded-[3px] border border-border bg-e2 px-1.5 py-1"
            >
              <p className="text-micro uppercase leading-tight tracking-[0.04em] text-t0">
                {stat.label}
              </p>
              <p className="font-mono text-caption font-bold leading-tight text-t4">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
