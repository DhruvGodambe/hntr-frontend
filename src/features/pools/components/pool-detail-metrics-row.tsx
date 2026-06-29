import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { cn } from "@/lib/utils";

type PoolDetailMetricsRowProps = {
  pool: PoolDetail;
};

export function PoolDetailMetricsRow({ pool }: PoolDetailMetricsRowProps) {
  return (
    <div className="mb-3.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {pool.metrics.map((metric) => (
        <div
          key={metric.label}
          className="pool-detail-metric rounded-[var(--r)] bg-e2 px-3.5 py-3 shadow-[var(--sh1),var(--glow)]"
        >
          <p className="mb-1 font-mono text-caption uppercase tracking-[0.08em] text-t0">
            {metric.label}
          </p>
          <p className="font-mono text-stat font-bold text-t4">{metric.value}</p>
          {metric.label === "Participants" ? (
            <div className="mt-1 flex items-center gap-1.5">
              <div className="flex items-center">
                {["🧑", "👤", "🧑"].map((emoji, index) => (
                  <span
                    key={index}
                    className="pool-detail-participant"
                    aria-hidden
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <span className="font-mono text-caption text-t0">+129</span>
            </div>
          ) : metric.subtext ? (
            <p className="mt-0.5 font-mono text-caption text-t0">{metric.subtext}</p>
          ) : null}
          {metric.delta && (
            <p
              className={cn(
                "mt-0.5 font-mono text-caption",
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
