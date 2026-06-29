"use client";

import * as React from "react";
import QRCode from "react-qr-code";
import { referralLink } from "@/features/referrals/data/referrals-data";

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
    <div className="flex flex-col gap-2.5 rounded-[var(--r)] bg-e2 p-4 shadow-[var(--sh1),var(--glow)]">
      <h2 className="font-mono text-caption uppercase tracking-[0.12em] text-t1">
        Referral Link
      </h2>

      <div className="flex items-center gap-1.5">
        <div className="flex h-[30px] flex-1 items-center rounded-[5px] bg-e3 px-2.5 font-mono text-caption text-t2 shadow-sh1">
          {referralLink.display}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex size-[30px] shrink-0 items-center justify-center rounded-[5px] bg-e3 text-t1 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
          aria-label={copied ? "Copied" : "Copy referral link"}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-md bg-e3 p-4">
        <div className="rounded-sm bg-white p-2">
          <QRCode
            value={referralLink.url}
            size={140}
            bgColor="#ffffff"
            fgColor="#111113"
            aria-label="Referral link QR code"
          />
        </div>
      </div>
    </div>
  );
}
