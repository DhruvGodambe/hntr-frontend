import Link from "next/link";
import type { RunningPool } from "@/features/pools/data/pools-data";
import { resolvePoolCardImage } from "@/lib/images";
import { CircularGauge } from "./circular-gauge";

type PoolCollectionCardProps = {
  pool: RunningPool;
};

const stats = (pool: RunningPool) =>
  [
    { label: "Target:", value: pool.target },
    { label: "Raised:", value: pool.raised },
    { label: "Premium:", value: pool.premium },
    { label: "User:", value: pool.userStake },
  ] as const;

export function PoolCollectionCard({ pool }: PoolCollectionCardProps) {
  return (
    <Link
      href={`/pools/${pool.id}`}
      className="group block transition-opacity hover:opacity-95"
    >
      <article className="flex flex-col overflow-hidden rounded-md border border-border bg-e2">
        <div className="relative aspect-square w-full overflow-hidden bg-e3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvePoolCardImage(pool.id, pool.imageSeed)}
            alt=""
            className="block h-full w-full object-contain object-center"
          />
        </div>

        <div className="flex items-start gap-3 border-b border-border px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[14px] font-bold leading-tight text-t4">
              {pool.name}
            </h3>
            <p className="mt-0.5 text-[10px] text-t2">{pool.poolId}</p>
            <span className="mt-3 inline-flex h-7 items-center rounded-[3px] border border-t4 bg-transparent px-3 font-mono text-[7px] font-medium uppercase tracking-[0.06em] text-t4 group-hover:bg-e3">
              View Listed Target
            </span>
          </div>
          <CircularGauge
            value={pool.stakePercent}
            label="Stake"
            size={64}
            strokeWidth={5}
            className="shrink-0"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-b border-border bg-e3 px-4 py-3">
          {stats(pool).map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline justify-between gap-2"
            >
              <span className="text-[9px] text-t2">{stat.label}</span>
              <span className="font-mono text-[9px] font-bold text-t4">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 text-center">
          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-t3 group-hover:text-t4">
            View Details
          </span>
        </div>
      </article>
    </Link>
  );
}
