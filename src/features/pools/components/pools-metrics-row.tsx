import { poolsMetrics } from "@/features/pools/data/pools-data";
import { cn } from "@/lib/utils";

export function PoolsMetricsRow() {
  return (
    <div className="mb-[18px] grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {poolsMetrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-[var(--r)] bg-e2 px-3.5 py-3 shadow-[var(--sh1),var(--glow)]"
        >
          <p className="mb-1 font-mono text-caption uppercase tracking-[0.08em] text-t0">
            {metric.label}
          </p>
          <p className="font-mono text-stat font-bold text-t4">
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
                "mt-0.5 font-mono text-caption",
                metric.changeColor === "green" ? "text-green" : "text-t0",
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
