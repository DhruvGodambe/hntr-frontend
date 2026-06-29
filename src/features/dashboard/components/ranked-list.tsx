import type { ReactNode } from "react";
import type { RankedCollection } from "@/features/dashboard/data/home-data";
import { nftPlaceholder } from "@/lib/placeholders";

type RankedListProps = {
  title: string;
  icon: ReactNode;
  items: RankedCollection[];
  variant: "change" | "volume";
};

function ChangeIndicator({ change }: { change: number }) {
  const formatted = Math.abs(change).toFixed(2);

  if (change > 0) {
    return (
      <span className="shrink-0 font-mono text-label font-bold text-green">
        ↑ {formatted} %
      </span>
    );
  }

  if (change < 0) {
    return (
      <span className="shrink-0 font-mono text-label font-bold text-red">
        ↓ {formatted} %
      </span>
    );
  }

  return (
    <span className="shrink-0 font-mono text-label font-bold text-t1">
      - 0.00 %
    </span>
  );
}

function RankedListItem({
  item,
  variant,
}: {
  item: RankedCollection;
  variant: "change" | "volume";
}) {
  return (
    <li className="flex items-center gap-2 border-b-[0.5px] border-[var(--cream-dark)] py-1.5 last:border-b-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={nftPlaceholder(item.imageSeed, 40)}
        alt=""
        className="size-6 shrink-0 rounded-[3px] bg-[var(--sage-faint)] object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-label font-medium text-t3">{item.name}</p>
        <p className="font-mono text-caption text-t1">
          {variant === "volume" ? (
            <>
              Floor: {item.floorPrice} Ξ - Vol: {item.volume24h}
            </>
          ) : (
            <>Floor: {item.floorPrice} Ξ</>
          )}
        </p>
      </div>
      {variant === "change" && item.change !== undefined && (
        <ChangeIndicator change={item.change} />
      )}
    </li>
  );
}

export function RankedList({ title, icon, items, variant }: RankedListProps) {
  return (
    <div className="min-w-0">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="font-mono text-caption font-semibold uppercase tracking-[0.08em] text-t1">
          {title}
        </h3>
        <span className="text-t1 [&_svg]:size-3.5">{icon}</span>
      </div>
      <ul>
        {items.map((item) => (
          <RankedListItem key={item.id} item={item} variant={variant} />
        ))}
      </ul>
    </div>
  );
}
