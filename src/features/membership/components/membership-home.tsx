import { MembershipComparison } from "./membership-comparison";
import { MembershipHero } from "./membership-hero";
import { MembershipInfoCards } from "./membership-info-cards";
import { MembershipPackages } from "./membership-packages";

export function MembershipHome() {
  return (
    <div className="-mx-4 -mt-4 flex flex-col pb-10">
      <div className="px-5 pt-[18px]">
        <MembershipHero />
        <MembershipPackages />
        <MembershipComparison />
        <MembershipInfoCards />
      </div>
    </div>
  );
}
