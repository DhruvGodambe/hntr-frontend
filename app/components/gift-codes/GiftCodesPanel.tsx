"use client";

import { useMemo, useState } from "react";
import {
  Voucher,
  VoucherAccess,
  VoucherToken,
  fetchAllVouchers,
  issueVoucher,
  revealVoucherCode,
  revokeVoucher,
  useMyVouchers,
  useVoucherAccess,
  useVoucherInvalidate,
} from "../../../lib/vouchers";
import { resolveAppError } from "../../../lib/errors";
import GiftCodeDialog, { type GiftDialogState } from "./GiftCodeDialog";

const FILTERS = ["all", "active", "redeemed", "expired"] as const;
type FilterKey = (typeof FILTERS)[number];

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusLabel(s: Voucher["status"]) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Never exports the plaintext redeem code — only the masked form shown on-screen. */
function vouchersToCsv(vouchers: Voucher[]): string {
  const header = ["Code", "Tier", "Value", "Token", "Status", "Redeemer", "Created", "Expires", "Note"];
  const rows = vouchers.map((v) => [
    `HNTR-****-****-${v.codeLast4}`,
    v.tier,
    v.amountUsd.toFixed(2),
    v.token,
    statusLabel(v.status),
    v.redeemerUsername ? `@${v.redeemerUsername}` : "",
    new Date(v.createdAt).toISOString(),
    new Date(v.expiresAt).toISOString(),
    v.note ?? "",
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  const [exportBusy, setExportBusy] = useState(false);
  const [dialog, setDialog] = useState<GiftDialogState | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const balances = access?.balances ?? [];
  const bal = balances.find((b) => b.token === token);
  const balance = bal?.balance ?? 0;
  const tiers = access?.tiers ?? [];

  const activeCount = useMemo(() => vouchers.filter((v) => v.status === "ACTIVE").length, [vouchers]);
  const redeemedCount = useMemo(() => vouchers.filter((v) => v.status === "REDEEMED").length, [vouchers]);

  async function generate() {
    const tier = tiers.find((t) => t.valueUsd === tierValue);
    if (!tier) {
      setDialog({ kind: "error", title: "Pick a tier", message: "Choose a membership tier before generating a code." });
      return;
    }
    if (tier.valueUsd > balance) {
      setDialog({
        kind: "error",
        title: "Insufficient balance",
        message: `That tier costs more than your available ${token} balance (${money(balance)}).`,
      });
      return;
    }
    setBusy(true);
    try {
      const result = await issueVoucher({ tier: tier.name, token, note: note.trim() || undefined });
      await invalidate();
      await accessQuery.refetch();
      await listQuery.refetch();
      setTierValue("");
      setNote("");
      setDialog({
        kind: "issued",
        title: "Gift code created",
        tier: result.tier,
        code: result.code,
        redeemUrl: result.redeemUrl,
      });
    } catch (error) {
      const resolved = resolveAppError(error, "Could not create gift code");
      setDialog({ kind: "error", title: resolved.title, message: resolved.sub || resolved.title });
    } finally {
      setBusy(false);
    }
  }

  async function exportCsv() {
    setExportBusy(true);
    try {
      const all = await fetchAllVouchers();
      if (all.length === 0) {
        setDialog({ kind: "error", title: "Nothing to export", message: "You haven't issued any gift codes yet." });
        return;
      }
      downloadCsv(vouchersToCsv(all), `gift-codes-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      const resolved = resolveAppError(error, "Could not export gift codes");
      setDialog({ kind: "error", title: resolved.title, message: resolved.sub || resolved.title });
    } finally {
      setExportBusy(false);
    }
  }

  async function reveal(voucherId: string) {
    try {
      const { code } = await revealVoucherCode(voucherId);
      setRevealed((prev) => ({ ...prev, [voucherId]: code }));
    } catch (error) {
      const resolved = resolveAppError(error, "Could not reveal code");
      setDialog({ kind: "error", title: resolved.title, message: resolved.sub || resolved.title });
    }
  }

  function revoke(voucherId: string) {
    setDialog({
      kind: "confirm",
      title: "Cancel gift code",
      message: "This deactivates the code and refunds its value back to your balance. This cannot be undone.",
      confirmLabel: "Cancel code",
      danger: true,
      onConfirm: async () => {
        setDialogBusy(true);
        try {
          await revokeVoucher(voucherId);
          await invalidate();
          await accessQuery.refetch();
          await listQuery.refetch();
          setDialog({
            kind: "success",
            title: "Gift code cancelled",
            message: "The code is now inactive and its value has been returned to your balance.",
          });
        } catch (error) {
          const resolved = resolveAppError(error, "Could not cancel gift code");
          setDialog({ kind: "error", title: resolved.title, message: resolved.sub || resolved.title });
        } finally {
          setDialogBusy(false);
        }
      },
    });
  }

  return (
    <div className="gc-scope">
      <GiftCodeDialog
        state={dialog}
        busy={dialogBusy}
        onClose={() => {
          if (dialogBusy) return;
          setDialog(null);
        }}
      />

      <div className="gc-wrap">
        <div className="gf-head">
          <div>
            <div className="gf-title">Gift Codes</div>
            <div className="gf-sub">Issue and track membership vouchers from your balance</div>
          </div>
          <button type="button" className="gf-btn ghost" onClick={exportCsv} disabled={exportBusy}>
            {exportBusy ? "Exporting…" : "Export CSV"}
          </button>
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
            <div className="net-stat-val gc-issued-val">
              {balances
                .filter((b) => b.issued > 0)
                .map((b) => `${money(b.issued)} ${b.token}`)
                .join(" + ") || money(0)}
            </div>
            <div className="net-stat-chg">Locked in outstanding codes</div>
          </div>
          <div className="net-stat">
            <div className="net-stat-lbl">Codes Generated</div>
            <div className="net-stat-val">{vouchers.length}</div>
            <div className="net-stat-chg">
              {activeCount} active · {redeemedCount} redeemed
            </div>
          </div>
          <div className="net-stat">
            <div className="net-stat-lbl">Codes Redeemed</div>
            <div className="net-stat-val">{access?.redeemed?.count ?? 0}</div>
            <div className="net-stat-chg">{money(access?.redeemed?.totalUsd ?? 0)} USD claimed</div>
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
                            Reveal code
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
