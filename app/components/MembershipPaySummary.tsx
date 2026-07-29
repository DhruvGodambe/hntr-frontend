"use client";

import { resolveAppError } from "../../lib/errors";
import type { MembershipQuote } from "../../lib/membership";
import type { PaymentToken } from "../../lib/tokens";

type MembershipPaySummaryProps = {
  token: PaymentToken;
  tierName?: string | null;
  quote?: MembershipQuote | null;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  className?: string;
};

export default function MembershipPaySummary({
  token,
  tierName,
  quote,
  isLoading = false,
  isError = false,
  error,
  className = "",
}: MembershipPaySummaryProps) {
  if (!tierName) {
    return (
      <p className={`membership-pay-summary is-neutral ${className}`.trim()}>
        Pay with USDT or USDC. Select a tier to preview the exact amount and wallet balance.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className={`membership-pay-summary is-neutral ${className}`.trim()} role="status">
        Checking {token} balance for {tierName}…
      </p>
    );
  }

  if (isError) {
    const resolved = resolveAppError(error, "Could not load payment quote");
    return (
      <p className={`membership-pay-summary is-error ${className}`.trim()} role="alert">
        {resolved.sub}
      </p>
    );
  }

  if (!quote) return null;

  if (quote.insufficientBalance) {
    return (
      <p className={`membership-pay-summary is-error ${className}`.trim()} role="alert">
        Insufficient {token} balance. You need {quote.amountDueFormatted} {token} to{" "}
        {quote.isUpgrade ? "upgrade to" : "purchase"} {quote.tier}.
      </p>
    );
  }

  return (
    <p className={`membership-pay-summary is-ready ${className}`.trim()} role="status">
      You will pay {quote.amountDueFormatted} {token} for {quote.tier}
      {quote.isUpgrade ? " (upgrade)" : ""}.
      {quote.needsApproval ? ` Your wallet will ask to approve ${token} first.` : ""}
    </p>
  );
}
