"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";
import { referralLink } from "@/features/referrals/data/referrals-data";
import { cn } from "@/lib/utils";

export function ReferralLinkCard() {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-md border border-border bg-e2 p-4 shadow-sh1">
      <h2 className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.08em] text-t4">
        Referral Link
      </h2>

      <div className="relative mb-4">
        <Input
          readOnly
          value={referralLink.display}
          className="h-8 pr-9 font-mono text-[9px] text-t3"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 text-t2 transition-colors hover:text-t4",
          )}
          aria-label={copied ? "Copied" : "Copy referral link"}
        >
          {copied ? (
            <Check className="size-3.5 text-green" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-md border border-border bg-e3 p-4">
        <div className="rounded-sm bg-white p-2">
          <QRCode
            value={referralLink.url}
            size={120}
            bgColor="#ffffff"
            fgColor="#2b3224"
            aria-label="Referral link QR code"
          />
        </div>
      </div>
    </div>
  );
}
