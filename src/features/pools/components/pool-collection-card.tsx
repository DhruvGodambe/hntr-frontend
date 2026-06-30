"use client";

import Link from "next/link";
import { PoolDepositButton } from "@/features/pools/components/deposit-modal";
import { getPoolDetail } from "@/features/pools/data/pool-detail-data";
import { nftPlaceholder } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

type PoolCollectionCardProps = {
  poolId: string;
  variant?: "default" | "carousel";
};

function ethAmount(value: string): string {
  return value.replace(/\s*ETH$/i, "").trim();
}

function EthStat({ value }: { value: string }) {
  return (
    <p className="flex items-baseline gap-1 font-mono text-[15px] font-bold leading-none text-t4 sm:text-[23px]">
      {ethAmount(value)}
      <small className="text-caption font-bold text-t2 sm:text-body-sm">Ξ</small>
    </p>
  );
}

export function PoolCollectionCard({
  poolId,
  variant = "default",
}: PoolCollectionCardProps) {
  const pool = getPoolDetail(poolId);
  const href = `/pools/${poolId}`;

  if (!pool) {
    return null;
  }

  const tokenId = pool.itemId.replace("#", "");
  const footerStats = pool.footerStats;

  return (
    <article
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[10px] bg-e2",
        variant === "default" && "border border-border",
        variant === "carousel" && "border-0",
      )}
    >
      <div className="flex flex-col sm:min-h-[200px] sm:flex-row">
        <Link
          href={href}
          className="relative block aspect-[5/3] max-h-[160px] w-full shrink-0 overflow-hidden sm:aspect-auto sm:max-h-none sm:min-h-[200px] sm:w-[188px] sm:self-stretch"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nftPlaceholder(pool.imageSeed)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute bottom-2 left-2 inline-flex h-[17px] items-center rounded-[3px] bg-[rgba(43,50,36,0.78)] px-[7px] font-mono text-micro tracking-[0.06em] text-[var(--cream)] backdrop-blur-[3px]">
            POOL #{tokenId}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-3.5 sm:pt-[15px]">
          <div className="mb-2.5 flex items-start justify-between gap-2 sm:mb-3 sm:gap-2.5">
            <div className="min-w-0">
              <Link href={href} className="block transition-opacity hover:opacity-90">
                <h3 className="font-display text-body-sm font-bold leading-tight text-t4 sm:text-[17px] sm:leading-[1.12]">
                  {pool.name}{" "}
                  <span className="text-t2">#{tokenId}</span>
                </h3>
              </Link>
              <div className="mt-1.5 flex flex-wrap gap-1 sm:gap-1.5">
                <span className="inline-flex h-3.5 items-center rounded-[3px] bg-e4 px-1.5 font-mono text-micro tracking-[0.05em] text-t2 sm:h-4 sm:px-[7px] sm:text-[7.5px]">
                  {pool.creator}
                </span>
                <span className="inline-flex h-3.5 items-center rounded-[3px] bg-e4 px-1.5 font-mono text-micro tracking-[0.05em] text-t2 sm:h-4 sm:px-[7px] sm:text-[7.5px]">
                  {pool.series}
                </span>
              </div>
            </div>
            <Link
              href={href}
              className="inline-flex h-6 shrink-0 items-center gap-1 rounded-[5px] border border-bd1 px-2 font-mono text-micro uppercase tracking-[0.07em] text-t2 transition-colors hover:border-[var(--sage)] hover:text-[var(--olive)] sm:px-2.5"
            >
              <span className="size-[5px] rounded-full bg-green shadow-[0_0_0_2px_rgba(61,122,90,0.18)]" />
              <span className="hidden min-[360px]:inline">View Insights</span>
              <span className="min-[360px]:hidden">Insights</span>
            </Link>
          </div>

          <div className="mb-2.5 grid grid-cols-2 gap-2 sm:mb-3 sm:gap-2.5">
            <div>
              <p className="mb-1 font-mono text-micro uppercase tracking-[0.09em] text-t1 sm:text-caption">
                Pool Target
              </p>
              <EthStat value={pool.targetPriceEth} />
              <p className="mt-0.5 font-mono text-micro text-t1 sm:mt-1 sm:text-caption">
                {pool.targetPriceUsd}
              </p>
            </div>
            <div>
              <p className="mb-1 font-mono text-micro uppercase tracking-[0.09em] text-t1 sm:text-caption">
                Community Raised
              </p>
              <EthStat value={pool.communityRaisedEth} />
              <p className="mt-0.5 font-mono text-micro text-t1 sm:mt-1 sm:text-caption">
                {pool.communityRaisedUsd}
              </p>
            </div>
          </div>

          <div className="mb-3 sm:mb-3.5">
            <div className="mb-1 flex justify-between font-mono text-micro text-t1 sm:text-caption">
              <span className="tracking-[0.06em]">POOL PROGRESS</span>
              <span className="font-bold text-t4">{pool.progress}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-[2px] bg-e4">
              <div
                className="h-full rounded-[2px] bg-t4"
                style={{ width: `${pool.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-auto">
            <PoolDepositButton pool={pool} className="pool-deposit-btn w-full text-micro" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 border-t border-bd0 bg-e3 px-2.5 py-2 sm:grid-cols-4">
        {footerStats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-h-[34px] flex-col justify-between rounded-[3px] border border-bd0 bg-e2 px-1.5 py-1"
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
    </article>
  );
}
