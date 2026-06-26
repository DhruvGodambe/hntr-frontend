import { SectionHeader } from "@/features/dashboard/components/section-header";
import { membershipTiers } from "@/features/membership/data/membership-data";
import { PricingTierCard } from "./pricing-tier-card";

export function MembershipPackages() {
  return (
    <section className="mb-6">
      <SectionHeader
        title="Membership Packages"
        subtitle="Select a tier to unlock institutional-grade features and network commissions."
        className="mb-4"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {membershipTiers.map((tier) => (
          <PricingTierCard key={tier.id} tier={tier} />
        ))}
      </div>
    </section>
  );
}
