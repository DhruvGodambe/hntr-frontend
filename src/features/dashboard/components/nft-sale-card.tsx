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
          "absolute left-1.5 top-1.5 z-[1] flex h-4 items-center rounded-[3px] px-1.5 font-mono text-[7px] font-bold tracking-[0.06em] backdrop-blur-sm",
          sale.status === "SOLD"
            ? "bg-[var(--olive)] text-[var(--cream)]"
            : "bg-[rgba(242,239,234,0.9)] text-accent shadow-sh1",
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

      <div className="p-2 pb-2.5">
        <h3 className="mb-1 font-mono text-[9px] font-bold text-t4">
          {sale.name}
        </h3>
        <div className="mb-0.5 flex justify-between">
          <span className="text-[8px] uppercase text-t0">Bought</span>
          <span className="font-mono text-[8px] text-t2">{sale.boughtPrice}</span>
        </div>
        <div className="mb-0.5 flex justify-between">
          <span className="text-[8px] uppercase text-t0">Sale</span>
          <span className="font-mono text-[8px] text-t2">{sale.soldPrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[8px] uppercase text-t0">Profit</span>
          <span className="font-mono text-[8px] text-green">{sale.profit}</span>
        </div>
      </div>
    </article>
  );
}
