import Link from "next/link";
import { ActiveRewardsSection } from "./active-rewards-section";
import { ReferralAnalyticsSection } from "./referral-analytics-section";
import { ReferralProfileHeader } from "./referral-profile-header";
import { ReferralTransactionTable } from "./referral-transaction-table";

export function ReferralsHome() {
  return (
    <>
      <ReferralProfileHeader />
      <ActiveRewardsSection />
      <ReferralAnalyticsSection />
      <ReferralTransactionTable />
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 font-mono text-[8px] uppercase tracking-[0.06em] text-t0">
        <span>© 2024 HNTR INSTITUTIONAL | TERMINAL STATUS: OPTIMAL</span>
        <div className="flex gap-4">
          <Link href="/terms" className="transition-colors hover:text-t3">
            Terms of Service
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-t3">
            Privacy Policy
          </Link>
          <Link href="/risk" className="transition-colors hover:text-t3">
            Risk Disclosure
          </Link>
        </div>
      </footer>
    </>
  );
}
