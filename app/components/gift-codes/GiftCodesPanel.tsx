"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  Voucher,
  VoucherAccess,
  VoucherToken,
  issueVoucher,
  revealVoucherCode,
  revokeVoucher,
  searchUsernames,
  shareVoucher,
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

function setModalBodyLock(locked: boolean) {
  document.body.classList.toggle("modal-open", locked);
}

function normalizeUsername(raw: string) {
  return raw.trim().replace(/^@+/, "");
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
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<{ username: string; tier: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected([]);
      setResults([]);
      setSearching(false);
      setShowResults(false);
      setHighlight(0);
      setModalBodyLock(false);
      return;
    }
    setModalBodyLock(true);
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      window.clearTimeout(t);
      setModalBodyLock(false);
    };
  }, [open]);

  const selectedSet = useMemo(
    () => new Set(selected.map((u) => u.toLowerCase())),
    [selected],
  );

  const runSearch = useCallback(
    async (term: string) => {
      const q = normalizeUsername(term);
      if (q.length < 1) {
        setResults([]);
        setSearching(false);
        setShowResults(false);
        return;
      }
      const id = ++reqIdRef.current;
      setSearching(true);
      try {
        const items = await searchUsernames(q, 8);
        if (id !== reqIdRef.current) return;
        const filtered = items.filter((u) => !selectedSet.has(u.username.toLowerCase()));
        setResults(filtered);
        setHighlight(0);
        setShowResults(true);
      } catch {
        if (id !== reqIdRef.current) return;
        setResults([]);
        setShowResults(true);
      } finally {
        if (id === reqIdRef.current) setSearching(false);
      }
    },
    [selectedSet],
  );

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = normalizeUsername(query);
    if (q.length < 1) {
      setResults([]);
      setSearching(false);
      setShowResults(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      void runSearch(q);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, runSearch]);

  const addRecipient = (username: string) => {
    const clean = normalizeUsername(username);
    if (!clean) return;
    if (selectedSet.has(clean.toLowerCase())) {
      setQuery("");
      setResults([]);
      setShowResults(false);
      return;
    }
    if (selected.length >= 25) return;
    setSelected((prev) => [...prev, clean]);
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const removeRecipient = (username: string) => {
    setSelected((prev) => prev.filter((u) => u.toLowerCase() !== username.toLowerCase()));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !query && selected.length > 0) {
      e.preventDefault();
      setSelected((prev) => prev.slice(0, -1));
      return;
    }
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setShowResults(true);
      setHighlight((h) => (h + 1) % results.length);
      return;
    }
    if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setShowResults(true);
      setHighlight((h) => (h - 1 + results.length) % results.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (showResults && results[highlight]) {
        addRecipient(results[highlight].username);
      } else if (normalizeUsername(query)) {
        addRecipient(query);
      }
      return;
    }
    if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  if (!mounted) return null;

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
            Search members by username. They get an in-app notification with your redeem link — the
            code stays bearer (anyone with the link can redeem). It is still a single-use code, so if
            you add more than one recipient, only whoever redeems it <strong>first</strong> gets the
            membership — everyone else's link stops working.
          </p>

          <div className="dm-amount-hdr">
            <div className="dm-amount-lbl">Recipients</div>
            {selected.length > 0 ? (
              <div className="dm-balance">
                {selected.length} selected{selected.length > 1 ? " · first to redeem wins" : ""}
              </div>
            ) : null}
          </div>

          <div className="gc-share-field">
            {selected.length > 0 ? (
              <div className="gc-share-chips">
                {selected.map((u) => (
                  <button
                    key={u}
                    type="button"
                    className="gc-share-chip"
                    onClick={() => !busy && removeRecipient(u)}
                    disabled={busy}
                    aria-label={`Remove @${u}`}
                  >
                    @{u}
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="gc-share-search-wrap">
              <input
                ref={inputRef}
                className="gc-share-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => {
                  if (results.length > 0 || normalizeUsername(query)) setShowResults(true);
                }}
                onBlur={() => {
                  // Allow click on result before closing.
                  window.setTimeout(() => setShowResults(false), 150);
                }}
                placeholder={selected.length ? "Add another username…" : "Search username…"}
                disabled={busy}
                autoComplete="off"
                spellCheck={false}
                aria-autocomplete="list"
                aria-expanded={showResults}
              />
              {showResults ? (
                <ul className="gc-share-results" role="listbox">
                  {searching && results.length === 0 ? (
                    <li className="gc-share-result muted">Searching…</li>
                  ) : null}
                  {!searching && results.length === 0 && normalizeUsername(query) ? (
                    <li className="gc-share-result muted">
                      No members match “{normalizeUsername(query)}”
                    </li>
                  ) : null}
                  {results.map((r, i) => (
                    <li key={r.username}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === highlight}
                        className={`gc-share-result${i === highlight ? " is-active" : ""}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addRecipient(r.username)}
                      >
                        <span className="gc-share-result-name">@{r.username}</span>
                        <span className="gc-share-result-tier">{r.tier}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <div className="gc-share-hint">Type to search · Enter to add · click a chip to remove</div>

          <div className="dm-actions">
            <button className="dm-cancel-btn" type="button" onClick={onClose} disabled={busy}>
              CANCEL
            </button>
            <button
              className="dm-proceed-btn"
              type="button"
              disabled={busy || selected.length === 0}
              onClick={() => onSubmit(selected)}
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
  const [dialog, setDialog] = useState<GiftDialogState | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [shareVoucherId, setShareVoucherId] = useState<string | null>(null);

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

  async function submitShare(usernames: string[]) {
    if (!shareVoucherId || usernames.length === 0) return;
    setShareBusy(true);
    try {
      const { notified, skipped } = await shareVoucher(shareVoucherId, usernames);
      const names = notified.map((u) => `@${u}`).join(", ");
      const alreadyNotified = skipped.filter((s) => s.reason === "already notified");
      const otherSkipped = skipped.filter((s) => s.reason !== "already notified");
      const skipNote = [
        alreadyNotified.length
          ? `${alreadyNotified.length} already notified earlier (not re-sent)`
          : null,
        otherSkipped.length
          ? `${otherSkipped.length} skipped (${otherSkipped.map((s) => `@${s.username}: ${s.reason}`).join(", ")})`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
      setShareVoucherId(null);
      setDialog(
        notified.length
          ? {
              kind: "success",
              title: "Gift code shared",
              message: `Sent to ${names}.${skipNote ? ` ${skipNote}.` : ""}${
                notified.length > 1
                  ? " Reminder: this is a single-use code — only whoever redeems it first actually gets the membership; everyone else's link will show “already redeemed”."
                  : " They get an in-app notification with the redeem link."
              }`,
            }
          : {
              kind: "error",
              title: "Nobody notified",
              message: skipNote || "No recipients were notified.",
            },
      );
    } catch (error) {
      const resolved = resolveAppError(error, "Could not share");
      setDialog({ kind: "error", title: resolved.title, message: resolved.sub || resolved.title });
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
