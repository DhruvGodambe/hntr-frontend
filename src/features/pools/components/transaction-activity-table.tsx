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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { poolTransactionPagination } from "@/features/pools/data/pool-detail-data";

type TransactionActivityTableProps = {
  pool: PoolDetail;
};

export function TransactionActivityTable({ pool }: TransactionActivityTableProps) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4">
          Transaction Activity
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-7 items-center rounded-md border border-border bg-e2 px-2 font-mono text-[8px] uppercase tracking-[0.04em] text-t2 transition-colors hover:bg-e3"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-e2 px-2 font-mono text-[8px] uppercase tracking-[0.04em] text-t2 transition-colors hover:bg-e3"
          >
            <Filter className="size-3" />
            Filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-e2 shadow-sh1">
        <Table>
          <TableHeader>
            <TableRow className="bg-e3 hover:bg-e3">
              <TableHead className="h-8 px-3">User</TableHead>
              <TableHead className="h-8 px-3">Type</TableHead>
              <TableHead className="h-8 px-3">Date</TableHead>
              <TableHead className="h-8 px-3">Amount</TableHead>
              <TableHead className="h-8 px-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pool.transactions.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="px-3 py-2 font-mono text-[9px] text-t3">
                  {row.user}
                </TableCell>
                <TableCell className="px-3 py-2 font-mono text-[8px] uppercase text-t2">
                  {row.type}
                </TableCell>
                <TableCell className="px-3 py-2 text-[9px] text-t2">
                  {row.date}
                </TableCell>
                <TableCell className="px-3 py-2 font-mono text-[9px] font-bold text-t4">
                  {row.amount}
                </TableCell>
                <TableCell className="px-3 py-2 text-right">
                  <Link
                    href={`https://etherscan.io/tx/${row.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[8px] uppercase tracking-[0.04em] text-accent transition-colors hover:text-t4"
                  >
                    View Transaction
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[8px] text-t0">
          Showing {poolTransactionPagination.from}-{poolTransactionPagination.to}{" "}
          of {poolTransactionPagination.total.toLocaleString()} entries
        </p>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" className="h-7 text-[8px]" />
            </PaginationItem>
            {[1, 2, 3].map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === 1}
                  className="size-7 text-[8px]"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" className="h-7 text-[8px]" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
}
