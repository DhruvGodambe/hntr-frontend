import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/page-hero";
import { vaultHero } from "@/features/marketplace/data/vault-data";
import { heroBackgroundImage } from "@/lib/images";

export function VaultHero() {
  return (
    <PageHero
      variant="media"
      rounded
      className="mb-3.5"
      title={vaultHero.title}
      subtitle={vaultHero.subtitle}
      imageSrc={heroBackgroundImage()}
      action={
        <Button
          className="h-[30px] rounded-[5px] border-0 bg-[var(--inverse-btn-bg)] px-4 font-display text-body-sm font-bold normal-case tracking-normal text-[var(--inverse-btn-text)] shadow-sh2 hover:brightness-95"
          size="sm"
        >
          {vaultHero.cta}
        </Button>
      }
    />
  );
}
