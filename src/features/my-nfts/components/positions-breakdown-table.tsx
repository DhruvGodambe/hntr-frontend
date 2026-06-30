"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import {
  positionRows,
  positionsPagination,
} from "@/features/my-nfts/data/collection-data";
import { cn } from "@/lib/utils";

function StatusCell({ status }: { status: "listed" | "sold" }) {
  const listed = status === "listed";

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          listed
            ? "bg-green shadow-[0_0_4px_rgba(26,157,95,0.4)]"
            : "bg-red",
        )}
        aria-hidden
      />
      <span className="whitespace-nowrap font-mono text-micro uppercase text-t2 sm:text-caption">
        {listed ? "Listed" : "Sold"}
      </span>
    </div>
  );
}

export function PositionsBreakdownTable() {
  return (
    <section className="mt-6" aria-labelledby="positions-breakdown-heading">
      <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3 sm:gap-3">
        <h2
          id="positions-breakdown-heading"
          className="min-w-0 font-display text-caption font-bold tracking-[0.01em] text-t4 sm:text-body-sm"
        >
          All Positions Breakdown
        </h2>
        <button
          type="button"
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[5px] border border-bd1 bg-e2 px-2.5 font-mono text-micro tracking-[0.06em] text-t2 transition-colors hover:bg-e3 hover:text-t4 sm:px-3 sm:text-caption"
        >
          <Download className="size-2.5" aria-hidden />
          <span className="hidden min-[360px]:inline">Export CSV</span>
          <span className="min-[360px]:hidden">Export</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-[var(--r)] border border-bd1 bg-e2 shadow-[var(--sh1),var(--glow)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-e3">
                {[
                  "Source",
                  "Collection",
                  "Token ID",
                  "Collateral Val.",
                  "LTV %",
                  "APR",
                  "Date",
                  "Action",
                  "View NFT",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-bd0 px-2 py-1.5 text-left font-mono text-micro font-medium uppercase tracking-[0.08em] text-t0 sm:px-3 sm:py-2 sm:text-caption"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positionRows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors last:[&_td]:border-b-0 hover:bg-e3"
                >
                  <td className="whitespace-nowrap border-b border-bd0 px-2 py-2 text-micro text-t1 sm:px-3 sm:py-2.5 sm:text-caption">
                    {row.source}
                  </td>
                  <td className="whitespace-nowrap border-b border-bd0 px-2 py-2 text-caption font-semibold text-t4 sm:px-3 sm:py-2.5 sm:text-label">
                    {row.collection}
                  </td>
                  <td className="whitespace-nowrap border-b border-bd0 px-2 py-2 font-mono text-micro text-t2 sm:px-3 sm:py-2.5 sm:text-caption">
                    {row.tokenId}
                  </td>
                  <td className="border-b border-bd0 px-2 py-2 sm:px-3 sm:py-2.5">
                    <div className="whitespace-nowrap font-mono text-caption font-bold text-t4 sm:text-label">
                      {row.collateralEth}
                    </div>
                    <div className="mt-0.5 whitespace-nowrap font-mono text-micro text-t0 sm:text-caption">
                      {row.collateralUsd}
                    </div>
                  </td>
                  <td className="whitespace-nowrap border-b border-bd0 px-2 py-2 font-mono text-caption text-t2 sm:px-3 sm:py-2.5 sm:text-label">
                    {row.ltv}
                  </td>
                  <td className="whitespace-nowrap border-b border-bd0 px-2 py-2 font-mono text-caption text-t2 sm:px-3 sm:py-2.5 sm:text-label">
                    {row.apr}
                  </td>
                  <td className="whitespace-nowrap border-b border-bd0 px-2 py-2 font-mono text-micro text-t1 sm:px-3 sm:py-2.5 sm:text-caption">
                    {row.date}
                  </td>
                  <td className="border-b border-bd0 px-2 py-2 sm:px-3 sm:py-2.5">
                    <StatusCell status={row.status} />
                  </td>
                  <td className="border-b border-bd0 px-2 py-2 sm:px-3 sm:py-2.5">
                    <Link
                      href={`/pools/${row.poolId}`}
                      className="inline-flex h-[22px] items-center whitespace-nowrap rounded-[3px] border border-bd1 bg-e3 px-2.5 font-mono text-micro tracking-[0.05em] text-t2 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4 sm:text-caption"
                    >
                      View NFT
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-bd0 bg-e3 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="font-mono text-micro text-t0 sm:text-caption">
            Showing {positionsPagination.from}-{positionsPagination.to} of{" "}
            {positionsPagination.total.toLocaleString()} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex size-[26px] items-center justify-center rounded bg-e2 font-mono text-caption text-t2 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
              aria-label="Previous page"
            >
              ‹
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                className={cn(
                  "flex size-[26px] items-center justify-center rounded font-mono text-caption shadow-sh1 transition-colors",
                  page === 1
                    ? "bg-[var(--olive)] text-[var(--cream)] dark:text-e0"
                    : "bg-e2 text-t2 hover:bg-[var(--sage-faint)] hover:text-t4",
                )}
                aria-label={`Page ${page}`}
                aria-current={page === 1 ? "page" : undefined}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="flex size-[26px] items-center justify-center rounded bg-e2 font-mono text-caption text-t2 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
