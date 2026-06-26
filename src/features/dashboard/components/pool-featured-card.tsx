import Link from "next/link";
import { BarChart3, ChevronDown } from "lucide-react";
import type { PoolItem } from "@/features/dashboard/data/home-data";
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
    <p className="font-mono text-[13px] font-bold leading-tight text-t4">
      {ethAmount(value)}{" "}
      <span className="text-[11px] font-bold" aria-hidden>
        Ξ
      </span>
    </p>
  );
}

export function PoolFeaturedCard({ pool }: PoolFeaturedCardProps) {
  return (
    <Link
      href={`/pools/${pool.id}`}
      className="group block w-full"
    >
    <article
      data-pool-slide
      className="overflow-hidden rounded-md border border-border bg-e2 transition-opacity group-hover:opacity-95"
    >
      <div className="flex">
        <div
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
        </div>

        <div className="flex min-h-[210px] min-w-0 flex-1 flex-col p-2.5 sm:p-3">
          <div className="relative mb-2.5">
            <span className="absolute right-0 top-0 inline-flex items-center gap-1 font-mono text-[7px] tracking-[0.06em] text-t2">
              <BarChart3 className="size-2.5" strokeWidth={1.75} />
              View Insights
            </span>

            <h3 className="pr-20 font-display text-[11px] font-bold leading-tight text-t4">
              {pool.name}
            </h3>
            <p className="font-display text-[11px] font-bold leading-tight text-t4">
              {pool.tokenId}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="inline-flex h-3.5 items-center rounded-[2px] bg-e4 px-1.5 font-mono text-[7px] tracking-[0.06em] text-t2">
                {pool.creator}
              </span>
              <span className="inline-flex h-3.5 items-center rounded-[2px] bg-e4 px-1.5 font-mono text-[7px] tracking-[0.06em] text-t2">
                {pool.series}
              </span>
            </div>
          </div>

          <div className="mb-2.5 grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-[8px] uppercase tracking-[0.05em] text-t1">
                Pool Target
              </p>
              <EthValue value={pool.poolTargetEth} />
              <p className="mt-0.5 font-mono text-[8px] text-t0">
                {pool.poolTargetUsd}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[8px] uppercase tracking-[0.05em] text-t1">
                Community Raised
              </p>
              <EthValue value={pool.communityRaisedEth} />
              <p className="mt-0.5 font-mono text-[8px] text-t0">
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

          <div className="mt-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.04em] text-t2"
            >
              Pool Details
              <ChevronDown className="size-3" strokeWidth={1.75} />
            </button>
            <span className="ml-auto inline-flex h-[27px] min-w-0 flex-[1.4] items-center justify-center rounded-[5px] bg-primary px-2 font-mono text-[8px] font-bold uppercase tracking-[0.04em] text-primary-foreground">
              Make a Deposit Now
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 border-t border-border px-2.5 py-2">
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
            <p className="text-[7px] uppercase leading-tight tracking-[0.04em] text-t0">
              {stat.label}
            </p>
            <p className="font-mono text-[8px] font-bold leading-tight text-t4">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </article>
    </Link>
  );
}
