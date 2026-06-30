import { PoolsSlider } from "@/components/ui/pools-slider";
import { runningPoolIds } from "@/features/pools/data/pools-data";
import { PoolCollectionCard } from "./pool-collection-card";

export function RunningPoolsGrid() {
  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-t4 sm:text-caption sm:font-normal sm:text-t1">
          Current Running Pools
        </h2>
      </div>

      <div className="flex flex-col gap-3.5 sm:hidden">
        {runningPoolIds.map((poolId) => (
          <PoolCollectionCard key={poolId} poolId={poolId} variant="default" />
        ))}
      </div>
      <div className="hidden sm:block">
        <PoolsSlider layout="pools" spaceBetween={12}>
          {runningPoolIds.map((poolId) => (
            <PoolCollectionCard key={poolId} poolId={poolId} variant="carousel" />
          ))}
        </PoolsSlider>
      </div>
    </section>
  );
}
