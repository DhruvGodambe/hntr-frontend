import { MembershipComparison } from "./membership-comparison";
import { MembershipHero } from "./membership-hero";
import { MembershipInfoCards } from "./membership-info-cards";
import { MembershipPackages } from "./membership-packages";

export function MembershipHome() {
  return (
    <div className="-mx-2 -mt-3 flex flex-col pb-8 sm:-mx-4 sm:-mt-4 sm:pb-10">
      <MembershipHero />
      <div className="px-2 pt-4 sm:px-5 sm:pt-[18px]">
        <MembershipPackages />
        <MembershipComparison />
        <MembershipInfoCards />
      </div>
    </div>
  );
}
