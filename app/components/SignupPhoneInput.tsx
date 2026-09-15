"use client";

import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input/input";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import type { Country } from "react-phone-number-input";

const E164_MAX_DIGITS = 15;

function countPhoneDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

type SignupPhoneInputProps = {
  country: Country | "";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  hasError?: boolean;
};

/** Country is chosen separately via <CountrySelect> — this is just the number field. */
export default function SignupPhoneInput({
  country,
  value,
  onChange,
  onBlur,
  disabled = false,
  hasError = false,
}: SignupPhoneInputProps) {
  const handleChange = (next?: string) => {
    if (!next) {
      onChange("");
      return;
    }

    const digitCount = countPhoneDigits(next);
    if (digitCount > E164_MAX_DIGITS) {
      return;
    }

    if (country) {
      const parsed = parsePhoneNumberFromString(next, country);
      if (parsed && !parsed.isPossible()) {
        return;
      }
      if (
        next.length > (value?.length ?? 0) &&
        digitCount > 3 &&
        !isPossiblePhoneNumber(next, country)
      ) {
        return;
      }
    }

    onChange(next);
  };

  return (
    <PhoneInput
      key={country || "none"}
      international
      country={country || undefined}
      value={value || undefined}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled || !country}
      className={`su-input${hasError ? " is-error" : ""}`}
      autoComplete="tel"
    />
  );
}
