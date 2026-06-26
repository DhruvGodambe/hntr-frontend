import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SignupTier } from "@/features/auth/data/signup-data";
import { cn } from "@/lib/utils";

type SignupTierCardProps = {
  tier: SignupTier;
  onSelect: () => void;
  className?: string;
};

export function SignupTierCard({ tier, onSelect, className }: SignupTierCardProps) {
  const isRecommended = tier.recommended;

  return (
    <article
      className={cn(
        "relative flex min-w-[140px] flex-1 flex-col overflow-hidden rounded-md border border-border bg-e2",
        isRecommended && "border-t4",
        className,
      )}
    >
      {isRecommended && (
        <div className="absolute left-0 right-0 top-0 z-[1] flex justify-center">
          <span className="rounded-b-md bg-primary px-2 py-0.5 font-mono text-[6px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
            Recommended
          </span>
        </div>
      )}

      <div className={cn("flex flex-1 flex-col p-3", isRecommended && "pt-5")}>
        <p className="font-mono text-[7px] uppercase tracking-[0.06em] text-t0">
          {tier.tierLabel}
        </p>
        <h3 className="mb-2 font-display text-[11px] font-bold text-t4">
          {tier.name}
        </h3>
        <p className="mb-3 font-mono text-[16px] font-bold leading-none text-t4">
          ${tier.price.toLocaleString()}
        </p>

        <ul className="mb-3 flex flex-1 flex-col gap-1">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-1">
              <Check className="mt-px size-2.5 shrink-0 text-accent" strokeWidth={2.5} />
              <span className="text-[8px] leading-snug text-t2">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isRecommended ? "default" : "outline"}
          className="h-6 w-full font-mono text-[7px] normal-case tracking-normal"
          onClick={onSelect}
        >
          Select
        </Button>
      </div>
    </article>
  );
}
