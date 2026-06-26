import { SectionHeader } from "@/features/dashboard/components/section-header";
import { runningPools } from "@/features/pools/data/pools-data";
import { PoolCollectionCard } from "./pool-collection-card";

export function RunningPoolsGrid() {
  return (
    <section className="mb-6">
      <SectionHeader
        title="Current Running Pools"
        actionLabel="Manage All"
        actionHref="/pools"
        className="mb-4"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {runningPools.map((pool) => (
          <PoolCollectionCard key={pool.id} pool={pool} />
        ))}
      </div>
    </section>
  );
}
