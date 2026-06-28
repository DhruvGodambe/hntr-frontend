import { activeRewards } from "@/features/referrals/data/referrals-data";
import { RewardGridCard } from "./reward-grid-card";

export function ActiveRewardsSection() {
  return (
    <section className="mb-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.14em] text-t1">
          Active Rewards Tiers
        </h2>
        <a
          href="#transactions"
          className="cursor-pointer border-b border-bd1 pb-px font-mono text-[10px] text-t4"
        >
          View Detailed Breakdown →
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {activeRewards.map((reward) => (
          <RewardGridCard key={reward.id} reward={reward} />
        ))}
      </div>
    </section>
  );
}
