"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useBalance } from "wagmi";
import { useEffectiveAccount } from "../../lib/session";
import MainLayout from "../components/MainLayout";
import HntrFooter from "../components/layout/shell/HntrFooter";
import PriorityLinePromoPopup from "../components/promo/PriorityLinePromoPopup";
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
import { APP_CHAIN_ID, TOKEN_ADDRESSES, explorerTxUrl } from "../../lib/contracts";
import { useConnectWallet } from "../../lib/useConnectWallet";

const MARK = "/assets/v2/hntr-logos/hntr-mark-white.png";
const WORD = "/assets/v2/hntr-logos/hntr-wordmark-white.png";
const BOX = "/assets/v2/hntr-dark/priority-box-hero.png";

const STEPS = [
  { n: "01", title: "Deposit USDT/USDC", meta: "Up to your membership seat cap." },
  { n: "02", title: "Wait in line", meta: "First in, first served. Withdraw anytime before launch." },
  { n: "03", title: "Co-own the first NFT", meta: "At launch, your reserve joins the Strategy Pool in line order. Profit and matching start after the NFT sells." },
] as const;

const FAQ = [
  {
    q: "What happens at launch?",
    a: "Reserves are converted to ETH and join the Strategy Pool in line order, lowest number first. When the pool reaches its target, the NFT is bought and listed for sale.",
  },
  {
    q: "Can I withdraw?",
    a: "Yes, any time before launch. Withdrawing gives up that deposit's place in line.",
  },
  {
    q: "How do I withdraw?",
    a: "Submit a withdrawal request in your back office, and the HNTR team will refund the full amount to your connected wallet.",
  },
  {
    q: "What if the pool fills before my number?",
    a: "Your reserve keeps its place and moves into the next pool, which targets the next cheapest listing.",
  },
  {
    q: "Does a deposit count toward my seat cap?",
    a: "Yes. Every active reserve counts toward your seat cap, and withdrawing frees up that amount.",
  },
  {
    q: "When can I claim?",
    a: "Once the NFT sells, your share becomes claimable in your back office.",
  },
] as const;

const PHASE_LABEL: Record<DepositPhase, string> = {
  preparing: "Preparing…",
  "awaiting-wallet": "Confirm in wallet",
  confirming: "Confirming…",
};

