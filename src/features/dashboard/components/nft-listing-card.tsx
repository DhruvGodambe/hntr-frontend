import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ListingItem } from "@/features/dashboard/data/home-data";
import { nftPlaceholder } from "@/lib/placeholders";

type NFTListingCardProps = {
  listing: ListingItem;
};

export function NFTListingCard({ listing }: NFTListingCardProps) {
  return (
    <article
      data-slide
      className="w-full overflow-hidden rounded-md bg-e2 shadow-sh2 transition-transform duration-200 [box-shadow:var(--sh2),var(--glow)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-sh3"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={nftPlaceholder(listing.imageSeed)}
        alt=""
        className="aspect-square w-full object-cover"
      />
      <div className="p-2 pb-2.5">
        <h3 className="mb-1.5 font-mono text-[9px] font-bold text-t4">
          {listing.name}
        </h3>
        <div className="mb-0.5 flex justify-between">
          <span className="text-[8px] uppercase tracking-[0.04em] text-t0">
            Bought
          </span>
          <span className="font-mono text-[8px] text-t2">
            {listing.boughtPrice}
          </span>
        </div>
        <div className="mb-0.5 flex justify-between">
          <span className="text-[8px] uppercase tracking-[0.04em] text-t0">
            Sell
          </span>
          <span className="font-mono text-[8px] text-green">
            {listing.sellPrice}
          </span>
        </div>
        <Button
          variant="secondary"
          className="mt-1.5 h-[22px] w-full rounded-[3px] font-mono text-[8px] normal-case tracking-normal"
          asChild
        >
          <Link href="/marketplace">View Listing</Link>
        </Button>
      </div>
    </article>
  );
}
