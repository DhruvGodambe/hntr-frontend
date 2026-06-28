import { membershipTiers } from "@/features/membership/data/membership-data";
import { PricingTierCard } from "./pricing-tier-card";

export function MembershipPackages() {
  return (
    <section className="mb-[22px]">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {membershipTiers.map((tier) => (
          <PricingTierCard key={tier.id} tier={tier} />
        ))}
      </div>
    </section>
  );
}
