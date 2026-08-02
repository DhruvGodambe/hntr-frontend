"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { api, ApiError } from "../../lib/api";
import { ensureAuth } from "../../lib/auth";
import { TIERS } from "../../lib/contracts";
import { handleAppError, resolveAppError } from "../../lib/errors";
import { purchaseOrUpgradeTier, useMembershipQuote } from "../../lib/membership";
import { useConnectWallet } from "../../lib/useConnectWallet";
import PaymentTokenToggle from "./PaymentTokenToggle";
import MembershipPaySummary from "./MembershipPaySummary";
import SignupPhoneInput from "./SignupPhoneInput";
import type { PaymentToken } from "../../lib/tokens";
import {
  SIGNUP_REGION_OPTIONS,
  type SignupRegion,
  type SignupCountryCode,
  type SignupStep2Errors,
  defaultCountryForRegion,
  formatPhoneE164,
  mapRegistrationApiError,
  validateSignupStep2,
  validateUsername,
  validatePhone,
} from "../../lib/signup-validation";

function setModalBodyLock(locked: boolean) {
  document.body.classList.toggle("modal-open", locked);
}

function closeSignupFlow() {
  window.closeSignup?.();
  setModalBodyLock(false);
}

function closeMembershipFlow() {
  window.closeMembership?.();
  setModalBodyLock(false);
}

function notifyError(title: string, error: unknown) {
  handleAppError(error, title);
}

type SignupPurchasePhase = "wallet" | "loading";

type SignupPurchaseStatus =
  | { state: "idle" }
  | { state: "wallet" | "loading"; tier: string }
  | { state: "success"; tier: string; message: string }
  | { state: "error"; message: string };

declare global {
  interface Window {
    openSignup?: () => void;
    closeSignup?: () => void;
    closeMembership?: () => void;
    reconnectWallet?: () => void;
    connectWalletForSignup?: () => Promise<void>;
    startSignupFx?: (canvas: HTMLCanvasElement | null) => void;
    suGoto?: (n: number) => void;
    msCopyRef?: (btn: HTMLButtonElement) => void;
  }
}

