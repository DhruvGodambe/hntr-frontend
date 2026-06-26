import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MembershipTier } from "@/features/membership/data/membership-data";
import { cn } from "@/lib/utils";

type PricingTierCardProps = {
  tier: MembershipTier;
  className?: string;
};

export function PricingTierCard({ tier, className }: PricingTierCardProps) {
  const isRecommended = tier.recommended;

  return (
    <article
      className={cn(
        "relative flex min-w-[168px] flex-1 flex-col overflow-hidden rounded-md border border-border bg-e2 shadow-sh1",
        isRecommended && "border-t4 shadow-sh2",
        className,
      )}
    >
      {isRecommended && (
        <div className="absolute left-0 right-0 top-0 z-[1] flex justify-center">
          <span className="rounded-b-md bg-primary px-3 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
            Recommended
          </span>
        </div>
      )}

      <div className={cn("flex flex-1 flex-col p-4", isRecommended && "pt-6")}>
        <div className="mb-3">
          <h3 className="font-display text-[13px] font-bold text-t4">{tier.name}</h3>
          <p className="font-mono text-[8px] uppercase tracking-[0.06em] text-t0">
            {tier.tierLabel}
          </p>
        </div>

        <div className="mb-4">
          <p className="font-mono text-[22px] font-bold leading-none text-t4">
            ${tier.price.toLocaleString()}
          </p>
          <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.04em] text-t0">
            USD
          </p>
        </div>

        <ul className="mb-4 flex flex-1 flex-col gap-1.5">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-1.5">
              <Check
                className="mt-px size-3 shrink-0 text-accent"
                strokeWidth={2.5}
                aria-hidden
              />
              <span className="text-[9px] leading-snug text-t2">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isRecommended ? "default" : "outline"}
          className={cn(
            "h-7 w-full font-mono text-[8px] normal-case tracking-normal",
            isRecommended && "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          {isRecommended ? "Purchase" : "Select"}
        </Button>
      </div>
    </article>
  );
}
