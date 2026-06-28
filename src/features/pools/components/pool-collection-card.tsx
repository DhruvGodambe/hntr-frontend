import Link from "next/link";
import type { RunningPool } from "@/features/pools/data/pools-data";
import { PoolStakeRing } from "./pool-stake-ring";

type PoolCollectionCardProps = {
  pool: RunningPool;
};

const stats = (pool: RunningPool) =>
  [
    { label: "Target", value: pool.target, accent: false },
    { label: "Raised", value: pool.raised, accent: false },
    { label: "Premium", value: pool.premium, accent: true },
    { label: "User", value: pool.userStake, accent: false },
  ] as const;

export function PoolCollectionCard({ pool }: PoolCollectionCardProps) {
  return (
    <article className="overflow-hidden rounded-[var(--r)] bg-e2 shadow-[var(--sh2),var(--glow)] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-[3px] hover:scale-[1.01] hover:shadow-sh3">
      <div
        className="relative h-[180px] overflow-hidden"
        style={{ background: "var(--olive)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pool.imageSrc}
          alt={pool.name}
          className="block h-full w-full object-cover transition-transform duration-300"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-b from-black/15 to-[rgba(15,20,12,0.72)] p-3.5">
          <h3 className="font-display text-sm font-bold tracking-[0.02em] text-white">
            {pool.name}
          </h3>
          <p className="mb-2.5 font-mono text-[9px] text-white/55">
            {pool.poolId}
          </p>
          <button
            type="button"
            className="inline-flex h-6 w-fit items-center rounded border border-white/30 bg-white/15 px-2.5 font-mono text-[8px] tracking-[0.06em] text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            VIEW LISTED TARGET
          </button>
        </div>
        <div className="absolute right-3 top-3">
          <PoolStakeRing value={pool.stakePercent} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 border-b border-bd0 px-3 py-2">
        {stats(pool).map((stat) => (
          <div key={stat.label}>
            <p className="mb-px font-mono text-[7px] uppercase tracking-[0.05em] text-t0">
              {stat.label}
            </p>
            <p
              className={`font-mono text-[10px] font-semibold ${stat.accent ? "text-green" : "text-t3"}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="p-2 px-3">
        <Link
          href={`/pools/${pool.id}`}
          className="flex h-[26px] w-full items-center justify-center rounded border border-[var(--cream-dark)] bg-transparent font-mono text-[8px] uppercase tracking-[0.08em] text-t2 transition-colors hover:border-[var(--sage-faint)] hover:bg-[var(--sage-faint)] hover:text-t4"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
