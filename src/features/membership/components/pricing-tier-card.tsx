import type { MembershipTier } from "@/features/membership/data/membership-data";
import { cn } from "@/lib/utils";

type PricingTierCardProps = {
  tier: MembershipTier;
  index?: number;
};

function TierFeatureCheck({ recommended }: { recommended?: boolean }) {
  return (
    <svg
      className={cn(
        "tier-card-icon mt-px size-3 shrink-0",
        !recommended && "text-green",
      )}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M3.5 6l1.5 1.5L8.5 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PricingTierCard({ tier, index = 0 }: PricingTierCardProps) {
  const isRecommended = tier.recommended;

  return (
    <article
      className={cn(
        "card-reveal relative flex flex-col overflow-hidden rounded-[var(--r)] p-4 shadow-[var(--sh1),var(--glow)] transition-[transform,box-shadow] duration-200 hover:z-[2] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-sh4",
        isRecommended
          ? "tier-card-recommended hover:scale-[1.025]"
          : "bg-e2",
      )}
      style={{ animationDelay: `${0.05 + index * 0.05}s` }}
    >
      {isRecommended && (
        <div className="tier-card-badge absolute left-1/2 top-0 -translate-x-1/2 rounded-b px-2.5 py-[3px] font-mono text-caption font-bold uppercase tracking-[0.1em]">
          RECOMMENDED
        </div>
      )}

      <div
        className={cn(
          "tier-card-label mb-1 mt-2 font-mono text-caption uppercase tracking-[0.1em]",
          !isRecommended && "text-t0",
        )}
      >
        {tier.tierLabel}
      </div>

      <h3
        className={cn(
          "tier-card-title mb-2.5 font-display text-body-sm font-bold",
          !isRecommended && "text-t4",
        )}
      >
        {tier.name}
      </h3>

      <div
        className={cn(
          "tier-card-price mb-2.5 flex items-baseline gap-0.5 font-mono text-[1.571rem] font-bold leading-none",
          !isRecommended && "text-t4",
        )}
      >
        ${tier.price.toLocaleString()}
        <span
          className={cn(
            "tier-card-price-unit text-label font-normal",
            !isRecommended && "text-t2",
          )}
        >
          USD
        </span>
      </div>

      <div
        className={cn(
          "tier-card-divider mb-3 h-px",
          !isRecommended && "bg-bd0",
        )}
      />

      <ul className="mb-3.5 flex flex-1 flex-col gap-[7px]">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-1.5">
            <TierFeatureCheck recommended={isRecommended} />
            <span
              className={cn(
                "tier-card-feature text-caption leading-[1.3]",
                !isRecommended && "text-t2",
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={cn(
          "h-[30px] w-full rounded-[5px] border-[1.5px] font-mono text-caption uppercase tracking-[0.08em] transition-colors",
          isRecommended
            ? "tier-card-cta"
            : "border-[var(--cream-dark)] bg-transparent text-t2 hover:border-[var(--sage-faint)] hover:bg-[var(--sage-faint)] hover:text-t4 dark:border-[rgba(168,181,162,0.15)]",
        )}
      >
        {isRecommended ? "PURCHASE" : "SELECT"}
      </button>
    </article>
  );
}
