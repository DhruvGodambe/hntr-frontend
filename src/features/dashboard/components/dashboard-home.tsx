import { listings, sales } from "@/features/dashboard/data/home-data";
import { DashboardHero } from "./dashboard-hero";
import { ListingsSection } from "./listings-section";
import { MarketOverviewSection } from "./market-overview-section";
import { PartnersSection } from "./partners-section";
import { PoolsSection } from "./pools-section";
import { SalesSection } from "./sales-section";

export function DashboardHome() {
  return (
    <>
      <DashboardHero />
      <PartnersSection />
      <PoolsSection />
      <ListingsSection
        headingId="listings-heading"
        title="HNTR's Listings"
        actionLabel="View All Listings"
        actionHref="/marketplace"
        items={listings}
      />
      <MarketOverviewSection />
      <SalesSection
        headingId="sales-heading"
        title="HNTR's Sales"
        actionLabel="View All Sales"
        actionHref="/marketplace"
        items={sales}
      />
    </>
  );
}
