"use client";

import { useState } from "react";
import MainLayout from "../components/MainLayout";
import PriorityLineBanner from "../components/PriorityLineBanner";

// UI only — values below are placeholders until Priority Line logic is wired up.
const PLACEHOLDER_TIER = "Platinum";
const PLACEHOLDER_CAP = 8000;
const PLACEHOLDER_USED = 0;

const STEPS = [
  { n: "01", title: "Deposit USDT/USDC", meta: "Up to your membership cap." },
  { n: "02", title: "Wait in line", meta: "First in, first served." },
  { n: "03", title: "Co-own the first NFT", meta: "Profit and matching start after it sells." },
] as const;

const ACTIVITY_COLUMNS = ["Type", "Line #", "Amount", "Status"] as const;

function usd(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default function PriorityLinePage() {
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"USDT" | "USDC">("USDT");

  const left = Math.max(0, PLACEHOLDER_CAP - PLACEHOLDER_USED);
  const amt = parseFloat(amount) || 0;
  const over = amt > left;
  const barPct = Math.min(100, ((PLACEHOLDER_USED + amt) / PLACEHOLDER_CAP) * 100);

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
                <div className="gf-avail-v">{usd(left)}</div>
                <div className="gf-avail-l">left to reserve</div>
              </div>
              <div className="gf-bar">
                <div className="gf-bar-fill" style={{ width: `${barPct}%` }} />
              </div>
              <div className="gf-bar-lbl">
                <span>Deposited {usd(PLACEHOLDER_USED)}</span>
                <span>Cap {usd(PLACEHOLDER_CAP)}</span>
              </div>
              <div className="gf-row">
                <div className="gf-field">
                  <span className="gf-lbl">Your membership</span>
                  <div className="gf-static">
                    {PLACEHOLDER_TIER} · {usd(PLACEHOLDER_CAP)} cap
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
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <select
                      className="gf-select"
                      value={token}
                      onChange={(e) => setToken(e.target.value as "USDT" | "USDC")}
                    >
                      <option>USDT</option>
                      <option>USDC</option>
                    </select>
                    <button
                      type="button"
                      className="gf-btn ghost"
                      onClick={() => setAmount(left ? String(left) : "")}
                    >
                      Max
                    </button>
                  </div>
                  <div className="gf-hint">Stablecoins only · 1:1 USD</div>
                </div>
              </div>
              <div className="pl-actions">
                {/* TODO: wire up reservation logic */}
                <button type="button" className="gf-btn" disabled={over || amt <= 0}>
                  Reserve my spot
                </button>
                <button type="button" className="gf-btn ghost" disabled>
                  Withdraw
                </button>
              </div>
              <div className={`gf-msg${over ? " err" : ""}`}>{over ? "Above your membership cap." : ""}</div>
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
                  <div className="gf-avail-v">—</div>
                  <div className="gf-avail-l">No spot yet</div>
                </div>
                <div className="gf-bar-lbl pl-position-lbl">
                  <span>Reserved</span>
                  <span className="pl-reserved-val">{usd(PLACEHOLDER_USED)}</span>
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
          </div>
          <div className="gf-panel">
            <table className="net-table">
              <thead>
                <tr>
                  {ACTIVITY_COLUMNS.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                  <th style={{ textAlign: "right" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={ACTIVITY_COLUMNS.length + 1}>
                    <div className="gf-empty">
                      No activity yet. Your deposits and withdrawals will show here.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="net-section-hdr pl-section-gap">
            <div className="net-section-title">Disclaimer</div>
          </div>
          <div className="gf-panel pl-disclaimer">
            <p>
              Priority Line lets you book your spot before the first strategy goes live. Spots are first
              come, first served: the earliest deposits enter the first pools. Only USDT and USDC are
              accepted. When the strategy launches, deposits are automatically converted to ETH and added
              to the pools in Priority Line order. You can withdraw your deposit at any time before the
              first pool officially launches.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
