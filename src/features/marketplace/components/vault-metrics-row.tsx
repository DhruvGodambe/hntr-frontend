import { vaultMetrics } from "@/features/marketplace/data/vault-data";

export function VaultMetricsRow() {
  return (
    <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border shadow-sh1 lg:grid-cols-4">
      {vaultMetrics.map((metric) => (
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
        </div>
      ))}
    </div>
  );
}
