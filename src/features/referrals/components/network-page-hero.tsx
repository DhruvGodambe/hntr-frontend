import { PageHero } from "@/components/layout/page-hero";
import { networkHero } from "@/features/referrals/data/referrals-data";

export function NetworkPageHero() {
  return (
    <PageHero
      variant="mosaic"
      title={networkHero.title}
      subtitle={networkHero.subtitle}
    />
  );
}
