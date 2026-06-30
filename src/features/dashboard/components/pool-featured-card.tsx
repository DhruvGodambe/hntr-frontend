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
  variant?: "default" | "carousel";
};

function ethAmount(value: string): string {
  return value.replace(/\s*ETH$/i, "").trim();
}

function EthValue({ value }: { value: string }) {
  return (
    <p className="font-mono text-[15px] font-bold leading-tight text-t4 sm:text-stat">
      {ethAmount(value)}{" "}
      <span className="text-caption font-bold sm:text-body-sm" aria-hidden>
        Ξ
      </span>
    </p>
  );
}

export function PoolFeaturedCard({
  pool,
  variant = "default",
}: PoolFeaturedCardProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const poolDetail = getPoolDetail(pool.id);
  const href = `/pools/${pool.id}`;

  return (
    <article
      data-pool-slide
      className={cn(
        "@container overflow-hidden rounded-xl border border-bd0 bg-e2 sm:rounded-md",
        variant === "default" && "border sm:border-border",
        variant === "carousel" && "border-0",
        detailsOpen && "open",
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <Link
          href={href}
          className={cn(
            "relative block w-full shrink-0 overflow-hidden sm:w-[40%] sm:self-stretch",
            "h-[172px] sm:aspect-auto sm:h-auto sm:min-h-[210px]",
            pool.imageBgClass,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nftPlaceholder(pool.imageSeed)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute bottom-2.5 left-2.5 rounded-[4px] bg-e0/80 px-2 py-0.75 font-mono text-[8px] tracking-[0.06em] text-t4 sm:hidden">
            POOL {pool.tokenId}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-3">
          <div className="mb-2 sm:mb-2.5">
            <div className="mb-2 flex items-start justify-between gap-2 sm:mb-1.5">
              <Link
                href={href}
                className="min-w-0 flex-1 transition-opacity hover:opacity-90"
              >
                <h3 className="font-display text-[17px] font-bold leading-[1.1] text-t4 sm:text-body-sm">
                  {pool.name}{" "}
                  <span className="text-t2 sm:hidden">
                    {pool.tokenId}
                  </span>
                </h3>
                <p className="hidden font-display text-body-sm font-bold leading-tight text-t4 sm:block">
                  {pool.tokenId}
                </p>
              </Link>
              <Link
                href={href}
                className="inline-flex shrink-0 items-center gap-1 font-mono text-micro tracking-[0.06em] text-t2 transition-colors hover:text-t4 sm:flex"
              >
                <BarChart3 className="size-2.5" strokeWidth={1.75} />
                <span className="hidden min-[360px]:inline">View Insights</span>
                <span className="min-[360px]:hidden">Insights</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-1">
              <span className="inline-flex h-[18px] items-center rounded-[4px] bg-e4 px-1.75 font-mono text-[8px] tracking-[0.05em] text-t2 sm:h-3.5 sm:rounded-[2px] sm:px-1.5 sm:text-micro sm:tracking-[0.06em]">
                {pool.creator}
              </span>
              <span className="inline-flex h-[18px] items-center rounded-[4px] bg-e4 px-1.75 font-mono text-[8px] tracking-[0.05em] text-t2 sm:h-3.5 sm:rounded-[2px] sm:px-1.5 sm:text-micro sm:tracking-[0.06em]">
                {pool.series}
              </span>
            </div>
          </div>

          <div className="mb-3.5 grid grid-cols-2 gap-3 sm:mb-2.5 sm:gap-3">
            <div>
              <p className="mb-1.25 font-mono text-[8px] uppercase tracking-[0.08em] text-t1 sm:mb-1 sm:text-caption sm:tracking-[0.05em]">
                Pool Target
              </p>
              <div className="flex items-baseline gap-1 sm:block">
                <p className="font-mono text-[21px] font-bold leading-tight text-t4 sm:text-stat">
                  {ethAmount(pool.poolTargetEth)}
                  <span className="text-[12px] font-normal text-t2 sm:hidden">
                    {" "}
                    Ξ
                  </span>
                </p>
                <span
                  className="hidden text-caption font-bold sm:inline sm:text-body-sm"
                  aria-hidden
                >
                  Ξ
                </span>
              </div>
              <p className="mt-0.75 font-mono text-[9px] text-t1 sm:mt-0.5 sm:text-caption sm:text-t0">
                {pool.poolTargetUsd}
              </p>
            </div>
            <div>
              <p className="mb-1.25 font-mono text-[8px] uppercase tracking-[0.08em] text-t1 sm:mb-1 sm:text-caption sm:tracking-[0.05em]">
                Community Raised
              </p>
              <div className="flex items-baseline gap-1 sm:block">
                <p className="font-mono text-[21px] font-bold leading-tight text-t4 sm:text-stat">
                  {ethAmount(pool.communityRaisedEth)}
                  <span className="text-[12px] font-normal text-t2 sm:hidden">
                    {" "}
                    Ξ
                  </span>
                </p>
                <span
                  className="hidden text-caption font-bold sm:inline sm:text-body-sm"
                  aria-hidden
                >
                  Ξ
                </span>
              </div>
              <p className="mt-0.75 font-mono text-[9px] text-t1 sm:mt-0.5 sm:text-caption sm:text-t0">
                {pool.communityRaisedUsd}
              </p>
            </div>
          </div>

          <div className="mb-1.25 flex justify-between font-mono text-[8px] tracking-[0.06em] text-t1 sm:hidden">
            <span className="uppercase">Pool Progress</span>
            <span className="font-bold text-t4">{pool.progress}%</span>
          </div>
          <div className="mb-3.5 h-[5px] overflow-hidden rounded-[3px] bg-e4 sm:mb-2.5 sm:h-1 sm:rounded-[2px]">
            <div
              className="h-full rounded-[3px] bg-t4 sm:rounded-[2px]"
              style={{ width: `${pool.progress}%` }}
            />
          </div>

          <div className="pool-card-actions mt-auto flex flex-col gap-3.5 sm:block">
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
              className="pool-details-btn h-8 w-full rounded-lg border border-bd0 bg-e3 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-t2 sm:h-auto sm:w-auto sm:border-0 sm:bg-transparent sm:text-micro"
            >
              <span className="truncate">
                {detailsOpen ? "Hide Pool Details" : "Pool Details"}
              </span>
              <ChevronDown
                className="pool-details-chevron size-3 shrink-0"
                strokeWidth={1.75}
              />
            </button>
            {poolDetail ? (
              <PoolDepositButton
                pool={poolDetail}
                className="pool-deposit-btn h-10 w-full rounded-lg bg-primary font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-primary-foreground sm:h-auto sm:w-auto sm:rounded-md sm:text-micro"
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          detailsOpen ? "max-h-48" : "max-h-0",
        )}
      >
        <div className="grid grid-cols-2 gap-2 border-t border-bd0 bg-e2 px-3.5 py-3.5 sm:grid-cols-4 sm:gap-1 sm:border-border sm:px-2.5 sm:py-2">
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
              className="flex min-h-[40px] flex-col justify-between rounded-lg bg-e1 px-2.5 py-2.25 sm:min-h-[34px] sm:rounded-[3px] sm:border sm:border-border sm:px-1.5 sm:py-1"
            >
              <p className="font-mono text-[7px] uppercase leading-tight tracking-[0.06em] text-t1 sm:text-micro sm:text-t0">
                {stat.label}
              </p>
              <p className="font-display text-[14px] font-bold leading-tight text-t4 sm:font-mono sm:text-caption">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
