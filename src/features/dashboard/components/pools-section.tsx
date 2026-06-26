import { pools } from "@/features/dashboard/data/home-data";
import { PoolsSlider } from "@/components/ui/pools-slider";
import { PoolFeaturedCard } from "./pool-featured-card";
import { SectionHeader } from "./section-header";

export function PoolsSection() {
  return (
    <section className="mb-[22px]" aria-labelledby="pools-heading">
      <SectionHeader
        title="HNTR's Pools"
        subtitle="04 active pools available for deposit"
        actionLabel="View All Pools"
        actionHref="/pools"
      />
      <PoolsSlider layout="pools" spaceBetween={12}>
        {pools.map((pool) => (
          <PoolFeaturedCard key={pool.id} pool={pool} />
        ))}
      </PoolsSlider>
    </section>
  );
}
