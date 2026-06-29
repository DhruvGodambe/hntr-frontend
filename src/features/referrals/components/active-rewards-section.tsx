import { activeRewards } from "@/features/referrals/data/referrals-data";
import { RewardGridCard } from "./reward-grid-card";

export function ActiveRewardsSection() {
  return (
    <section className="mb-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-mono text-caption uppercase tracking-[0.14em] text-t1">
          Active Rewards Tiers
        </h2>
        <a
          href="#transactions"
          className="cursor-pointer border-b border-[var(--sage-faint)] pb-px font-mono text-caption text-t4 transition-colors hover:text-t3"
        >
          View Detailed Breakdown →
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeRewards.map((reward) => (
          <RewardGridCard key={reward.id} reward={reward} />
        ))}
      </div>
    </section>
  );
}
