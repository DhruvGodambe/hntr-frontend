import { PoolsMetricsRow } from "./pools-metrics-row";
import { PoolsPageActions } from "./pools-page-actions";
import { PoolsPageHero } from "./pools-page-hero";
import { RealtimeActivityTable } from "./realtime-activity-table";
import { RunningPoolsGrid } from "./running-pools-grid";

export function PoolsHome() {
  return (
    <div className="-mx-2 -mt-3 flex flex-col pb-8 sm:-mx-4 sm:-mt-4 sm:pb-10">
      <PoolsPageHero />
      <div className="px-4 pt-4 sm:px-5 sm:pt-[18px]">
        <div className="mb-4 sm:hidden">
          <h1 className="font-display text-[19px] font-bold tracking-[0.04em] text-t4">
            NFT Strategy Pools
          </h1>
          <p className="mt-0.75 text-[11px] text-t1">
            Co-invest in blue-chip NFTs.
          </p>
        </div>
        <PoolsPageActions />
        <PoolsMetricsRow />
        <RunningPoolsGrid />
        <RealtimeActivityTable />
      </div>
    </div>
  );
}
