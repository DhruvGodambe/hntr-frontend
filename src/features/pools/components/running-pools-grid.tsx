import { PoolsSlider } from "@/components/ui/pools-slider";
import { PoolFeaturedCard } from "@/features/dashboard/components/pool-featured-card";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import { getRunningPoolItems } from "@/features/pools/data/pool-detail-data";

export function RunningPoolsGrid() {
  const pools = getRunningPoolItems();

  return (
    <section className="mb-6 sm:mb-[22px]" aria-labelledby="running-pools-heading">
      <SectionHeader title="Current Running Pools" />
      <div className="flex flex-col gap-3.5 sm:hidden">
        {pools.map((pool) => (
          <PoolFeaturedCard key={pool.id} pool={pool} variant="default" />
        ))}
      </div>
      <div className="hidden sm:block">
        <PoolsSlider layout="pools" spaceBetween={12}>
          {pools.map((pool) => (
            <PoolFeaturedCard key={pool.id} pool={pool} variant="carousel" />
          ))}
        </PoolsSlider>
      </div>
    </section>
  );
}
