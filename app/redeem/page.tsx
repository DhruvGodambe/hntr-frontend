"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import MainLayout from "../components/MainLayout";

/** Legacy `/redeem?code=` links redirect into the membership redeem panel. */
function RedeemRedirect() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = (params.get("code") || "").trim();
    const qs = code ? `?code=${encodeURIComponent(code)}` : "";
    router.replace(`/membership${qs}`);
  }, [params, router]);

  return (
    <div className="feed">
      <div className="page-body" style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
        <p className="cmp-sub">Opening Membership…</p>
      </div>
    </div>
  );
}

export default function RedeemPage() {
  return (
    <MainLayout>
      <Suspense fallback={null}>
        <RedeemRedirect />
      </Suspense>
    </MainLayout>
  );
}
