import type { SaleItem } from "@/features/dashboard/data/home-data";
import { nftPlaceholder } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

type NFTSaleCardProps = {
  sale: SaleItem;
};

export function NFTSaleCard({ sale }: NFTSaleCardProps) {
  return (
    <article
      data-slide
      className="relative w-full overflow-hidden rounded-xl border border-bd0 bg-e2 shadow-sh2 transition-transform duration-200 [box-shadow:var(--sh2),var(--glow)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-sh3 sm:rounded-md sm:border-0"
    >
      <span
        className={cn(
          "absolute left-1.75 top-1.75 z-[1] flex h-[18px] items-center rounded-[3px] px-1.5 font-mono text-[7px] font-bold tracking-[0.06em] backdrop-blur-sm sm:left-2 sm:top-2 sm:h-5 sm:px-2 sm:text-micro",
          sale.status === "SOLD"
            ? "bg-red/90 text-white sm:bg-accent sm:text-accent-ui-foreground"
            : "bg-e5 text-t3 shadow-sh1",
        )}
      >
        {sale.status}
      </span>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={nftPlaceholder(sale.imageSeed)}
        alt=""
        className="aspect-square w-full object-cover"
      />

      <div className="p-2.25 sm:p-3">
        <h3 className="mb-1.5 truncate font-mono text-[9px] font-bold text-t4 sm:text-label">
          {sale.name}
        </h3>
        <div className="hidden sm:block">
          <div className="mb-1 flex justify-between gap-2">
            <span className="text-caption uppercase text-t1">Bought</span>
            <span className="font-mono text-caption text-t3">
              {sale.boughtPrice}
            </span>
          </div>
          <div className="mb-1 flex justify-between gap-2">
            <span className="text-caption uppercase text-t1">Sale</span>
            <span className="font-mono text-caption text-t3">
              {sale.soldPrice}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="font-mono text-[7.5px] uppercase text-t1 sm:text-caption">
            Profit
          </span>
          <span className="font-mono text-[9px] font-bold text-green sm:text-caption">
            {sale.profit}
          </span>
        </div>
      </div>
    </article>
  );
}
