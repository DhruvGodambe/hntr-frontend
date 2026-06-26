import { Expand, Share2 } from "lucide-react";
import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { nftPlaceholder } from "@/lib/placeholders";
import { PoolDepositButton } from "./deposit-modal";

type PoolDetailHeroProps = {
  pool: PoolDetail;
};

function ethAmount(value: string): string {
  return value.replace(/\s*ETH$/i, "").trim();
}

export function PoolDetailHero({ pool }: PoolDetailHeroProps) {
  return (
    <section className="mb-4">
      <header className="mb-3">
        <h1 className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4">
          Pools Details
        </h1>
        <p className="mt-0.5 text-[9px] text-t1">
          Item: {pool.tokenName} Details
        </p>
      </header>

      <div className="overflow-hidden rounded-md border border-border bg-e2 shadow-sh1">
        <div className="flex flex-col lg:flex-row">
          <div className="relative aspect-square w-full shrink-0 bg-e3 lg:w-[42%] lg:max-w-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={nftPlaceholder(pool.imageSeed, 600)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4">
            <div className="relative mb-3">
              <div className="absolute right-0 top-0 flex gap-2">
                <button
                  type="button"
                  className="text-t2 transition-colors hover:text-t4"
                  aria-label="Share pool"
                >
                  <Share2 className="size-3.5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  className="text-t2 transition-colors hover:text-t4"
                  aria-label="Expand pool"
                >
                  <Expand className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>

              <p className="font-mono text-[8px] uppercase tracking-[0.06em] text-t0">
                ID: {pool.itemId}
              </p>
              <h2 className="mt-0.5 font-display text-[18px] font-bold leading-tight text-t4">
                {pool.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="inline-flex h-4 items-center rounded-[2px] bg-e4 px-1.5 font-mono text-[7px] tracking-[0.06em] text-t2">
                  {pool.creator}
                </span>
                <span className="inline-flex h-4 items-center rounded-[2px] bg-e4 px-1.5 font-mono text-[7px] tracking-[0.06em] text-t2">
                  {pool.series}
                </span>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="rounded-[3px] border border-border bg-e3 px-2.5 py-2">
                <p className="mb-1 text-[8px] uppercase tracking-[0.05em] text-t1">
                  Target Price
                </p>
                <p className="font-mono text-[13px] font-bold text-t4">
                  {ethAmount(pool.targetPriceEth)}{" "}
                  <span className="text-[11px]" aria-hidden>
                    Ξ
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-[8px] text-t0">
                  {pool.targetPriceUsd}
                </p>
              </div>
              <div className="rounded-[3px] border border-border bg-e3 px-2.5 py-2">
                <p className="mb-1 text-[8px] uppercase tracking-[0.05em] text-t1">
                  Community Raised
                </p>
                <p className="font-mono text-[13px] font-bold text-t4">
                  {ethAmount(pool.communityRaisedEth)}{" "}
                  <span className="text-[11px]" aria-hidden>
                    Ξ
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-[8px] text-t0">
                  {pool.communityRaisedUsd}
                </p>
              </div>
            </div>

            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[8px] uppercase tracking-[0.05em] text-t1">
                  Community Raised
                </span>
                <span className="font-mono text-[8px] text-t2">
                  {pool.progressSummary}
                </span>
              </div>
              <div
                className="h-1 overflow-hidden rounded-[2px] bg-e4"
                role="progressbar"
                aria-valuenow={pool.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-[2px] bg-t4"
                  style={{ width: `${pool.progress}%` }}
                />
              </div>
            </div>

            <PoolDepositButton pool={pool} />
            <p className="mt-2 text-center text-[8px] text-t0">
              {pool.lockMessage}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
