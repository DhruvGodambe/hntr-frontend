"use client";

import { useCallback, useEffect, useState } from "react";
import Turnstile, { isTurnstileEnabled } from "@/components/Turnstile";
import { api, ApiError } from "@/lib/api";

/**
 * Site-wide "verify you are human" gate.
 *
 * On a visitor's first load it covers the whole app with a Cloudflare Turnstile
 * challenge; once solved (and confirmed by the backend) the site is revealed and
 * the pass is remembered for `PASS_TTL_MS`. If NEXT_PUBLIC_TURNSTILE_SITE_KEY is
 * not set the gate is inert and just renders children.
 *
 * Note: this is a soft gate for casual bots / scrapers that run JS. The hard
 * checks stay server-side on sensitive actions (e.g. POST /api/users/register).
 */

const STORAGE_KEY = "hntr_human_verified";
const PASS_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function hasValidPass(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < PASS_TTL_MS;
  } catch {
    return false;
  }
}

export default function HumanGate({ children }: { children: React.ReactNode }) {
  // null = still checking localStorage (pre-hydration / first tick)
  const [passed, setPassed] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!isTurnstileEnabled()) {
      setPassed(true);
      return;
    }
    setPassed(hasValidPass());
  }, []);

  const handleVerify = useCallback(async (token: string) => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/turnstile/verify", { token });
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* storage blocked — gate will re-show next load */
      }
      setPassed(true);
    } catch (err) {
      // 4xx from our API = the challenge itself was rejected; anything else
      // (network error, 5xx, service unavailable) = we couldn't reach the check.
      const rejected = err instanceof ApiError && err.statusCode >= 400 && err.statusCode < 500;
      setError(
        rejected
          ? "That check didn't go through. Please try again."
          : "Couldn't reach the verification service. Check your connection and retry.",
      );
      setNonce((n) => n + 1); // remount the widget for a fresh challenge
    } finally {
      setSubmitting(false);
    }
  }, []);

  const retry = () => {
    setError("");
    setNonce((n) => n + 1);
  };

  return (
    <>
      {children}

      {passed !== true && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483000,
            background: "var(--black-0, #0a0a0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              background: "var(--black-1, #0c0c0e)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 28,
              textAlign: "center",
              color: "var(--white, #fff)",
            }}
          >
            <img
              src="/assets/images/logoMark.png"
              alt="HNTR"
              style={{ width: 48, height: 48, margin: "0 auto 16px", display: "block" }}
            />
            {passed === null ? (
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Loading…</p>
            ) : (
              <>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Verify you are human</h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "0 0 18px" }}>
                  Complete the check below to continue to HNTR.
                </p>

                <div style={{ display: "flex", justifyContent: "center", minHeight: 65 }}>
                  <Turnstile key={nonce} theme="dark" onVerify={handleVerify} onExpire={retry} />
                </div>

                {submitting && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>Verifying…</p>
                )}
                {error && (
                  <p style={{ fontSize: 13, color: "#f87171", marginTop: 12 }}>
                    {error}{" "}
                    <button
                      onClick={retry}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--orange, #f25623)",
                        cursor: "pointer",
                        font: "inherit",
                        textDecoration: "underline",
                      }}
                    >
                      Retry
                    </button>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
