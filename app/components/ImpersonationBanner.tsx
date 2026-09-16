"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuth, clearStoredAuth } from "@/lib/api";

export default function ImpersonationBanner() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const stored = getStoredAuth();
      setWalletAddress(stored?.isImpersonation ? stored.walletAddress : null);
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  if (!walletAddress) return null;

  const handleExit = () => {
    clearStoredAuth();
    router.push("/super-login");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#f50",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <span>
        Viewing <strong>{walletAddress}</strong> — read-only super-login session
      </span>
      <button
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
