const REFERRAL_SPONSOR_KEY = "hntrReferralSponsor";

export function normalizeReferralSponsor(raw: string): string {
  return raw.replace(/^@/, "").replace(/\s/g, "");
}

export function captureReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return null;

    const sponsor = normalizeReferralSponsor(ref);
    if (!sponsor) return null;

    sessionStorage.setItem(REFERRAL_SPONSOR_KEY, sponsor);
    return sponsor;
  } catch {
    return null;
  }
}

export function getStoredReferralSponsor(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(REFERRAL_SPONSOR_KEY);
    return stored ? normalizeReferralSponsor(stored) : null;
  } catch {
    return null;
  }
}

export function resolveReferralSponsor(): string | null {
  return captureReferralFromUrl() ?? getStoredReferralSponsor();
}
