import { poolsHero } from "@/features/pools/data/pools-data";

const MOSAIC_CELLS = 60;

export function PoolsPageHero() {
  return (
    <section className="relative flex h-[158px] shrink-0 items-end overflow-hidden bg-[var(--inverse-surface)] shadow-[0_2px_12px_rgba(60,70,50,0.12)] dark:shadow-sh2">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 grid w-[340px] grid-cols-12 grid-rows-5 gap-px opacity-[0.18]"
        aria-hidden
      >
        {Array.from({ length: MOSAIC_CELLS }).map((_, index) => (
          <div
            key={index}
            className="bg-[var(--inverse-mosaic)]"
          />
        ))}
      </div>

      <div className="relative z-[1] px-7 py-6">
        <h1 className="font-display text-2xl font-bold leading-none tracking-[0.1em] text-[var(--inverse-foreground)]">
          {poolsHero.title}
        </h1>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.05em] text-[var(--inverse-foreground-muted)]">
          {poolsHero.subtitle}
        </p>
      </div>
    </section>
  );
}
