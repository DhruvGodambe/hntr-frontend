"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile ("Verify you are human") widget.
 *
 * Loads the Cloudflare script once and renders the widget explicitly so we can
 * hook the token callbacks. The token is one-time and short-lived — pass it to
 * the backend immediately on form submit as `turnstileToken`.
 *
 * When NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set, the widget renders nothing and
 * the form should treat verification as not required (see `isTurnstileEnabled`).
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function isTurnstileEnabled(): boolean {
  return SITE_KEY.length > 0;
}

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "auto" | "light" | "dark";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __turnstileLoading?: Promise<void>;
  }
}

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileLoading) return window.__turnstileLoading;

  window.__turnstileLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="https://challenges.cloudflare.com/turnstile"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile script failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile script failed"));
    document.head.appendChild(s);
  });
  return window.__turnstileLoading;
}

interface TurnstileProps {
  /** Fires with a fresh token once the visitor passes the challenge. */
  onVerify: (token: string) => void;
  /** Fires when the token expires or the challenge errors — clear any stored token. */
  onExpire?: () => void;
  theme?: "auto" | "light" | "dark";
  className?: string;
}

export default function Turnstile({
  onVerify,
  onExpire,
  theme = "auto",
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme,
          callback: (token: string) => onVerifyRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
          "error-callback": () => onExpireRef.current?.(),
        });
      })
      .catch(() => {
        /* network/adblock — parent keeps submit disabled if enabled */
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
        widgetIdRef.current = null;
      }
    };
  }, [theme]);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className={className} />;
}
