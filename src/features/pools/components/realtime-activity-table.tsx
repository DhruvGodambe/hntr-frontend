"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { poolActivity } from "@/features/pools/data/pools-data";

export function RealtimeActivityTable() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimated(true), 200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="mb-4 overflow-hidden rounded-[var(--r)] bg-e2 shadow-[var(--sh1),var(--glow)]">
      <div className="flex items-center justify-between border-b border-bd0 px-4 py-3">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.1em] text-t1">
          Real-Time Activity
        </h2>
        <span className="flex items-center gap-1.5 font-mono text-[9px] text-green">
          <span className="size-[5px] animate-pulse rounded-full bg-green" aria-hidden />
          Real-Time
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-e3">
              <th className="border-b border-bd0 px-4 py-2 text-left font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-t0">
                Wallet
              </th>
              <th className="border-b border-bd0 px-4 py-2 text-left font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-t0">
                Bid Amount
              </th>
              <th className="border-b border-bd0 px-4 py-2 text-left font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-t0">
                Collection
              </th>
              <th className="border-b border-bd0 px-4 py-2 text-left font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-t0">
                Completion
              </th>
              <th className="border-b border-bd0 px-4 py-2 text-left font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-t0">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {poolActivity.map((row, index) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-e3"
              >
                <td className="border-b border-bd0 px-4 py-2.5 font-mono text-[10px] font-medium text-t3 last:border-b-0">
                  {row.wallet}
                </td>
                <td className="border-b border-bd0 px-4 py-2.5 font-mono text-[11px] font-bold text-t4 last:border-b-0">
                  {row.bidAmount}
                </td>
                <td className="border-b border-bd0 px-4 py-2.5 last:border-b-0">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-[2px]"
                      style={{ background: row.collectionColor }}
                      aria-hidden
                    />
                    <span className="text-[10px] text-t2">{row.collection}</span>
                  </span>
                </td>
                <td className="border-b border-bd0 px-4 py-2.5 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <div className="h-1 max-w-[120px] flex-1 overflow-hidden rounded-[2px] bg-[var(--cream-dark)]">
                      <div
                        className="h-full rounded-[2px] transition-[width] duration-700 ease-out"
                        style={{
                          width: animated ? `${row.completion}%` : "0%",
                          background: "var(--olive)",
                          transitionDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-mono text-[9px] text-t1">
                      {row.completion}%
                    </span>
                  </div>
                </td>
                <td className="border-b border-bd0 px-4 py-2.5 last:border-b-0">
                  <Link
                    href={`https://etherscan.io/tx/${row.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-[var(--sage-faint)] font-mono text-[9px] tracking-[0.05em] text-[var(--olive)]"
                  >
                    VIEW TX
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
