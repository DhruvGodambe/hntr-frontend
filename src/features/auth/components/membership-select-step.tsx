import { Info } from "lucide-react";
import { signupTiers } from "@/features/auth/data/signup-data";
import { SignupStepHeader } from "./signup-step-header";
import { SignupTierCard } from "./signup-tier-card";

type MembershipSelectStepProps = {
  onSelect: () => void;
  onPrevious: () => void;
};

export function MembershipSelectStep({
  onSelect,
  onPrevious,
}: MembershipSelectStepProps) {
  return (
    <div className="flex min-h-0 flex-col">
      <SignupStepHeader step={3} showProgress />

      <div className="mb-4">
        <h2 className="font-display text-heading-sm font-bold text-t4">
          Choose Membership
        </h2>
        <p className="mt-1 text-label leading-relaxed text-t2">
          Choose a membership tier that aligns with your capital deployment
          requirements and network expansion objectives. All tiers include full
          terminal access.
        </p>
      </div>

      <div className="signup-tier-grid mb-3 grid grid-cols-2 gap-2 min-[520px]:grid-cols-3 lg:grid-cols-5 lg:gap-2.5">
        {signupTiers.map((tier, index) => (
          <SignupTierCard
            key={tier.id}
            tier={tier}
            onSelect={onSelect}
            index={index}
          />
        ))}
      </div>

      <div className="flex gap-3 rounded-[var(--r)] border border-bd0 bg-e3 p-3 shadow-sh1">
        <Info className="mt-0.5 size-4 shrink-0 text-t2" strokeWidth={1.75} />
        <p className="text-caption leading-relaxed text-t2">
          All tiers are subject to risk assessment and protocol parameters.
          Tiers 04 and 05 require additional KYC verification and institutional
          accreditation documentation prior to activation.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-bd0 pt-3 font-mono text-micro uppercase tracking-[0.06em] text-t0">
        <button
          type="button"
          onClick={onPrevious}
          className="text-label text-t2 transition-colors hover:text-t4"
        >
          ← Previous Step
        </button>
        <span>Current Status: Onboarding</span>
      </div>
    </div>
  );
}
