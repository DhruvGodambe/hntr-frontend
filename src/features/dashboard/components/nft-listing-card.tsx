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
      className="relative w-full overflow-hidden rounded-xl border border-bd0 bg-e2 shadow-sh2 transition-transform duration-200 [box-shadow:var(--sh2),var(--glow)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-sh3 sm:rounded-md sm:border-0"
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={nftPlaceholder(listing.imageSeed)}
          alt=""
          className="aspect-square w-full object-cover"
        />
        <div className="absolute right-1.75 top-1.75 sm:static">
          <MarketplaceSourceLogo source={listing.source} />
        </div>
      </div>
      <div className="p-[10px_11px_11px] sm:p-3">
        <h3 className="mb-2 truncate font-mono text-[9px] font-bold text-t4 sm:text-label">
          {listing.name}
        </h3>
        <div className="mb-1 flex justify-between gap-2">
          <span className="font-mono text-[7.5px] uppercase tracking-[0.04em] text-t1 sm:text-caption">
            Bought
          </span>
          <span className="font-mono text-[8px] text-t3 sm:text-caption">
            {listing.boughtPrice}
          </span>
        </div>
        <div className="mb-1 flex justify-between gap-2">
          <span className="font-mono text-[7.5px] uppercase tracking-[0.04em] text-t1 sm:text-caption">
            Sell
          </span>
          <span className="font-mono text-[8px] font-semibold text-green">
            {listing.sellPrice}
          </span>
        </div>
        <Button
          variant="secondary"
          className="mt-2 hidden h-7 w-full rounded-[3px] font-mono text-caption normal-case tracking-normal sm:flex"
          asChild
        >
          <Link href="/marketplace">View Listing</Link>
        </Button>
      </div>
    </article>
  );
}
