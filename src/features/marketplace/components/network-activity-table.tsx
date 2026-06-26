import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { networkActivity } from "@/features/marketplace/data/vault-data";
import { cn } from "@/lib/utils";

type NetworkActivityTableProps = {
  className?: string;
};

export function NetworkActivityTable({ className }: NetworkActivityTableProps) {
  return (
    <section
      className={cn("w-full", className)}
      aria-labelledby="network-activity-heading"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="network-activity-heading"
          className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4"
        >
          Network Activity
        </h2>
        <Link
          href="/marketplace/activity"
          className="font-mono text-[9px] tracking-[0.04em] text-accent transition-colors hover:text-t4"
        >
          View All Activity →
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-e2 shadow-sh1">
        <Table>
          <TableHeader>
            <TableRow className="bg-e3 hover:bg-e3">
              <TableHead className="h-8 px-3">Asset</TableHead>
              <TableHead className="h-8 px-3">Event</TableHead>
              <TableHead className="h-8 px-3">Price</TableHead>
              <TableHead className="h-8 px-3">Source</TableHead>
              <TableHead className="h-8 px-3 text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {networkActivity.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="px-3 py-2 font-mono text-[9px] font-bold text-t4">
                  {row.asset}
                </TableCell>
                <TableCell className="px-3 py-2 font-mono text-[8px] uppercase text-t2">
                  {row.event}
                </TableCell>
                <TableCell className="px-3 py-2 font-mono text-[8px] text-t3">
                  {row.price}
                </TableCell>
                <TableCell className="px-3 py-2 text-[9px] text-t2">
                  {row.source}
                </TableCell>
                <TableCell className="px-3 py-2 text-right font-mono text-[8px] text-t0">
                  {row.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
