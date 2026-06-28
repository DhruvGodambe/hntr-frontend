import { membershipHero } from "@/features/membership/data/membership-data";

const MOSAIC_CELLS = 60;

export function MembershipHero() {
  return (
    <section className="relative mb-[18px] flex h-[158px] shrink-0 items-end overflow-hidden rounded-md bg-[var(--inverse-surface)] shadow-sh2">
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
          {membershipHero.title}
        </h1>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.05em] text-[var(--inverse-foreground-muted)]">
          {membershipHero.subtitle}
        </p>
      </div>
    </section>
  );
}
