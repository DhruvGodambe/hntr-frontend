import { PoolsMetricsRow } from "./pools-metrics-row";
import { PoolsPageActions } from "./pools-page-actions";
import { PoolsPageHero } from "./pools-page-hero";
import { RealtimeActivityTable } from "./realtime-activity-table";
import { RunningPoolsGrid } from "./running-pools-grid";

export function PoolsHome() {
  return (
    <div className="-mx-2 -mt-3 flex flex-col pb-8 sm:-mx-4 sm:-mt-4 sm:pb-10">
      <PoolsPageHero />
      <div className="px-2 pt-4 sm:px-5 sm:pt-[18px]">
        <PoolsPageActions />
        <PoolsMetricsRow />
        <RunningPoolsGrid />
        <RealtimeActivityTable />
      </div>
    </div>
  );
}
