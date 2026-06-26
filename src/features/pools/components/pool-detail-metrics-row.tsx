import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { cn } from "@/lib/utils";

type PoolDetailMetricsRowProps = {
  pool: PoolDetail;
};

export function PoolDetailMetricsRow({ pool }: PoolDetailMetricsRowProps) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border shadow-sh1 lg:grid-cols-4">
      {pool.metrics.map((metric) => (
        <div key={metric.label} className="bg-e2 px-4 py-3">
          <p className="mb-1 text-[8px] uppercase tracking-[0.06em] text-t1">
            {metric.label}
          </p>
          <p className="font-mono text-[15px] font-bold text-t4">
            {metric.value}
          </p>
          {metric.subtext && (
            <p className="mt-0.5 text-[8px] text-t1">{metric.subtext}</p>
          )}
          {metric.delta && (
            <p
              className={cn(
                "mt-0.5 font-mono text-[8px]",
                metric.deltaVariant === "success" && "text-green",
                metric.deltaVariant === "danger" && "text-red",
                !metric.deltaVariant && "text-t0",
              )}
            >
              {metric.delta}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
