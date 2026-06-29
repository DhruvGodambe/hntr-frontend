import { poolsHero } from "@/features/pools/data/pools-data";

const MOSAIC_CELLS = 60;

export function PoolsPageHero() {
  return (
    <section className="relative flex min-h-[120px] shrink-0 items-end overflow-hidden bg-[var(--inverse-surface)] shadow-[0_2px_12px_rgba(60,70,50,0.12)] dark:shadow-sh2 sm:h-[158px]">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 grid w-[200px] grid-cols-12 grid-rows-5 gap-px opacity-[0.18] sm:w-[340px]"
        aria-hidden
      >
        {Array.from({ length: MOSAIC_CELLS }).map((_, index) => (
          <div key={index} className="bg-[var(--inverse-mosaic)]" />
        ))}
      </div>

      <div className="relative z-[1] px-5 py-5 sm:px-7 sm:py-6">
        <h1 className="font-display text-heading font-bold leading-none tracking-[0.1em] text-[var(--inverse-foreground)]">
          {poolsHero.title}
        </h1>
        <p className="mt-1.5 text-label text-[var(--inverse-foreground-muted)]">
          {poolsHero.subtitle}
        </p>
      </div>
    </section>
  );
}
