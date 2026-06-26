import { Lock, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authNodeId } from "@/features/auth/data/signup-data";
import { SignupStepHeader } from "./signup-step-header";

type ConnectWalletStepProps = {
  onConnect: () => void;
};

export function ConnectWalletStep({ onConnect }: ConnectWalletStepProps) {
  return (
    <div className="flex flex-col">
      <SignupStepHeader step={1} />

      <div className="flex flex-col items-center px-2 py-4 text-center">
        <div
          className="mb-4 flex size-12 items-center justify-center rounded-md border border-border bg-e3 text-t3"
          aria-hidden
        >
          <Wallet className="size-5" strokeWidth={1.75} />
        </div>

        <h2 className="mb-2 font-display text-[18px] font-bold text-t4">
          Connect Wallet
        </h2>
        <p className="mb-6 max-w-[280px] text-[10px] leading-relaxed text-t2">
          Access requires a verified cryptographic signature. Connect your wallet
          to continue.
        </p>

        <Button
          className="h-9 w-full max-w-[280px] font-mono text-[9px] uppercase tracking-[0.06em]"
          onClick={onConnect}
        >
          <Zap className="size-3.5" />
          Connect Wallet
        </Button>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-3 font-mono text-[7px] uppercase tracking-[0.04em] text-t0">
        <span className="inline-flex items-center gap-1">
          <Lock className="size-2.5" />
          Encrypted End-to-End
        </span>
        <span>ID: {authNodeId}</span>
      </div>
    </div>
  );
}
