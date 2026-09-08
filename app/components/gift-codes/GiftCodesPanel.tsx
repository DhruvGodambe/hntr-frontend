"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Voucher,
  VoucherAccess,
  VoucherToken,
  issueVoucher,
  revealVoucherCode,
  revokeVoucher,
  shareVoucher,
  useMyVouchers,
  useVoucherAccess,
  useVoucherInvalidate,
} from "../../../lib/vouchers";
import { handleAppError } from "../../../lib/errors";

const FILTERS = ["all", "active", "redeemed", "expired"] as const;
type FilterKey = (typeof FILTERS)[number];

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusLabel(s: Voucher["status"]) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function setModalBodyLock(locked: boolean) {
  document.body.classList.toggle("modal-open", locked);
}

/** Reuses the platform deposit-overlay / deposit-modal chrome (user-side). */
function ShareGiftCodeModal({
  open,
  onClose,
  onSubmit,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (usernames: string[]) => void | Promise<void>;
  busy: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [raw, setRaw] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setRaw("");
      setModalBodyLock(false);
      return;
    }
    setModalBodyLock(true);
    return () => setModalBodyLock(false);
  }, [open]);

  if (!mounted) return null;

  const parsed = raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return createPortal(
    <div
      className={`deposit-overlay${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="deposit-modal" role="dialog" aria-modal="true" aria-label="Share gift code">
        <div className="dm-header">
          <div className="dm-title">SHARE GIFT CODE</div>
          <button className="dm-close" type="button" onClick={onClose} disabled={busy} aria-label="Close">
            ×
          </button>
        </div>

        <div className="dm-body">
          <p className="gc-share-sub">
            Notify members by username. They get an in-app notification with your redeem link — the
            code stays bearer (anyone with the link can redeem).
          </p>

          <div className="dm-amount-hdr">
            <div className="dm-amount-lbl">Usernames</div>
            {parsed.length > 0 ? (
              <div className="dm-balance">
                {parsed.length} recipient{parsed.length === 1 ? "" : "s"}
              </div>
            ) : null}
          </div>

          <textarea
            className="gc-share-input"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="alice, bob, carol"
            rows={4}
            autoFocus
            disabled={busy}
            autoComplete="off"
          />
          <div className="gc-share-hint">Separate with commas or new lines.</div>

          <div className="dm-actions">
            <button className="dm-cancel-btn" type="button" onClick={onClose} disabled={busy}>
              CANCEL
            </button>
            <button
              className="dm-proceed-btn"
              type="button"
              disabled={busy || parsed.length === 0}
              onClick={() => onSubmit(parsed)}
            >
              {busy ? "SENDING…" : "SEND"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function GiftCodesPanel({ access: initialAccess }: { access?: VoucherAccess }) {
  const accessQuery = useVoucherAccess();
  const access = accessQuery.data ?? initialAccess;
  const invalidate = useVoucherInvalidate();

  const [filter, setFilter] = useState<FilterKey>("all");
  const listQuery = useMyVouchers(filter, 1, 50);
  const vouchers = listQuery.data?.items ?? [];

  const [token, setToken] = useState<VoucherToken>("USDT");
  const [tierValue, setTierValue] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; cls: "ok" | "err" | "" }>({ text: "", cls: "" });

  const [issued, setIssued] = useState<{ code: string; redeemUrl: string; tier: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [shareVoucherId, setShareVoucherId] = useState<string | null>(null);

  const balances = access?.balances ?? [];
  const bal = balances.find((b) => b.token === token);
  const balance = bal?.balance ?? 0;
  const issuedTotal = balances.reduce((s, b) => s + b.issued, 0);
  const tiers = access?.tiers ?? [];

  const activeCount = useMemo(() => vouchers.filter((v) => v.status === "ACTIVE").length, [vouchers]);
  const redeemedCount = useMemo(() => vouchers.filter((v) => v.status === "REDEEMED").length, [vouchers]);

  async function generate() {
    const tier = tiers.find((t) => t.valueUsd === tierValue);
    if (!tier) {
      setMsg({ text: "Pick a membership tier.", cls: "err" });
      return;
    }
    if (tier.valueUsd > balance) {
      setMsg({ text: `Amount exceeds your available ${token} balance (${money(balance)}).`, cls: "err" });
      return;
    }
    setBusy(true);
    setMsg({ text: "", cls: "" });
    try {
      const result = await issueVoucher({ tier: tier.name, token, note: note.trim() || undefined });
      await invalidate();
      await accessQuery.refetch();
      await listQuery.refetch();
      setIssued({ code: result.code, redeemUrl: result.redeemUrl, tier: result.tier });
      setCopied(false);
      setTierValue("");
      setNote("");
      setMsg({ text: `${result.tier} gift code created — ${money(result.amountUsd)} ${token}.`, cls: "ok" });
    } catch (error) {
      const resolved = handleAppError(error, "Could not create gift code");
      setMsg({ text: resolved.sub || resolved.title, cls: "err" });
    } finally {
      setBusy(false);
    }
  }

  async function reveal(voucherId: string) {
    try {
      const { code } = await revealVoucherCode(voucherId);
      setRevealed((prev) => ({ ...prev, [voucherId]: code }));
    } catch (error) {
      handleAppError(error, "Could not reveal code");
    }
  }

  async function revoke(voucherId: string) {
    if (!window.confirm("Cancel this gift code and refund the balance?")) return;
    try {
      await revokeVoucher(voucherId);
      await invalidate();
      await accessQuery.refetch();
      await listQuery.refetch();
    } catch (error) {
      handleAppError(error, "Could not cancel gift code");
    }
  }

  async function submitShare(usernames: string[]) {
    if (!shareVoucherId || usernames.length === 0) return;
    setShareBusy(true);
    try {
      const { notified, skipped } = await shareVoucher(shareVoucherId, usernames);
      setMsg({
        text: `Sent to ${notified.length} member(s)${skipped.length ? `, ${skipped.length} skipped` : ""}.`,
        cls: "ok",
      });
      setShareVoucherId(null);
    } catch (error) {
      handleAppError(error, "Could not share");
    } finally {
      setShareBusy(false);
    }
  }

  return (
    <div className="gc-scope">
      <ShareGiftCodeModal
        open={Boolean(shareVoucherId)}
        onClose={() => !shareBusy && setShareVoucherId(null)}
        onSubmit={submitShare}
        busy={shareBusy}
      />

      <div className="gc-wrap">
        <div className="gf-head">
          <div>
            <div className="gf-title">Gift Codes</div>
            <div className="gf-sub">Issue and track membership vouchers from your balance</div>
          </div>
        </div>

        <div className="gf-stats">
          <div className="net-stat">
            <div className="net-stat-lbl">USDT Balance</div>
            <div className="net-stat-val">{money(balances.find((b) => b.token === "USDT")?.balance ?? 0)}</div>
            <div className="net-stat-chg">Available to issue</div>
          </div>
          <div className="net-stat">
            <div className="net-stat-lbl">USDC Balance</div>
            <div className="net-stat-val">{money(balances.find((b) => b.token === "USDC")?.balance ?? 0)}</div>
            <div className="net-stat-chg">Available to issue</div>
          </div>
          <div className="net-stat">
            <div className="net-stat-lbl">Balance Issued</div>
            <div className="net-stat-val">{money(issuedTotal)}</div>
            <div className="net-stat-chg">Locked in outstanding codes</div>
          </div>
          <div className="net-stat">
            <div className="net-stat-lbl">Codes</div>
            <div className="net-stat-val">{vouchers.length}</div>
            <div className="net-stat-chg">
              {activeCount} active · {redeemedCount} redeemed
            </div>
          </div>
        </div>

        <div className="gf-top">
          <div className="gf-card">
            <div className="gf-card-hd">
              <div className="gf-card-t">Generate a gift code</div>
              <div className="gf-card-n">From balance</div>
            </div>

            <div className="gf-row">
              <div className="gf-field">
                <span className="gf-lbl">Currency</span>
                <select
                  className="gf-select"
                  value={token}
                  onChange={(e) => setToken(e.target.value as VoucherToken)}
                >
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
              <div className="gf-field">
                <span className="gf-lbl">Membership tier</span>
                <select
                  className="gf-select"
                  value={tierValue}
                  onChange={(e) => setTierValue(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Select a tier…</option>
                  {tiers.map((t) => (
                    <option key={t.name} value={t.valueUsd}>
                      {t.name} · {t.valueUsd.toLocaleString("en-US")} {token}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="gf-field">
              <span className="gf-lbl">Note (optional)</span>
              <input
                className="gf-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Q3 promo"
                maxLength={64}
                autoComplete="off"
              />
              <div className="gf-hint">
                Codes are bearer — anyone with the link can redeem. Expires 7 days after issue; the
                balance is returned automatically if it goes unredeemed.
              </div>
            </div>

            <button type="button" className="gf-btn wide" onClick={generate} disabled={busy}>
              {busy ? "Creating…" : "Generate code"}
            </button>
            <div className={`gf-msg ${msg.cls}`}>{msg.text}</div>

            {issued && (
              <div className="gc-issued">
                <div className="gc-issued-lbl">{issued.tier} code — copy it now, it is shown once</div>
                <div className="gc-issued-code">{issued.code}</div>
                <div className="gc-issued-actions">
                  <button
                    type="button"
                    className="gf-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(issued.redeemUrl);
                      setCopied(true);
                    }}
                  >
                    {copied ? "Link copied" : "Copy redeem link"}
                  </button>
                  <button type="button" className="gf-btn ghost" onClick={() => setIssued(null)}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="net-section-hdr">
          <div className="net-section-title">Codes status</div>
          <div className="gf-tabs">
            {FILTERS.map((k) => (
              <button
                key={k}
                type="button"
                className={`gf-tab${filter === k ? " on" : ""}`}
                onClick={() => setFilter(k)}
              >
                {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="gf-panel">
          <table className="net-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Tier</th>
                <th>Value</th>
                <th>Status</th>
                <th>Redeemer</th>
                <th>Created</th>
                <th>Expires</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length ? (
                vouchers.map((v) => (
                  <tr key={v.voucherId}>
                    <td>
                      <span className="gf-code">
                        {revealed[v.voucherId] ?? `HNTR-••••-••••-${v.codeLast4}`}
                      </span>
                    </td>
                    <td className="td-asset">{v.tier}</td>
                    <td className="td-price">
                      {money(v.amountUsd)} {v.token}
                    </td>
                    <td className="td-source">{statusLabel(v.status)}</td>
                    <td className="td-source">{v.redeemerUsername ? `@${v.redeemerUsername}` : "—"}</td>
                    <td className="td-time">{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td className="td-time">{new Date(v.expiresAt).toLocaleDateString()}</td>
                    <td className="td-time">
                      {v.status === "ACTIVE" && (
                        <span className="gc-row-actions">
                          <button type="button" onClick={() => reveal(v.voucherId)}>
                            Reveal
                          </button>
                          <button type="button" onClick={() => setShareVoucherId(v.voucherId)}>
                            Share
                          </button>
                          <button type="button" onClick={() => revoke(v.voucherId)}>
                            Cancel
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="gf-empty">No codes with this status.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
