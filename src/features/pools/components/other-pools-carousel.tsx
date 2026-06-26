import Link from "next/link";
import { Carousel } from "@/components/ui/carousel";
import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { nftPlaceholder } from "@/lib/placeholders";

type OtherPoolsCarouselProps = {
  pool: PoolDetail;
};

export function OtherPoolsCarousel({ pool }: OtherPoolsCarouselProps) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4">
        Other Available Pools
      </h2>

      <Carousel spaceBetween={12}>
        {pool.otherPools.map((item) => {
          const percent = Math.round(
            (item.activityCurrent / item.activityTarget) * 100,
          );

          return (
            <article
              key={item.id}
              className="flex w-[168px] flex-col overflow-hidden rounded-md border border-border bg-e2 shadow-sh1 sm:w-[200px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nftPlaceholder(item.imageSeed, 200)}
                alt=""
                className="h-[72px] w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-2.5">
                <h3 className="mb-1 font-display text-[10px] font-bold leading-tight text-t4">
                  {item.name}
                </h3>
                <p className="mb-2 font-mono text-[8px] text-t2">
                  Activity: {item.activityCurrent} / {item.activityTarget} ETH (
                  {percent}%)
                </p>
                <Link
                  href={`/pools/${item.id}`}
                  className="mt-auto font-mono text-[8px] uppercase tracking-[0.06em] text-t3 transition-colors hover:text-t4"
                >
                  View
                </Link>
              </div>
            </article>
          );
        })}
      </Carousel>
    </section>
  );
}
