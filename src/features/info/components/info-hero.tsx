import { infoHero } from "@/features/info/data/info-data";

export function InfoHero() {
  return (
    <header className="mb-5">
      <h1 className="font-display text-[clamp(1.25rem,4.8vw,1.571rem)] font-bold uppercase tracking-[0.08em] text-t4">
        {infoHero.title}
      </h1>
      <p className="mt-1 max-w-2xl text-[clamp(0.8125rem,3.1vw,0.929rem)] leading-relaxed text-t2">
        {infoHero.subtitle}
      </p>
    </header>
  );
}
