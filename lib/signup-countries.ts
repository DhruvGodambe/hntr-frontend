import type { Country } from "react-phone-number-input";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import countryLabels from "react-phone-number-input/locale/en.json";

export type { Country };

export type SignupCountryOption = {
  code: Country;
  label: string;
  dialCode: string;
};

/** Every country react-phone-number-input/libphonenumber-js knows how to format, with its English name and dial code. */
export const SIGNUP_COUNTRIES: SignupCountryOption[] = getCountries()
  .map((code) => ({
    code,
    label: countryLabels[code] ?? code,
    dialCode: getCountryCallingCode(code),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const COUNTRY_BY_CODE = new Map(SIGNUP_COUNTRIES.map((option) => [option.code, option]));

export function getCountryOption(code: Country | ""): SignupCountryOption | undefined {
  if (!code) return undefined;
  return COUNTRY_BY_CODE.get(code);
}
