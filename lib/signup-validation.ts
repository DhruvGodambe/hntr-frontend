import {
  getCountriesForRegion,
  getCountryOption,
  toIsoCountry,
  type SignupCountryCode,
  type SignupRegion,
} from "./signup-countries";
import { isValidPhoneNumber, isPossiblePhoneNumber, parsePhoneNumber } from "react-phone-number-input";

export type { SignupCountryCode, SignupRegion } from "./signup-countries";

export type SignupRegionOption = {
  value: SignupRegion;
  label: string;
};

export const SIGNUP_REGION_OPTIONS: SignupRegionOption[] = [
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "asia-pacific", label: "Asia Pacific" },
  { value: "latin-america", label: "Latin America" },
  { value: "middle-east", label: "Middle East" },
  { value: "africa", label: "Africa" },
];

export type SignupStep2Values = {
  sponsor: string;
  username: string;
  fullName: string;
  region: SignupRegion | "";
  country: SignupCountryCode | "";
  phone: string;
  email: string;
};

export type SignupStep2Errors = Partial<Record<keyof SignupStep2Values, string>>;

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const FULL_NAME_PATTERN = /^[a-zA-Z\s'.-]{2,80}$/;

export function validateUsername(value: string, label = "Username"): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (!USERNAME_PATTERN.test(trimmed)) {
    return `${label} must be 3–20 characters and use letters, numbers, or underscores only.`;
  }
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Full name is required.";
  if (!FULL_NAME_PATTERN.test(trimmed)) {
    return "Full name may only contain letters, spaces, hyphens, apostrophes, or periods.";
  }
  return undefined;
}

export function validateRegion(value: SignupRegion | ""): string | undefined {
  if (!value) return "Select your nationality region.";
  return undefined;
}

export function validateCountry(value: SignupCountryCode | "", region: SignupRegion | ""): string | undefined {
  if (!value) return "Select your country.";
  const country = getCountryOption(value);
  if (!country) return "Select a valid country.";
  if (region && country.region !== region) {
    return "Selected country does not match the chosen region.";
  }
  return undefined;
}

export function validatePhone(
  value: string,
  countryCode: SignupCountryCode | "",
  region: SignupRegion | "",
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required.";

  const countryError = validateCountry(countryCode, region);
  if (countryError) return countryError;

  const country = getCountryOption(countryCode);
  const isoCountry = toIsoCountry(countryCode);
  if (!isoCountry) return "Select a valid country.";

  if (!isPossiblePhoneNumber(trimmed, isoCountry)) {
    return `Enter a valid ${country?.label ?? "phone"} number for +${country?.dialCode ?? ""}.`;
  }

  if (!isValidPhoneNumber(trimmed, isoCountry)) {
    return `Enter a complete ${country?.label ?? "phone"} number (include +${country?.dialCode ?? ""}).`;
  }

  try {
    const parsed = parsePhoneNumber(trimmed);
    if (parsed?.country && parsed.country.toLowerCase() !== countryCode) {
      return `This number does not match ${country?.label ?? "the selected country"}.`;
    }
  } catch {
    // isValidPhoneNumber already passed
  }

  return undefined;
}

export function formatPhoneE164(value: string, _countryCode?: SignupCountryCode | ""): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return parsePhoneNumber(trimmed)?.number ?? trimmed;
  } catch {
    return trimmed;
  }
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address (e.g. name@company.com).";
  }
  return undefined;
}

export function validateSignupStep2(values: SignupStep2Values): SignupStep2Errors {
  const errors: SignupStep2Errors = {};

  const sponsorError = validateUsername(values.sponsor, "Sponsor username");
  if (sponsorError) errors.sponsor = sponsorError;

  const usernameError = validateUsername(values.username);
  if (usernameError) errors.username = usernameError;

  const fullNameError = validateFullName(values.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const regionError = validateRegion(values.region);
  if (regionError) errors.region = regionError;

  const countryError = validateCountry(values.country, values.region);
  if (countryError) errors.country = countryError;

  const phoneError = validatePhone(values.phone, values.country, values.region);
  if (phoneError) errors.phone = phoneError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  return errors;
}

export function countriesForRegion(region: SignupRegion | "") {
  return getCountriesForRegion(region);
}

export {
  defaultCountryForRegion,
  fromIsoCountry,
  getCountryOption,
  getIsoCountriesForRegion,
  toIsoCountry,
} from "./signup-countries";

function duplicateFieldMessage(message: string, field: keyof SignupStep2Values, label: string): string | undefined {
  const lower = message.toLowerCase();
  if (!lower.includes("duplicate") && !lower.includes("already") && !lower.includes("e11000")) {
    return undefined;
  }
  if (lower.includes(field) || lower.includes(label.toLowerCase())) {
    return field === "username"
      ? "This username is already taken. Choose another."
      : `This ${label.toLowerCase()} is already registered.`;
  }
  return undefined;
}

/** Map registration API failures to inline signup field / form messages. */
export function mapRegistrationApiError(error: unknown): {
  fieldErrors: SignupStep2Errors;
  formError?: string;
} {
  const message =
    error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message
      : typeof error === "string"
        ? error
        : "Registration failed. Please try again.";

  const lower = message.toLowerCase();

  if (lower.includes("sponsor not found")) {
    const sponsorMessage =
      "This sponsor username was not found. Check the spelling or ask your referrer.";
    return {
      fieldErrors: { sponsor: sponsorMessage },
      formError: sponsorMessage,
    };
  }

  if (
    lower.includes("does not have an active membership") ||
    lower.includes("sponsor_no_membership")
  ) {
    const sponsorMessage =
      "This sponsor does not have an active membership plan. Ask your referrer to purchase a membership first.";
    return {
      fieldErrors: { sponsor: sponsorMessage },
      formError: sponsorMessage,
    };
  }

  const usernameDup = duplicateFieldMessage(message, "username", "Username");
  if (usernameDup) return { fieldErrors: { username: usernameDup }, formError: usernameDup };

  if (lower.includes("wallet") && (lower.includes("duplicate") || lower.includes("already") || lower.includes("e11000"))) {
    return {
      fieldErrors: {},
      formError: "This wallet is already registered. Connect a different wallet or sign in.",
    };
  }

  const emailDup = duplicateFieldMessage(message, "email", "Email");
  if (emailDup) return { fieldErrors: { email: emailDup }, formError: emailDup };

  return { fieldErrors: {}, formError: message };
}
