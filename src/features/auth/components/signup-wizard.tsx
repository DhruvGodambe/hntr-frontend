"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConnectWizard } from "@/features/auth/context/connect-wizard-context";
import { ConnectWalletStep } from "./connect-wallet-step";
import { MembershipSelectStep } from "./membership-select-step";
import { UserInfoStep } from "./user-info-step";
import { cn } from "@/lib/utils";

export function SignupWizard() {
  const {
    isOpen,
    step,
    closeWizard,
    setStep,
    connectWallet,
    completeOnboarding,
  } = useConnectWizard();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeWizard()}>
      <DialogContent
        className={cn(
          "gap-0 p-5 sm:rounded-md",
          step === 3 ? "max-w-[min(96vw,920px)]" : "max-w-md",
        )}
      >
        <DialogTitle className="sr-only">
          Sign up step {step} of 3
        </DialogTitle>
        {step === 1 && <ConnectWalletStep onConnect={connectWallet} />}
        {step === 2 && <UserInfoStep onContinue={() => setStep(3)} />}
        {step === 3 && (
          <MembershipSelectStep
            onSelect={completeOnboarding}
            onPrevious={() => setStep(2)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
