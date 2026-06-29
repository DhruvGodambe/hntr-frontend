import Link from "next/link";
import type { NetworkActivity } from "@/features/marketplace/data/vault-data";
import { cn } from "@/lib/utils";

type NetworkActivityTableProps = {
  className?: string;
  rows: NetworkActivity[];
  showViewAll?: boolean;
};

function EventBadge({ event }: { event: NetworkActivity["event"] }) {
  const isPurchase = event === "PURCHASE";

  return (
    <span
      className={cn(
        "inline-flex h-3 items-center rounded-[2px] px-1 font-mono text-[9px] font-bold leading-none tracking-[0.06em]",
        isPurchase
          ? "bg-[rgba(94,107,85,0.15)] text-[var(--olive)]"
          : "bg-[rgba(155,64,64,0.1)] text-red",
      )}
    >
      {event}
    </span>
  );
}

export function NetworkActivityTable({
  className,
  rows,
  showViewAll = false,
}: NetworkActivityTableProps) {
  return (
    <section
      className={cn("w-full", className)}
      aria-labelledby="network-activity-heading"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="network-activity-heading"
          className="font-display text-body-sm font-bold uppercase tracking-[0.1em] text-t4"
        >
          Network Activity
        </h2>
        {showViewAll && (
          <Link
            href="/marketplace/activity"
            className="border-b border-e4 pb-px font-mono text-label tracking-[0.04em] text-accent transition-colors hover:text-accent-h"
          >
            View All Activity →
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-md bg-e2 shadow-sh1 [box-shadow:var(--sh1),var(--glow)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-e3">
                <th className="border-b-[0.5px] border-bd0 px-4 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Asset
                </th>
                <th className="border-b-[0.5px] border-bd0 px-4 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Event
                </th>
                <th className="border-b-[0.5px] border-bd0 px-4 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Price
                </th>
                <th className="border-b-[0.5px] border-bd0 px-4 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Source
                </th>
                <th className="border-b-[0.5px] border-bd0 px-4 py-2 text-right font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors last:[&_td]:border-b-0 hover:bg-e3"
                >
                  <td className="border-b-[0.5px] border-bd0 px-4 py-2.5 text-label font-semibold text-t4">
                    {row.asset}
                  </td>
                  <td className="border-b-[0.5px] border-bd0 px-4 py-2.5">
                    <EventBadge event={row.event} />
                  </td>
                  <td className="border-b-[0.5px] border-bd0 px-4 py-2.5 font-mono text-label font-semibold text-t3">
                    {row.price}
                  </td>
                  <td className="border-b-[0.5px] border-bd0 px-4 py-2.5 text-caption text-t1">
                    {row.source}
                  </td>
                  <td className="border-b-[0.5px] border-bd0 px-4 py-2.5 text-right font-mono text-caption text-t0">
                    {row.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
