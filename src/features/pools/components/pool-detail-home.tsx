import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { OtherPoolsCarousel } from "./other-pools-carousel";
import { PoolDetailHero } from "./pool-detail-hero";
import { PoolDetailMetricsRow } from "./pool-detail-metrics-row";
import { TransactionActivityTable } from "./transaction-activity-table";

type PoolDetailHomeProps = {
  pool: PoolDetail;
};

export function PoolDetailHome({ pool }: PoolDetailHomeProps) {
  return (
    <div className="-mx-3 -mt-4 flex flex-col pb-10 sm:-mx-4">
      <div className="px-3 pt-[18px] sm:px-5">
        <PoolDetailHero pool={pool} />
        <PoolDetailMetricsRow pool={pool} />
        <TransactionActivityTable pool={pool} />
        <OtherPoolsCarousel pool={pool} />
      </div>
    </div>
  );
}
