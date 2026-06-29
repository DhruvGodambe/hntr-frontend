import { ActiveRewardsSection } from "./active-rewards-section";
import { NetworkPageHero } from "./network-page-hero";
import { ReferralAnalyticsSection } from "./referral-analytics-section";
import { ReferralProfileHeader } from "./referral-profile-header";
import { ReferralTransactionTable } from "./referral-transaction-table";

export function ReferralsHome() {
  return (
    <div className="-mx-3 -mt-4 flex flex-col pb-10 sm:-mx-4">
      <NetworkPageHero />
      <div className="px-3 pt-[18px] sm:px-5">
        <ReferralProfileHeader />
        <ActiveRewardsSection />
        <ReferralAnalyticsSection />
        <ReferralTransactionTable />
      </div>
    </div>
  );
}
