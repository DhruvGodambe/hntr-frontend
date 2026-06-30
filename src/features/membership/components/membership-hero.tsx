import { PageHero } from "@/components/layout/page-hero";
import { membershipHero } from "@/features/membership/data/membership-data";

export function MembershipHero() {
  return (
    <PageHero
      variant="mosaic"
      title={membershipHero.title}
      subtitle={membershipHero.subtitle}
    />
  );
}
