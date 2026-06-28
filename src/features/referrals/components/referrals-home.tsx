import { ActiveRewardsSection } from "./active-rewards-section";
import { NetworkPageHero } from "./network-page-hero";
import { ReferralAnalyticsSection } from "./referral-analytics-section";
import { ReferralProfileHeader } from "./referral-profile-header";
import { ReferralTransactionTable } from "./referral-transaction-table";

export function ReferralsHome() {
  return (
    <div className="-mx-4 -mt-4 flex flex-col pb-10">
      <div className="px-[18px] pt-[18px]">
        <NetworkPageHero />
        <ReferralProfileHeader />
        <ActiveRewardsSection />
        <ReferralAnalyticsSection />
        <ReferralTransactionTable />
      </div>
    </div>
  );
}
