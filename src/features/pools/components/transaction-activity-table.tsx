import Link from "next/link";
import { Filter } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { poolTransactionPagination } from "@/features/pools/data/pool-detail-data";
import { cn } from "@/lib/utils";

type TransactionActivityTableProps = {
  pool: PoolDetail;
};

export function TransactionActivityTable({ pool }: TransactionActivityTableProps) {
  return (
    <section className="mb-5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-body-sm font-bold uppercase tracking-[0.1em] text-t4">
          Transaction Activity
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-[26px] items-center rounded bg-e2 px-3 font-mono text-caption tracking-[0.06em] text-t2 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="flex h-[26px] items-center gap-1 rounded bg-e2 px-3 font-mono text-caption tracking-[0.06em] text-t2 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
          >
            <Filter className="size-3" />
            Filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--r)] bg-e2 shadow-[var(--sh1),var(--glow)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                {["User", "Type", "Date", "Amount", "Action"].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-bd0 bg-e3 px-4 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0 sm:px-4"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pool.transactions.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors last:[&_td]:border-b-0 hover:bg-e3"
                >
                  <td className="border-b border-bd0 px-4 py-2.5 font-mono text-label font-medium text-t3">
                    {row.user}
                  </td>
                  <td className="border-b border-bd0 px-4 py-2.5">
                    <span className="pool-tx-badge">{row.type}</span>
                  </td>
                  <td className="border-b border-bd0 px-4 py-2.5 font-mono text-caption text-t1">
                    {row.date}
                  </td>
                  <td className="border-b border-bd0 px-4 py-2.5 font-mono text-body-sm font-bold text-t4">
                    {row.amount}
                  </td>
                  <td className="border-b border-bd0 px-4 py-2.5">
                    <Link
                      href={`https://etherscan.io/tx/${row.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-caption text-[var(--olive)] underline decoration-[var(--sage-faint)] underline-offset-2 transition-colors hover:text-t4"
                    >
                      View Transaction
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bd0 px-4 py-2">
          <p className="font-mono text-caption text-t0">
            Showing {poolTransactionPagination.from}-{poolTransactionPagination.to}{" "}
            of {poolTransactionPagination.total.toLocaleString()} entries
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" className="h-7 text-caption" />
              </PaginationItem>
              {[1, 2, 3].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === 1}
                    className={cn(
                      "size-7 text-caption",
                      page === 1 && "pool-pg-active dark:text-e0",
                    )}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" className="h-7 text-caption" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </section>
  );
}
