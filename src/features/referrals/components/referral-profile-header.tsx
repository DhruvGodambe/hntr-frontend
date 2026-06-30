import type { CSSProperties } from "react";
import {
  referralPerformance,
  referralProfile,
  referralStats,
} from "@/features/referrals/data/referrals-data";
import { cn } from "@/lib/utils";

function ProfileAvatar({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <circle cx="14" cy="10" r="5" stroke="var(--t2)" strokeWidth="1.5" />
      <path
        d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10"
        stroke="var(--t2)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PerfBadge({ complete }: { complete: boolean }) {
  return (
    <span
      className={cn(
        "flex size-[15px] shrink-0 items-center justify-center rounded-full",
        complete ? "bg-[var(--net-claim-bg)]" : "bg-t0",
      )}
    >
      <svg viewBox="0 0 12 12" fill="none" className="size-[9px]" aria-hidden>
        <path
          d="M2.5 6.2l2.3 2.3L9.5 3.5"
          stroke="#fff"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ReferralProfileHeader() {
  return (
    <section className="mb-[22px] grid items-start gap-3.5 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div className="net-profile-card net-card-in">
        <div className="net-flip-inner">
          <div className="net-flip-face net-flip-front">
            <span className="net-flip-cue">HOVER ⇆</span>
            <div className="mb-4 flex items-center gap-3.5">
              <div className="flex size-[60px] shrink-0 items-center justify-center rounded-lg bg-e3 shadow-sh1">
                <ProfileAvatar />
              </div>
              <div className="min-w-0">
                <p className="font-display text-[1.571rem] font-semibold leading-none text-t4">
                  {referralProfile.username}
                </p>
                <p className="mt-1 font-mono text-caption uppercase tracking-[0.1em] text-t1">
                  Rank: <span className="text-t4">{referralProfile.rank}</span>
                </p>
              </div>
            </div>

            <div className="mb-3.5 h-px bg-bd0" />

            <div>
              <div className="mb-1.5 flex justify-between">
                <span className="font-mono text-caption uppercase tracking-[0.1em] text-t0">
                  Current Progress
                </span>
                <span className="font-mono text-label text-t4">
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
                  className="net-prog-fill h-full rounded-[3px] bg-[var(--net-claim-bg)]"
                  style={{ width: `${referralProfile.progress}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-caption text-t1">
                <span>{referralProfile.progressStart}</span>
                <span className="font-semibold text-t4">
                  {referralProfile.progressEnd}
                </span>
              </div>
            </div>
          </div>

          <div className="net-flip-face net-flip-back">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex size-[30px] shrink-0 items-center justify-center rounded-md bg-e3">
                <ProfileAvatar size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-label font-semibold text-t4">
                  {referralProfile.username}
                </p>
                <p className="font-mono text-caption uppercase tracking-[0.1em] text-t1">
                  Rank: <span className="text-t4">{referralProfile.rank}</span>
                </p>
              </div>
              <p className="ml-auto whitespace-nowrap font-mono text-label tracking-[0.12em] text-t1">
                RULE{" "}
                {referralPerformance.rule.map((value, index) => (
                  <span key={index}>
                    <b className="font-bold text-t4">{value}</b>
                    {index < referralPerformance.rule.length - 1 ? " / " : ""}
                  </span>
                ))}
              </p>
            </div>

            <div className="mb-2.5 h-px bg-bd0" />

            <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-3 sm:gap-3">
              {referralPerformance.columns.map((column) => (
                <div key={column.name} className="net-perf-col min-w-0">
                  <p className="mb-1 truncate font-display text-micro font-bold text-t4 sm:text-caption">
                    {column.name}
                  </p>
                  <div className="mb-1.5 flex items-center gap-1 sm:mb-2 sm:gap-1.5">
                    <p className="whitespace-nowrap font-mono text-micro text-t1 sm:text-caption">
                      {column.current}
                      <b className="font-bold text-t4">/{column.target}</b>
                    </p>
                    <div className="ml-auto flex items-center gap-1 whitespace-nowrap font-mono text-caption font-bold text-t4 sm:text-label">
                      <PerfBadge complete={column.complete} />
                      {column.percent}%
                    </div>
                  </div>
                  <div className="mb-1 h-[6px] overflow-hidden rounded-[2px] bg-e4 sm:mb-1.5 sm:h-[7px]">
                    <div
                      className="net-perf-fill"
                      style={{ "--w": `${column.percent}%` } as CSSProperties}
                    />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-t0 sm:text-micro sm:tracking-[0.1em]">
                    Referring Team
                    <b className="mt-0.5 block truncate font-display text-micro font-bold normal-case tracking-normal text-t2 sm:text-caption">
                      {column.team}
                    </b>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {referralStats.map((stat, index) => (
          <div
            key={stat.label}
            className="net-card-in rounded-[var(--r)] bg-e2 px-4 py-3.5 shadow-[var(--sh1),var(--glow)]"
            style={{ animationDelay: `${0.08 + index * 0.05}s` }}
          >
            <p className="mb-1.5 font-mono text-caption uppercase tracking-[0.1em] text-t0">
              {stat.label}
            </p>
            <p
              className={cn(
                "mb-1 truncate font-mono text-heading-sm font-bold leading-none text-t4 sm:text-heading",
                stat.displayFont && "font-display",
              )}
            >
              {stat.value}
            </p>
            {stat.subtext && (
              <p className="font-mono text-caption text-t0">{stat.subtext}</p>
            )}
            {stat.delta && (
              <p
                className={cn(
                  "font-mono text-caption",
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
