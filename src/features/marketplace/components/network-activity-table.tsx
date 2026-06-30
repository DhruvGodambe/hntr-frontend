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
        "inline-flex h-3.5 items-center rounded-[2px] px-1 font-mono text-[8px] font-bold leading-none tracking-[0.06em] sm:h-3 sm:text-[9px]",
        isPurchase
          ? "bg-[rgba(94,107,85,0.15)] text-[var(--olive)]"
          : "bg-[rgba(155,64,64,0.1)] text-red",
      )}
    >
      {event}
    </span>
  );
}

function ActivityRowCard({ row }: { row: NetworkActivity }) {
  return (
    <div className="border-b border-bd0 px-3 py-2.5 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 font-mono text-caption font-semibold leading-tight text-t4">
          {row.asset}
        </p>
        <span className="shrink-0 font-mono text-micro text-t0">{row.time}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <EventBadge event={row.event} />
        <span className="font-mono text-caption font-semibold text-t3">{row.price}</span>
        <span className="text-micro text-t1">{row.source}</span>
      </div>
    </div>
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
      <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3 sm:gap-3">
        <h2
          id="network-activity-heading"
          className="min-w-0 font-display text-caption font-bold uppercase tracking-[0.08em] text-t4 sm:text-body-sm sm:tracking-[0.1em]"
        >
          Network Activity
        </h2>
        {showViewAll && (
          <Link
            href="/marketplace/activity"
            className="shrink-0 border-b border-e4 pb-px font-mono text-micro tracking-[0.04em] text-accent transition-colors hover:text-accent-h sm:text-label"
          >
            <span className="sm:hidden">View All →</span>
            <span className="hidden sm:inline">View All Activity →</span>
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-md bg-e2 shadow-sh1 [box-shadow:var(--sh1),var(--glow)]">
        <div className="sm:hidden">
          {rows.map((row) => (
            <ActivityRowCard key={row.id} row={row} />
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="bg-e3">
                {["Asset", "Event", "Price", "Source", "Time"].map((heading, index) => (
                  <th
                    key={heading}
                    className={cn(
                      "border-b-[0.5px] border-bd0 px-3 py-1.5 text-left font-mono text-micro font-medium uppercase tracking-[0.08em] text-t0 md:px-4 md:py-2 md:text-caption",
                      index === 4 && "text-right",
                    )}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors last:[&_td]:border-b-0 hover:bg-e3"
                >
                  <td className="border-b-[0.5px] border-bd0 px-3 py-2 font-mono text-caption font-semibold text-t4 md:px-4 md:py-2.5 md:text-label">
                    {row.asset}
                  </td>
                  <td className="border-b-[0.5px] border-bd0 px-3 py-2 md:px-4 md:py-2.5">
                    <EventBadge event={row.event} />
                  </td>
                  <td className="border-b-[0.5px] border-bd0 px-3 py-2 font-mono text-caption font-semibold text-t3 md:px-4 md:py-2.5 md:text-label">
                    {row.price}
                  </td>
                  <td className="border-b-[0.5px] border-bd0 px-3 py-2 text-micro text-t1 md:px-4 md:py-2.5 md:text-caption">
                    {row.source}
                  </td>
                  <td className="border-b-[0.5px] border-bd0 px-3 py-2 text-right font-mono text-micro text-t0 md:px-4 md:py-2.5 md:text-caption">
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
