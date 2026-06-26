import { MembershipComparison } from "./membership-comparison";
import { MembershipHero } from "./membership-hero";
import { MembershipInfoCards } from "./membership-info-cards";
import { MembershipPackages } from "./membership-packages";

export function MembershipHome() {
  return (
    <>
      <MembershipHero />
      <MembershipPackages />
      <MembershipComparison />
      <MembershipInfoCards />
      <footer className="border-t border-border pt-4 font-mono text-[8px] uppercase tracking-[0.06em] text-t0">
        © 2024 HNTR INSTITUTIONAL | TERMINAL STATUS: OPTIMAL
      </footer>
    </>
  );
}
