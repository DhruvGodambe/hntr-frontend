import { Check } from "lucide-react";
import type { SignupTier } from "@/features/auth/data/signup-data";
import { cn } from "@/lib/utils";

type SignupTierCardProps = {
  tier: SignupTier;
  onSelect: () => void;
  index?: number;
  className?: string;
};

export function SignupTierCard({
  tier,
  onSelect,
  index = 0,
  className,
}: SignupTierCardProps) {
  const isRecommended = tier.recommended;

  return (
    <article
      className={cn(
        "signup-tier-card card-reveal relative flex h-full flex-col overflow-hidden rounded-[var(--r)] shadow-[var(--sh1),var(--glow)] transition-shadow duration-200 hover:shadow-sh3",
        isRecommended ? "tier-card-recommended" : "border border-bd0 bg-e2",
        className,
      )}
      style={{ animationDelay: `${0.05 + index * 0.05}s` }}
    >
      {isRecommended && (
        <div className="signup-tier-badge tier-card-badge absolute left-1/2 top-0 -translate-x-1/2 rounded-b px-2 py-0.5 font-mono font-bold uppercase tracking-[0.1em]">
          Recommended
        </div>
      )}

      <div className={cn("flex flex-1 flex-col p-3", isRecommended && "pt-5")}>
        <p
          className={cn(
            "signup-tier-label tier-card-label mb-0.5 font-mono uppercase tracking-[0.1em]",
            !isRecommended && "text-t0",
          )}
        >
          {tier.tierLabel}
        </p>
        <h3
          className={cn(
            "signup-tier-name tier-card-title mb-1.5 font-display font-bold",
            !isRecommended && "text-t4",
          )}
        >
          {tier.name}
        </h3>
        <p
          className={cn(
            "signup-tier-price tier-card-price mb-2 font-mono font-bold leading-none",
            !isRecommended && "text-t4",
          )}
        >
          ${tier.price.toLocaleString()}
        </p>

        <ul className="mb-3 flex min-w-0 flex-1 flex-col gap-1">
          {tier.features.map((feature) => (
            <li key={feature} className="flex min-w-0 items-center gap-1">
              <Check
                className={cn(
                  "signup-tier-check mt-px shrink-0",
                  isRecommended ? "tier-card-icon" : "text-green",
                )}
                strokeWidth={2.25}
              />
              <span
                className={cn(
                  "signup-tier-feature",
                  isRecommended ? "tier-card-feature" : "text-t2",
                )}
                title={feature}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={cn(
            "signup-tier-cta w-full rounded-md font-mono font-bold transition-colors",
            isRecommended
              ? "tier-card-cta"
              : "border border-bd0 bg-e3 text-t4 hover:bg-[var(--sage-faint)]",
          )}
          onClick={onSelect}
        >
          Select
        </button>
      </div>
    </article>
  );
}
