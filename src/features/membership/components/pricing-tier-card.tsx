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
        "tier-card-icon mt-px size-3 shrink-0 lg:size-2.5",
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
        "pricing-tier-card card-reveal relative flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--r)] p-4 shadow-[var(--sh1),var(--glow)] transition-[transform,box-shadow] duration-200 hover:z-[2] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-sh4 lg:p-3 lg:hover:scale-[1.01]",
        isRecommended
          ? "tier-card-recommended lg:hover:scale-[1.015]"
          : "tier-card-standard bg-e2",
      )}
      style={{ animationDelay: `${0.05 + index * 0.05}s` }}
    >
      {isRecommended && (
        <div className="tier-card-badge absolute left-1/2 top-0 -translate-x-1/2 rounded-b px-2.5 py-[3px] font-mono text-caption font-bold uppercase tracking-[0.1em] lg:px-2 lg:py-0.5 lg:text-micro lg:tracking-[0.08em]">
          RECOMMENDED
        </div>
      )}

      <div className="tier-card-label mb-1 mt-2 font-mono text-caption uppercase tracking-[0.1em] lg:text-micro lg:tracking-[0.08em]">
        {tier.tierLabel}
      </div>

      <h3 className="tier-card-title mb-2.5 font-display text-body-sm font-bold lg:mb-2 lg:text-caption">
        {tier.name}
      </h3>

      <div className="tier-card-price mb-2.5 flex items-baseline gap-0.5 font-mono text-[1.571rem] font-bold leading-none lg:mb-2 lg:text-heading-sm xl:text-body-sm">
        ${tier.price.toLocaleString()}
        <span className="tier-card-price-unit text-label font-normal lg:text-caption">
          USD
        </span>
      </div>

      <div className="tier-card-divider mb-3 h-px lg:mb-2.5" />

      <ul className="mb-3.5 flex flex-1 flex-col gap-[7px] lg:mb-3 lg:gap-1.5">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-1.5 lg:gap-1">
            <TierFeatureCheck recommended={isRecommended} />
            <span className="tier-card-feature text-caption leading-[1.3] lg:text-micro lg:leading-snug">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={cn(
          "h-[30px] w-full rounded-[5px] border-[1.5px] font-mono text-caption uppercase tracking-[0.08em] transition-colors lg:h-7 lg:text-micro lg:tracking-[0.06em]",
          isRecommended ? "tier-card-cta" : "tier-card-cta-standard",
        )}
      >
        {isRecommended ? "PURCHASE" : "SELECT"}
      </button>
    </article>
  );
}
