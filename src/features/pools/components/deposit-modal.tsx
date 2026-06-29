"use client";

import * as React from "react";
import { Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  depositDefaults,
  ethToUsd,
  formatEthAmount,
  formatUsdAmount,
  parseEthAmount,
} from "@/features/pools/data/deposit-data";
import type { PoolDetail } from "@/features/pools/data/pool-detail-data";
import { cn } from "@/lib/utils";

type DepositStep = "amount" | "success";

type PoolDepositButtonProps = {
  pool: PoolDetail;
  className?: string;
};

function ethAmount(value: string): string {
  return value.replace(/\s*ETH$/i, "").trim();
}

const quickAmounts = [
  { label: "25%", ratio: 0.25 },
  { label: "50%", ratio: 0.5 },
  { label: "75%", ratio: 0.75 },
  { label: "MAX", ratio: 1 },
] as const;

export function PoolDepositButton({ pool, className }: PoolDepositButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<DepositStep>("amount");
  const [amount, setAmount] = React.useState("0.00");
  const [submittedAmount, setSubmittedAmount] = React.useState("0.00");

  const { availableBalanceEth, explorerTxUrl } = depositDefaults;
  const numericAmount = parseEthAmount(amount);
  const usdEstimate = ethToUsd(numericAmount);

  const resetModal = React.useCallback(() => {
    setStep("amount");
    setAmount("0.00");
    setSubmittedAmount("0.00");
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetModal();
    }
  };

  const setQuickAmount = (ratio: number) => {
    setAmount(formatEthAmount(availableBalanceEth * ratio));
  };

  const handleProceed = () => {
    if (numericAmount <= 0) {
      return;
    }

    setSubmittedAmount(formatEthAmount(numericAmount));
    setStep("success");
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          "pool-deposit-btn text-micro uppercase tracking-[0.06em]",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        Make a Deposit Now
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "gap-0 p-5 sm:rounded-md",
            step === "amount" ? "max-w-md" : "max-w-sm",
          )}
        >
          <DialogTitle className="sr-only">
            {step === "amount" ? "Enter deposit amount" : "Deposit successful"}
          </DialogTitle>

          {step === "amount" ? (
            <DepositAmountStep
              pool={pool}
              amount={amount}
              usdEstimate={usdEstimate}
              onAmountChange={setAmount}
              onQuickAmount={setQuickAmount}
              onCancel={() => handleOpenChange(false)}
              onProceed={handleProceed}
              canProceed={numericAmount > 0}
            />
          ) : (
            <DepositSuccessStep
              amount={submittedAmount}
              poolName={pool.tokenName}
              explorerTxUrl={explorerTxUrl}
              onDone={() => handleOpenChange(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type DepositAmountStepProps = {
  pool: PoolDetail;
  amount: string;
  usdEstimate: number;
  onAmountChange: (value: string) => void;
  onQuickAmount: (ratio: number) => void;
  onCancel: () => void;
  onProceed: () => void;
  canProceed: boolean;
};

function DepositAmountStep({
  pool,
  amount,
  usdEstimate,
  onAmountChange,
  onQuickAmount,
  onCancel,
  onProceed,
  canProceed,
}: DepositAmountStepProps) {
  const { availableBalanceEth, membership } = depositDefaults;

  return (
    <div className="flex flex-col">
      <h2 className="border-b border-border pb-4 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-t4">
        Enter Deposit Amount
      </h2>

      <div className="mt-4 rounded-md border border-border bg-e3 px-3 py-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-[8px] uppercase tracking-[0.05em] text-t1">
              Pool Asset
            </p>
            <p className="font-display text-[12px] font-bold text-t4">
              {pool.tokenName}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[8px] uppercase tracking-[0.05em] text-t1">
              Collection Floor
            </p>
            <p className="font-display text-[12px] font-bold text-t4">
              {ethAmount(pool.targetPriceEth)} ETH
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[8px] uppercase tracking-[0.05em] text-t1">
            Amount to Deposit
          </span>
          <span className="text-[8px] text-t1">
            Available Balance:{" "}
            <span className="font-mono text-t4">
              {formatEthAmount(availableBalanceEth)} ETH
            </span>
          </span>
        </div>

        <div className="flex items-center rounded-md border border-border bg-card px-3 py-2.5">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent font-display text-[22px] font-bold text-t4 outline-none placeholder:text-t1"
            aria-label="Deposit amount in ETH"
          />
          <span className="shrink-0 font-display text-[14px] font-bold text-t4">
            ETH
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[9px] text-t1">
            ≈ {formatUsdAmount(usdEstimate)} USD
          </span>
          <div className="flex gap-1">
            {quickAmounts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onQuickAmount(item.ratio)}
                className="inline-flex h-5 min-w-[34px] items-center justify-center rounded-[2px] border border-border bg-e3 px-1.5 font-mono text-[7px] uppercase tracking-[0.04em] text-t2 transition-colors hover:bg-e4 hover:text-t4"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="secondary"
          className="h-9 font-mono text-[9px] uppercase tracking-[0.06em]"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="h-9 font-mono text-[9px] uppercase tracking-[0.06em]"
          onClick={onProceed}
          disabled={!canProceed}
        >
          Proceed to Deposit
        </Button>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="space-y-1.5 font-mono text-[8px] uppercase tracking-[0.04em] text-t2">
          <div className="flex justify-between gap-2">
            <span>Membership:</span>
            <span className="text-t4">
              {membership.tier} ({membership.price})
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Pools/Month:</span>
            <span className="text-t4">
              {membership.poolsUsed} / {membership.poolsLimit}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Max Deposit:</span>
            <span className="text-t4">
              {membership.maxDepositUsed}/{membership.maxDepositLimit}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-3 h-7 px-3 font-mono text-[8px] uppercase tracking-[0.06em]"
          asChild
        >
          <Link href="/membership">Upgrade</Link>
        </Button>
      </div>
    </div>
  );
}

type DepositSuccessStepProps = {
  amount: string;
  poolName: string;
  explorerTxUrl: string;
  onDone: () => void;
};

function DepositSuccessStep({
  amount,
  poolName,
  explorerTxUrl,
  onDone,
}: DepositSuccessStepProps) {
  return (
    <div className="flex flex-col items-center px-2 py-2 text-center">
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-full bg-e4"
        aria-hidden
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-t4 text-e0">
          <Check className="size-5" strokeWidth={2.5} />
        </div>
      </div>

      <h2 className="mb-3 font-display text-[14px] font-bold uppercase tracking-[0.08em] text-t4">
        Deposit Successful
      </h2>

      <p className="mb-4 max-w-[280px] text-[11px] leading-relaxed text-t2">
        You have successfully deposited{" "}
        <span className="font-bold text-t4">{amount} ETH</span> into the{" "}
        {poolName} pool.
      </p>

      <a
        href={explorerTxUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 inline-flex items-center gap-1 text-[10px] text-t1 transition-colors hover:text-t4"
      >
        View Transaction on Explorer
        <ExternalLink className="size-3" aria-hidden />
      </a>

      <Button
        type="button"
        className="h-9 w-full font-mono text-[9px] uppercase tracking-[0.06em]"
        onClick={onDone}
      >
        Done
      </Button>
    </div>
  );
}
