import type { MembershipTier } from "@/features/membership/data/membership-data";
import { cn } from "@/lib/utils";

type PricingTierCardProps = {
  tier: MembershipTier;
};

function TierFeatureCheck({ recommended }: { recommended?: boolean }) {
  return (
    <svg
      className={cn(
        "mt-px size-3 shrink-0",
        recommended ? "text-[var(--inverse-foreground-faint)]" : "text-green",
      )}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <circle
        cx="6"
        cy="6"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity={recommended ? 0.85 : 1}
      />
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

export function PricingTierCard({ tier }: PricingTierCardProps) {
  const isRecommended = tier.recommended;

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-md p-4 shadow-[var(--sh1),var(--glow)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-sh2",
        isRecommended
          ? "bg-[var(--inverse-surface)] shadow-sh3"
          : "bg-e2",
      )}
    >
      {isRecommended && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b bg-beige px-2.5 py-[3px] font-mono text-[7px] font-bold uppercase tracking-[0.1em] text-[var(--inverse-btn-text)]">
          RECOMMENDED
        </div>
      )}

      <div
        className={cn(
          "mb-1 mt-2 font-mono text-[8px] uppercase tracking-[0.1em]",
          isRecommended
            ? "text-[var(--inverse-foreground-subtle)]"
            : "text-t0",
        )}
      >
        {tier.tierLabel}
      </div>

      <h3
        className={cn(
          "mb-2.5 font-display text-base font-bold",
          isRecommended ? "text-[var(--inverse-foreground)]" : "text-t4",
        )}
      >
        {tier.name}
      </h3>

      <div
        className={cn(
          "mb-2.5 flex items-baseline gap-0.5 font-mono text-[22px] font-bold leading-none",
          isRecommended ? "text-[var(--inverse-foreground)]" : "text-t4",
        )}
      >
        ${tier.price.toLocaleString()}
        <span
          className={cn(
            "text-[10px] font-normal",
            isRecommended
              ? "text-[var(--inverse-foreground-faint)]"
              : "text-t2",
          )}
        >
          USD
        </span>
      </div>

      <div
        className={cn(
          "mb-3.5 h-px",
          isRecommended ? "bg-[var(--inverse-divider)]" : "bg-bd0",
        )}
      />

      <ul className="mb-3.5 flex flex-1 flex-col gap-[7px]">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-1.5">
            <TierFeatureCheck recommended={isRecommended} />
            <span
              className={cn(
                "text-[10px] leading-[1.3]",
                isRecommended
                  ? "text-[var(--inverse-foreground)]"
                  : "text-t2",
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
          "h-[30px] w-full rounded-[5px] border font-mono text-[9px] uppercase tracking-[0.08em] transition-colors",
          isRecommended
            ? "border-transparent bg-[var(--inverse-btn-bg)] font-bold text-[var(--inverse-btn-text)] hover:brightness-95 dark:hover:brightness-90"
            : "border-bd1 bg-transparent text-t2 hover:border-bd2 hover:bg-e3 hover:text-t4",
        )}
      >
        {isRecommended ? "PURCHASE" : "SELECT"}
      </button>
    </article>
  );
}
