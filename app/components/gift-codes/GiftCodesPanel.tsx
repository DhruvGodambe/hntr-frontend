"use client";

import { useMemo, useState } from "react";
import {
  FILTERS,
  INITIAL_CODES,
  TIERS,
  type FilterKey,
  type GiftCode,
  isoDate,
  money,
  newGiftCode,
  tierName,
} from "./types";

/**
 * Gift Codes backoffice UI — ported 1:1 from gift-code-sample/index.html.
 * Mock state mirrors the sample `GF` object; swap generate/export/read for API later.
 */
export default function GiftCodesPanel() {
  const [balance, setBalance] = useState(4820);
  const [used, setUsed] = useState(2150);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [codes, setCodes] = useState<GiftCode[]>(INITIAL_CODES);

  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ text: string; cls: "ok" | "err" | "" }>({ text: "", cls: "" });

  const total = balance + used;
  const pct = total ? Math.round((used / total) * 100) : 0;

  const activeCount = useMemo(() => codes.filter((c) => c.status === "active").length, [codes]);
  const redeemed = useMemo(() => codes.filter((c) => c.status === "redeemed"), [codes]);
  const expiredCount = useMemo(() => codes.filter((c) => c.status === "expired").length, [codes]);
  const claimedTotal = redeemed.reduce((a, c) => a + c.amt, 0);

  const counts: Record<FilterKey, number> = {
    all: codes.length,
    active: activeCount,
    redeemed: redeemed.length,
    expired: expiredCount,
  };

  const rows = codes.filter((c) => filter === "all" || c.status === filter);

  function setTierAmount(v: number) {
    setAmt(String(v));
    setSelectedChip(v);
  }

  function generate() {
    const value = parseFloat(amt || "0");
    const valid = TIERS.some((t) => t.v === value);
    const redeemer = note.trim().toLowerCase();

    if (!valid) {
      setMsg({ text: "Pick a membership tier value: 50, 250, 750, 1,500 or 2,500.", cls: "err" });
      return;
    }
    if (!redeemer) {
      setMsg({ text: "Enter the username of the person who will redeem this code.", cls: "err" });
      return;
    }
    if (value > balance) {
      setMsg({ text: `Amount exceeds your available balance (${money(balance)} USDC).`, cls: "err" });
      return;
    }

    const code = newGiftCode();
    const now = new Date();
    const exp = isoDate(new Date(now.getTime() + 7 * 864e5));

    setBalance((b) => b - value);
    setUsed((u) => u + value);
    setCodes((prev) => [
      { code, amt: value, note: redeemer, created: isoDate(now), exp, status: "active", by: "—" },
      ...prev,
    ]);
    setAmt("");
    setNote("");
    setSelectedChip(null);
    setFilter("all");
    setMsg({
      text: `${code} created for ${redeemer} · ${money(value)} USD (${tierName(value)}).`,
      cls: "ok",
    });
  }

  function exportCsv() {
    const head = "code,tier,value,redeemer,created,expires,status,used_date";
    const body = codes
      .map((c) =>
        [c.code, tierName(c.amt), c.amt, c.note || "", c.created, c.exp, c.status, c.used || ""].join(","),
      )
      .join("\n");
    const blob = new Blob([`${head}\n${body}`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hntr-gift-codes.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="gc-scope">
      <div className="gc-wrap">
        <div className="gf-head">
          <div>
            <div className="gf-title">Gift Codes</div>
            <div className="gf-sub">Issue and track credit from your balance</div>
          </div>
          <div className="hdr-actions">
            <button type="button" className="gf-btn ghost" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="gf-stats">
          <div className="net-stat">
            <div className="net-stat-lbl">Available Balance</div>
            <div className="net-stat-val">{money(balance)}</div>
            <div className="net-stat-chg">USDC · withdrawable</div>
          </div>
          <div className="net-stat">
            <div className="net-stat-lbl">Balance Used</div>
            <div className="net-stat-val">{money(used)}</div>
            <div className="net-stat-chg">Issued as gift credit</div>
          </div>
          <div className="net-stat">
            <div className="net-stat-lbl">Codes Generated</div>
            <div className="net-stat-val">{codes.length}</div>
            <div className="net-stat-chg">
              {activeCount} active · {redeemed.length} redeemed
            </div>
          </div>
          <div className="net-stat">
            <div className="net-stat-lbl">Codes Redeemed</div>
            <div className="net-stat-val">{redeemed.length}</div>
            <div className="net-stat-chg">{money(claimedTotal)} USD claimed</div>
          </div>
        </div>

        <div className="gf-top">
          <div className="gf-card">
            <div className="gf-card-hd">
              <div className="gf-card-t">Generate a gift code</div>
              <div className="gf-card-n">From balance</div>
            </div>
            <div className="gf-avail">
              <div className="gf-avail-v">{money(balance)}</div>
              <div className="gf-avail-l">available to issue</div>
            </div>
            <div className="gf-bar">
              <div className="gf-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="gf-bar-lbl">
              <span>{money(used)} issued</span>
              <span>
                {pct}% of {money(total)}
              </span>
            </div>

            <div className="gf-chips">
              {TIERS.map((t) => {
                const off = balance < t.v;
                return (
                  <button
                    key={t.v}
                    type="button"
                    className={`gf-chip${off ? " off" : ""}${selectedChip === t.v ? " on" : ""}`}
                    onClick={() => !off && setTierAmount(t.v)}
                    disabled={off}
                  >
                    {t.n} · {t.v.toLocaleString("en-US")}
                  </button>
                );
              })}
            </div>

            <div className="gf-row">
              <div className="gf-field">
                <span className="gf-lbl">Membership tier value</span>
                <select
                  className="gf-select"
                  value={amt}
                  onChange={(e) => {
                    setAmt(e.target.value);
                    setSelectedChip(e.target.value ? Number(e.target.value) : null);
                  }}
                >
                  <option value="">Select a tier…</option>
                  <option value="50">Bronze · 50 USD</option>
                  <option value="250">Silver · 250 USD</option>
                  <option value="750">Gold · 750 USD</option>
                  <option value="1500">Platinum · 1,500 USD</option>
                  <option value="2500">Diamond · 2,500 USD</option>
                </select>
              </div>
              <div className="gf-field">
                <span className="gf-lbl">Expires</span>
                <div className="gf-static" data-days="7">
                  7 days from issue
                </div>
              </div>
            </div>

            <div className="gf-field">
              <span className="gf-lbl">Username of redeemer</span>
              <input
                className="gf-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. m.ruiz"
                maxLength={32}
                autoComplete="off"
              />
              <div className="gf-hint">Only this account can redeem the code.</div>
            </div>

            <button type="button" className="gf-btn wide" onClick={generate}>
              Generate code
            </button>
            <div className={`gf-msg ${msg.cls}`}>{msg.text}</div>
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
                {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)} <b>{counts[k]}</b>
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
                <th>Redeemer</th>
                <th>Created</th>
                <th>Expires</th>
                <th>Used date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((c) => (
                  <tr key={c.code}>
                    <td>
                      <span className="gf-code">{c.code}</span>
                    </td>
                    <td className="td-asset">{tierName(c.amt)}</td>
                    <td className="td-price">{money(c.amt)}</td>
                    <td className="td-source">{c.note ? `@${c.note}` : "—"}</td>
                    <td className="td-time">{c.created}</td>
                    <td className="td-time">{c.exp}</td>
                    <td className="td-time">{c.used || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
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
