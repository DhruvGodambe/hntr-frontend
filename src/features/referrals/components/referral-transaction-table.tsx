import {
  referralTransactions,
  transactionPagination,
} from "@/features/referrals/data/referrals-data";
import { cn } from "@/lib/utils";

export function ReferralTransactionTable() {
  return (
    <section
      id="transactions"
      className="mb-5 scroll-mt-4 overflow-hidden rounded-[var(--r)] bg-e2 shadow-[var(--sh1),var(--glow)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bd0 px-[18px] py-3.5">
        <h2 className="font-display text-body-sm font-semibold text-t4">
          Transaction History
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex h-[30px] items-center gap-1.5 rounded-[5px] bg-e3 px-2.5 shadow-sh1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden className="text-t1">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Filter..."
              className="w-[100px] border-none bg-transparent font-mono text-caption text-t2 outline-none placeholder:text-t0 sm:w-[120px]"
            />
          </div>
          <button
            type="button"
            className="flex h-[30px] items-center gap-1 rounded-[5px] bg-e3 px-3 font-mono text-caption text-t2 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              {["Date / Time", "Type", "Source", "Amount", "Status"].map(
                (heading, index) => (
                  <th
                    key={heading}
                    className={cn(
                      "border-b border-bd0 bg-e3 px-[18px] py-2.5 font-mono text-caption font-medium uppercase tracking-[0.08em] text-t0",
                      index === 3 && "text-right",
                      index === 4 && "text-center",
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
              <tr key={row.id} className="transition-colors last:[&_td]:border-b-0 hover:bg-e3">
                <td className="border-b border-bd0 px-[18px] py-2.5 font-mono text-caption text-t2">
                  {row.dateTime}
                </td>
                <td className="border-b border-bd0 px-[18px] py-2.5">
                  <span className="inline-flex h-5 items-center rounded-[3px] bg-e3 px-2 font-mono text-caption font-medium tracking-[0.07em] text-t1">
                    {row.type}
                  </span>
                </td>
                <td className="border-b border-bd0 px-[18px] py-2.5 text-caption text-t2">
                  {row.source}
                </td>
                <td className="border-b border-bd0 px-[18px] py-2.5 text-right font-mono text-label font-bold text-green">
                  {row.amount}
                </td>
                <td className="border-b border-bd0 px-[18px] py-2.5 text-center">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--net-claim-bg)]">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path
                        d="M2.5 6.2l2.3 2.3L9.5 3.5"
                        stroke="var(--net-claim-text)"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bd0 bg-e3 px-[18px] py-2.5">
        <p className="font-mono text-caption text-t0">
          Showing {transactionPagination.from}-{transactionPagination.to} of{" "}
          {transactionPagination.total.toLocaleString()} entries
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded bg-e2 font-mono text-caption text-t2 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
            aria-label="Previous page"
          >
            ‹
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type="button"
              className={cn(
                "flex size-7 items-center justify-center rounded font-mono text-caption shadow-sh1 transition-colors",
                page === 1
                  ? "net-txh-pg-active"
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
            className="flex size-7 items-center justify-center rounded bg-e2 font-mono text-caption text-t2 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
