"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useVoucherAccess, redeemVoucher, useVoucherInvalidate } from "../../lib/vouchers";
import { handleAppError } from "../../lib/errors";

const CODE_RE = /^HNTR-[A-Z0-9]{4}-[A-Z0-9]{4}(-[A-Z0-9]{4})?$/;

/**
 * "Redeem a membership code" panel on the membership page.
 *
 * Standard members see only the code input + REDEEM. Members enabled for gift
 * codes in the admin console also get a GIFT CODES button to the backoffice.
 * Redemption is gasless — the backend burner wallet sends the tx; the member
 * only signs the (free) SIWE message if they aren't already authenticated.
 */
export default function MembershipRedeemPanel() {
  const router = useRouter();
  const { data: access } = useVoucherAccess();
  const invalidate = useVoucherInvalidate();

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; cls: "ok" | "err" | "" }>({ text: "", cls: "" });

  async function redeem() {
    const value = code.trim().toUpperCase();
    if (!CODE_RE.test(value)) {
      setMsg({ text: "Enter a valid code in the format HNTR-XXXX-XXXX-XXXX.", cls: "err" });
      return;
    }
    setBusy(true);
    setMsg({ text: "", cls: "" });
    try {
      const result = await redeemVoucher(value);
      await invalidate({ membership: true });
      setMsg({
        text: `${result.tier} membership activated — no payment or gas required. Redirecting…`,
        cls: "ok",
      });
      setCode("");
      setTimeout(() => router.push("/network"), 1200);
    } catch (error) {
      const resolved = handleAppError(error, "Redemption failed");
      setMsg({ text: resolved.sub || resolved.title, cls: "err" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="comparison mr-panel">
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
      {msg.text && <div className={`mr-msg ${msg.cls}`}>{msg.text}</div>}
    </div>
  );
}
