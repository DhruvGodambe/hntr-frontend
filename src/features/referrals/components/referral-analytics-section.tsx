import { ReferralLinkCard } from "./referral-link-card";
import { ReferralNetworkChart } from "./referral-network-chart";

export function ReferralAnalyticsSection() {
  return (
    <section className="mb-6 grid gap-3 lg:grid-cols-[1fr_minmax(220px,280px)]">
      <ReferralNetworkChart />
      <ReferralLinkCard />
    </section>
  );
}
