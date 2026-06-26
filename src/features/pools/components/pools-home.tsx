import { PoolsMetricsRow } from "./pools-metrics-row";
import { PoolsPageHero } from "./pools-page-hero";
import { RealtimeActivityTable } from "./realtime-activity-table";
import { RunningPoolsGrid } from "./running-pools-grid";

export function PoolsHome() {
  return (
    <>
      <PoolsPageHero />
      <PoolsMetricsRow />
      <RunningPoolsGrid />
      <RealtimeActivityTable />
      <footer className="border-t border-border pt-4 font-mono text-[8px] uppercase tracking-[0.06em] text-t0">
        © 2024 HNTR INSTITUTIONAL | TERMINAL STATUS: OPTIMAL
      </footer>
    </>
  );
}
