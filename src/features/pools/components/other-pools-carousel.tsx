import Link from "next/link";
import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { resolvePoolCardImage } from "@/lib/images";

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
    <Link href={`/pools/${item.id}`} className="pool-thumb">
      <div className="pool-thumb-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvePoolCardImage(item.id, item.imageSeed)}
          alt=""
          className="pool-thumb-img"
        />
      </div>
      <div className="pool-thumb-info">
        <p className="pt-name">{item.name}</p>
        <p className="pt-activity">
          Activity: {item.activityCurrent}/{item.activityTarget} ETH ({percent}%)
        </p>
        <p className="pt-view">View →</p>
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
        <h2 className="font-display text-body-sm font-bold uppercase tracking-[0.1em] text-t4">
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
