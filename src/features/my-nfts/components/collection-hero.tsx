import { collectionHero } from "@/features/my-nfts/data/collection-data";

const MOSAIC_CELLS = 60;

export function CollectionHero() {
  return (
    <section className="relative mb-0 flex min-h-[120px] shrink-0 items-end overflow-hidden bg-[var(--inverse-surface)] shadow-sh2 sm:h-[158px]">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 grid w-[200px] grid-cols-12 grid-rows-5 gap-px opacity-[0.18] sm:w-[340px]"
        aria-hidden
      >
        {Array.from({ length: MOSAIC_CELLS }).map((_, index) => (
          <div key={index} className="bg-[var(--inverse-mosaic)]" />
        ))}
      </div>

      <div className="relative z-[1] px-5 py-5 sm:px-7 sm:py-6">
        <h1 className="font-display text-heading font-bold leading-none tracking-[0.08em] text-[var(--inverse-foreground)]">
          {collectionHero.title}
        </h1>
        <p className="mt-1.5 text-body-sm tracking-[0.02em] text-[var(--inverse-foreground-muted)]">
          {collectionHero.subtitle}
        </p>
      </div>
    </section>
  );
}
