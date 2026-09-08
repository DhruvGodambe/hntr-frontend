"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useAccount } from "wagmi";
import MainLayout from "../components/MainLayout";
import { useConnectWallet } from "../../lib/useConnectWallet";
import { redeemVoucher, useVoucherInvalidate, type RedeemResult } from "../../lib/vouchers";
import { handleAppError } from "../../lib/errors";

const CODE_RE = /^HNTR-[A-Z0-9]{4}-[A-Z0-9]{4}(-[A-Z0-9]{4})?$/;

function RedeemInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { isConnected } = useAccount();
  const { connectWallet } = useConnectWallet();
  const invalidate = useVoucherInvalidate();

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = (params.get("code") || "").toUpperCase();
    if (c) setCode(c);
  }, [params]);

  async function redeem() {
    const value = code.trim().toUpperCase();
    if (!CODE_RE.test(value)) {
      setError("That does not look like a valid gift code.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (!isConnected) await connectWallet();
      const r = await redeemVoucher(value);
      await invalidate({ membership: true });
      setResult(r);
    } catch (err) {
      const resolved = handleAppError(err, "Redemption failed");
      if (resolved.openSignup && typeof window !== "undefined" && window.openSignup) {
        window.openSignup();
      }
      setError(resolved.sub || resolved.title);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="feed">
      <div className="page-body" style={{ maxWidth: 480, margin: "40px auto" }}>
        <div className="comparison" style={{ padding: "24px" }}>
          <div className="cmp-title" style={{ fontSize: 15, marginBottom: 6 }}>
            Redeem a membership gift code
          </div>

          {result ? (
            <>
              <div className="mr-msg ok" style={{ marginTop: 12 }}>
                {result.tier} membership activated
                {result.tierBefore && result.tierBefore !== "None" ? ` (upgraded from ${result.tierBefore})` : ""}.
              </div>
              <p className="cmp-sub" style={{ marginTop: 10 }}>
                No payment and no gas — the transaction was sent for you.
              </p>
              <button
                type="button"
                className="mr-redeem-btn"
                style={{ marginTop: 16, width: "100%" }}
                onClick={() => router.push("/network")}
              >
                Go to my dashboard
              </button>
            </>
          ) : (
            <>
              <p className="cmp-sub" style={{ marginBottom: 16 }}>
                Redeeming is free. You will not sign a transaction or pay gas — connecting your wallet
                is only to verify who you are.
              </p>
              <input
                className="mr-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !busy && redeem()}
                placeholder="HNTR-XXXX-XXXX-XXXX"
                maxLength={19}
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
                style={{ width: "100%" }}
              />
              <button
                type="button"
                className="mr-redeem-btn"
                style={{ marginTop: 12, width: "100%" }}
                onClick={redeem}
                disabled={busy}
              >
                {busy ? "Redeeming…" : isConnected ? "Redeem" : "Connect wallet & redeem"}
              </button>
              {error && (
                <div className="mr-msg err" style={{ marginTop: 10 }}>
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedeemPage() {
  return (
    <MainLayout>
      <Suspense fallback={null}>
        <RedeemInner />
      </Suspense>
    </MainLayout>
  );
}
