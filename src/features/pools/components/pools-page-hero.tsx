import { poolsHero } from "@/features/pools/data/pools-data";

export function PoolsPageHero() {
  return (
    <header className="mb-4">
      <h1 className="font-display text-[22px] font-bold uppercase tracking-[0.08em] text-t4 sm:text-[26px]">
        {poolsHero.title}
      </h1>
      <p className="mt-1 max-w-xl text-[10px] leading-relaxed text-t2">
        {poolsHero.subtitle}
      </p>
    </header>
  );
}
