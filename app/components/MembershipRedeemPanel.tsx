"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useVoucherAccess, redeemVoucher, useVoucherInvalidate } from "../../lib/vouchers";
import { resolveAppError } from "../../lib/errors";
import GiftCodeDialog, { type GiftDialogState } from "./gift-codes/GiftCodeDialog";

const CODE_FORMAT = "HNTR-XXXX-XXXX-XXXX";
const CODE_RE = /^HNTR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

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
    if (!value) {
      setDialog({
        kind: "error",
        title: "Code required",
        message: "Please enter a code.",
      });
      return;
    }
    if (!CODE_RE.test(value)) {
      setDialog({
        kind: "error",
        title: "Invalid code",
        message: `Enter a valid code in the format ${CODE_FORMAT}.`,
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
    <div className="gf-card" style={{ margin: "22px 0 24px" }} ref={panelRef} id="membership-redeem">
      <div className="gf-card-hd">
        <div className="gf-card-t">Redeem a membership code</div>
        <div className="gf-card-n">Gift &amp; promo codes</div>
      </div>
      <div className="mr-redeem">
        <input
          className="gf-input code"
          id="mrCodeIn"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && redeem()}
          placeholder={CODE_FORMAT}
          maxLength={19}
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
        />
        <button type="button" className="gf-btn" onClick={redeem} disabled={busy}>
          {busy ? "Redeeming…" : "Redeem"}
        </button>
        {access?.enabled && (
          <button type="button" className="gf-btn ghost" onClick={() => router.push("/gift-codes")}>
            Gift Codes
          </button>
        )}
      </div>
      <div className="gf-hint">
        Codes are single-use, issued to one username, and expire 7 days after issue. Redeeming applies the tier credit to your
        membership immediately.
      </div>
      <GiftCodeDialog state={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
