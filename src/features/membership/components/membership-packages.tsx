import { membershipTiers } from "@/features/membership/data/membership-data";
import { PricingTierCard } from "./pricing-tier-card";

export function MembershipPackages() {
  return (
    <section className="mb-[22px]" aria-label="Membership tiers">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {membershipTiers.map((tier, index) => (
          <PricingTierCard key={tier.id} tier={tier} index={index} />
        ))}
      </div>
    </section>
  );
}
