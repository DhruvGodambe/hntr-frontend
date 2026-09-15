import { getCountryOption, type Country } from "./signup-countries";
import { isValidPhoneNumber, isPossiblePhoneNumber, parsePhoneNumber } from "react-phone-number-input";

export type { Country } from "./signup-countries";

export type SignupStep2Values = {
  sponsor: string;
  username: string;
  fullName: string;
  country: Country | "";
  phone: string;
  email: string;
};

export type SignupStep2Errors = Partial<Record<keyof SignupStep2Values, string>>;

/** Existing usernames (e.g. a sponsor referenced by an already-registered member) may
 *  predate the letters-only rule below — keep this lenient so those still validate. */
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
/** New usernames created from now on: English letters only, no digits/underscore. */
const NEW_USERNAME_PATTERN = /^[a-zA-Z]{3,20}$/;
const FULL_NAME_ALLOWED = /^[a-zA-Z\s'.-]+$/;

/** Obvious filler words people type to skip the field. */
const PLACEHOLDER_NAME_TOKENS = new Set([
  "test", "testing", "tester", "user", "users", "username", "admin", "administrator",
  "demo", "sample", "example", "name", "fullname", "firstname", "lastname", "surname",
  "asdf", "asdfg", "qwerty", "abc", "abcd", "xyz", "foo", "bar", "baz", "lorem", "ipsum",
  "none", "null", "undefined", "unknown", "anonymous", "nobody", "someone", "dummy",
  "aaa", "aaaa", "xxx", "xxxx", "nil",
]);

export function validateUsername(value: string, label = "Username"): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (!USERNAME_PATTERN.test(trimmed)) {
    return `${label} must be 3–20 characters and use letters, numbers, or underscores only.`;
  }
  return undefined;
}

/** Validates a brand-new username being created at signup — letters only. */
export function validateNewUsername(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Username is required.";
  if (!NEW_USERNAME_PATTERN.test(trimmed)) {
    return "Username must be 3–20 letters only (no numbers, symbols, or spaces).";
  }
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Full name is required.";
  if (trimmed.length < 3 || trimmed.length > 80) {
    return "Full name must be between 3 and 80 characters.";
  }
  if (!FULL_NAME_ALLOWED.test(trimmed) || !/^[a-zA-Z]/.test(trimmed) || !/[a-zA-Z]$/.test(trimmed)) {
    return "Enter your name using letters, spaces, hyphens, apostrophes, or periods only.";
  }

  const letters = trimmed.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const distinctLetters = new Set(letters).size;
  // A name built from one repeated letter ("aaaa", "aa aa"), from two letters
  // ("abababab"), or with a 3+ identical run ("Jaaaane") is not a real name.
  if (distinctLetters < 2 || (letters.length >= 6 && distinctLetters < 3)) {
    return "Enter your real full name.";
  }
  if (/([a-zA-Z])\1\1/i.test(trimmed)) {
    return "Enter your real full name.";
  }

  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length < 2) {
    return "Enter your first and last name.";
  }

  const alphaParts = parts.map((part) => part.replace(/[^a-zA-Z]/g, ""));
  const first = alphaParts[0];
  const last = alphaParts[alphaParts.length - 1];
  if (first.length < 2 || last.length < 2) {
    return "Enter your full first and last name (no single-letter names).";
  }

  const lowerParts = alphaParts.map((part) => part.toLowerCase());
  if (lowerParts.every((part) => PLACEHOLDER_NAME_TOKENS.has(part))) {
    return "Enter your real full name, not a placeholder.";
  }
  if (lowerParts.length === 2 && lowerParts[0] === lowerParts[1]) {
    return "Enter your real full name.";
  }

  return undefined;
}

export function validateCountry(value: Country | ""): string | undefined {
  if (!value) return "Select your country.";
  if (!getCountryOption(value)) return "Select a valid country.";
  return undefined;
}

/**
 * Reject numbers that pass a length check but are obviously not real:
 * all-identical digits, only two distinct digits, or a full ascending/descending
 * run (e.g. 1111111111, 1212121212, 1234567890).
 */
export function hasFakePhonePattern(nationalDigits: string): boolean {
  if (nationalDigits.length < 5) return false;
  if (/^(\d)\1+$/.test(nationalDigits)) return true;
  if (/(\d)\1{5,}/.test(nationalDigits)) return true;
  if (new Set(nationalDigits).size <= 2) return true;
  const ascending = "01234567890";
  const descending = "09876543210";
  if (ascending.includes(nationalDigits) || descending.includes(nationalDigits)) return true;
  return false;
}

export function validatePhone(value: string, country: Country | ""): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required.";

  const countryError = validateCountry(country);
  if (countryError) return countryError;

  const option = getCountryOption(country as Country);
  if (!option) return "Select a valid country.";

  let parsed: ReturnType<typeof parsePhoneNumber> | undefined;
  try {
    parsed = parsePhoneNumber(trimmed);
  } catch {
    parsed = undefined;
  }

  if (!parsed || !parsed.nationalNumber) {
    return `Enter a valid ${option.label} mobile number, including +${option.dialCode}.`;
  }

  // The dialled country code must match the country picked in the form.
  if (parsed.countryCallingCode && String(parsed.countryCallingCode) !== option.dialCode) {
    return `Use a +${option.dialCode} ${option.label} number, or change the selected country.`;
  }

  if (hasFakePhonePattern(String(parsed.nationalNumber))) {
    return "Enter a real phone number.";
  }

  if (!isPossiblePhoneNumber(trimmed, option.code)) {
    return `Enter a valid ${option.label} number for +${option.dialCode}.`;
  }

  if (!isValidPhoneNumber(trimmed, option.code)) {
    return `Enter a complete, valid ${option.label} mobile number.`;
  }

  if (parsed.country && parsed.country !== option.code) {
    return `This number does not match ${option.label}.`;
  }

  return undefined;
}

export function formatPhoneE164(value: string): string {
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

  const usernameError = validateNewUsername(values.username);
  if (usernameError) errors.username = usernameError;

  const fullNameError = validateFullName(values.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const countryError = validateCountry(values.country);
  if (countryError) errors.country = countryError;

  const phoneError = validatePhone(values.phone, values.country);
  if (phoneError) errors.phone = phoneError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  return errors;
}

export { SIGNUP_COUNTRIES, getCountryOption } from "./signup-countries";

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
