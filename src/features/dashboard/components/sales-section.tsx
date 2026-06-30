import { Carousel } from "@/components/ui/carousel";
import type { SaleItem } from "@/features/dashboard/data/home-data";
import { NFTSaleCard } from "./nft-sale-card";
import { SectionHeader } from "./section-header";

type SalesSectionProps = {
  title: string;
  actionLabel: string;
  actionHref: string;
  items: SaleItem[];
  headingId: string;
};

export function SalesSection({
  title,
  actionLabel,
  actionHref,
  items,
  headingId,
}: SalesSectionProps) {
  return (
    <section className="mb-6 sm:mb-[22px]" aria-labelledby={headingId}>
      <SectionHeader
        title={title}
        subtitle="All NFTs sold by HNTR"
        actionLabel={actionLabel}
        actionHref={actionHref}
      />
      <div className="scrollable -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:hidden">
        {items.map((sale) => (
          <div key={sale.id} className="w-[132px] shrink-0">
            <NFTSaleCard sale={sale} />
          </div>
        ))}
      </div>
      <div className="hidden sm:block">
        <Carousel layout="cards" fadeRight>
          {items.map((sale) => (
            <NFTSaleCard key={sale.id} sale={sale} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
