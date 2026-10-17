"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { clearStoredAuth, getStoredAuthSnapshot, subscribeStoredAuth } from "@/lib/api";

const shortAddress = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

/**
 * Shown above the app while an operator views a member through super-login. It sits in the page flow
 * (not floating over it), so it never covers the top bar, and the app shrinks to make room.
 */
export default function ImpersonationBanner() {
  const router = useRouter();
  const stored = useSyncExternalStore(subscribeStoredAuth, getStoredAuthSnapshot, () => null);

  if (!stored?.isImpersonation) return null;

  const who = stored.username ? `${stored.username} (${shortAddress(stored.walletAddress)})` : shortAddress(stored.walletAddress);

  const handleExit = () => {
    clearStoredAuth();
    router.push("/super-login");
  };

  return (
    <div
      role="status"
      style={{
        flex: "0 0 auto",
        background: "#f50",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.35,
        padding: "8px 16px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px 12px",
        textAlign: "center",
      }}
    >
      <span>
        Viewing <strong>{who}</strong> — read-only super-login session
      </span>
      <button
        type="button"
        onClick={handleExit}
        style={{
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: 6,
          color: "#fff",
          padding: "2px 10px",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Exit
      </button>
    </div>
  );
}
