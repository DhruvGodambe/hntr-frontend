import { ActiveRewardsSection } from "./active-rewards-section";
import { NetworkPageHero } from "./network-page-hero";
import { ReferralAnalyticsSection } from "./referral-analytics-section";
import { ReferralProfileHeader } from "./referral-profile-header";
import { ReferralTransactionTable } from "./referral-transaction-table";

export function ReferralsHome() {
  return (
    <div className="-mx-2 -mt-3 flex flex-col pb-8 sm:-mx-4 sm:-mt-4 sm:pb-10">
      <NetworkPageHero />
      <div className="px-2 pt-4 sm:px-5 sm:pt-[18px]">
        <ReferralProfileHeader />
        <ActiveRewardsSection />
        <ReferralAnalyticsSection />
        <ReferralTransactionTable />
      </div>
    </div>
  );
}
