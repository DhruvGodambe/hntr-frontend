"use client";

import { PAYMENT_TOKENS, type PaymentToken } from "../../lib/tokens";

interface PaymentTokenToggleProps {
  value: PaymentToken;
  onChange: (token: PaymentToken) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function PaymentTokenToggle({
  value,
  onChange,
  disabled = false,
  className = "",
  label = "Pay with",
}: PaymentTokenToggleProps) {
  return (
    <div className={`payment-token-toggle ${className}`.trim()} role="group" aria-label={label}>
      <span className="payment-token-toggle-label">{label}</span>
      <div className="payment-token-toggle-btns">
        {PAYMENT_TOKENS.map((token) => {
          const active = value === token;
          return (
            <button
              key={token}
              type="button"
              className={`payment-token-btn${active ? " active" : ""}`}
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onChange(token)}
            >
              {token}
            </button>
          );
        })}
      </div>
    </div>
  );
}