export default function SignupOverlays() {
  const { address, isConnected } = useAccount();
  const { connectWallet } = useConnectWallet();

  const [sponsorUsername, setSponsorUsername] = useState("");
  const [sponsorLocked, setSponsorLocked] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [connectBusy, setConnectBusy] = useState(false);
  const [awaitingSignature, setAwaitingSignature] = useState(false);
  const [registerBusy, setRegisterBusy] = useState(false);
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const [purchasePhase, setPurchasePhase] = useState<SignupPurchasePhase | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<SignupPurchaseStatus>({ state: "idle" });
  const [paymentToken, setPaymentToken] = useState<PaymentToken>("USDT");
  const [selectedSignupTier, setSelectedSignupTier] = useState<string | null>(null);
  const [step2Errors, setStep2Errors] = useState<SignupStep2Errors>({});
  const [registerFormError, setRegisterFormError] = useState("");
  const [sponsorVerified, setSponsorVerified] = useState(false);
  const [sponsorChecking, setSponsorChecking] = useState(false);
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState<SignupRegion | "">("");
  const [country, setCountry] = useState<SignupCountryCode | "">("");
  const [phone, setPhone] = useState("");
  const purchaseBusyRef = useRef(false);
  const paymentTokenRef = useRef<PaymentToken>("USDT");
  const skipStep2Ref = useRef(false);
  const verifySponsorRef = useRef<(rawSponsor: string) => Promise<boolean>>(async () => false);
  const sponsorLockedRef = useRef(sponsorLocked);
  const sponsorUsernameRef = useRef(sponsorUsername);
  const [isProfileRegistered, setIsProfileRegistered] = useState(false);

  const goToSignupStep = useCallback((step: number) => {
    if (skipStep2Ref.current && step === 2) return;
    window.suGoto?.(step);
  }, []);

  const clearStep2Error = useCallback((field: keyof SignupStep2Errors) => {
    setRegisterFormError("");
    setStep2Errors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const mapSponsorValidationError = useCallback((error: unknown): string => {
    const { fieldErrors, formError } = mapRegistrationApiError(error);
    return fieldErrors.sponsor ?? formError ?? "Unable to verify sponsor. Please try again.";
  }, []);

  const verifySponsor = useCallback(async (rawSponsor: string): Promise<boolean> => {
    const sponsor = rawSponsor.trim().replace(/^@/, "");
    const formatError = validateUsername(sponsor, "Sponsor username");
    if (formatError) {
      setSponsorVerified(false);
      setStep2Errors({ sponsor: formatError });
      setRegisterFormError(formatError);
      return false;
    }

    setSponsorChecking(true);
    setRegisterFormError("");
    try {
      await api.get<{ username: string; tier: string }>(
        `/api/users/sponsor/${encodeURIComponent(sponsor)}/validate`,
      );
      setSponsorVerified(true);
      clearStep2Error("sponsor");
      return true;
    } catch (error) {
      const message = mapSponsorValidationError(error);
      setSponsorVerified(false);
      setStep2Errors({ sponsor: message });
      setRegisterFormError(message);
      return false;
    } finally {
      setSponsorChecking(false);
    }
  }, [clearStep2Error, mapSponsorValidationError]);

  verifySponsorRef.current = verifySponsor;
  sponsorLockedRef.current = sponsorLocked;
  sponsorUsernameRef.current = sponsorUsername;

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setSponsorUsername(ref.replace(/^@/, "").replace(/\s/g, ""));
        setSponsorLocked(true);
      }
    } catch {
      // no-op: referral prefill is a convenience, not required
    }
  }, []);

  useEffect(() => {
    if (sponsorLocked && sponsorUsername.trim()) {
      void verifySponsor(sponsorUsername);
    }
  }, [sponsorLocked, sponsorUsername, verifySponsor]);

  useEffect(() => {
    paymentTokenRef.current = paymentToken;
  }, [paymentToken]);

  const signupQuoteQuery = useMembershipQuote(
    selectedSignupTier,
    paymentToken,
    !!selectedSignupTier && !pendingTier,
  );

  useEffect(() => {
    if (purchaseStatus.state === "error") {
      setPurchaseStatus({ state: "idle" });
    }
    setSelectedSignupTier(null);
  }, [paymentToken]);

  useEffect(() => {
    const scriptId = "signup-flow-script";
    document.getElementById(scriptId)?.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `/assets/js/script-8.js?${Date.now()}`;
    script.async = true;
    script.onload = () => {
      const nativeSuGoto = window.suGoto;
      const nativeOpenSignup = window.openSignup;
      const nativeClose = window.closeSignup;

      window.suGoto = (step: number) => {
        if (skipStep2Ref.current && step === 2) return;
        nativeSuGoto?.(step);
      };

      window.openSignup = () => {
        skipStep2Ref.current = false;
        setIsProfileRegistered(false);
        setSponsorChecking(false);
        if (sponsorLockedRef.current) {
          const sponsor = sponsorUsernameRef.current.trim();
          if (sponsor) {
            void verifySponsorRef.current(sponsor);
          }
        } else {
          setSponsorVerified(false);
        }
        nativeOpenSignup?.();
      };

      if (nativeClose) {
        window.closeSignup = () => {
          nativeClose();
          if (!document.getElementById("msOverlay")?.classList.contains("open")) {
            setModalBodyLock(false);
          }
        };
      }
    };
    document.body.appendChild(script);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSignupFlow();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      script.remove();
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleSignupTierSelect = useCallback(
    async (tierName: string) => {
      if (purchaseBusyRef.current) return;

      if (selectedSignupTier !== tierName) {
        setSelectedSignupTier(tierName);
        setPurchaseStatus({ state: "idle" });
        return;
      }

      if (signupQuoteQuery.data?.insufficientBalance) {
        const resolved = resolveAppError(
          {
            code: "INSUFFICIENT_BALANCE",
            message: `Insufficient ${paymentTokenRef.current} balance. You need ${signupQuoteQuery.data.amountDueFormatted} ${paymentTokenRef.current} to purchase ${tierName}.`,
          },
          "Purchase failed",
        );
        setPurchaseStatus({ state: "error", message: resolved.sub });
        window.showToast?.({ title: resolved.title, sub: resolved.sub, link: "" });
        return;
      }

      purchaseBusyRef.current = true;
      setPendingTier(tierName);
      setPurchasePhase(null);
      setPurchaseStatus({ state: "loading", tier: tierName });

      let succeeded = false;
      const token = paymentTokenRef.current;
      try {
        await ensureAuth();

        const result = await purchaseOrUpgradeTier(tierName, token, {
          onAwaitingWallet: () => {
            setPurchasePhase("wallet");
            setPurchaseStatus({ state: "wallet", tier: tierName });
          },
          onWalletAccepted: () => {
            setPurchasePhase("loading");
            setPurchaseStatus({ state: "loading", tier: tierName });
          },
        });

        succeeded = true;
        setPurchaseStatus({
          state: "success",
          tier: result.tier,
          message: `${result.tier} membership activated (${result.amountLabel}). Redirecting to your network...`,
        });
        closeSignupFlow();
        window.setTimeout(() => {
          window.location.assign("/network");
        }, 700);
      } catch (error) {
        const resolved = resolveAppError(error, "Purchase failed");
        setPurchaseStatus({ state: "error", message: resolved.sub });
        notifyError(resolved.title, error);
      } finally {
        purchaseBusyRef.current = false;
        if (!succeeded) {
          setPendingTier(null);
          setPurchasePhase(null);
        }
      }
    },
    [selectedSignupTier, signupQuoteQuery.data]
  );

  const signupTierButtonLabel = (tierName: string) => {
    if (pendingTier === tierName) {
      if (purchasePhase === "loading") return "Loading...";
      if (purchasePhase === "wallet") return "Confirm in wallet";
    }
    if (selectedSignupTier === tierName) {
      if (signupQuoteQuery.isLoading) return "Checking...";
      if (signupQuoteQuery.data?.insufficientBalance) return "Insufficient balance";
      return `Purchase with ${paymentToken}`;
    }
    return "Select";
  };

  const openSignupOverlay = useCallback(() => {
    document.getElementById("signupOverlay")?.classList.add("open");
    setModalBodyLock(true);
  }, []);

  const handleConnectWallet = useCallback(async () => {
    if (connectBusy) return;
    setConnectBusy(true);
    setAwaitingSignature(false);
    try {
      let account = address;
      if (!isConnected || !account) {
        account = await connectWallet();
      }
      if (!account) throw new Error("No wallet account available.");

      setAwaitingSignature(true);
      await ensureAuth();
      setAwaitingSignature(false);

      try {
        const profile = await api.get<{ profile: { username: string; tier: string } }>(`/api/users/wallet/${account}`);
        setCurrentUsername(profile.profile.username);
        if (profile.profile.tier && profile.profile.tier !== "None") {
          window.showToast?.({
            title: "Already a member",
            sub: `Signed in as @${profile.profile.username} (${profile.profile.tier})`,
            link: "",
          });
          closeSignupFlow();
          return;
        }
        // Registered but hasn't purchased a tier yet - skip straight to tier selection.
        skipStep2Ref.current = true;
        setIsProfileRegistered(true);
        setPurchaseStatus({ state: "idle" });
        openSignupOverlay();
        goToSignupStep(3);
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 404) {
          skipStep2Ref.current = false;
          setIsProfileRegistered(false);
          openSignupOverlay();
          goToSignupStep(2);
          if (sponsorLocked && sponsorUsername.trim()) {
            void verifySponsor(sponsorUsername);
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      notifyError("Connection failed", error);
    } finally {
      setConnectBusy(false);
      setAwaitingSignature(false);
    }
  }, [address, connectBusy, connectWallet, goToSignupStep, isConnected, openSignupOverlay, sponsorLocked, sponsorUsername, verifySponsor]);

  useEffect(() => {
    window.connectWalletForSignup = handleConnectWallet;
    return () => {
      delete window.connectWalletForSignup;
    };
  }, [handleConnectWallet]);

  const handleContinueRegistration = async () => {
    if (registerBusy || sponsorChecking) return;
    const sponsor = sponsorUsername.trim().replace(/^@/, "");

    if (!sponsorVerified) {
      const verified = await verifySponsor(sponsor);
      if (!verified) return;
    }

    const username = usernameRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";

    const errors = validateSignupStep2({
      sponsor,
      username,
      fullName,
      region,
      country,
      phone,
      email,
    });
    if (Object.keys(errors).length > 0) {
      setRegisterFormError("Please complete the required fields before continuing.");
      setStep2Errors(errors);
      return;
    }
    if (!address) {
      setRegisterFormError("Wallet not connected. Go back and connect your wallet.");
      setStep2Errors({ sponsor: "Wallet not connected. Go back and connect your wallet." });
      return;
    }

    setStep2Errors({});
    setRegisterFormError("");
    setRegisterBusy(true);
    try {
      await api.post("/api/users/register", {
        username,
        walletAddress: address,
        email,
        phone: formatPhoneE164(phone, country),
        sponsorUsername: sponsor,
      });
      setCurrentUsername(username);
      skipStep2Ref.current = true;
      setIsProfileRegistered(true);
      setPurchaseStatus({ state: "idle" });
      goToSignupStep(3);
    } catch (error) {
      const { fieldErrors, formError } = mapRegistrationApiError(error);
      setStep2Errors(fieldErrors);
      setRegisterFormError(formError ?? "");
    } finally {
      setRegisterBusy(false);
    }
  };

  const profileFieldsDisabled = registerBusy;

  return (
    <>
      <div
        id="signupOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSignupFlow();
        }}
      >
        <div className="su-modal" id="suModal" role="dialog" aria-modal="true" aria-label="Sign up">
          <div className="su-step on" id="suStep1">
            <div className="su-head">
              <div className="su-eyebrow">
                Sign up: Step 1 of 3
                <div className="su-prog">
                  <i className="on"></i>
                  <i></i>
                  <i></i>
                </div>
              </div>
              <button className="su-x" type="button" onClick={() => closeSignupFlow()} aria-label="Close">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="su1-body">
              <div className="su1-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M3 10h18" />
                  <circle cx="16.5" cy="14.5" r="1.3" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <div className="su1-title">Connect Wallet</div>
              <div className="su1-sub">
                Access requires a verified cryptographic signature. Connect your wallet to continue.
              </div>
              <button className="su-primary" type="button" onClick={handleConnectWallet} disabled={connectBusy}>
                {awaitingSignature ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "suSpin 1s linear infinite" }}>
                      <style>{"@keyframes suSpin{to{transform:rotate(360deg)}}"}</style>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" strokeWidth="2.5" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Waiting for signature...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M9 1L2 9h5l-1 6 7-8H8l1-6z" fill="currentColor" />
                    </svg>
                    {connectBusy ? "Connecting..." : "Connect Wallet"}
                  </>
                )}
              </button>
              {awaitingSignature && (
                <div className="su-hint" style={{ marginTop: "12px", fontSize: "12px", color: "var(--t2)", textAlign: "center" }}>
                  Please approve the signature request in your wallet.
                </div>
              )}
            </div>
            <div className="su-foot">
              <span className="lock">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4.5 6V4.3a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Encrypted End-to-End
              </span>
              <span>ID: AUTH_NODE_492</span>
            </div>
          </div>

          <div className="su-step" id="suStep2">
            <div className="su-head">
              <div className="su-eyebrow">
                Sign up: Step 2 of 3
                <div className="su-prog">
                  <i className="on"></i>
                  <i className="on"></i>
                  <i></i>
                </div>
              </div>
              <button className="su-x" type="button" onClick={() => closeSignupFlow()} aria-label="Close">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="su2-body">
              <div className="su2-title">Step 2 of 3: User Information</div>
              <div className="su2-sub">Complete your profile to access the terminal.</div>
              {registerFormError && (
                <div className="su-form-errors" role="alert">
                  {registerFormError}
                </div>
              )}
              <div className="su-field">
                <label className="su-lbl">Sponsor</label>
                <input
                  className={`su-input${step2Errors.sponsor ? " is-error" : ""}${sponsorVerified ? " is-valid" : ""}`}
                  value={sponsorUsername}
                  placeholder="sponsor_username"
                  disabled={sponsorLocked || sponsorChecking || registerBusy}
                  required
                  aria-invalid={!!step2Errors.sponsor}
                  onChange={(e) => {
                    setSponsorUsername(e.target.value.replace(/^@/, "").replace(/\s/g, ""));
                    setSponsorVerified(false);
                    clearStep2Error("sponsor");
                  }}
                  onBlur={() => {
                    if (sponsorUsername.trim()) {
                      void verifySponsor(sponsorUsername);
                    }
                  }}
                />
                {sponsorChecking && (
                  <p className="su-field-hint">
                    {sponsorLocked ? "Verifying referral sponsor..." : "Verifying sponsor..."}
                  </p>
                )}
                {!sponsorChecking && sponsorVerified && !step2Errors.sponsor && (
                  <p className="su-field-hint is-success">
                    {sponsorLocked
                      ? "Referral sponsor verified. Complete your profile below."
                      : "Sponsor verified. You can complete your profile."}
                  </p>
                )}
                {!sponsorChecking && !sponsorVerified && !step2Errors.sponsor && (
                  <p className="su-field-hint">
                    {sponsorLocked
                      ? "Referral sponsor applied from your invite link."
                      : "Enter your sponsor username to verify eligibility before continuing."}
                  </p>
                )}
                {step2Errors.sponsor && <p className="su-field-error">{step2Errors.sponsor}</p>}
              </div>
              <div className="su-field su-row">
                <div>
                  <label className="su-lbl">Username</label>
                  <input
                    className={`su-input${step2Errors.username ? " is-error" : ""}`}
                    id="suUsername"
                    ref={usernameRef}
                    placeholder="e.g. ALPHA"
                    required
                    disabled={profileFieldsDisabled}
                    aria-invalid={!!step2Errors.username}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
                      clearStep2Error("username");
                    }}
                  />
                  {step2Errors.username && <p className="su-field-error">{step2Errors.username}</p>}
                </div>
                <div>
                  <label className="su-lbl">Full Name</label>
                  <input
                    className={`su-input${step2Errors.fullName ? " is-error" : ""}`}
                    placeholder="Enter as shown on identification"
                    value={fullName}
                    required
                    disabled={profileFieldsDisabled}
                    aria-invalid={!!step2Errors.fullName}
                    onChange={(e) => {
                      setFullName(e.target.value.replace(/[^a-zA-Z\s'.-]/g, ""));
                      clearStep2Error("fullName");
                    }}
                  />
                  {step2Errors.fullName && <p className="su-field-error">{step2Errors.fullName}</p>}
                </div>
              </div>
              <div className="su-field">
                <div className="su-row">
                  <div>
                    <label className="su-lbl">Nationality Region</label>
                    <select
                      className={`su-select${step2Errors.region ? " is-error" : ""}`}
                      value={region}
                      required
                      disabled={profileFieldsDisabled}
                      aria-invalid={!!step2Errors.region}
                      onChange={(e) => {
                        const nextRegion = e.target.value as SignupRegion | "";
                        setRegion(nextRegion);
                        setCountry(defaultCountryForRegion(nextRegion));
                        setPhone("");
                        clearStep2Error("region");
                        clearStep2Error("country");
                        clearStep2Error("phone");
                      }}
                    >
                      <option value="">Select Region</option>
                      {SIGNUP_REGION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {step2Errors.region && <p className="su-field-error">{step2Errors.region}</p>}
                  </div>
                  <div>
                    <label className="su-lbl">Phone Number</label>
                    <SignupPhoneInput
                      region={region}
                      country={country}
                      value={phone}
                      disabled={profileFieldsDisabled || !region}
                      hasError={!!step2Errors.phone || !!step2Errors.country}
                      onChange={(next) => {
                        setPhone(next);
                        clearStep2Error("phone");
                      }}
                      onCountryChange={(nextCountry) => {
                        setCountry(nextCountry);
                        setPhone("");
                        clearStep2Error("country");
                        clearStep2Error("phone");
                      }}
                      onBlur={() => {
                        if (!phone.trim()) return;
                        const phoneError = validatePhone(phone, country, region);
                        if (phoneError) {
                          setStep2Errors((prev) => ({ ...prev, phone: phoneError }));
                        }
                      }}
                    />
                    {step2Errors.country && !step2Errors.phone && (
                      <p className="su-field-error">{step2Errors.country}</p>
                    )}
                    {step2Errors.phone && <p className="su-field-error">{step2Errors.phone}</p>}
                  </div>
                </div>
                {region && !step2Errors.phone && !step2Errors.country && (
                  <p className="su-field-hint">Choose your country and enter a valid mobile number.</p>
                )}
              </div>
              <div className="su-field">
                <label className="su-lbl">Email Address</label>
                <input
                  className={`su-input${step2Errors.email ? " is-error" : ""}`}
                  type="email"
                  ref={emailRef}
                  placeholder="institutional@gmail.com"
                  autoComplete="email"
                  inputMode="email"
                  disabled={profileFieldsDisabled}
                  aria-invalid={!!step2Errors.email}
                  onChange={() => clearStep2Error("email")}
                />
                {step2Errors.email && <p className="su-field-error">{step2Errors.email}</p>}
              </div>
              <button
                className="su-primary"
                type="button"
                onClick={handleContinueRegistration}
                disabled={registerBusy || sponsorChecking}
              >
                {registerBusy ? "Registering..." : sponsorChecking ? "Verifying sponsor..." : <>Continue&nbsp;&nbsp;→</>}
              </button>
            </div>
            <div className="su-foot">
              <span>Encrypted Session ID: 0X8A2…FF01</span>
              <span>End-to-End Security Active</span>
            </div>
          </div>

          <div className="su-step" id="suStep3">
            <div className="su-head">
              <div className="su-eyebrow">
                Sign up: Step 3 of 3
                <div className="su-prog">
                  <i className="on"></i>
                  <i className="on"></i>
                  <i className="on"></i>
                </div>
              </div>
              <button className="su-x" type="button" onClick={() => closeSignupFlow()} aria-label="Close">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="su3-body">
              <div className="su3-intro">
                Choose a Membership tier that aligns with your capital deployment requirements and network expansion
                objectives. All tiers include full terminal access.
              </div>
              <PaymentTokenToggle
                className="su-payment-token"
                value={paymentToken}
                onChange={setPaymentToken}
                disabled={!!pendingTier}
              />
              <MembershipPaySummary
                token={paymentToken}
                tierName={selectedSignupTier}
                quote={signupQuoteQuery.data}
                isLoading={signupQuoteQuery.isLoading}
                isError={signupQuoteQuery.isError}
                error={signupQuoteQuery.error}
                className="su-payment-summary"
              />
              {purchaseStatus.state !== "idle" && (
                <div
                  className={`su-purchase-status${
                    purchaseStatus.state === "error"
                      ? " is-error"
                      : purchaseStatus.state === "success"
                      ? " is-success"
                      : ""
                  }`}
                  role="status"
                >
                  {purchaseStatus.state === "wallet" &&
                    `Confirm the ${purchaseStatus.tier} membership transaction in your wallet (${paymentToken}).`}
                  {purchaseStatus.state === "loading" &&
                    `Processing your ${purchaseStatus.tier} membership purchase with ${paymentToken}...`}
                  {purchaseStatus.state === "success" && purchaseStatus.message}
                  {purchaseStatus.state === "error" && purchaseStatus.message}
                </div>
              )}
              <div className="su-tiers" id="suTiers">
                {TIERS.map((tier, idx) => {
                  const isRecommended = tier.name === "Gold";
                  const tierNo = `Tier ${String(idx + 1).padStart(2, "0")}`;
                  return (
                    <div key={tier.name} className={`su-tier${isRecommended ? " rec" : ""}`}>
                      {isRecommended && <div className="su-tier-ribbon">Recommended</div>}
                      <div className="su-tier-no">{tierNo}</div>
                      <div className="su-tier-name">{tier.name}</div>
                      <div className="su-tier-price">
                        <span className="cur">$</span>
                        <span className="amt">{tier.priceUsd.toLocaleString()}</span>
                      </div>
                      <div className="su-tier-feats">
                        <div className="su-feat">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M2 11l3-3 2.5 1.5L11 5l3-2"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div>
                            <div className="su-feat-t">Unilevel Unlock</div>
                            <div className="su-feat-s">{tier.levels} Levels</div>
                          </div>
                        </div>
                        <div className="su-feat">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <rect x="2.5" y="5" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M5 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.3" />
                          </svg>
                          <div>
                            <div className="su-feat-t">Strategy Pools</div>
                            <div className="su-feat-s">All Strategy Pools</div>
                          </div>
                        </div>
                        <div className="su-feat">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M8 5v3l2 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                          </svg>
                          <div>
                            <div className="su-feat-t">Max Deposit</div>
                            <div className="su-feat-s">{tier.maxDeposit} Max Deposit</div>
                          </div>
                        </div>
                        {tier.name === "Diamond" && (
                          <div className="su-feat">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M3 8l3.5 3.5L13 5"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div>
                              <div className="su-feat-t">OTC Desk & NFT Lending</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className={`su-tier-btn${selectedSignupTier === tier.name ? " purchase" : ""}`}
                        disabled={
                          !!pendingTier ||
                          (selectedSignupTier === tier.name && signupQuoteQuery.data?.insufficientBalance === true)
                        }
                        onClick={() => handleSignupTierSelect(tier.name)}
                      >
                        {signupTierButtonLabel(tier.name)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="su-foot" style={{ padding: "16px 30px" }}>
              {!isProfileRegistered && (
                <button
                  className="su-back"
                  type="button"
                  onClick={() => goToSignupStep(2)}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Previous Step
                </button>
              )}
              <span className="su-status">
                Current Status<b>Onboarding</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        id="msOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMembershipFlow();
        }}
      >
        <div className="ms-modal" role="dialog" aria-modal="true" aria-label="Membership acquired">
          <canvas id="msConfetti" />
          <div className="ms-head">
            <div className="ms-check">
              <div className="dot">
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3.5 8.5l2.8 2.8L12.5 5"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="ms-title">MEMBERSHIP ACQUIRED</div>
            <div className="ms-status" id="msStatus">
              RANGER STATUS ACTIVATED
            </div>
          </div>
          <div className="ms-body">
            <div className="ms-pkg-row">
              <span className="ms-pkg-lbl">Package</span>
              <span className="ms-pkg-val" id="msPkg">
                RANGER
              </span>
            </div>
            <div className="ms-grid">
              <div className="ms-cell">
                <div className="ms-cell-lbl">Unilevel</div>
                <div className="ms-cell-val" id="msUni">
                  All Levels Unlocked
                </div>
              </div>
              <div className="ms-cell">
                <div className="ms-cell-lbl">Pool Deposits</div>
                <div className="ms-cell-val" id="msPool">
                  Max Capacity
                </div>
              </div>
            </div>
            <div className="ms-line">
              <span className="ms-line-lbl">Payment Amount</span>
              <span className="ms-line-val" id="msAmt">
                —
              </span>
            </div>
            <div className="ms-line">
              <span className="ms-line-lbl">Status</span>
              <span className="ms-line-val ok">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.3" />
                  <path
                    d="M5.3 8.2l1.8 1.8L11 6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Confirmed
              </span>
            </div>
            <div className="ms-ref">
              <div className="ms-ref-lbl">Your Referral Link</div>
              <div className="ms-ref-box">
                <input id="msRef" readOnly defaultValue="https://hntr.art/join/RANGER" />
                <button
                  className="ms-ref-copy"
                  id="msRefCopy"
                  type="button"
                  onClick={(e) => window.msCopyRef?.(e.currentTarget)}
                >
                  COPY
                </button>
              </div>
            </div>
            <button className="ms-explorer" type="button">
              View Transaction on Explorer
            </button>
          </div>
          <div className="ms-foot">
            <button className="ms-done" type="button" onClick={() => closeMembershipFlow()}>
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
