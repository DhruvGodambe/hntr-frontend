import { infoHero } from "@/features/info/data/info-data";

export function InfoHero() {
  return (
    <header className="mb-5">
      <h1 className="font-display text-[22px] font-bold uppercase tracking-[0.08em] text-t4 sm:text-[26px]">
        {infoHero.title}
      </h1>
      <p className="mt-1 max-w-2xl text-[10px] leading-relaxed text-t2">
        {infoHero.subtitle}
      </p>
    </header>
  );
}
