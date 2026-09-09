"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useVoucherAccess, redeemVoucher, useVoucherInvalidate } from "../../lib/vouchers";
import { resolveAppError } from "../../lib/errors";
import GiftCodeDialog, { type GiftDialogState } from "./gift-codes/GiftCodeDialog";

const CODE_RE = /^HNTR-[A-Z0-9]{4}-[A-Z0-9]{4}(-[A-Z0-9]{4})?$/;

/**
 * "Redeem a membership code" panel on the membership page.
 *
 * Standard members see only the code input + REDEEM. Members enabled for gift
 * codes in the admin console also get a GIFT CODES button to the backoffice.
 * Redemption is gasless — the backend burner wallet sends the tx; the member
 * only signs the (free) SIWE message if they aren't already authenticated.
 *
 * Gift-code notifications / share links land on `/membership?code=…` and
 * prefill this input.
 */
export default function MembershipRedeemPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: access } = useVoucherAccess();
  const invalidate = useVoucherInvalidate();
  const panelRef = useRef<HTMLDivElement>(null);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<GiftDialogState | null>(null);

  useEffect(() => {
    const fromUrl = (searchParams.get("code") || "").trim().toUpperCase();
    if (!fromUrl) return;
    setCode(fromUrl);
    // Bring the redeem panel into view when arriving from a notification / share link.
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [searchParams]);

  async function redeem() {
    const value = code.trim().toUpperCase();
    if (!CODE_RE.test(value)) {
      setDialog({
        kind: "error",
        title: "Invalid code",
        message: "Enter a valid code in the format HNTR-XXXX-XXXX-XXXX.",
      });
      return;
    }
    setBusy(true);
    try {
      const result = await redeemVoucher(value);
      await invalidate({ membership: true });
      setCode("");
      setDialog({
        kind: "success",
        title: "Membership activated",
        message: `Your ${result.tier} membership is now active — no payment or gas required. Taking you to your network…`,
      });
      setTimeout(() => router.push("/network"), 1600);
    } catch (error) {
      const resolved = resolveAppError(error, "Redemption failed");
      setDialog({ kind: "error", title: resolved.title, message: resolved.sub || resolved.title });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="comparison mr-panel" ref={panelRef} id="membership-redeem">
      <div className="mr-head">
        <div className="cmp-title">Redeem a membership code</div>
        <div className="mr-eyebrow">Gift &amp; Promo Codes</div>
      </div>

      <div className="mr-row">
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
        />
        <button type="button" className="mr-redeem-btn" onClick={redeem} disabled={busy}>
          {busy ? "Redeeming…" : "Redeem"}
        </button>
        {access?.enabled && (
          <button
            type="button"
            className="mr-giftcodes-btn"
            onClick={() => router.push("/gift-codes")}
          >
            Gift Codes
          </button>
        )}
      </div>

      <div className="mr-hint">
        Codes are single-use and expire 7 days after issue. Redeeming is free — no payment and no
        gas; the tier credit applies to your membership immediately.
      </div>
      <GiftCodeDialog state={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
