import { PageHero } from "@/components/layout/page-hero";
import { poolsHero } from "@/features/pools/data/pools-data";

export function PoolsPageHero() {
  return (
    <PageHero
      variant="mosaic"
      title={poolsHero.title}
      subtitle={poolsHero.subtitle}
    />
  );
}
