import { SectionHeader } from "@/features/dashboard/components/section-header";
import { activeRewards } from "@/features/referrals/data/referrals-data";
import { RewardGridCard } from "./reward-grid-card";

export function ActiveRewardsSection() {
  return (
    <section className="mb-6">
      <SectionHeader
        title="Active Rewards Tiers"
        actionLabel="View Detailed Breakdown →"
        actionHref="/referrals#transactions"
        className="mb-4"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {activeRewards.map((reward) => (
          <RewardGridCard key={reward.id} reward={reward} />
        ))}
      </div>
    </section>
  );
}
