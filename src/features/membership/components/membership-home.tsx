import { MembershipComparison } from "./membership-comparison";
import { MembershipHero } from "./membership-hero";
import { MembershipInfoCards } from "./membership-info-cards";
import { MembershipPackages } from "./membership-packages";

export function MembershipHome() {
  return (
    <div className="-mx-3 -mt-4 flex flex-col pb-10 sm:-mx-4">
      <MembershipHero />
      <div className="px-3 pt-[18px] sm:px-5">
        <MembershipPackages />
        <MembershipComparison />
        <MembershipInfoCards />
      </div>
    </div>
  );
}
