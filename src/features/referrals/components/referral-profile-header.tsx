import {
  referralProfile,
  referralStats,
} from "@/features/referrals/data/referrals-data";

export function ReferralProfileHeader() {
  return (
    <section className="mb-5 flex flex-col gap-3 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col rounded-md border border-border bg-e2 p-4 shadow-sh1">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-e3 text-lg shadow-sh1"
            aria-hidden
          >
            👤
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-t4">
              {referralProfile.username}
            </p>
            <p className="font-mono text-[8px] uppercase tracking-[0.06em] text-t1">
              Rank: {referralProfile.rank}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between">
            <span className="text-[8px] uppercase tracking-[0.06em] text-t0">
              Current Progress
            </span>
            <span className="font-mono text-[9px] text-t4">
              {referralProfile.progress}%
            </span>
          </div>
          <div
            className="mb-1 h-[3px] overflow-hidden rounded-[2px] bg-e4"
            role="progressbar"
            aria-valuenow={referralProfile.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-[2px] bg-t4"
              style={{ width: `${referralProfile.progress}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[8px] text-t0">
            <span>{referralProfile.progressStart}</span>
            <span>{referralProfile.progressEnd}</span>
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 lg:w-[min(100%,420px)]">
        {referralStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border bg-e2 p-3 shadow-sh1"
          >
            <p className="mb-1 text-[8px] uppercase tracking-[0.05em] text-t0">
              {stat.label}
            </p>
            <p className="font-mono text-[13px] font-bold leading-tight text-t4">
              {stat.value}
            </p>
            {stat.subtext && (
              <p className="mt-0.5 text-[8px] text-t1">{stat.subtext}</p>
            )}
            {stat.delta && (
              <p className="mt-0.5 font-mono text-[8px] text-green">
                {stat.delta}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
