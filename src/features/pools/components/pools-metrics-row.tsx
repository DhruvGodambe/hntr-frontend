import { poolsMetrics } from "@/features/pools/data/pools-data";

export function PoolsMetricsRow() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border shadow-sh1 lg:grid-cols-4">
      {poolsMetrics.map((metric) => (
        <div key={metric.label} className="bg-e2 px-4 py-3">
          <p className="mb-1 text-[8px] uppercase tracking-[0.06em] text-t1">
            {metric.label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-[15px] font-bold text-t4">
              {metric.value}
            </p>
            {metric.delta && (
              <span className="font-mono text-[8px] text-green">
                {metric.delta}
              </span>
            )}
          </div>
          {metric.subtext && (
            <p className="mt-0.5 font-mono text-[8px] text-t0">
              {metric.subtext}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
