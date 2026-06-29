import { Carousel } from "@/components/ui/carousel";
import type { ListingItem } from "@/features/dashboard/data/home-data";
import { NFTListingCard } from "./nft-listing-card";
import { SectionHeader } from "./section-header";

type ListingsSectionProps = {
  title: string;
  subtitle?: string;
  actionLabel: string;
  actionHref: string;
  items: ListingItem[];
  headingId: string;
};

export function ListingsSection({
  title,
  subtitle,
  actionLabel,
  actionHref,
  items,
  headingId,
}: ListingsSectionProps) {
  return (
    <section className="mb-[22px]" aria-labelledby={headingId}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />
      <Carousel layout="cards">
        {items.map((listing) => (
          <NFTListingCard key={listing.id} listing={listing} />
        ))}
      </Carousel>
    </section>
  );
}
