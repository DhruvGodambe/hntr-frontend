import { PoolsMetricsRow } from "./pools-metrics-row";
import { PoolsPageActions } from "./pools-page-actions";
import { PoolsPageHero } from "./pools-page-hero";
import { RealtimeActivityTable } from "./realtime-activity-table";
import { RunningPoolsGrid } from "./running-pools-grid";

export function PoolsHome() {
  return (
    <div className="-mx-3 -mt-4 flex flex-col pb-10 sm:-mx-4">
      <PoolsPageHero />
      <div className="px-3 pt-[18px] sm:px-5">
        <PoolsPageActions />
        <PoolsMetricsRow />
        <RunningPoolsGrid />
        <RealtimeActivityTable />
      </div>
    </div>
  );
}
