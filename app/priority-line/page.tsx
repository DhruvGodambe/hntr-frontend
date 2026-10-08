"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useAccount } from "wagmi";
import MainLayout from "../components/MainLayout";
import PriorityLineBanner from "../components/PriorityLineBanner";
import { handleAppError } from "../../lib/errors";
import {
  depositPriorityLine,
  recoverPendingPriorityLine,
  requestPriorityLineWithdrawal,
  usePriorityLine,
  usePriorityLineInvalidate,
  type DepositPhase,
  type PriorityLineDeposit,
} from "../../lib/priorityLine";
import type { PaymentToken } from "../../lib/tokens";
import { useConnectWallet } from "../../lib/useConnectWallet";

const STEPS = [
  { n: "01", title: "Deposit USDT/USDC", meta: "Up to your membership cap." },
  { n: "02", title: "Wait in line", meta: "First in, first served." },
  { n: "03", title: "Co-own the first NFT", meta: "Profit and matching start after it sells." },
] as const;

const PHASE_LABEL: Record<DepositPhase, string> = {
  preparing: "Preparing…",
  "awaiting-wallet": "Confirm in wallet",
  confirming: "Confirming…",
};

function usd(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function when(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

type ActivityRow = {
  key: string;
  type: "Deposit" | "Withdrawal";
  lineNumber: number | null;
  amountUsd: number;
  token: PaymentToken;
  status: { label: string; tone: "active" | "pending" | "expired" };
  date: string;
};

/** Each deposit yields a Deposit row, plus a Withdrawal row once a withdrawal was requested. */
function buildActivity(deposits: PriorityLineDeposit[]): ActivityRow[] {
  const rows: ActivityRow[] = [];
  for (const d of deposits) {
    rows.push({
      key: `${d.id}-dep`,
      type: "Deposit",
      lineNumber: d.lineNumber,
      amountUsd: d.amountUsd,
      token: d.token,
      status: d.status === "REVIEW" ? { label: "In review", tone: "pending" } : { label: "In line", tone: "active" },
      date: d.createdAt,
    });
    if (d.status === "WITHDRAWAL_REQUESTED" || d.status === "WITHDRAWN") {
      const paid = d.status === "WITHDRAWN";
      rows.push({
        key: `${d.id}-wd`,
        type: "Withdrawal",
        lineNumber: d.lineNumber,
        amountUsd: d.amountUsd,
        token: d.token,
        status: paid ? { label: "Withdrawn", tone: "expired" } : { label: "Pending", tone: "pending" },
        date: (paid ? d.withdrawnAt : d.withdrawalRequestedAt) ?? d.createdAt,
      });
    }
  }
  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function PriorityLinePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectWallet } = useConnectWallet();
  const { data, isLoading } = usePriorityLine();
  const invalidate = usePriorityLineInvalidate();

  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<PaymentToken>("USDT");
  const [phase, setPhase] = useState<DepositPhase | null>(null);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);
  const [wdOpen, setWdOpen] = useState(false);
  const [wdSelected, setWdSelected] = useState<string | null>(null);
  const [wdBusy, setWdBusy] = useState(false);

  const deposits = useMemo(() => data?.deposits ?? [], [data]);
  const activeDeposits = useMemo(() => deposits.filter((d) => d.status === "ACTIVE"), [deposits]);
  const inLineCount = deposits.filter((d) => d.status === "ACTIVE" || d.status === "WITHDRAWAL_REQUESTED").length;
  const activity = useMemo(() => buildActivity(deposits), [deposits]);

  const cap = data?.cap ?? 0;
  const used = data?.used ?? 0;
  const remaining = data?.remaining ?? 0;
  const minDeposit = data?.minDepositUsd ?? 1;
  const hasMembership = cap > 0;
  const depositsOpen = !!data?.depositWallet;
  const loaded = isConnected && !!data;

  const amt = parseFloat(amount) || 0;
  const over = loaded && amt > remaining + 1e-9;
  const busy = phase !== null;
  const barPct = cap > 0 ? Math.min(100, ((used + (over ? 0 : amt)) / cap) * 100) : 0;

  // Record any transfer that was sent but never confirmed (closed tab, dropped connection).
  const recoveredFor = useRef<string | null>(null);
  useEffect(() => {
    if (!address || !data || recoveredFor.current === address) return;
    recoveredFor.current = address;
    recoverPendingPriorityLine(address).then((n) => {
      if (n > 0) {
        setMsg({ text: "Your earlier deposit was confirmed and added to the Priority Line.", kind: "ok" });
        invalidate();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, data]);

  useEffect(() => {
    if (!wdOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWdOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [wdOpen]);

  const reserve = async () => {
    if (busy || amt <= 0 || over) return;
    setMsg(null);
    try {
      const sent = Math.round(amt * 100) / 100;
      const created = await depositPriorityLine(token, sent, setPhase);
      setAmount("");
      const lines = created.filter((d) => d.lineNumber).map((d) => `#${d.lineNumber}`).join(", ");
      setMsg(
        created.some((d) => d.status === "REVIEW")
          ? { text: "Deposit received — it exceeded your cap, so our team will review it.", kind: "err" }
          : { text: `Deposit added as Priority Line ${lines}.`, kind: "ok" },
      );
      await invalidate();
    } catch (err) {
      handleAppError(err, "Deposit failed");
    } finally {
      setPhase(null);
    }
  };

  const openWithdraw = () => {
    if (!activeDeposits.length) return;
    setWdSelected(null);
    setWdOpen(true);
  };

  const submitWithdraw = async () => {
    const dep = activeDeposits.find((d) => d.id === wdSelected);
    if (!dep) return;
    setWdBusy(true);
    try {
      await requestPriorityLineWithdrawal(dep.id);
      setWdOpen(false);
      setMsg({
        text: `Withdrawal requested for line #${dep.lineNumber}. An admin will review it and send your funds.`,
        kind: "ok",
      });
      await invalidate();
    } catch (err) {
      handleAppError(err, "Withdrawal request failed");
    } finally {
      setWdBusy(false);
    }
  };

  let primary: { label: string; onClick: () => void; disabled: boolean };
  if (!isConnected) {
    primary = { label: "Connect wallet", onClick: () => void connectWallet().catch(() => undefined), disabled: false };
  } else if (loaded && !hasMembership) {
    primary = { label: "Get a membership", onClick: () => router.push("/membership"), disabled: false };
  } else {
    primary = {
      label: phase ? PHASE_LABEL[phase] : inLineCount ? "Add another deposit" : "Reserve my spot",
      onClick: reserve,
      disabled: !loaded || !depositsOpen || busy || amt < minDeposit || over,
    };
  }

  const hint = !loaded
    ? null
    : !hasMembership
      ? "A membership is required to reserve a spot."
      : !depositsOpen
        ? "Deposits are not open yet. Please check back soon."
        : null;

  return (
    <MainLayout>
      <div className="feed" id="feed-priority">
        <div className="page-body gc-scope">
          <PriorityLineBanner />

          <div className="pl-grid">
            <div className="gf-card">
              <div className="gf-card-hd">
                <div className="gf-card-t">Deposit USDT / USDC</div>
                <div className="gf-card-n">Capped by membership</div>
              </div>
              <div className="gf-avail">
                <div className="gf-avail-v">{loaded ? usd(remaining) : "—"}</div>
                <div className="gf-avail-l">left to reserve</div>
              </div>
              <div className="gf-bar">
                <div className="gf-bar-fill" style={{ width: `${barPct}%` }} />
              </div>
              <div className="gf-bar-lbl">
                <span>{loaded ? `Deposited ${usd(used)}` : "—"}</span>
                <span>{loaded ? `Cap ${usd(cap)}` : "—"}</span>
              </div>
              <div className="gf-row">
                <div className="gf-field">
                  <span className="gf-lbl">Your membership</span>
                  <div className="gf-static">
                    {!loaded
                      ? isLoading
                        ? "Loading…"
                        : "Connect your wallet"
                      : hasMembership
                        ? `${data?.tier} · ${usd(cap)} cap`
                        : "No membership"}
                  </div>
                </div>
                <div className="gf-field">
                  <span className="gf-lbl">Amount</span>
                  <div className="pl-amount-row">
                    <input
                      className="gf-input"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0.00"
                      autoComplete="off"
                      value={amount}
                      disabled={busy}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <select
                      className="gf-select"
                      value={token}
                      disabled={busy}
                      onChange={(e) => setToken(e.target.value as PaymentToken)}
                    >
                      <option>USDT</option>
                      <option>USDC</option>
                    </select>
                    <button
                      type="button"
                      className="gf-btn ghost"
                      disabled={busy || !loaded || remaining <= 0}
                      onClick={() => setAmount(remaining ? String(remaining) : "")}
                    >
                      Max
                    </button>
                  </div>
                  <div className="gf-hint">Stablecoins only · 1:1 USD · whole or partial amounts</div>
                </div>
              </div>
              <div className="pl-actions">
                <button type="button" className="gf-btn" disabled={primary.disabled} onClick={primary.onClick}>
                  {primary.label}
                </button>
                <button type="button" className="gf-btn ghost" disabled={!activeDeposits.length || busy} onClick={openWithdraw}>
                  Withdraw
                </button>
              </div>
              <div className={`gf-msg${over || msg?.kind === "err" ? " err" : msg?.kind === "ok" ? " ok" : ""}`}>
                {over ? "Above your membership cap." : (msg?.text ?? hint ?? "")}
              </div>
              <div className="gf-hint">
                Each deposit gets its own Priority Line number. Withdraw any deposit before launch.
              </div>
            </div>

            <div className="pl-stack">
              <div className="gf-card">
                <div className="gf-card-hd">
                  <div className="gf-card-t">Your first spot in line</div>
                  <div className="gf-card-n">Waiting for launch</div>
                </div>
                <div className="gf-avail">
                  <div className="gf-avail-v">{data?.firstLineNumber ? `#${data.firstLineNumber}` : "—"}</div>
                  <div className="gf-avail-l">
                    {inLineCount
                      ? `${inLineCount} ${inLineCount === 1 ? "deposit" : "deposits"} in the Priority Line`
                      : "No spot yet"}
                  </div>
                </div>
                <div className="gf-bar-lbl pl-position-lbl">
                  <span>Reserved</span>
                  <span className="pl-reserved-val">{usd(loaded ? used : 0)}</span>
                </div>
              </div>

              <div className="gf-card">
                <div className="gf-card-hd">
                  <div className="gf-card-t">How it works</div>
                  <div className="gf-card-n">3 steps</div>
                </div>
                {STEPS.map((step) => (
                  <div key={step.n} className="gf-req pl-step">
                    <div className="gf-req-val">{step.n}</div>
                    <div className="gf-req-main">
                      <div className="gf-req-t">{step.title}</div>
                      <div className="gf-req-m">{step.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="net-section-hdr">
            <div className="net-section-title">Activity</div>
            <div className="gf-card-n">
              {activity.length ? `${activity.length} ${activity.length === 1 ? "transaction" : "transactions"}` : ""}
            </div>
          </div>
          <div className="gf-panel">
            <table className="net-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Line #</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {activity.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="gf-empty">No activity yet. Your deposits and withdrawals will show here.</div>
                    </td>
                  </tr>
                ) : (
                  activity.map((row) => {
                    const dep = row.type === "Deposit";
                    return (
                      <tr key={row.key}>
                        <td className="td-asset">{row.type}</td>
                        <td className="pl-mono pl-line">{row.lineNumber ? `#${row.lineNumber}` : "—"}</td>
                        <td className={`pl-mono ${dep ? "pl-pos" : "pl-neg"}`}>
                          {dep ? "+" : "−"}
                          {usd(row.amountUsd).slice(1)} {row.token}
                        </td>
                        <td>
                          <span className={`gf-pill ${row.status.tone}`}>{row.status.label}</span>
                        </td>
                        <td className="pl-mono pl-date">{when(row.date)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="net-section-hdr pl-section-gap">
            <div className="net-section-title">Disclaimer</div>
          </div>
          <div className="gf-panel pl-disclaimer">
            <p>
              Priority Line lets you book your spot before the first strategy goes live. Spots are first come, first
              served: the earliest deposits enter the first pools. Only USDT and USDC are accepted. When the strategy
              launches, deposits are automatically converted to ETH and added to the pools in Priority Line order. You
              can withdraw your deposit at any time before the first pool officially launches.
            </p>
          </div>
        </div>
      </div>

      {wdOpen && (
        <div
          className="pl-modal-back gc-scope"
          onClick={(e) => {
            if (e.target === e.currentTarget && !wdBusy) setWdOpen(false);
          }}
        >
          <div className="gf-card pl-modal" role="dialog" aria-modal="true" aria-label="Withdraw a deposit">
            <div className="gf-card-hd">
              <div className="gf-card-t">Withdraw a deposit</div>
              <button type="button" className="gf-btn ghost pl-modal-x" disabled={wdBusy} onClick={() => setWdOpen(false)}>
                ✕
              </button>
            </div>
            <div className="gf-hint pl-modal-hint">
              Select the deposit to withdraw. Withdrawals are reviewed and paid out manually by our team — your spot
              and cap stay reserved until it is sent.
            </div>
            <div className="pl-wd-list">
              {activeDeposits.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`pl-wd-item${wdSelected === d.id ? " on" : ""}`}
                  onClick={() => setWdSelected(d.id)}
                >
                  <span className="pl-wd-n">#{d.lineNumber}</span>
                  <span className="pl-wd-date">{when(d.createdAt)}</span>
                  <span className="pl-wd-amt">
                    {usd(d.amountUsd).slice(1)} {d.token}
                  </span>
                </button>
              ))}
            </div>
            <div className="pl-actions">
              <button type="button" className="gf-btn ghost" disabled={wdBusy} onClick={() => setWdOpen(false)}>
                Cancel
              </button>
              <button type="button" className="gf-btn" disabled={!wdSelected || wdBusy} onClick={submitWithdraw}>
                {wdBusy ? "Requesting…" : "Request withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
