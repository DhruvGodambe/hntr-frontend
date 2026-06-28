import type { ActiveReward } from "@/features/referrals/data/referrals-data";

type RewardGridCardProps = {
  reward: ActiveReward;
};

function RewardIcon({ icon }: { icon: ActiveReward["icon"] }) {
  switch (icon) {
    case "referral":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "leadership":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 7h12M4 10h10M4 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "rank":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M10 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L10 14l-4.8 2.6.9-5.3L2.3 7.6l5.3-.8L10 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "nft":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M10 4v12M4 10l6-6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "otc":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "liquidity":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function RewardGridCard({ reward }: RewardGridCardProps) {
  return (
    <article
      className="flex flex-col rounded-md bg-e2 p-[18px] shadow-[var(--sh1),var(--glow)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-sh2"
      style={{ animationDelay: reward.delay }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex size-[38px] items-center justify-center rounded-lg bg-e3 text-t4">
          <RewardIcon icon={reward.icon} />
        </div>
        <span className="rounded-[3px] bg-e3 px-[7px] py-[3px] font-mono text-[7px] tracking-[0.1em] text-t1">
          {reward.tag}
        </span>
      </div>

      <h3 className="mb-1.5 font-display text-[13px] font-semibold leading-tight text-t4">
        {reward.title}
      </h3>
      <p className="mb-[18px] flex-1 text-[10px] leading-[1.5] text-t1">
        {reward.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-t4">
          {reward.amount}
        </span>
        <button
          type="button"
          className="h-8 rounded-[5px] bg-[var(--inverse-surface)] px-4 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--inverse-foreground)] shadow-sh1 transition-colors hover:brightness-110 dark:bg-[var(--inverse-btn-bg)] dark:text-[var(--inverse-btn-text)] dark:hover:brightness-95"
        >
          CLAIM
        </button>
      </div>
    </article>
  );
}
