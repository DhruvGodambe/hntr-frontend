import { Button } from "@/components/ui/button";
import { vaultHero } from "@/features/marketplace/data/vault-data";
import { heroBackgroundImage } from "@/lib/images";

export function VaultHero() {
  return (
    <section className="relative mb-3.5 flex h-[158px] overflow-hidden rounded-md bg-[var(--inverse-surface)] shadow-sh3">
      <div className="z-[1] flex flex-1 flex-col justify-center px-7 py-6">
        <h1 className="font-display text-[40px] font-bold leading-none tracking-[0.12em] text-[var(--inverse-foreground)]">
          {vaultHero.title}
        </h1>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.06em] text-[var(--inverse-foreground-muted)]">
          {vaultHero.subtitle}
        </p>
        <div className="mt-[18px]">
          <Button
            className="h-[30px] rounded-[5px] border-0 bg-[var(--inverse-btn-bg)] px-4 font-display text-[11px] font-bold normal-case tracking-normal text-[var(--inverse-btn-text)] shadow-sh2 hover:brightness-95"
            size="sm"
          >
            {vaultHero.cta}
          </Button>
        </div>
      </div>

      <div className="relative w-[320px] shrink-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroBackgroundImage()}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--inverse-surface)] to-transparent"
        />
      </div>
    </section>
  );
}
