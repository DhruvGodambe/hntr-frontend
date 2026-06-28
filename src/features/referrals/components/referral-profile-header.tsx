import {
  referralProfile,
  referralStats,
} from "@/features/referrals/data/referrals-data";
import { cn } from "@/lib/utils";

function ProfileAvatar() {
  return (
    <div className="flex size-[60px] shrink-0 items-center justify-center rounded-lg bg-e3 shadow-sh1">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="10" r="5" stroke="var(--t2)" strokeWidth="1.5" />
        <path
          d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10"
          stroke="var(--t2)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function ReferralProfileHeader() {
  return (
    <section className="mb-[22px] grid items-start gap-3.5 lg:grid-cols-[380px_1fr]">
      <div className="rounded-md bg-e2 px-6 py-5 shadow-[var(--sh2),var(--glow)]">
        <div className="flex items-center gap-3.5">
          <ProfileAvatar />
          <div className="min-w-0">
            <p className="font-display text-[22px] font-semibold leading-none text-t4">
              {referralProfile.username}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-t1">
              Rank: <span>{referralProfile.rank}</span>
            </p>
          </div>
        </div>

        <div className="my-4 h-px bg-bd0" />

        <div>
          <div className="mb-1.5 flex justify-between">
            <span className="text-[8px] uppercase tracking-[0.06em] text-t0">
              Current Progress
            </span>
            <span className="font-mono text-[9px] text-t4">
              {referralProfile.progress}%
            </span>
          </div>
          <div
            className="mb-1.5 h-[5px] overflow-hidden rounded-[3px] bg-e4"
            role="progressbar"
            aria-valuenow={referralProfile.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-[3px] bg-[var(--inverse-surface)] dark:bg-[var(--inverse-foreground)]"
              style={{ width: `${referralProfile.progress}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[8px] text-t0">
            <span>{referralProfile.progressStart}</span>
            <span className="font-semibold text-t4">
              {referralProfile.progressEnd}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {referralStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md bg-e2 px-4 py-3.5 shadow-[var(--sh1),var(--glow)]"
          >
            <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-t0">
              {stat.label}
            </p>
            <p
              className={cn(
                "mb-1 font-mono text-[22px] font-bold leading-none text-t4",
                stat.displayFont && "font-display",
              )}
            >
              {stat.value}
            </p>
            {stat.subtext && (
              <p className="font-mono text-[9px] text-t0">{stat.subtext}</p>
            )}
            {stat.delta && (
              <p
                className={cn(
                  "font-mono text-[9px]",
                  stat.positive ? "text-green" : "text-t0",
                )}
              >
                {stat.delta}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
