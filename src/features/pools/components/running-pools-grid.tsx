import Link from "next/link";
import { runningPools } from "@/features/pools/data/pools-data";
import { PoolCollectionCard } from "./pool-collection-card";

export function RunningPoolsGrid() {
  return (
    <section className="mb-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.14em] text-t1">
          Current Running Pools
        </h2>
        <Link
          href="/pools"
          className="cursor-pointer border-b border-[var(--sage-faint)] font-mono text-[9px] text-[var(--olive)]"
        >
          Manage All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {runningPools.map((pool) => (
          <PoolCollectionCard key={pool.id} pool={pool} />
        ))}
      </div>
    </section>
  );
}
