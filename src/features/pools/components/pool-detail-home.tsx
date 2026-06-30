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
    <div className="-mx-2 -mt-3 flex flex-col pb-8 sm:-mx-4 sm:-mt-4 sm:pb-10">
      <div className="px-2 pt-4 sm:px-5 sm:pt-[18px]">
        <PoolDetailHero pool={pool} />
        <PoolDetailMetricsRow pool={pool} />
        <TransactionActivityTable pool={pool} />
        <OtherPoolsCarousel pool={pool} />
      </div>
    </div>
  );
}
