import Link from "next/link";
import { PoolsSlider } from "@/components/ui/pools-slider";
import { runningPoolIds } from "@/features/pools/data/pools-data";
import { PoolCollectionCard } from "./pool-collection-card";

export function RunningPoolsGrid() {
  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="font-mono text-caption uppercase tracking-[0.1em] text-t1">
          Current Running Pools
        </h2>
        <Link
          href="/pools"
          className="border-b border-[var(--sage-faint)] font-mono text-caption text-[var(--olive)] transition-colors hover:text-[var(--olive-dark)]"
        >
          Manage All
        </Link>
      </div>

      <PoolsSlider layout="pools" spaceBetween={12}>
        {runningPoolIds.map((poolId) => (
          <PoolCollectionCard key={poolId} poolId={poolId} variant="carousel" />
        ))}
      </PoolsSlider>
    </section>
  );
}
