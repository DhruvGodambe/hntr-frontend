import {
  referralTransactions,
  transactionPagination,
} from "@/features/referrals/data/referrals-data";
import { cn } from "@/lib/utils";

export function ReferralTransactionTable() {
  return (
    <section
      id="transactions"
      className="mb-5 scroll-mt-4 overflow-hidden rounded-md bg-e2 shadow-[var(--sh1),var(--glow)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[0.5px] border-bd0 px-[18px] py-3.5">
        <h2 className="font-display text-[13px] font-semibold text-t4">
          Transaction History
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex h-[30px] items-center gap-1.5 rounded-[5px] bg-e3 px-2.5 shadow-sh1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Filter..."
              className="w-[100px] border-none bg-transparent font-mono text-[9px] text-t2 outline-none placeholder:text-t0 sm:w-[120px]"
            />
          </div>
          <button
            type="button"
            className="flex h-[30px] items-center gap-1 rounded-[5px] bg-e3 px-3 font-mono text-[9px] text-t2 shadow-sh1 transition-colors hover:text-t4"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Date / Time", "Type", "Source", "Amount", "Status"].map(
                (heading, index) => (
                  <th
                    key={heading}
                    className={cn(
                      "border-b-[0.5px] border-bd0 bg-e3 px-3.5 py-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-t1",
                      index === 3 && "text-right",
                      index === 4 && "text-center",
                      index === 0 && "text-left",
                      index > 0 && index < 3 && "text-left",
                    )}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {referralTransactions.map((row) => (
              <tr key={row.id} className="hover:bg-e3">
                <td className="border-b-[0.5px] border-bd0 px-3.5 py-2.5 font-mono text-[9px] text-t2">
                  {row.dateTime}
                </td>
                <td className="border-b-[0.5px] border-bd0 px-3.5 py-2.5 font-mono text-[9px] text-t3">
                  {row.type}
                </td>
                <td className="border-b-[0.5px] border-bd0 px-3.5 py-2.5 text-[10px] text-t2">
                  {row.source}
                </td>
                <td className="border-b-[0.5px] border-bd0 px-3.5 py-2.5 text-right font-mono text-[10px] font-bold text-t4">
                  {row.amount}
                </td>
                <td className="border-b-[0.5px] border-bd0 px-3.5 py-2.5 text-center text-[13px] text-green">
                  ✓
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t-[0.5px] border-bd0 bg-e3 px-[18px] py-2.5">
        <p className="font-mono text-[9px] text-t1">
          Showing {transactionPagination.from}-{transactionPagination.to} of{" "}
          {transactionPagination.total.toLocaleString()} entries
        </p>
        <div className="flex items-center gap-1">
          {["‹", "1", "2", "3", "›"].map((page, index) => (
            <button
              key={`${page}-${index}`}
              type="button"
              className={cn(
                "flex size-7 items-center justify-center rounded font-mono text-[9px] shadow-sh1 transition-colors",
                page === "1"
                  ? "bg-[var(--inverse-surface)] text-[var(--inverse-foreground)] dark:bg-[var(--inverse-btn-bg)] dark:text-[var(--inverse-btn-text)]"
                  : "bg-e2 text-t2 hover:text-t4",
              )}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
