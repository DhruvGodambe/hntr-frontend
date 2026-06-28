import { ReferralLinkCard } from "./referral-link-card";
import { ReferralNetworkChart } from "./referral-network-chart";

export function ReferralAnalyticsSection() {
  return (
    <section className="mb-3.5 mt-5 grid gap-3 lg:grid-cols-[1fr_240px]">
      <ReferralNetworkChart />
      <ReferralLinkCard />
    </section>
  );
}
