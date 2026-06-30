import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/page-hero";
import { heroContent } from "@/features/dashboard/data/home-data";
import { heroBackgroundImage } from "@/lib/images";

export function DashboardHero() {
  return (
    <div className="mb-3.5 flex flex-col overflow-hidden rounded-xl border border-bd0 bg-e2 p-[22px_18px] sm:p-0">
      <div className="sm:hidden">
        <h1 className="font-display text-[30px] font-bold leading-none tracking-[0.06em] text-t4">
          {heroContent.title}
        </h1>
        <p className="mt-[9px] font-mono text-[11px] uppercase tracking-[0.04em] text-t1">
          {heroContent.subtitle}
        </p>
        <Button
          className="mt-4 h-10 rounded-lg border-0 bg-primary px-[22px] font-display text-[13px] font-bold text-primary-foreground shadow-none hover:bg-primary/90"
          size="sm"
        >
          {heroContent.cta}
        </Button>
      </div>
      <div className="hidden sm:block">
        <PageHero
          variant="media"
          rounded
          title={heroContent.title}
          subtitle={heroContent.subtitle}
          imageSrc={heroBackgroundImage()}
          action={
            <Button
              className="h-[30px] rounded-[5px] border-0 bg-[var(--inverse-btn-bg)] px-4 font-display text-body-sm font-bold normal-case tracking-normal text-[var(--inverse-btn-text)] shadow-sh2 hover:brightness-95"
              size="sm"
            >
              {heroContent.cta}
            </Button>
          }
        />
      </div>
    </div>
  );
}
