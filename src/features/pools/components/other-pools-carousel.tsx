import Link from "next/link";
import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { nftPlaceholder } from "@/lib/placeholders";

type OtherPoolsCarouselProps = {
  pool: PoolDetail;
};

function PoolThumbCard({
  item,
}: {
  item: PoolDetail["otherPools"][number];
}) {
  const percent = Math.round(
    (item.activityCurrent / item.activityTarget) * 100,
  );

  return (
    <Link
      href={`/pools/${item.id}`}
      className="pool-thumb flex w-[200px] shrink-0 cursor-pointer items-center overflow-hidden rounded-md bg-e2 shadow-[var(--sh1),var(--glow)] transition-[transform,box-shadow] duration-200 hover:relative hover:z-[1] hover:scale-[1.04] hover:shadow-sh3"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={nftPlaceholder(item.imageSeed, 104)}
        alt=""
        className="size-[52px] shrink-0 object-cover"
      />
      <div className="min-w-0 flex-1 px-2.5 py-2">
        <p className="mb-[3px] truncate font-display text-[10px] font-bold text-t4">
          {item.name}
        </p>
        <p className="font-mono text-[8px] text-t1">
          Activity: {item.activityCurrent}/{item.activityTarget} ETH ({percent}%)
        </p>
        <p className="mt-[3px] font-mono text-[8px] text-t4">View →</p>
      </div>
    </Link>
  );
}

export function OtherPoolsCarousel({ pool }: OtherPoolsCarouselProps) {
  const items = pool.otherPools;
  const trackItems = [...items, ...items];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 mt-4">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.1em] text-t1">
          Other Available Pools
        </h2>
      </div>

      <div className="carousel-outer group relative mb-2.5 overflow-hidden">
        <div className="carousel-track flex w-max gap-2.5">
          {trackItems.map((item, index) => (
            <PoolThumbCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
