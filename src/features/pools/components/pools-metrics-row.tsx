import { poolsMetrics } from "@/features/pools/data/pools-data";
import { cn } from "@/lib/utils";

export function PoolsMetricsRow() {
  return (
    <div className="mb-[18px] grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
      {poolsMetrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-xl border border-bd0 bg-e2 px-3 py-2.75 shadow-sh1 sm:rounded-[var(--r)] sm:border-0 sm:px-3.5 sm:py-3 sm:shadow-[var(--sh1),var(--glow)]"
        >
          <p className="mb-1.25 font-mono text-[7.5px] uppercase tracking-[0.06em] text-t1 sm:mb-1 sm:text-caption sm:tracking-[0.08em] sm:text-t0">
            {metric.label}
          </p>
          <p className="font-mono text-[16px] font-bold text-t4 sm:text-stat">
            {metric.value}
            {metric.unit && (
              <span className="ml-1 text-label font-normal text-t2">
                {metric.unit}
              </span>
            )}
          </p>
          {metric.change && (
            <p
              className={cn(
                "mt-1 font-mono text-[8px] sm:mt-0.5 sm:text-caption",
                metric.changeColor === "green" ? "text-green" : "text-t1",
              )}
            >
              {metric.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