function usd(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function num(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function when(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function shortHash(hash: string) {
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

type ActivityRow = {
  key: string;
  type: "Deposit" | "Withdraw";
  lineNumber: number | null;
  amountUsd: number;
  token: PaymentToken;
  status: { label: string; tone: "active" | "pending" | "expired" };
  date: string;
  txHash: string | null;
};

/** Each deposit yields a Deposit row, plus a Withdraw row once a withdrawal was requested. */
function buildActivity(deposits: PriorityLineDeposit[]): ActivityRow[] {
  const rows: ActivityRow[] = [];
  for (const d of deposits) {
    const depositStatus =
      d.status === "REVIEW"
        ? { label: "In review", tone: "pending" as const }
        : d.status === "WITHDRAWN"
          ? { label: "Withdrawn", tone: "expired" as const }
          : { label: "Confirmed", tone: "active" as const };
    rows.push({
      key: `${d.id}-dep`,
      type: "Deposit",
      lineNumber: d.lineNumber,
      amountUsd: d.amountUsd,
      token: d.token,
      status: depositStatus,
      date: d.createdAt,
      txHash: d.txHash,
    });
    if (d.status === "WITHDRAWAL_REQUESTED" || d.status === "WITHDRAWN") {
      const paid = d.status === "WITHDRAWN";
      rows.push({
        key: `${d.id}-wd`,
        type: "Withdraw",
        lineNumber: d.lineNumber,
        amountUsd: d.amountUsd,
        token: d.token,
        status: paid ? { label: "Withdrawn", tone: "expired" } : { label: "Pending", tone: "pending" },
        date: (paid ? d.withdrawnAt : d.withdrawalRequestedAt) ?? d.createdAt,
        txHash: paid ? d.payoutTxHash : null,
      });
    }
  }
  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function csvCell(value: string | number | null) {
  const raw = value == null ? "" : String(value);
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

export default function PriorityLinePage() {
  const router = useRouter();
  // Super-login (operator viewing a member) shows that member's line, read-only: no deposits, recovery or withdrawals.
  const { address, isConnected, isImpersonation } = useEffectiveAccount();
  const { connectWallet } = useConnectWallet();
  const { data, isLoading } = usePriorityLine();
  const invalidate = usePriorityLineInvalidate();

  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<PaymentToken>("USDT");
  const [phase, setPhase] = useState<DepositPhase | null>(null);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);
  const [wdOpen, setWdOpen] = useState(false);
  const [wdSelected, setWdSelected] = useState<string[]>([]);
  const [wdBusy, setWdBusy] = useState(false);
  const [wdMsg, setWdMsg] = useState<string | null>(null);
  const [cfOpen, setCfOpen] = useState(false);
  const [cfAck, setCfAck] = useState(false);
  const [filter, setFilter] = useState<"" | "Deposit" | "Withdraw">("");

  const tokenAddress = TOKEN_ADDRESSES[token];
  const { data: walletBal } = useBalance({
    address: (address as `0x${string}`) || undefined,
    token: tokenAddress || undefined,
    chainId: APP_CHAIN_ID,
    query: { enabled: Boolean(address && tokenAddress) },
  });

  const deposits = useMemo(() => data?.deposits ?? [], [data]);
  const activeDeposits = useMemo(() => deposits.filter((d) => d.status === "ACTIVE"), [deposits]);
  const inLine = useMemo(
    () => deposits.filter((d) => d.status === "ACTIVE" || d.status === "WITHDRAWAL_REQUESTED"),
    [deposits],
  );
  const activity = useMemo(() => buildActivity(deposits), [deposits]);
  const visibleActivity = useMemo(
    () => (filter ? activity.filter((row) => row.type === filter) : activity),
    [activity, filter],
  );

  const cap = data?.cap ?? 0;
  const used = data?.used ?? 0;
  const remaining = data?.remaining ?? 0;
  const minDeposit = data?.minDepositUsd ?? 1;
  const hasMembership = cap > 0;
  const depositsOpen = !!data?.depositWallet;
  const loaded = isConnected && !!data;

  const amt = parseFloat(amount) || 0;
  const bal = walletBal ? Number(walletBal.formatted) : null;
  const over = loaded && amt > remaining + 1e-9;
  const belowMin = loaded && amt > 0 && amt < minDeposit;
  const shortBal = bal != null && amt > bal + 1e-9;
  const busy = phase !== null;
  const barPct = cap > 0 ? Math.min(100, ((used + (over ? 0 : amt)) / cap) * 100) : 0;

  const recoveredFor = useRef<string | null>(null);
  useEffect(() => {
    if (isImpersonation || !address || !data || recoveredFor.current === address) return;
    recoveredFor.current = address;
    recoverPendingPriorityLine(address).then((n) => {
      if (n > 0) {
        setMsg({ text: "Your earlier deposit was confirmed and added to the Priority Line.", kind: "ok" });
        invalidate();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, data, isImpersonation]);

  useEffect(() => {
    if (!wdOpen && !cfOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || wdBusy || busy) return;
      setWdOpen(false);
      setCfOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [wdOpen, cfOpen, wdBusy, busy]);

  const reserve = async () => {
    if (busy || amt <= 0 || over || belowMin || shortBal) return;
    setMsg(null);
    setCfOpen(false);
    try {
      const sent = Math.round(amt * 100) / 100;
      const created = await depositPriorityLine(token, sent, setPhase);
      setAmount("");
      const lines = created.filter((d) => d.lineNumber).map((d) => `#${d.lineNumber}`).join(", ");
      setMsg(
        created.some((d) => d.status === "REVIEW")
          ? { text: "Deposit received — it exceeded your cap, so our team will review it.", kind: "err" }
          : { text: lines ? `Deposit confirmed as Priority Line ${lines}.` : "Deposit confirmed.", kind: "ok" },
      );
      await invalidate();
    } catch (err) {
      handleAppError(err, "Deposit failed");
    } finally {
      setPhase(null);
    }
  };

  const openConfirm = () => {
    if (busy || amt <= 0 || over || belowMin || shortBal || !loaded || !hasMembership || !depositsOpen) return;
    setCfAck(false);
    setCfOpen(true);
  };

  const openWithdraw = () => {
    if (!activeDeposits.length || isImpersonation) return;
    setWdSelected([]);
    setWdMsg(null);
    setWdOpen(true);
  };

  const toggleWd = (id: string) => {
    setWdSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const submitWithdraw = async (ids: string[]) => {
    const chosen = activeDeposits.filter((d) => ids.includes(d.id));
    if (!chosen.length || wdBusy) return;
    setWdBusy(true);
    setWdMsg(null);
    let done = 0;
    try {
      for (const dep of chosen) {
        await requestPriorityLineWithdrawal(dep.id);
        done += 1;
      }
      setWdOpen(false);
      const line = chosen.length === 1 && chosen[0].lineNumber ? ` for line #${chosen[0].lineNumber}` : "";
      setMsg({
        text:
          chosen.length === 1
            ? `Withdrawal requested${line}. An admin will review it and send your funds.`
            : `Withdrawal requested for ${chosen.length} deposits. An admin will review them and send your funds.`,
        kind: "ok",
      });
      await invalidate();
    } catch (err) {
      if (done > 0) await invalidate();
      setWdMsg(done > 0 ? "Some requests were sent. The rest could not be submitted." : null);
      handleAppError(err, "Withdrawal request failed");
    } finally {
      setWdBusy(false);
    }
  };

  const exportCsv = () => {
    const header = ["Type", "Line #", "Amount", "Token", "Status", "Date", "Tx"];
    const lines = activity.map((row) =>
      [row.type, row.lineNumber ?? "", row.amountUsd, row.token, row.status.label, new Date(row.date).toISOString(), row.txHash ?? ""]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hntr-priority-line.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  let primary: { label: string; onClick: () => void; disabled: boolean };
  if (isImpersonation) {
    primary = { label: "Read-only view", onClick: () => undefined, disabled: true };
  } else if (!isConnected) {
    primary = { label: "Connect wallet", onClick: () => void connectWallet().catch(() => undefined), disabled: false };
  } else if (loaded && !hasMembership) {
    primary = { label: "Get membership", onClick: () => router.push("/membership"), disabled: false };
  } else {
    primary = {
      label: phase ? PHASE_LABEL[phase] : "Deposit",
      onClick: openConfirm,
      disabled: !loaded || !depositsOpen || busy || amt < minDeposit || over || shortBal,
    };
  }

  const formLocked = isImpersonation || !loaded || !hasMembership || !depositsOpen || busy;
  const hint = !loaded
    ? null
    : !hasMembership
      ? "A membership is required to reserve a spot."
      : !depositsOpen
        ? "Deposits are not open yet. Please check back soon."
        : null;
  const inlineErr = over
    ? "Amount exceeds your remaining seat cap"
    : belowMin
      ? `Minimum deposit ${usd(minDeposit)}`
      : shortBal
        ? "Insufficient balance"
        : null;

  const spotCount = inLine.length;
  const membershipLabel = !isConnected
    ? "Connect your wallet"
    : isLoading || !data
      ? "Loading…"
      : hasMembership
        ? `${data.tier} · ${usd(cap)} seat cap`
        : "No active membership";

  return (
    <MainLayout>
      <div className="feed" id="feed-priority">
        <div className="page-body gc-scope">
          <div className="pl-page">
            <div className="pl-banner">
              <div className="pl-bn-bg" />
              <div className="pl-bn-grid" />
              <div className="pl-stage" aria-hidden="true">
                <div className="pl-box">
                  <img src={BOX} alt="" />
                  <span className="pl-box-tint" />
                </div>
                <div className="pl-cone" />
                <div className="pl-ring pl-ring-a" />
                <div className="pl-ring pl-ring-b" />
                <div className="pl-holo">
                  <div className="pl-holo-logo">
                    <img src={MARK} alt="" />
                    <span className="pl-holo-scan" />
                  </div>
                  <img className="pl-holo-word" src={WORD} alt="" />
                </div>
                <span className="pl-spark" style={{ left: "38%", top: "30%" }} />
                <span className="pl-spark" style={{ left: "62%", top: "22%", animationDelay: "1.2s" }} />
                <span className="pl-spark" style={{ left: "54%", top: "44%", animationDelay: "2.1s" }} />
                <span className="pl-spark" style={{ left: "44%", top: "14%", animationDelay: "0.6s" }} />
              </div>
              <div className="pl-bn-shade" />
              <div className="pl-bn-line" />
              <div className="pl-banner-copy">
                <h1 className="pl-h1">Priority Line</h1>
                <div className="pl-hero-meta">
                  <span className="pl-pill">
                    <i />
                    Pre-launch · Waiting for launch
                  </span>
                  <span className="pl-pill pl-pill-dim">Launch date announced soon</span>
                </div>
              </div>
            </div>

            <div className="pl-intro">
              <div className="pl-intro-k">NFT Strategy · Pre-launch</div>
              <p className="pl-intro-p">Reserve your seat in the first NFT Strategy before launch. First in, first served.</p>
            </div>

            <div className="pl-grid">
              <div className="gf-card">
                <div className="gf-card-hd">
                  <div className="gf-card-t">Deposit USDT / USDC</div>
                  <div className="gf-card-n">Capped by membership</div>
                </div>
                <div className="gf-avail">
                  <div className="gf-avail-v">{loaded ? usd(remaining) : "—"}</div>
                  <div className="gf-avail-l">Left to reserve</div>
                </div>
                <div className="gf-bar">
                  <div className="gf-bar-fill" style={{ width: `${barPct}%` }} />
                </div>
                <div className="gf-bar-lbl">
                  <span>{loaded ? `Reserved ${usd(used)}` : "—"}</span>
                  <span>{loaded ? `Cap ${usd(cap)}` : "—"}</span>
                </div>
                <div className="gf-row">
                  <div className="gf-field">
                    <span className="gf-lbl">Your membership</span>
                    <div className="gf-static">{membershipLabel}</div>
                    {loaded && !hasMembership && !isImpersonation && (
                      <button type="button" className="gf-btn ghost pl-get-mem" onClick={() => router.push("/membership")}>
                        Get membership
                      </button>
                    )}
                  </div>
                  <div className="gf-field">
                    <span className="gf-lbl">Amount</span>
                    <div className="pl-amount-row">
                      <input
                        id="plAmt"
                        className="gf-input"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="1"
                        placeholder="0.00"
                        autoComplete="off"
                        value={amount}
                        disabled={formLocked}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <select
                        className="gf-select"
                        aria-label="Token"
                        value={token}
                        disabled={formLocked}
                        onChange={(e) => setToken(e.target.value as PaymentToken)}
                      >
                        <option>USDT</option>
                        <option>USDC</option>
                      </select>
                      <button
                        type="button"
                        className="gf-btn ghost"
                        disabled={formLocked || remaining <= 0}
                        onClick={() => {
                          const capLeft = Math.max(0, remaining);
                          const next = bal == null ? capLeft : Math.min(capLeft, bal);
                          setAmount(next ? String(Math.floor(next * 100) / 100) : "");
                        }}
                      >
                        Max
                      </button>
                    </div>
                    <div className="gf-hint">Stablecoins only · 1:1 USD · whole or partial amounts</div>
                    {isConnected && bal != null && (
                      <div className="gf-hint">
                        Wallet balance: {num(bal)} {token}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pl-actions">
                  <button type="button" className="gf-btn pl-btn-primary" disabled={primary.disabled} onClick={primary.onClick}>
                    {primary.label}
                  </button>
                  <button
                    type="button"
                    className="gf-btn ghost"
                    disabled={isImpersonation || !activeDeposits.length || busy}
                    onClick={openWithdraw}
                  >
                    Withdraw
                  </button>
                </div>
                <div className={`gf-msg${inlineErr || msg?.kind === "err" ? " err" : msg?.kind === "ok" ? " ok" : ""}`}>
                  {inlineErr ?? msg?.text ?? hint ?? ""}
                </div>
                <div className="gf-hint">Each deposit gets its own Priority Line number. Withdraw any deposit before launch.</div>
              </div>

              <div className="gf-card">
                <div className="gf-card-hd">
                  <div className="gf-card-t">Your spot in line</div>
                  <div className="gf-card-n">Waiting for launch</div>
                </div>
                <div className="gf-avail">
                  <div className="gf-avail-v pl-pos-num">{data?.firstLineNumber ? `#${data.firstLineNumber}` : "—"}</div>
                  <div className="gf-avail-l">
                    {spotCount
                      ? `Reserved ${usd(used)} across ${spotCount} ${spotCount === 1 ? "deposit" : "deposits"}`
                      : "No spot yet"}
                  </div>
                </div>
                <div className="pl-kv">
                  <span>Reserved</span>
                  <b>{isConnected ? usd(used) : "$0"}</b>
                </div>
                {spotCount > 0 && (
                  <>
                    <div className="pl-kv">
                      <span>Est. pool position</span>
                      <b>TBA</b>
                    </div>
                    <div className="gf-hint" style={{ marginTop: 4 }}>
                      Estimate. Depends on the NFT price at launch.
                    </div>
                    <details className="pl-det">
                      <summary>Show my deposits</summary>
                      {inLine
                        .slice()
                        .sort((a, b) => (a.lineNumber ?? 0) - (b.lineNumber ?? 0))
                        .map((d) => (
                          <div className="pl-dep" key={d.id}>
                            <b>{d.lineNumber ? `#${d.lineNumber}` : "—"}</b>
                            <span>
                              {num(d.amountUsd)} {d.token}
                              {d.status === "WITHDRAWAL_REQUESTED" ? " · pending withdrawal" : ""}
                            </span>
                          </div>
                        ))}
                    </details>
                  </>
                )}
              </div>
            </div>

            <div className="pl-info-row">
              <div className="gf-card">
                <div className="gf-card-hd">
                  <div className="gf-card-t">How it works</div>
                  <div className="gf-card-n">3 steps</div>
                </div>
                {STEPS.map((step) => (
                  <div key={step.n} className="gf-req">
                    <div className="gf-req-val">{step.n}</div>
                    <div className="gf-req-main">
                      <div className="gf-req-t">{step.title}</div>
                      <div className="gf-req-m">{step.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="gf-card">
                <div className="gf-card-hd">
                  <div className="gf-card-t">FAQ</div>
                  <div className="gf-card-n">6 questions</div>
                </div>
                {FAQ.map((item) => (
                  <details key={item.q} className="pl-det">
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="net-section-hdr">
              <div className="net-section-title">Priority Line Activities</div>
              <div className="pl-act-tools">
                <span className="gf-card-n">
                  {activity.length ? `${activity.length} ${activity.length === 1 ? "transaction" : "transactions"}` : ""}
                </span>
                <select
                  className="gf-select"
                  aria-label="Filter activity"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "" | "Deposit" | "Withdraw")}
                >
                  <option value="">All types</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdraw">Withdraw</option>
                </select>
                <button type="button" className="gf-btn ghost" onClick={exportCsv}>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="gf-panel">
              <div className="gf-panel-scroll">
                <table className="net-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Line #</th>
                      <th>Amount</th>
                      <th>Token</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleActivity.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="gf-empty">No activity yet. Your deposits and withdrawals will show here.</div>
                        </td>
                      </tr>
                    ) : (
                      visibleActivity.map((row) => {
                        const dep = row.type === "Deposit";
                        return (
                          <tr key={row.key}>
                            <td className="td-asset">{row.type}</td>
                            <td className="pl-line">{row.lineNumber ? `#${row.lineNumber}` : "—"}</td>
                            <td className={dep ? "pl-amt-pos" : "pl-amt-neg"}>
                              {dep ? "+" : "−"}
                              {num(row.amountUsd)}
                            </td>
                            <td className="pl-tok">{row.token}</td>
                            <td>
                              <span className={`gf-pill ${row.status.tone}`}>{row.status.label}</span>
                            </td>
                            <td className="pl-date">{when(row.date)}</td>
                            <td style={{ textAlign: "right" }}>
                              {row.txHash ? (
                                <a className="pl-tx" href={explorerTxUrl(APP_CHAIN_ID, row.txHash)} target="_blank" rel="noopener noreferrer">
                                  {shortHash(row.txHash)} ↗
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        {wdOpen && (
          <div
            className="pl-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget && !wdBusy) setWdOpen(false);
            }}
          >
            <div className="gf-card pl-modal-card" role="dialog" aria-modal="true" aria-label="Withdraw deposits">
              <div className="gf-card-hd">
                <div className="gf-card-t">Withdraw deposits</div>
                <button type="button" className="gf-btn ghost pl-modal-x" disabled={wdBusy} onClick={() => setWdOpen(false)}>
                  ✕
                </button>
              </div>
              <div className="pl-warn">Withdrawing gives up that deposit&apos;s place in line.</div>
              <div className="gf-hint pl-modal-hint">
                Tick the deposits to withdraw. Each request is for the full amount, and the HNTR team sends the refund.
              </div>
              <div className="pl-wd-list">
                {activeDeposits
                  .slice()
                  .sort((a, b) => (a.lineNumber ?? 0) - (b.lineNumber ?? 0))
                  .map((d) => {
                    const on = wdSelected.includes(d.id);
                    return (
                      <div key={d.id} className={`pl-wd-row${on ? " on" : ""}`}>
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={wdBusy}
                          aria-label={d.lineNumber ? `Withdraw line #${d.lineNumber}` : "Withdraw deposit"}
                          onChange={() => toggleWd(d.id)}
                        />
                        <span className="pl-wd-n">{d.lineNumber ? `#${d.lineNumber}` : "—"}</span>
                        <span className="pl-wd-meta">
                          {num(d.amountUsd)} {d.token}
                        </span>
                        <input className="gf-input" type="number" value={d.amountUsd} readOnly aria-label="Amount" />
                      </div>
                    );
                  })}
              </div>
              {wdMsg && <div className="gf-msg err">{wdMsg}</div>}
              <div className="pl-actions">
                <button type="button" className="gf-btn ghost" disabled={wdBusy} onClick={() => setWdOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="gf-btn ghost"
                  disabled={wdBusy || !activeDeposits.length}
                  onClick={() => submitWithdraw(activeDeposits.map((d) => d.id))}
                >
                  Withdraw all
                </button>
                <button
                  type="button"
                  className="gf-btn pl-btn-primary"
                  disabled={!wdSelected.length || wdBusy}
                  onClick={() => submitWithdraw(wdSelected)}
                >
                  {wdBusy ? "Requesting…" : "Withdraw selected"}
                </button>
              </div>
            </div>
          </div>
        )}

        {cfOpen && (
          <div
            className="pl-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget && !busy) setCfOpen(false);
            }}
          >
            <div className="gf-card pl-modal-card" role="dialog" aria-modal="true" aria-label="Confirm deposit">
              <div className="gf-card-hd">
                <div className="gf-card-t">Confirm deposit</div>
                <button type="button" className="gf-btn ghost pl-modal-x" disabled={busy} onClick={() => setCfOpen(false)}>
                  ✕
                </button>
              </div>
              <div className="pl-kv">
                <span>Amount</span>
                <b>
                  {num(amt)} {token}
                </b>
              </div>
              <div className="pl-kv">
                <span>Token</span>
                <b>{token}</b>
              </div>
              <div className="pl-kv">
                <span>Priority Line number</span>
                <b>Assigned on confirmation</b>
              </div>
              <div className="pl-kv">
                <span>Status after deposit</span>
                <b>Waiting for launch</b>
              </div>
              <label className="pl-check">
                <input type="checkbox" checked={cfAck} onChange={(e) => setCfAck(e.target.checked)} />
                <span>I understand this is not an investment and NFTs can lose value</span>
              </label>
              <div className="pl-actions pl-actions-2">
                <button type="button" className="gf-btn ghost" disabled={busy} onClick={() => setCfOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="gf-btn pl-btn-primary" disabled={!cfAck || busy} onClick={() => void reserve()}>
                  Confirm deposit
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
        <HntrFooter />
      </div>
      <PriorityLinePromoPopup />
    </MainLayout>
  );
}
