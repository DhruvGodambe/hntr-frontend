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
      className="relative w-full overflow-hidden rounded-md bg-e2 shadow-sh2 transition-transform duration-200 [box-shadow:var(--sh2),var(--glow)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-sh3"
    >
      <span
        className={cn(
          "absolute left-2 top-2 z-[1] flex h-5 items-center rounded-[3px] px-2 font-mono text-micro font-bold tracking-[0.06em] backdrop-blur-sm",
          sale.status === "SOLD"
            ? "bg-accent text-accent-ui-foreground"
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

      <div className="p-2.5 sm:p-3">
        <h3 className="mb-1.5 font-mono text-label font-bold text-t4">
          {sale.name}
        </h3>
        <div className="mb-1 flex justify-between gap-2">
          <span className="text-caption uppercase text-t1">Bought</span>
          <span className="font-mono text-caption text-t3">{sale.boughtPrice}</span>
        </div>
        <div className="mb-1 flex justify-between gap-2">
          <span className="text-caption uppercase text-t1">Sale</span>
          <span className="font-mono text-caption text-t3">{sale.soldPrice}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-caption uppercase text-t1">Profit</span>
          <span className="font-mono text-caption font-semibold text-green">
            {sale.profit}
          </span>
        </div>
      </div>
    </article>
  );
}
