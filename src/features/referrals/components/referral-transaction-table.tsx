import { Check, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  referralTransactions,
  transactionPagination,
} from "@/features/referrals/data/referrals-data";

export function ReferralTransactionTable() {
  return (
    <section id="transactions" className="mb-6 scroll-mt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4">
          Transaction History
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-t0" />
            <Input
              placeholder="Search..."
              className="h-7 w-[140px] pl-7 font-mono text-[9px] sm:w-[180px]"
            />
          </div>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-e2 px-2 font-mono text-[8px] uppercase tracking-[0.04em] text-t2 transition-colors hover:bg-e3"
          >
            <Filter className="size-3" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-e2 shadow-sh1">
        <Table>
          <TableHeader>
            <TableRow className="bg-e3 hover:bg-e3">
              <TableHead className="h-8 px-3">Date / Time</TableHead>
              <TableHead className="h-8 px-3">Type</TableHead>
              <TableHead className="h-8 px-3">Source</TableHead>
              <TableHead className="h-8 px-3">Amount</TableHead>
              <TableHead className="h-8 px-3 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referralTransactions.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="px-3 py-2 font-mono text-[8px] text-t2">
                  {row.dateTime}
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Badge variant="outline" className="text-[7px]">
                    {row.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-2 text-[9px] text-t3">
                  {row.source}
                </TableCell>
                <TableCell className="px-3 py-2 font-mono text-[9px] font-bold text-t4">
                  {row.amount}
                </TableCell>
                <TableCell className="px-3 py-2 text-right">
                  <Check
                    className="ml-auto size-3.5 text-green"
                    strokeWidth={2.5}
                    aria-label="Completed"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[8px] text-t0">
          Showing {transactionPagination.from}-{transactionPagination.to} of{" "}
          {transactionPagination.total.toLocaleString()} entries
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
