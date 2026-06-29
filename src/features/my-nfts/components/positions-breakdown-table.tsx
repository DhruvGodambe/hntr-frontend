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
      <span className="font-mono text-caption uppercase text-t2">
        {listed ? "Listed" : "Sold"}
      </span>
    </div>
  );
}

export function PositionsBreakdownTable() {
  return (
    <section className="mt-6" aria-labelledby="positions-breakdown-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="positions-breakdown-heading"
          className="font-display text-body-sm font-bold tracking-[0.01em] text-t4"
        >
          All Positions Breakdown
        </h2>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1.5 rounded-[5px] border border-bd1 bg-e2 px-3 font-mono text-caption tracking-[0.06em] text-t2 transition-colors hover:bg-e3 hover:text-t4"
        >
          <Download className="size-2.5" aria-hidden />
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-[var(--r)] border border-bd1 bg-e2 shadow-[var(--sh1),var(--glow)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="bg-e3">
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Source
                </th>
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Collection
                </th>
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Token ID
                </th>
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Collateral Val.
                </th>
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  LTV %
                </th>
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  APR
                </th>
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Date
                </th>
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  Action
                </th>
                <th className="border-b border-bd0 px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0">
                  View NFT
                </th>
              </tr>
            </thead>
            <tbody>
              {positionRows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors last:[&_td]:border-b-0 hover:bg-e3"
                >
                  <td className="border-b border-bd0 px-3 py-2.5 text-caption text-t1">
                    {row.source}
                  </td>
                  <td className="border-b border-bd0 px-3 py-2.5 text-label font-semibold text-t4">
                    {row.collection}
                  </td>
                  <td className="border-b border-bd0 px-3 py-2.5 font-mono text-caption text-t2">
                    {row.tokenId}
                  </td>
                  <td className="border-b border-bd0 px-3 py-2.5">
                    <div className="font-mono text-label font-bold text-t4">
                      {row.collateralEth}
                    </div>
                    <div className="mt-0.5 font-mono text-caption text-t0">
                      {row.collateralUsd}
                    </div>
                  </td>
                  <td className="border-b border-bd0 px-3 py-2.5 font-mono text-label text-t2">
                    {row.ltv}
                  </td>
                  <td className="border-b border-bd0 px-3 py-2.5 font-mono text-label text-t2">
                    {row.apr}
                  </td>
                  <td className="border-b border-bd0 px-3 py-2.5 font-mono text-caption text-t1">
                    {row.date}
                  </td>
                  <td className="border-b border-bd0 px-3 py-2.5">
                    <StatusCell status={row.status} />
                  </td>
                  <td className="border-b border-bd0 px-3 py-2.5">
                    <Link
                      href={`/pools/${row.poolId}`}
                      className="inline-flex h-[22px] items-center rounded-[3px] border border-bd1 bg-e3 px-2.5 font-mono text-caption tracking-[0.05em] text-t2 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
                    >
                      View NFT
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bd0 bg-e3 px-3 py-2">
          <p className="font-mono text-caption text-t0">
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
