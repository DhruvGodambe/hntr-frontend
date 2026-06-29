import { collectionStats } from "@/features/my-nfts/data/collection-data";

export function CollectionStatsRow() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {collectionStats.map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className="rounded-[var(--r)] border border-bd1 bg-e2 px-3.5 py-3 shadow-[var(--sh1),var(--glow)]"
        >
          <p className="mb-1 font-mono text-caption uppercase tracking-[0.08em] text-t0">
            {stat.label}
          </p>
          <p className="font-mono text-stat font-bold leading-none text-t4">
            {stat.value}
            {"unit" in stat && (
              <span className="ml-1 text-label font-normal text-t2">{stat.unit}</span>
            )}
          </p>
          {"sub" in stat && stat.sub && (
            <p className="mt-1 font-mono text-caption text-t1">{stat.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
