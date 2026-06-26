import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { poolActivity } from "@/features/pools/data/pools-data";
import { nftPlaceholder } from "@/lib/placeholders";

export function RealtimeActivityTable() {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4">
          Real-Time Activity
        </h2>
        <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.04em] text-green">
          <span className="size-1.5 rounded-full bg-green" aria-hidden />
          Real-Time
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-e2 shadow-sh1">
        <Table>
          <TableHeader>
            <TableRow className="bg-e3 hover:bg-e3">
              <TableHead className="h-8 px-3">Wallet</TableHead>
              <TableHead className="h-8 px-3">Bid Amount</TableHead>
              <TableHead className="h-8 px-3">Collection</TableHead>
              <TableHead className="h-8 min-w-[120px] px-3">Completion</TableHead>
              <TableHead className="h-8 px-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {poolActivity.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="px-3 py-2 font-mono text-[9px] text-t3">
                  {row.wallet}
                </TableCell>
                <TableCell className="px-3 py-2 font-mono text-[9px] font-bold text-t4">
                  {row.bidAmount}
                </TableCell>
                <TableCell className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={nftPlaceholder(row.collectionSeed, 48)}
                      alt=""
                      className="size-5 rounded-sm object-cover"
                    />
                    <span className="text-[9px] text-t3">{row.collection}</span>
                  </span>
                </TableCell>
                <TableCell className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={row.completion}
                      className="h-1 flex-1 rounded-[2px]"
                      indicatorClassName="bg-t4 rounded-[2px]"
                    />
                    <span className="w-7 shrink-0 text-right font-mono text-[8px] text-t0">
                      {row.completion}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2 text-right">
                  <Link
                    href={`https://etherscan.io/tx/${row.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[8px] uppercase tracking-[0.04em] text-accent transition-colors hover:text-t4"
                  >
                    View Tx
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
