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

function ethAmount(value: string): number | string {
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
        "flex w-full flex-col overflow-hidden rounded-xl border border-bd0 bg-e2 sm:rounded-[10px]",
        variant === "default" && "border sm:border-border",
        variant === "carousel" && "border-0",
      )}
    >
      <div className="flex flex-col sm:min-h-[200px] sm:flex-row">
        <Link
          href={href}
          className="relative block h-[172px] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-auto sm:min-h-[200px] sm:w-[188px] sm:self-stretch"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nftPlaceholder(pool.imageSeed)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute bottom-2.5 left-2.5 rounded-[4px] bg-e0/80 px-2 py-0.75 font-mono text-[8px] tracking-[0.06em] text-t4 sm:bottom-2 sm:left-2 sm:h-[17px] sm:rounded-[3px] sm:bg-[rgba(43,50,36,0.78)] sm:px-[7px] sm:text-micro sm:backdrop-blur-[3px]">
            POOL #{tokenId}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:px-4 sm:pb-3.5 sm:pt-[15px]">
          <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3 sm:gap-2.5">
            <div className="min-w-0">
              <Link
                href={href}
                className="block transition-opacity hover:opacity-90"
              >
                <h3 className="font-display text-[17px] font-bold leading-[1.1] text-t4 sm:text-[17px] sm:leading-[1.12]">
                  {pool.name} <span className="text-t2">#{tokenId}</span>
                </h3>
              </Link>
              <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-1.5 sm:gap-1.5">
                <span className="inline-flex h-[18px] items-center rounded-[4px] bg-e4 px-1.75 font-mono text-[8px] tracking-[0.05em] text-t2 sm:h-4 sm:rounded-[3px] sm:px-[7px] sm:text-[7.5px]">
                  {pool.creator}
                </span>
                <span className="inline-flex h-[18px] items-center rounded-[4px] bg-e4 px-1.75 font-mono text-[8px] tracking-[0.05em] text-t2 sm:h-4 sm:rounded-[3px] sm:px-[7px] sm:text-[7.5px]">
                  {pool.series}
                </span>
              </div>
            </div>
            <Link
              href={href}
              className="hidden h-6 shrink-0 items-center gap-1 rounded-[5px] border border-bd1 px-2 font-mono text-micro uppercase tracking-[0.07em] text-t2 transition-colors hover:border-[var(--sage)] hover:text-[var(--olive)] sm:inline-flex sm:px-2.5"
            >
              <span className="size-[5px] rounded-full bg-green shadow-[0_0_0_2px_rgba(61,122,90,0.18)]" />
              <span className="hidden min-[360px]:inline">View Insights</span>
              <span className="min-[360px]:hidden">Insights</span>
            </Link>
          </div>

          <div className="mb-3.5 grid grid-cols-2 gap-3 sm:mb-3 sm:gap-2.5">
            <div>
              <p className="mb-1.25 font-mono text-[8px] uppercase tracking-[0.08em] text-t1 sm:mb-1 sm:text-caption">
                Pool Target
              </p>
              <div className="flex items-baseline gap-1 sm:block">
                <p className="font-mono text-[21px] font-bold leading-tight text-t4 sm:text-[23px]">
                  {ethAmount(pool.targetPriceEth)}
                  <span className="text-[12px] font-normal text-t2 sm:hidden">
                    {" "}
                    Ξ
                  </span>
                </p>
                <small
                  className="hidden text-caption font-bold text-t2 sm:inline sm:text-body-sm"
                  aria-hidden
                >
                  Ξ
                </small>
              </div>
              <p className="mt-0.75 font-mono text-[9px] text-t1 sm:mt-1 sm:text-caption">
                {pool.targetPriceUsd}
              </p>
            </div>
            <div>
              <p className="mb-1.25 font-mono text-[8px] uppercase tracking-[0.08em] text-t1 sm:mb-1 sm:text-caption">
                Community Raised
              </p>
              <div className="flex items-baseline gap-1 sm:block">
                <p className="font-mono text-[21px] font-bold leading-tight text-t4 sm:text-[23px]">
                  {ethAmount(pool.communityRaisedEth)}
                  <span className="text-[12px] font-normal text-t2 sm:hidden">
                    {" "}
                    Ξ
                  </span>
                </p>
                <small
                  className="hidden text-caption font-bold text-t2 sm:inline sm:text-body-sm"
                  aria-hidden
                >
                  Ξ
                </small>
              </div>
              <p className="mt-0.75 font-mono text-[9px] text-t1 sm:mt-1 sm:text-caption">
                {pool.communityRaisedUsd}
              </p>
            </div>
          </div>

          <div className="mb-3.5 sm:mb-3.5">
            <div className="mb-1.25 flex justify-between font-mono text-[8px] tracking-[0.06em] text-t1 sm:mb-1 sm:text-caption">
              <span className="uppercase">Pool Progress</span>
              <span className="font-bold text-t4">
                {pool.progress}%
              </span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-[3px] bg-e4 sm:h-1 sm:rounded-[2px]">
              <div
                className="h-full rounded-[3px] bg-t4 sm:rounded-[2px]"
                style={{ width: `${pool.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-auto">
            <PoolDepositButton
              pool={pool}
              className="pool-deposit-btn h-10 w-full rounded-lg bg-primary font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-primary-foreground sm:h-auto sm:w-auto sm:rounded-md sm:text-micro"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-bd0 bg-e2 px-3.5 py-3.5 sm:grid-cols-4 sm:gap-1 sm:border-bd0 sm:px-2.5 sm:py-2">
        {footerStats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-h-[40px] flex-col justify-between rounded-lg bg-e1 px-2.5 py-2.25 sm:min-h-[34px] sm:rounded-[3px] sm:border sm:border-bd0 sm:bg-e2 sm:px-1.5 sm:py-1"
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
    </article>
  );
}
