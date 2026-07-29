"use client";

import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import "react-phone-number-input/style.css";
import {
  defaultCountryForRegion,
  fromIsoCountry,
  getIsoCountriesForRegion,
  toIsoCountry,
  type SignupCountryCode,
  type SignupRegion,
} from "../../lib/signup-countries";

const E164_MAX_DIGITS = 15;

function countPhoneDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

type SignupPhoneInputProps = {
  region: SignupRegion | "";
  country: SignupCountryCode | "";
  value: string;
  onChange: (value: string) => void;
  onCountryChange: (country: SignupCountryCode) => void;
  onBlur?: () => void;
  disabled?: boolean;
  hasError?: boolean;
};

export default function SignupPhoneInput({
  region,
  country,
  value,
  onChange,
  onCountryChange,
  onBlur,
  disabled = false,
  hasError = false,
}: SignupPhoneInputProps) {
  const countries = getIsoCountriesForRegion(region);
  const resolvedCountry = toIsoCountry(country || defaultCountryForRegion(region));

  const handleChange = (next?: string) => {
    if (!next) {
      onChange("");
      return;
    }

    const digitCount = countPhoneDigits(next);
    if (digitCount > E164_MAX_DIGITS) {
      return;
    }

    if (resolvedCountry) {
      const parsed = parsePhoneNumberFromString(next, resolvedCountry);
      if (parsed && !parsed.isPossible()) {
        return;
      }
      if (
        next.length > (value?.length ?? 0) &&
        digitCount > 3 &&
        !isPossiblePhoneNumber(next, resolvedCountry)
      ) {
        return;
      }
    }

    onChange(next);
  };

  return (
    <PhoneInput
      key={`${region}-${resolvedCountry ?? "none"}`}
      international
      limitMaxLength
      countryCallingCodeEditable={false}
      addInternationalOption={false}
      countries={countries.length > 0 ? countries : undefined}
      defaultCountry={resolvedCountry}
      value={value || undefined}
      onChange={handleChange}
      onCountryChange={(iso) => {
        const mapped = fromIsoCountry(iso);
        if (mapped) onCountryChange(mapped);
      }}
      onBlur={onBlur}
      disabled={disabled || countries.length === 0}
      className={`su-phone-field${hasError ? " is-error" : ""}`}
      numberInputProps={{
        className: "su-input PhoneInputInput",
        "aria-invalid": hasError,
        autoComplete: "tel",
      }}
    />
  );
}