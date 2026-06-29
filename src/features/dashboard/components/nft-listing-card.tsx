import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketplaceSourceLogo } from "@/features/dashboard/components/marketplace-source-logo";
import type { ListingItem } from "@/features/dashboard/data/home-data";
import { nftPlaceholder } from "@/lib/placeholders";

type NFTListingCardProps = {
  listing: ListingItem;
};

export function NFTListingCard({ listing }: NFTListingCardProps) {
  return (
    <article
      data-slide
      className="relative w-full overflow-hidden rounded-md bg-e2 shadow-sh2 transition-transform duration-200 [box-shadow:var(--sh2),var(--glow)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-sh3"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={nftPlaceholder(listing.imageSeed)}
        alt=""
        className="aspect-square w-full object-cover"
      />
      <MarketplaceSourceLogo source={listing.source} />
      <div className="p-2.5 sm:p-3">
        <h3 className="mb-2 font-mono text-label font-bold text-t4">
          {listing.name}
        </h3>
        <div className="mb-1 flex justify-between gap-2">
          <span className="text-caption uppercase tracking-[0.04em] text-t1">
            Bought
          </span>
          <span className="font-mono text-caption text-t3">
            {listing.boughtPrice}
          </span>
        </div>
        <div className="mb-1 flex justify-between gap-2">
          <span className="text-caption uppercase tracking-[0.04em] text-t1">
            Sell
          </span>
          <span className="font-mono text-caption font-semibold text-green">
            {listing.sellPrice}
          </span>
        </div>
        <Button
          variant="secondary"
          className="mt-2 h-7 w-full rounded-[3px] font-mono text-caption normal-case tracking-normal"
          asChild
        >
          <Link href="/marketplace">View Listing</Link>
        </Button>
      </div>
    </article>
  );
}
