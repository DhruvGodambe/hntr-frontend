import { Info } from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
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
    <div className="flex flex-col">
      <SignupStepHeader step={3} showProgress />

      <p className="mb-4 text-[9px] leading-relaxed text-t2">
        Choose a Membership tier that aligns with your capital deployment
        requirements and network expansion objectives. All tiers include full
        terminal access.
      </p>

      <Carousel className="mb-1" spaceBetween={8}>
        {signupTiers.map((tier) => (
          <SignupTierCard
            key={tier.id}
            tier={tier}
            onSelect={onSelect}
            className="w-[140px]"
          />
        ))}
      </Carousel>

      <div className="mt-4 flex gap-2 rounded-md border border-border bg-e3 p-3">
        <Info className="mt-0.5 size-3.5 shrink-0 text-t2" strokeWidth={1.75} />
        <p className="text-[8px] leading-relaxed text-t2">
          All tiers are subject to risk assessment and protocol parameters.
          Tiers 04 and 05 require additional KYC verification and institutional
          accreditation documentation prior to activation.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 font-mono text-[7px] uppercase tracking-[0.04em] text-t0">
        <button
          type="button"
          onClick={onPrevious}
          className="text-t2 transition-colors hover:text-t4"
        >
          ← Previous Step
        </button>
        <span>Current Status: Onboarding</span>
      </div>
    </div>
  );
}
