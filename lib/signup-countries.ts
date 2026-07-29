import type { Country } from "react-phone-number-input";

export type SignupRegion =
  | "north-america"
  | "europe"
  | "asia-pacific"
  | "latin-america"
  | "middle-east"
  | "africa";

export type SignupCountryCode =
  | "us"
  | "ca"
  | "mx"
  | "gb"
  | "de"
  | "fr"
  | "it"
  | "es"
  | "nl"
  | "au"
  | "in"
  | "jp"
  | "sg"
  | "nz"
  | "ph"
  | "my"
  | "br"
  | "ar"
  | "co"
  | "cl"
  | "ae"
  | "sa"
  | "qa"
  | "il"
  | "za"
  | "ng"
  | "eg"
  | "ke";

export type SignupCountryOption = {
  code: SignupCountryCode;
  label: string;
  region: SignupRegion;
  dialCode: string;
  nationalMinDigits: number;
  nationalMaxDigits: number;
  phonePlaceholder: string;
};

export const SIGNUP_COUNTRIES: SignupCountryOption[] = [
  { code: "us", label: "United States", region: "north-america", dialCode: "1", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+1 555 123 4567" },
  { code: "ca", label: "Canada", region: "north-america", dialCode: "1", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+1 416 555 1234" },
  { code: "mx", label: "Mexico", region: "north-america", dialCode: "52", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+52 55 1234 5678" },
  { code: "gb", label: "United Kingdom", region: "europe", dialCode: "44", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+44 7911 123456" },
  { code: "de", label: "Germany", region: "europe", dialCode: "49", nationalMinDigits: 10, nationalMaxDigits: 11, phonePlaceholder: "+49 151 23456789" },
  { code: "fr", label: "France", region: "europe", dialCode: "33", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+33 6 12 34 56 78" },
  { code: "it", label: "Italy", region: "europe", dialCode: "39", nationalMinDigits: 9, nationalMaxDigits: 10, phonePlaceholder: "+39 312 345 6789" },
  { code: "es", label: "Spain", region: "europe", dialCode: "34", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+34 612 34 56 78" },
  { code: "nl", label: "Netherlands", region: "europe", dialCode: "31", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+31 6 12345678" },
  { code: "au", label: "Australia", region: "asia-pacific", dialCode: "61", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+61 412 345 678" },
  { code: "in", label: "India", region: "asia-pacific", dialCode: "91", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+91 98765 43210" },
  { code: "jp", label: "Japan", region: "asia-pacific", dialCode: "81", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+81 90 1234 5678" },
  { code: "sg", label: "Singapore", region: "asia-pacific", dialCode: "65", nationalMinDigits: 8, nationalMaxDigits: 8, phonePlaceholder: "+65 9123 4567" },
  { code: "nz", label: "New Zealand", region: "asia-pacific", dialCode: "64", nationalMinDigits: 8, nationalMaxDigits: 10, phonePlaceholder: "+64 21 123 4567" },
  { code: "ph", label: "Philippines", region: "asia-pacific", dialCode: "63", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+63 917 123 4567" },
  { code: "my", label: "Malaysia", region: "asia-pacific", dialCode: "60", nationalMinDigits: 9, nationalMaxDigits: 10, phonePlaceholder: "+60 12 345 6789" },
  { code: "br", label: "Brazil", region: "latin-america", dialCode: "55", nationalMinDigits: 10, nationalMaxDigits: 11, phonePlaceholder: "+55 11 91234 5678" },
  { code: "ar", label: "Argentina", region: "latin-america", dialCode: "54", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+54 11 2345 6789" },
  { code: "co", label: "Colombia", region: "latin-america", dialCode: "57", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+57 300 123 4567" },
  { code: "cl", label: "Chile", region: "latin-america", dialCode: "56", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+56 9 1234 5678" },
  { code: "ae", label: "United Arab Emirates", region: "middle-east", dialCode: "971", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+971 50 123 4567" },
  { code: "sa", label: "Saudi Arabia", region: "middle-east", dialCode: "966", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+966 50 123 4567" },
  { code: "qa", label: "Qatar", region: "middle-east", dialCode: "974", nationalMinDigits: 8, nationalMaxDigits: 8, phonePlaceholder: "+974 3312 3456" },
  { code: "il", label: "Israel", region: "middle-east", dialCode: "972", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+972 50 123 4567" },
  { code: "za", label: "South Africa", region: "africa", dialCode: "27", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+27 82 123 4567" },
  { code: "ng", label: "Nigeria", region: "africa", dialCode: "234", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+234 803 123 4567" },
  { code: "eg", label: "Egypt", region: "africa", dialCode: "20", nationalMinDigits: 10, nationalMaxDigits: 10, phonePlaceholder: "+20 10 1234 5678" },
  { code: "ke", label: "Kenya", region: "africa", dialCode: "254", nationalMinDigits: 9, nationalMaxDigits: 9, phonePlaceholder: "+254 712 345678" },
];

export function getCountriesForRegion(region: SignupRegion | ""): SignupCountryOption[] {
  if (!region) return [];
  return SIGNUP_COUNTRIES.filter((country) => country.region === region);
}

export function getCountryOption(code: SignupCountryCode | ""): SignupCountryOption | undefined {
  if (!code) return undefined;
  return SIGNUP_COUNTRIES.find((country) => country.code === code);
}

export function toIsoCountry(code: SignupCountryCode | ""): Country | undefined {
  if (!code) return undefined;
  return code.toUpperCase() as Country;
}

export function fromIsoCountry(iso: Country | undefined): SignupCountryCode | "" {
  if (!iso) return "";
  const lower = iso.toLowerCase() as SignupCountryCode;
  return SIGNUP_COUNTRIES.some((country) => country.code === lower) ? lower : "";
}

export function getIsoCountriesForRegion(region: SignupRegion | ""): Country[] {
  return getCountriesForRegion(region).map((country) => country.code.toUpperCase() as Country);
}

export function defaultCountryForRegion(region: SignupRegion | ""): SignupCountryCode | "" {
  return getCountriesForRegion(region)[0]?.code ?? "";
}
