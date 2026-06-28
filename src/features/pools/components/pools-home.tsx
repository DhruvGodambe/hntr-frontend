import { PoolsMetricsRow } from "./pools-metrics-row";
import { PoolsPageActions } from "./pools-page-actions";
import { PoolsPageHero } from "./pools-page-hero";
import { RealtimeActivityTable } from "./realtime-activity-table";
import { RunningPoolsGrid } from "./running-pools-grid";

export function PoolsHome() {
  return (
    <div className="-mx-4 -mt-4 flex flex-col pb-10">
      <PoolsPageHero />
      <div className="px-5 pt-[18px]">
        <PoolsPageActions />
        <PoolsMetricsRow />
        <RunningPoolsGrid />
        <RealtimeActivityTable />
      </div>
    </div>
  );
}
